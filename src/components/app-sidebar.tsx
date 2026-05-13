'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarPlus, History, User, Layers } from 'lucide-react'
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

const NAV_ITEMS = [
  { href: '/',        icon: Home,        label: 'Beranda'      },
  { href: '/booking', icon: CalendarPlus, label: 'Booking Baru' },
  { href: '/riwayat', icon: History,     label: 'Riwayat'      },
  { href: '/profil',  icon: User,        label: 'Profil'       },
]

interface AppSidebarProps {
  userEmail: string
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="hidden md:flex" collapsible="none">
      {/* Brand */}
      <SidebarHeader className="border-b px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">8BPOS</p>
            <p className="text-xs text-muted-foreground">Biliar Point of Sale</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={active} size="lg">
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
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
      <SidebarFooter className="border-t p-4">
        <div className="mb-3 flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
            {userEmail[0]}
          </div>
          <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
        </div>
        <form action={logout}>
          <Button variant="outline" size="sm" className="w-full">
            Logout
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
