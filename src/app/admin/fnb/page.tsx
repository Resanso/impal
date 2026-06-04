import { Coffee } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { FnbForm } from './_components/fnb-form'
import { FnbList } from './_components/fnb-list'
import { getFnbItems, type FnbItem } from './actions'

export const revalidate = 0

export default async function AdminFnbPage() {
  let items: FnbItem[] = []
  let error: string | null = null

  try {
    items = await getFnbItems()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data'
  }

  const totalItem = items.length
  const totalStok = items.reduce((sum, item) => sum + item.stok, 0)
  const totalHarga = items.reduce((sum, item) => sum + item.harga * item.stok, 0)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Coffee className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelola FNB</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola menu makanan dan minuman untuk restoran biliar Anda
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <FnbForm />
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-none ring-1 ring-border/50 shadow-sm bg-blue-50/30 dark:bg-blue-900/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600/80">Total Item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{totalItem}</div>
          </CardContent>
        </Card>
        <Card className="border-none ring-1 ring-border/50 shadow-sm bg-amber-50/30 dark:bg-amber-900/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-600/80">Total Stok</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-400">{totalStok}</div>
          </CardContent>
        </Card>
        <Card className="border-none ring-1 ring-border/50 shadow-sm bg-emerald-50/30 dark:bg-emerald-900/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600/80">Nilai Stok</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(totalHarga)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FNB List */}
      <Card className="border-none ring-1 ring-border/50 shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl">Daftar Menu FNB</CardTitle>
          <CardDescription>Aktifkan, edit, atau hapus menu makanan dan minuman restoran Anda</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground font-medium">Gagal memuat data</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-12 border border-dashed rounded-xl">
              <p className="text-muted-foreground font-medium text-sm">Belum ada item FNB. Klik tombol "Tambah FNB" di atas.</p>
            </div>
          ) : (
            <FnbList items={items} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
