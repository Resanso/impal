'use client'

import { Card, CardContent, CardHeader } from '~/components/ui/card'

interface TopMenuTableProps {
  data: { nama: string; terjual: number; revenue: number }[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function TopMenuTable({ data }: TopMenuTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-sm font-semibold">Top 5 Menu Terlaris</h2>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Menu</th>
                <th className="pb-2 font-medium text-right">Terjual</th>
                <th className="pb-2 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{item.nama}</td>
                  <td className="py-2 text-right">{item.terjual}</td>
                  <td className="py-2 text-right">{formatRupiah(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
