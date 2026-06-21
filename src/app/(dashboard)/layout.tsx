import { redirect } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'
import { SidebarProvider } from '~/components/ui/sidebar'
import { AppSidebar } from '~/components/app-sidebar'
import { BottomNav } from '~/components/bottom-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role || 'user'
  if (role === 'admin') redirect('/admin/dashboard')

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden">
        <AppSidebar userEmail={user.email ?? ''} />
        <main className="h-svh flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </SidebarProvider>
  )
}
