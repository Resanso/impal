import Link from 'next/link'
import { CalendarPlus, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { createClient } from '~/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{greeting}! 👋</h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card size="sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalBooking}</p>
            <p className="text-xs text-muted-foreground">Total Booking</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{aktif}</p>
            <p className="text-xs text-muted-foreground">Menunggu Bayar</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{selesai}</p>
            <p className="text-xs text-muted-foreground">Lunas</p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Link href="/booking">
        <Button className="mb-8 w-full" size="lg">
          <CalendarPlus className="mr-2 size-5" />
          Booking Meja Baru
        </Button>
      </Link>

      {/* Recent Bookings */}
      <div>
        <h2 className="mb-3 text-base font-semibold">Riwayat Terakhir</h2>
        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Belum ada booking. Yuk mulai booking meja!
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map(booking => {
              const statusKey = booking.status_pembayaran as keyof typeof STATUS_CONFIG
              const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.Pending
              const StatusIcon = status.icon
              const waktu = new Date(booking.waktu_mulai)
              return (
                <Link key={booking.id} href={`/booking/${booking.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Meja #{booking.meja?.id}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>
                            <StatusIcon className="size-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {waktu.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {' · '}{booking.durasi} menit
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <p className="text-sm font-semibold">{idr(booking.total_tagihan)}</p>
                        <ChevronRight className="size-4 text-muted-foreground" />
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
