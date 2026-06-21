'use client'

import { DollarSign, CalendarDays, UtensilsCrossed, TimerReset, CircleDashed } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'
import { SessionCountdown } from '~/components/session-countdown'

interface DashboardCardsProps {
  pendapatan: number
  totalBooking: number
  mejaAktif: number
  mejaTidakTerpakai: number
  mejaTersedia: number
  totalMeja: number
  mejaMaintenance: number
  fnbTerjual: number
  activeBookings: { id: number; meja_id: number; waktu_mulai: string; waktu_selesai: string }[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function DashboardCards({
  pendapatan,
  totalBooking,
  mejaAktif,
  mejaTidakTerpakai,
  mejaTersedia,
  totalMeja,
  mejaMaintenance,
  fnbTerjual,
  activeBookings,
}: DashboardCardsProps) {
  const nearestEndingBooking = activeBookings[0] ?? null
  const cards = [
    {
      label: 'Pendapatan Hari Ini',
      value: formatRupiah(pendapatan),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Booking Hari Ini',
      value: String(totalBooking),
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Meja Aktif',
      value: `${mejaAktif} / ${totalMeja}`,
      subtitle: nearestEndingBooking
        ? `Meja #${nearestEndingBooking.meja_id} selesai paling dekat`
        : mejaMaintenance > 0
          ? `${mejaMaintenance} maintenance`
          : 'Belum ada sesi aktif',
      icon: TimerReset,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Meja Tidak Terpakai',
      value: `${mejaTidakTerpakai}`,
      subtitle: `${mejaTersedia} tersedia${mejaMaintenance > 0 ? ` • ${mejaMaintenance} maintenance` : ''}`,
      icon: CircleDashed,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'F&B Terjual Hari Ini',
      value: `${fnbTerjual} item`,
      icon: UtensilsCrossed,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${c.bg}`}>
                <c.icon className={`size-5 ${c.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{c.label}</p>
                <p className="text-lg font-bold leading-tight">{c.value}</p>
                {c.subtitle && (
                  <p className="text-xs text-muted-foreground">{c.subtitle}</p>
                )}
                {c.label === 'Meja Aktif' && nearestEndingBooking && (
                  <SessionCountdown
                    startAt={nearestEndingBooking.waktu_mulai}
                    endAt={nearestEndingBooking.waktu_selesai}
                    compact
                    className="mt-2 w-fit"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
