import Link from 'next/link'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { verifyAndUpdatePayment } from '../../actions'

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pemesananID = parseInt(id)

  // Langsung cek ke Mayar API dan update DB jika sudah dibayar
  const status = isNaN(pemesananID) ? 'no_invoice' : await verifyAndUpdatePayment(pemesananID)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-10 text-center">

            {status === 'paid' && (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="size-10 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Pembayaran Berhasil!</h1>
                  <p className="mt-2 text-muted-foreground">
                    Booking #{pemesananID} sudah lunas. Silakan datang dan nikmati permainan biliar.
                  </p>
                </div>
              </>
            )}

            {status === 'unpaid' && (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="size-10 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Menunggu Pembayaran</h1>
                  <p className="mt-2 text-muted-foreground">
                    Pembayaran belum terdeteksi. Jika sudah membayar, tunggu beberapa saat
                    lalu refresh halaman ini.
                  </p>
                </div>
              </>
            )}

            {status === 'no_invoice' && (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <AlertCircle className="size-10 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Invoice Tidak Ditemukan</h1>
                  <p className="mt-2 text-muted-foreground">
                    Tidak ada invoice aktif untuk booking ini.
                  </p>
                </div>
              </>
            )}

            <div className="flex w-full flex-col gap-2">
              {status === 'unpaid' && (
                <Link href={`/payment/${pemesananID}/success`}>
                  <Button variant="outline" className="w-full">
                    Refresh Status
                  </Button>
                </Link>
              )}
              <Link href={`/booking/${pemesananID}`}>
                <Button className="w-full" variant={status === 'paid' ? 'default' : 'outline'}>
                  Lihat Detail Booking
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    </main>
  )
}
