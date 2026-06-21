'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { MejaForm } from './meja-form'
import { adminDeleteMeja } from '../actions'
import { SessionCountdown } from '~/components/session-countdown'
import { useTransition } from 'react'

interface MejaRow {
  id: number
  tarif: number
  status: 'Tersedia' | 'Terpakai' | 'Maintenance'
  active_booking: {
    id: number
    waktu_mulai: string
    waktu_selesai: string
  } | null
}

interface MejaListProps {
  items: MejaRow[]
}

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export function MejaList({ items }: MejaListProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: number) => {
    if (!confirm(`Yakin ingin menghapus Meja #${id}? Ini dapat memengaruhi riwayat booking.`)) return

    startTransition(async () => {
      try {
        await adminDeleteMeja(id)
      } catch (error) {
        console.error('Error:', error)
        alert('Gagal menghapus meja')
      }
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map((meja) => {
        const activeBooking = meja.active_booking
        const displayStatus = activeBooking ? 'Terpakai' : meja.status
        return (
          <Card key={meja.id} className="border-none ring-1 ring-border/50 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-extrabold">Meja #{meja.id}</CardTitle>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                displayStatus === 'Tersedia' ? 'bg-green-100 text-green-800' :
                displayStatus === 'Terpakai' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {displayStatus}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Tarif per Jam</p>
                <p className="text-lg font-bold text-primary">
                  {idr(meja.tarif)} <span className="text-xs font-normal text-muted-foreground">/ jam</span>
                </p>
              </div>

              {activeBooking && (
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Booking #{activeBooking.id}
                  </p>
                  <SessionCountdown
                    startAt={activeBooking.waktu_mulai}
                    endAt={activeBooking.waktu_selesai}
                    className="w-fit"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <MejaForm meja={meja} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(meja.id)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
