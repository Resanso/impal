'use server'

import { createClient } from '~/lib/supabase/server'
import type { Meja, MejaWithAvailability, MenuFnB } from '~/types/models'

export interface BookingDetailRow {
  id: number
  durasi: number
  waktu_mulai: string
  waktu_selesai: string
  status_pembayaran: string
  total_tagihan: number
  created_at: string
  meja: { id: number; tarif: number } | null
  pemesanan_detail: Array<{
    id: number
    kuantitas: number
    sub_total: number
    menu_fnb: { id: number; nama: string; harga: number; kategori: string } | null
  }>
}

export async function cariMeja(
  tanggal: string,    // 'YYYY-MM-DD'
  waktuMulai: string, // 'HH:MM'
  durasi: number      // minutes
): Promise<{ data: MejaWithAvailability[] | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const start = new Date(`${tanggal}T${waktuMulai}:00`)
    const end = new Date(start.getTime() + durasi * 60 * 1000)

    // Ambil semua meja (kecuali Maintenance) dan booking yang konflik secara paralel
    const [mejaRes, conflictRes] = await Promise.all([
      supabase
        .from('meja')
        .select('id, status, tarif')
        .neq('status', 'Maintenance')
        .order('id'),
      supabase
        .from('pemesanan')
        .select('meja_id, waktu_selesai')
        .neq('status_pembayaran', 'Batal')
        .lt('waktu_mulai', end.toISOString())
        .gt('waktu_selesai', start.toISOString()),
    ])

    if (mejaRes.error) return { data: null, error: mejaRes.error.message }

    // Map meja_id → waktu_selesai terlama dari semua booking yang konflik
    const conflictMap = new Map<number, string>()
    for (const c of (conflictRes.data ?? []) as { meja_id: number; waktu_selesai: string }[]) {
      const existing = conflictMap.get(c.meja_id)
      if (!existing || c.waktu_selesai > existing) {
        conflictMap.set(c.meja_id, c.waktu_selesai)
      }
    }

    return {
      data: (mejaRes.data ?? []).map((row: { id: number; status: string; tarif: number }) => ({
        mejaID: row.id,
        status: row.status as Meja['status'],
        tarif: row.tarif,
        tersedia: !conflictMap.has(row.id),
        terpakaiSampai: conflictMap.get(row.id),
      })),
      error: null,
    }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}

export async function getMenuFnB(): Promise<{ data: MenuFnB[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('menu_fnb')
      .select('id, nama, harga, stok, kategori')
      .gt('stok', 0)
      .order('kategori')
      .order('nama')

    if (error) return { data: null, error: error.message }

    return {
      data: (data ?? []).map((row: { id: number; nama: string; harga: number; stok: number; kategori: string }) => ({
        menuID: row.id,
        nama: row.nama,
        harga: row.harga,
        stok: row.stok,
        kategori: row.kategori as MenuFnB['kategori'],
      })),
      error: null,
    }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}

interface BookingItem {
  menuID: number
  qty: number
  hargaSatuan: number
}

export async function createBooking(
  userID: string,
  mejaID: number,
  tarifPerJam: number,
  waktuMulaiISO: string,
  durasi: number,
  items: BookingItem[]
): Promise<{ success: boolean; pemesananID?: number; error?: string }> {
  try {
    const supabase = await createClient()

    const start = new Date(waktuMulaiISO)
    const end = new Date(start.getTime() + durasi * 60 * 1000)

    // Algoritma hitungTotalBiaya (sesuai project-context.md)
    const durasiJam = durasi / 60
    const biayaSewa = durasiJam * tarifPerJam
    const totalFnb = items.reduce((sum, item) => sum + item.qty * item.hargaSatuan, 0)
    const totalTagihan = biayaSewa + totalFnb

    // Insert pemesanan
    const { data: booking, error: bookingError } = await supabase
      .from('pemesanan')
      .insert({
        user_id: userID,
        meja_id: mejaID,
        durasi,
        waktu_mulai: start.toISOString(),
        waktu_selesai: end.toISOString(),
        status_pembayaran: 'Pending',
        total_tagihan: totalTagihan,
      })
      .select('id')
      .single()

    if (bookingError) return { success: false, error: bookingError.message }

    // Insert pemesanan_detail jika ada item F&B
    if (items.length > 0) {
      const { error: detailError } = await supabase
        .from('pemesanan_detail')
        .insert(
          items.map(item => ({
            pemesanan_id: (booking.id as number),
            menu_fnb_id: item.menuID,
            kuantitas: item.qty,
            sub_total: item.qty * item.hargaSatuan,
          }))
        )

      if (detailError) return { success: false, error: detailError.message }
    }

    return { success: true, pemesananID: booking.id as number }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function getBookingDetail(
  pemesananID: number
): Promise<{ data: BookingDetailRow | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pemesanan')
      .select(`
        id, durasi, waktu_mulai, waktu_selesai, status_pembayaran, total_tagihan, created_at,
        meja:meja_id ( id, tarif ),
        pemesanan_detail (
          id, kuantitas, sub_total,
          menu_fnb:menu_fnb_id ( id, nama, harga, kategori )
        )
      `)
      .eq('id', pemesananID)
      .single()

    if (error) return { data: null, error: error.message }
    return { data: data as unknown as BookingDetailRow, error: null }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}
