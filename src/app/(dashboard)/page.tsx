import Link from 'next/link'
import { CalendarPlus, Clock, CheckCircle, XCircle, ChevronRight, LayoutDashboard, History, User, Wallet } from 'lucide-react'
import { createClient } from '~/lib/supabase/server'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = {
  Pending: { label: 'Pending',  className: 'bg-yellow-100 text-yellow-800', icon: Clock       },
  Lunas:   { label: 'Lunas',   className: 'bg-green-100 text-green-800',   icon: CheckCircle  },
  Batal:   { label: 'Batal',   className: 'bg-red-100 text-red-800',       icon: XCircle      },
} as const

interface BookingRow {
  id: number
  waktu_mulai: string
  durasi: number
  status_pembayaran: string
  total_tagihan: number
  meja: { id: number } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bookings } = await supabase
    .from('pemesanan')
    .select('id, waktu_mulai, durasi, status_pembayaran, total_tagihan, meja:meja_id(id)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const rows = (bookings ?? []) as unknown as BookingRow[]

  const totalBooking  = rows.length
  const aktif         = rows.filter(b => b.status_pembayaran === 'Pending').length
  const selesai       = rows.filter(b => b.status_pembayaran === 'Lunas').length

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
  })()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">

      {/* Greeting */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
            {greeting}, <span className="text-primary">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sistem billing biliar cerdas Anda.</p>
        </div>
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User className="size-6" />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card size="sm" className="border-none bg-blue-50/50 dark:bg-blue-900/10 ring-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <LayoutDashboard className="size-4 text-blue-600 mb-1" />
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalBooking}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-600/70">Total</p>
          </CardContent>
        </Card>
        <Card size="sm" className="border-none bg-amber-50/50 dark:bg-amber-900/10 ring-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Wallet className="size-4 text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{aktif}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-600/70">Pending</p>
          </CardContent>
        </Card>
        <Card size="sm" className="border-none bg-emerald-50/50 dark:bg-emerald-900/10 ring-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <CheckCircle className="size-4 text-emerald-600 mb-1" />
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{selesai}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600/70">Lunas</p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Link href="/booking">
        <Button className="mb-10 w-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:to-primary" size="lg">
          <CalendarPlus className="mr-2 size-5" />
          Booking Meja Baru
        </Button>
      </Link>

      {/* Recent Bookings */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Riwayat Terakhir</h2>
          <Link href="/riwayat" className="text-xs font-medium text-primary hover:underline">Lihat semua</Link>
        </div>
        {rows.length === 0 ? (
          <Card className="border-dashed ring-0 bg-muted/20">
            <CardContent className="py-12 text-center">
              <History className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                Belum ada booking. Yuk mulai booking meja!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map(booking => {
              const statusKey = booking.status_pembayaran as keyof typeof STATUS_CONFIG
              const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.Pending
              const StatusIcon = status.icon
              const waktu = new Date(booking.waktu_mulai)
              return (
                <Link key={booking.id} href={`/booking/${booking.id}`}>
                  <Card className="transition-all hover:ring-primary/30 hover:bg-muted/30 border-none ring-1 ring-foreground/5 shadow-sm">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <span className="font-bold text-sm text-muted-foreground">#{booking.meja?.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">Meja {booking.meja?.id}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className} bg-opacity-10`}>
                            <StatusIcon className="size-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {waktu.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                          {' • '}{booking.durasi} menit
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{idr(booking.total_tagihan)}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
