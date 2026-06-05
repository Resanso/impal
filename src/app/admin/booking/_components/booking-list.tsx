'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, Clock, CalendarDays, Search, User } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { adminUpdateBookingStatus } from '../actions'

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

interface BookingListProps {
  initialBookings: BookingRow[]
}

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = {
  Pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  Lunas: { label: 'Lunas', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  Batal: { label: 'Batal', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
}

export function BookingList({ initialBookings }: BookingListProps) {
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Pending' | 'Lunas' | 'Batal'>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleUpdateStatus = (id: number, newStatus: 'Lunas' | 'Batal') => {
    const verb = newStatus === 'Lunas' ? 'melunasi' : 'membatalkan'
    if (!confirm(`Yakin ingin ${verb} booking #${id}?`)) return

    startTransition(async () => {
      try {
        await adminUpdateBookingStatus(id, newStatus)
      } catch (error) {
        console.error('Error:', error)
        alert('Gagal memperbarui status booking')
      }
    })
  }

  const filteredBookings = initialBookings.filter(b => {
    const matchesStatus = filterStatus === 'Semua' || b.status_pembayaran === filterStatus
    const matchesSearch = b.user_email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(b.meja_id).includes(searchQuery) ||
                          String(b.id).includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari email user, nomor meja, atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-lg"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['Semua', 'Pending', 'Lunas', 'Batal'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-background hover:bg-muted text-muted-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Count */}
      <p className="text-xs text-muted-foreground font-semibold">
        Menampilkan {filteredBookings.length} booking dari total {initialBookings.length}
      </p>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="py-16 text-center border border-dashed rounded-xl">
          <CalendarDays className="size-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Tidak ada data booking ditemukan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredBookings.map((booking) => {
            const statusConfig = STATUS_CONFIG[booking.status_pembayaran] || STATUS_CONFIG.Pending
            const StatusIcon = statusConfig.icon
            const waktuMulai = new Date(booking.waktu_mulai)
            const waktuSelesai = new Date(booking.waktu_selesai)

            return (
              <Card key={booking.id} className="border-none ring-1 ring-border/50 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-extrabold text-sm text-muted-foreground">#{booking.id}</span>
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="font-bold text-xs text-primary">M{booking.meja_id}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground">Meja {booking.meja_id}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.className}`}>
                          <StatusIcon className="size-3" />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="size-3.5 shrink-0" />
                          <span className="truncate text-foreground font-semibold" title={booking.user_email}>
                            {booking.user_email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 shrink-0" />
                          <span>
                            {waktuMulai.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            {' • '}{waktuMulai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – {waktuSelesai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            {' '}({booking.durasi}m)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="flex flex-row sm:items-center lg:flex-col lg:items-end justify-between lg:justify-center gap-4 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="lg:text-right">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Total Tagihan</p>
                        <p className="text-lg font-black text-primary">{idr(booking.total_tagihan)}</p>
                      </div>

                      {booking.status_pembayaran === 'Pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            onClick={() => handleUpdateStatus(booking.id, 'Lunas')}
                            disabled={isPending}
                          >
                            Setujui Lunas
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive font-semibold"
                            onClick={() => handleUpdateStatus(booking.id, 'Batal')}
                            disabled={isPending}
                          >
                            Batalkan
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
