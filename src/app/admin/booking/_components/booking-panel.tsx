'use client'

import { useState } from 'react'
import { CalendarDays, MapPin } from 'lucide-react'
import { BookingList } from './booking-list'
import { MejaList } from './meja-list'
import { MejaForm } from './meja-form'

interface BookingRow {
  id: number
  user_id: string
  user_email: string
  meja_id: number
  durasi: number
  waktu_mulai: string
  waktu_selesai: string
  status_pembayaran: 'Pending' | 'Lunas' | 'Batal'
  total_tagihan: number
  created_at: string
  meja: { id: number; tarif: number } | null
}

interface MejaRow {
  id: number
  tarif: number
  status: 'Tersedia' | 'Terpakai' | 'Maintenance'
}

interface BookingPanelProps {
  bookings: BookingRow[]
  mejaList: MejaRow[]
}

export function BookingPanel({ bookings, mejaList }: BookingPanelProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'tables'>('bookings')

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            activeTab === 'bookings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarDays className="size-4" />
          Daftar Booking
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            activeTab === 'tables'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="size-4" />
          Kelola Meja
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'bookings' ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5 pb-2">
            <h2 className="text-xl font-bold tracking-tight">Booking Sesi Masuk</h2>
            <p className="text-sm text-muted-foreground">Konfirmasi pembayaran atau batalkan booking pelanggan</p>
          </div>
          <BookingList initialBookings={bookings} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Daftar Meja Biliar</h2>
              <p className="text-sm text-muted-foreground">Tambahkan, edit status, atau ubah tarif sewa meja</p>
            </div>
            <div className="shrink-0">
              <MejaForm />
            </div>
          </div>
          <MejaList items={mejaList} />
        </div>
      )}
    </div>
  )
}
