'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '~/lib/supabase/server'
import { createAdminClient } from '~/lib/supabase/admin'

export interface AdminBookingRow {
  id: number
  user_id: string
  user_email: string
  meja_id: number
  durasi: number
  waktu_mulai: string
  waktu_selesai: string
  status_pembayaran: 'Pending' | 'Lunas' | 'Batal'
  total_tagihan: number
  created_at: string
  meja: { id: number; tarif: number } | null
}

export interface AdminMejaRow {
  id: number
  tarif: number
  status: 'Tersedia' | 'Terpakai' | 'Maintenance'
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Akses ditolak. Anda bukan admin.')
  }
}

export async function adminGetAllBookings(): Promise<AdminBookingRow[]> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()

  // 1. Fetch bookings
  const { data: bookings, error: bookingsError } = await adminSupabase
    .from('pemesanan')
    .select(`
      id,
      user_id,
      meja_id,
      durasi,
      waktu_mulai,
      waktu_selesai,
      status_pembayaran,
      total_tagihan,
      created_at,
      meja:meja_id ( id, tarif )
    `)
    .order('created_at', { ascending: false })

  if (bookingsError) throw new Error(bookingsError.message)
  if (!bookings) return []

  // 2. Fetch all users from Supabase Auth using admin client
  let userEmailMap = new Map<string, string>()
  try {
    const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers()
    if (!usersError && usersData?.users) {
      usersData.users.forEach(u => {
        if (u.email) userEmailMap.set(u.id, u.email)
      })
    }
  } catch (err) {
    console.error('Gagal mengambil daftar user:', err)
  }

  // 3. Map bookings to include user email
  return bookings.map((b: any) => ({
    id: b.id,
    user_id: b.user_id,
    user_email: userEmailMap.get(b.user_id) ?? 'Unknown User',
    meja_id: b.meja_id,
    durasi: b.durasi,
    waktu_mulai: b.waktu_mulai,
    waktu_selesai: b.waktu_selesai,
    status_pembayaran: b.status_pembayaran,
    total_tagihan: b.total_tagihan,
    created_at: b.created_at,
    meja: b.meja,
  }))
}

export async function adminUpdateBookingStatus(
  pemesananId: number,
  status: 'Pending' | 'Lunas' | 'Batal'
): Promise<{ success: boolean }> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('pemesanan')
    .update({ status_pembayaran: status })
    .eq('id', pemesananId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/booking')
  revalidatePath('/')
  revalidatePath('/riwayat')
  return { success: true }
}

export async function adminGetAllMeja(): Promise<AdminMejaRow[]> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('meja')
    .select('*')
    .order('id')

  if (error) throw new Error(error.message)
  return (data as AdminMejaRow[]) ?? []
}

export async function adminCreateMeja(
  tarif: number,
  status: 'Tersedia' | 'Terpakai' | 'Maintenance'
): Promise<AdminMejaRow> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('meja')
    .insert([{ tarif, status }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/booking')
  revalidatePath('/booking')
  return data as AdminMejaRow
}

export async function adminUpdateMeja(
  mejaId: number,
  updates: { tarif?: number; status?: 'Tersedia' | 'Terpakai' | 'Maintenance' }
): Promise<AdminMejaRow> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('meja')
    .update(updates)
    .eq('id', mejaId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/booking')
  revalidatePath('/booking')
  return data as AdminMejaRow
}

export async function adminDeleteMeja(mejaId: number): Promise<{ success: boolean }> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('meja')
    .delete()
    .eq('id', mejaId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/booking')
  revalidatePath('/booking')
  return { success: true }
}
