import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, UtensilsCrossed, ShieldCheck } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { getPaymentPageData } from '../actions'
import { PaymentForm } from './_components/payment-form'

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pemesananID = parseInt(id)
  if (isNaN(pemesananID)) notFound()

  const { data, error } = await getPaymentPageData(pemesananID)

  if (error === 'Tidak terautentikasi') redirect('/login')
  if (!data) notFound()

  const { booking, existingPayment, userEmail } = data

  if (booking.status_pembayaran === 'Lunas') redirect(`/booking/${pemesananID}`)

  const { meja, pemesanan_detail: details } = booking
  const waktuMulai = new Date(booking.waktu_mulai)
  const waktuSelesai = new Date(booking.waktu_selesai)
  const biayaSewa = (booking.durasi / 60) * (meja?.tarif ?? 0)
  const totalFnb = details.reduce((s, d) => s + d.sub_total, 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-10">

        <div className="mb-6 flex items-center gap-3">
          <Link href={`/booking/${pemesananID}`}>
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Pembayaran</h1>
            <p className="text-sm text-muted-foreground">Booking #{pemesananID}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4" /> Ringkasan Sesi
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meja</span>
                <span className="font-medium">Meja #{meja?.id}</span>
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
                  <UtensilsCrossed className="size-4" /> Pesanan F&B
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {details.map(d => (
                  <div key={d.id} className="flex justify-between">
                    <span className="text-muted-foreground">{d.menu_fnb?.nama} ×{d.kuantitas}</span>
                    <span>{idr(d.sub_total)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" /> Rincian Biaya
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
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total Tagihan</span>
                <span className="text-primary">{idr(booking.total_tagihan)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4" /> Data Pemesan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentForm
                pemesananID={pemesananID}
                defaultEmail={userEmail}
                existingLink={existingPayment?.mayar_link ?? null}
              />
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Pembayaran diproses dengan aman oleh{' '}
            <span className="font-semibold">Mayar</span>. Kamu akan diarahkan ke halaman
            pembayaran setelah mengisi data di atas.
          </p>
        </div>
      </div>
    </main>
  )
}
