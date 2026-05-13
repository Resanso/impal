import Link from 'next/link'
import { Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { createClient } from '~/lib/supabase/server'
import { Card, CardContent } from '~/components/ui/card'

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = {
  Pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock       },
  Lunas:   { label: 'Lunas',  className: 'bg-green-100 text-green-800',   icon: CheckCircle  },
  Batal:   { label: 'Batal',  className: 'bg-red-100 text-red-800',       icon: XCircle      },
} as const

interface BookingRow {
  id: number
  waktu_mulai: string
  waktu_selesai: string
  durasi: number
  status_pembayaran: string
  total_tagihan: number
  meja: { id: number; tarif: number } | null
}

export default async function RiwayatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bookings } = await supabase
    .from('pemesanan')
    .select('id, waktu_mulai, waktu_selesai, durasi, status_pembayaran, total_tagihan, meja:meja_id(id, tarif)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const rows = (bookings ?? []) as unknown as BookingRow[]

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Riwayat Booking</h1>
        <p className="text-muted-foreground">Semua booking kamu</p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Belum ada riwayat booking.
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">Meja #{booking.meja?.id}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>
                          <StatusIcon className="size-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {waktu.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
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
  )
}
