import { CalendarDays } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'
import { adminGetAllBookings, adminGetAllMeja, type AdminBookingRow, type AdminMejaRow } from './actions'
import { BookingPanel } from './_components/booking-panel'

export const revalidate = 0

export default async function AdminBookingPage() {
  let bookings: AdminBookingRow[] = []
  let mejaList: AdminMejaRow[] = []
  let error: string | null = null

  try {
    const [fetchedBookings, fetchedMeja] = await Promise.all([
      adminGetAllBookings(),
      adminGetAllMeja(),
    ])
    bookings = fetchedBookings
    mejaList = fetchedMeja
  } catch (err) {
    error = err instanceof Error ? err.message : 'Gagal memuat data booking dan meja'
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b pb-5">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <CalendarDays className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking & Meja</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola permohonan booking sesi biliar dan konfigurasi ketersediaan meja biliar
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 font-medium">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Panel */}
      {!error && (
        <BookingPanel bookings={bookings} mejaList={mejaList} />
      )}
    </div>
  )
}
