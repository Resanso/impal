import { getDashboardStats } from './actions'
import { DashboardCards } from './_components/dashboard-cards'
import { PendapatanChart } from './_components/pendapatan-chart'
import { TopMenuTable } from './_components/top-menu-table'
import { TopMejaTable } from './_components/top-meja-table'

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <DashboardCards
        pendapatan={stats.pendapatanHariIni}
        totalBooking={stats.totalBookingHariIni}
        mejaAktif={stats.mejaAktif}
        mejaTidakTerpakai={stats.mejaTidakTerpakai}
        mejaTersedia={stats.mejaTersedia}
        totalMeja={stats.totalMeja}
        mejaMaintenance={stats.mejaMaintenance}
        fnbTerjual={stats.fnbTerjualHariIni}
        activeBookings={stats.activeBookings}
      />

      <PendapatanChart data={stats.pendapatan7Hari} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopMenuTable data={stats.topMenu} />
        <TopMejaTable data={stats.topMeja} />
      </div>
    </div>
  )
}
