'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarPlus, History, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/',        icon: Home,        label: 'Beranda'  },
  { href: '/booking', icon: CalendarPlus, label: 'Booking'  },
  { href: '/riwayat', icon: History,     label: 'Riwayat'  },
  { href: '/profil',  icon: User,        label: 'Profil'   },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-background md:hidden">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className={`size-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            <span className={`text-[10px] font-medium ${active ? '' : 'opacity-70'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
