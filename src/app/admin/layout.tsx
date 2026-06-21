import { redirect } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'
import { SidebarProvider } from '~/components/ui/sidebar'
import { AdminSidebar } from '~/components/admin-sidebar'
import { AdminBottomNav } from '~/components/admin-bottom-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guard: Not logged in
  if (!user) redirect('/login')

  // Guard: Not an admin
  const role = user.user_metadata?.role || 'user'
  if (role !== 'admin') redirect('/')

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden">
        <AdminSidebar userEmail={user.email ?? ''} />
        <main className="h-svh flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <AdminBottomNav />
    </SidebarProvider>
  )
}
