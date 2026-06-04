'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { MejaForm } from './meja-form'
import { adminDeleteMeja } from '../actions'
import { useTransition } from 'react'

interface MejaRow {
  id: number
  tarif: number
  status: 'Tersedia' | 'Terpakai' | 'Maintenance'
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
        return (
          <Card key={meja.id} className="border-none ring-1 ring-border/50 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-extrabold">Meja #{meja.id}</CardTitle>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                meja.status === 'Tersedia' ? 'bg-green-100 text-green-800' :
                meja.status === 'Terpakai' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {meja.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Tarif per Jam</p>
                <p className="text-lg font-bold text-primary">
                  {idr(meja.tarif)} <span className="text-xs font-normal text-muted-foreground">/ jam</span>
                </p>
              </div>

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
