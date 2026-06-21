'use server'

import { createClient } from '~/lib/supabase/server'
import { createAdminClient } from '~/lib/supabase/admin'

export interface DashboardStats {
  pendapatanHariIni: number
  totalBookingHariIni: number
  mejaAktif: number
  mejaTermakai: number
  mejaTidakTerpakai: number
  mejaTersedia: number
  totalMeja: number
  mejaMaintenance: number
  fnbTerjualHariIni: number
  pendapatan7Hari: { tanggal: string; total: number }[]
  topMenu: { nama: string; terjual: number; revenue: number }[]
  topMeja: { id: number; totalBooking: number }[]
  activeBookings: { id: number; meja_id: number; waktu_mulai: string; waktu_selesai: string }[]
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Akses ditolak. Anda bukan admin.')
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await verifyAdmin()
  const admin = createAdminClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString()

  // 1. Pendapatan hari ini (pemesanan Lunas)
  const { data: bookingsToday } = await admin
    .from('pemesanan')
    .select('total_tagihan')
    .eq('status_pembayaran', 'Lunas')
    .gte('created_at', todayStart)
    .lt('created_at', todayEnd)

  const todayList = (bookingsToday ?? []) as { total_tagihan: number }[]
  let pendapatanHariIni = 0
  for (const b of todayList) {
    pendapatanHariIni += Number(b.total_tagihan ?? 0)
  }

  // 2. Total booking hari ini
  const { count: totalBookingHariIni } = await admin
    .from('pemesanan')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart)
    .lt('created_at', todayEnd)

  // 3. Status meja dan sesi aktif real-time
  const [{ data: mejaRaw }, { data: activeBookingsRaw }] = await Promise.all([
    admin.from('meja').select('status'),
    admin
      .from('pemesanan')
      .select('id, meja_id, waktu_mulai, waktu_selesai')
      .eq('status_pembayaran', 'Lunas')
      .lte('waktu_mulai', now.toISOString())
      .gt('waktu_selesai', now.toISOString())
      .order('waktu_selesai', { ascending: true }),
  ])

  const activeBookings = (activeBookingsRaw ?? []) as {
    id: number
    meja_id: number
    waktu_mulai: string
    waktu_selesai: string
  }[]
  const activeMejaIds = new Set(activeBookings.map((booking) => booking.meja_id))
  const allMeja = (mejaRaw ?? []) as { status: string }[]
  const totalMeja = allMeja.length
  const mejaMaintenance = allMeja.filter((m: { status: string }) => m.status === 'Maintenance').length
  const mejaAktif = activeMejaIds.size
  const mejaTermakai = mejaAktif
  const mejaTidakTerpakai = Math.max(totalMeja - mejaMaintenance - mejaAktif, 0)
  const mejaTersedia = allMeja.filter((m: { status: string }) => m.status === 'Tersedia').length

  // 4. F&B terjual hari ini
  const { data: detailRaw } = await admin
    .from('pemesanan_detail')
    .select('kuantitas, pemesanan!inner(created_at)')
    .gte('pemesanan.created_at', todayStart)
    .lt('pemesanan.created_at', todayEnd)

  const detailList = (detailRaw ?? []) as { kuantitas: number }[]
  let fnbTerjualHariIni = 0
  for (const d of detailList) {
    fnbTerjualHariIni += Number(d.kuantitas ?? 0)
  }

  // 5. Pendapatan 7 hari terakhir
  const { data: bookings7Raw } = await admin
    .from('pemesanan')
    .select('total_tagihan, created_at')
    .eq('status_pembayaran', 'Lunas')
    .gte('created_at', sevenDaysAgo)
    .lt('created_at', todayEnd)

  const raw7 = (bookings7Raw ?? []) as { total_tagihan: number; created_at: string }[]
  const pendapatan7Hari: { tanggal: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]!
    const dayStart = d.toISOString()
    const dayEnd = new Date(d.getTime() + 86400000).toISOString()
    const total = raw7
      .filter((b: { created_at: string }) => b.created_at >= dayStart && b.created_at < dayEnd)
      .reduce((s: number, b: { total_tagihan: number }) => s + Number(b.total_tagihan ?? 0), 0)
    pendapatan7Hari.push({ tanggal: dateStr, total })
  }

  // 6. Top 5 menu terlaris
  const { data: allDetailsRaw } = await admin
    .from('pemesanan_detail')
    .select('menu_fnb_id, kuantitas, sub_total')

  const rawDetails = (allDetailsRaw ?? []) as { menu_fnb_id: number; kuantitas: number; sub_total: number }[]
  const menuMap = new Map<number, { terjual: number; revenue: number }>()
  for (const d of rawDetails) {
    const existing = menuMap.get(d.menu_fnb_id) ?? { terjual: 0, revenue: 0 }
    existing.terjual += Number(d.kuantitas)
    existing.revenue += Number(d.sub_total)
    menuMap.set(d.menu_fnb_id, existing)
  }

  const menuIds = Array.from(menuMap.keys())
  const { data: menuNamesRaw } = await admin
    .from('menu_fnb')
    .select('id, nama')
    .in('id', menuIds.length > 0 ? menuIds : [0])

  const menuNames = (menuNamesRaw ?? []) as { id: number; nama: string }[]
  const topMenu = Array.from(menuMap.entries())
    .map(([id, stats]) => ({
      nama: menuNames.find((m: { id: number }) => m.id === id)?.nama ?? `Menu #${id}`,
      terjual: stats.terjual,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 5)

  // 7. Top meja
  const { data: allBookingsRaw } = await admin
    .from('pemesanan')
    .select('meja_id')

  const rawBookings = (allBookingsRaw ?? []) as { meja_id: number }[]
  const mejaCountMap = new Map<number, number>()
  for (const b of rawBookings) {
    mejaCountMap.set(b.meja_id, (mejaCountMap.get(b.meja_id) ?? 0) + 1)
  }

  const topMeja = Array.from(mejaCountMap.entries())
    .map(([id, totalBooking]) => ({ id, totalBooking }))
    .sort((a, b) => b.totalBooking - a.totalBooking)
    .slice(0, 5)

  return {
    pendapatanHariIni,
    totalBookingHariIni: totalBookingHariIni ?? 0,
    mejaAktif,
    mejaTermakai,
    mejaTidakTerpakai,
    mejaTersedia,
    totalMeja,
    mejaMaintenance,
    fnbTerjualHariIni,
    pendapatan7Hari,
    topMenu,
    topMeja,
    activeBookings,
  }
}
