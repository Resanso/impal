import { Coffee, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { createClient } from '~/lib/supabase/server'

interface FnbItem {
  id: number
  nama: string
  harga: number
  stok: number
  kategori: 'Makanan' | 'Minuman'
}

export const revalidate = 0

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default async function FnbPage() {
  let items: FnbItem[] = []
  let error: string | null = null

  try {
    const supabase = await createClient()
    const { data, error: supabaseError } = await supabase
      .from('menu_fnb')
      .select('*')
      .order('kategori')
      .order('nama')

    if (supabaseError) {
      error = supabaseError.message
    } else {
      items = (data as FnbItem[]) ?? []
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data'
  }

  const makanan = items.filter(i => i.kategori === 'Makanan')
  const minuman = items.filter(i => i.kategori === 'Minuman')

  const renderCategoryList = (title: string, categoryItems: FnbItem[]) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold tracking-tight text-foreground border-b pb-2 flex items-center gap-2">
        <span>{title}</span>
        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {categoryItems.length} menu
        </span>
      </h3>
      {categoryItems.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Menu belum tersedia.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryItems.map((item) => {
            const isAvailable = item.stok > 0
            return (
              <Card key={item.id} className="border-none ring-1 ring-border/50 shadow-sm transition-all duration-300 hover:shadow-md hover:ring-primary/20 group">
                <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {item.nama}
                      </h4>
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                          <CheckCircle className="size-3" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                          <XCircle className="size-3" />
                          Habis
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.kategori}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-dashed">
                    <p className="text-sm text-muted-foreground">Harga</p>
                    <p className="text-lg font-extrabold text-foreground">
                      {idr(item.harga)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Coffee className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu F&B</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar makanan dan minuman segar untuk menemani sesi biliar Anda
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">Peringatan: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-10">
        {renderCategoryList('Makanan Lezat', makanan)}
        {renderCategoryList('Minuman Segar', minuman)}
      </div>
    </div>
  )
}
