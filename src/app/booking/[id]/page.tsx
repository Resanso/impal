import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, MapPin, UtensilsCrossed, ArrowLeft } from 'lucide-react'
import { createClient } from '~/lib/supabase/server'
import { getBookingDetail } from '../actions'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Lunas: 'bg-green-100 text-green-800',
  Batal: 'bg-red-100 text-red-800',
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pemesananID = parseInt(id)

  if (isNaN(pemesananID)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: booking, error } = await getBookingDetail(pemesananID)

  if (error ?? !booking) notFound()
  if (!booking) notFound()

  const { meja, pemesanan_detail: details } = booking
  const waktuMulai = new Date(booking.waktu_mulai)
  const waktuSelesai = new Date(booking.waktu_selesai)
  const statusBadge = STATUS_STYLE[booking.status_pembayaran] ?? 'bg-muted text-muted-foreground'

  const biayaSewa = (booking.durasi / 60) * (meja?.tarif ?? 0)
  const totalFnb = details.reduce((s, d) => s + d.sub_total, 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detail Booking #{booking.id}</h1>
            <p className="text-sm text-muted-foreground">
              Dibuat: {new Date(booking.created_at).toLocaleString('id-ID')}
            </p>
          </div>
          <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
            {booking.status_pembayaran}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4" /> Detail Sesi
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meja</span>
                <span className="font-medium">Meja #{meja?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarif</span>
                <span className="font-medium">{idr(meja?.tarif ?? 0)} / jam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">
                  {waktuMulai.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu</span>
                <span className="font-medium">
                  {waktuMulai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {waktuSelesai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durasi</span>
                <span className="font-medium">{booking.durasi} menit</span>
              </div>
            </CardContent>
          </Card>

          {details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UtensilsCrossed className="size-4" /> Pesanan Makanan & Minuman
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {details.map(d => (
                  <div key={d.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {d.menu_fnb?.nama} ×{d.kuantitas}
                    </span>
                    <span>{idr(d.sub_total)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" /> Ringkasan Biaya
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Biaya Sewa ({booking.durasi / 60} jam × {idr(meja?.tarif ?? 0)})
                </span>
                <span>{idr(biayaSewa)}</span>
              </div>
              {totalFnb > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total F&B</span>
                  <span>{idr(totalFnb)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold text-base">
                <span>Total Tagihan</span>
                <span className="text-primary">{idr(booking.total_tagihan)}</span>
              </div>
            </CardContent>
          </Card>

          {booking.status_pembayaran === 'Pending' && (
            <Link href={`/payment/${booking.id}`}>
              <Button className="w-full" size="lg">
                Bayar Sekarang →
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
