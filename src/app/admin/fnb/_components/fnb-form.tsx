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
import { createFnbItem, updateFnbItem } from '../actions'
import { Plus } from 'lucide-react'
import { useTransition } from 'react'

interface FnbFormProps {
  item?: {
    id: number
    nama: string
    harga: number
    stok: number
    kategori: 'Makanan' | 'Minuman'
  }
}

export function FnbForm({ item }: FnbFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    nama: item?.nama ?? '',
    harga: item?.harga ?? 0,
    stok: item?.stok ?? 0,
    kategori: item?.kategori ?? ('Makanan' as const),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      try {
        if (item) {
          await updateFnbItem(item.id, formData)
        } else {
          await createFnbItem(formData.nama, formData.harga, formData.stok, formData.kategori)
        }
        setOpen(false)
        if (!item) {
          setFormData({ nama: '', harga: 0, stok: 0, kategori: 'Makanan' })
        }

      } catch (error) {
        console.error('Error:', error)
        alert('Gagal menyimpan data')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {item ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="size-4" />
            Tambah FNB
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{item ? 'Edit FNB' : 'Tambah FNB Baru'}</SheetTitle>
          <SheetDescription>
            {item ? 'Ubah informasi FNB' : 'Tambahkan item FNB baru ke menu'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="nama">Nama Item</Label>
            <Input
              id="nama"
              placeholder="Misal: Nasi Goreng"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="harga">Harga (Rp)</Label>
            <Input
              id="harga"
              type="number"
              placeholder="Misal: 20000"
              value={formData.harga}
              onChange={(e) => setFormData({ ...formData, harga: Number(e.target.value) })}
              required
              min="0"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="stok">Stok</Label>
            <Input
              id="stok"
              type="number"
              placeholder="Misal: 50"
              value={formData.stok}
              onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })}
              required
              min="0"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="kategori">Kategori</Label>
            <select
              id="kategori"
              value={formData.kategori}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  kategori: e.target.value as 'Makanan' | 'Minuman',
                })
              }
              disabled={isPending}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Menyimpan...' : item ? 'Update' : 'Tambah'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
