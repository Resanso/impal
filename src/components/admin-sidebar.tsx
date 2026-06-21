'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Coffee, CalendarDays, Layers, LogOut, LayoutDashboard } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { logout } from '~/app/login/actions'
import { Button } from '~/components/ui/button'

const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/fnb',     icon: Coffee,       label: 'Kelola FNB'          },
  { href: '/admin/booking', icon: CalendarDays,  label: 'Kelola Booking & Meja' },
]

interface AdminSidebarProps {
  userEmail: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="hidden md:flex" collapsible="none">
      {/* Brand */}
      <SidebarHeader className="border-b px-4 py-5 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Layers className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">8BPOS Admin</p>
            <p className="text-xs text-muted-foreground mt-0.5">Control Panel</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href)
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={active} size="lg" className="rounded-lg transition-all">
                      <Link href={href} className="flex items-center gap-3">
                        <Icon className={`size-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User + Logout */}
      <SidebarFooter className="border-t p-4 bg-muted/20">
        <div className="mb-3 flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
            {userEmail[0] || 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="truncate text-xs font-semibold text-foreground leading-none">{userEmail.split('@')[0]}</p>
            <p className="truncate text-[10px] text-muted-foreground mt-0.5">{userEmail}</p>
          </div>
        </div>
        <form action={logout}>
          <Button variant="destructive" size="sm" className="w-full gap-2 font-medium hover:bg-destructive/90">
            <LogOut className="size-3.5" />
            Logout
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
