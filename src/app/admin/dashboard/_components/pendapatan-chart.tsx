'use client'

import { Card, CardContent, CardHeader } from '~/components/ui/card'

interface PendapatanChartProps {
  data: { tanggal: string; total: number }[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function PendapatanChart({ data }: PendapatanChartProps) {
  const maxVal = Math.max(...data.map(d => d.total), 1)

  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-sm font-semibold">Pendapatan 7 Hari Terakhir</h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {data.map((d) => {
            const height = maxVal > 0 ? (d.total / maxVal) * 100 : 0
            const day = new Date(d.tanggal).toLocaleDateString('id-ID', { weekday: 'short' })
            return (
              <div key={d.tanggal} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {d.total > 0 ? formatRupiah(d.total) : '-'}
                </span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-8 rounded-t bg-primary/80 transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
