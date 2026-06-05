'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { adminCreateMeja, adminUpdateMeja } from '../actions'
import { Plus } from 'lucide-react'
import { useTransition } from 'react'

interface MejaFormProps {
  meja?: {
    id: number
    tarif: number
    status: 'Tersedia' | 'Terpakai' | 'Maintenance'
  }
}

export function MejaForm({ meja }: MejaFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    tarif: meja?.tarif ?? 30000,
    status: meja?.status ?? ('Tersedia' as const),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        if (meja) {
          await adminUpdateMeja(meja.id, formData)
        } else {
          await adminCreateMeja(formData.tarif, formData.status)
        }
        setOpen(false)
        if (!meja) {
          setFormData({ tarif: 30000, status: 'Tersedia' })
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Gagal menyimpan data meja')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {meja ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="size-4" />
            Tambah Meja
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{meja ? `Edit Meja #${meja.id}` : 'Tambah Meja Baru'}</SheetTitle>
          <SheetDescription>
            {meja ? 'Ubah tarif atau status operasional meja biliar' : 'Tambahkan meja biliar baru ke sistem billing'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="tarif">Tarif per Jam (Rp)</Label>
            <Input
              id="tarif"
              type="number"
              placeholder="Misal: 30000"
              value={formData.tarif}
              onChange={(e) => setFormData({ ...formData, tarif: Number(e.target.value) })}
              required
              min="0"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="status">Status Operasional</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'Tersedia' | 'Terpakai' | 'Maintenance',
                })
              }
              disabled={isPending}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="Tersedia">Tersedia (Available)</option>
              <option value="Terpakai">Terpakai (In Use)</option>
              <option value="Maintenance">Pemeliharaan (Maintenance)</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Menyimpan...' : meja ? 'Update Meja' : 'Tambah Meja'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
