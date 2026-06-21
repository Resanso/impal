'use client'

import { Card, CardContent, CardHeader } from '~/components/ui/card'

interface TopMejaTableProps {
  data: { id: number; totalBooking: number }[]
}

export function TopMejaTable({ data }: TopMejaTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-sm font-semibold">Meja Paling Laris</h2>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Meja</th>
                <th className="pb-2 font-medium text-right">Total Booking</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2">Meja #{item.id}</td>
                  <td className="py-2 text-right">{item.totalBooking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
