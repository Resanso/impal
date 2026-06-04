'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { FnbForm } from './fnb-form'
import { deleteFnbItem } from '../actions'
import { useTransition } from 'react'

interface FnbItem {
  id: number
  nama: string
  harga: number
  stok: number
  kategori: 'Makanan' | 'Minuman'
}

interface FnbListProps {
  items: FnbItem[]
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)

export function FnbList({ items }: FnbListProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: number) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return

    startTransition(async () => {
      try {
        await deleteFnbItem(id)
      } catch (error) {
        console.error('Error:', error)
        alert('Gagal menghapus data')
      }
    })
  }

  const makanan = items.filter((item) => item.kategori === 'Makanan')
  const minuman = items.filter((item) => item.kategori === 'Minuman')

  const renderCategory = (title: string, categoryItems: FnbItem[]) => (
    <div key={title} className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {categoryItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tidak ada item</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryItems.map((item) => (
            <Card key={item.id} className="flex flex-col border-none ring-1 ring-border/50 shadow-sm hover:ring-primary/20 transition-all">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold">{item.nama}</CardTitle>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  item.stok > 10 ? 'bg-green-100 text-green-800' :
                  item.stok > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.stok > 0 ? 'Ready' : 'Habis'}
                </span>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Harga</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(item.harga)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Stok</p>
                    <p className="text-sm font-medium text-foreground">
                      {item.stok} pcs
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <FnbForm item={item} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {renderCategory('🍽️ Makanan', makanan)}
      {renderCategory('🥤 Minuman', minuman)}
    </div>
  )
}
