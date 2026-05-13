import { redirect } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'
import { BookingForm } from './_components/booking-form'

export default async function BookingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Booking Meja Biliar</h1>
          <p className="mt-1 text-muted-foreground">Pilih jadwal, meja, dan menu favoritmu</p>
        </div>
        <BookingForm userID={user.id} />
      </div>
    </main>
  )
}
