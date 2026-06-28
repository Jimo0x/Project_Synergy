'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { UserRole } from '@/lib/database.types'

interface SidebarProps {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: UserRole
  }
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const isClient = user.role === 'client'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const clientLinks = [
    { href: '/client', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: '/catalogue', icon: 'fa-search', label: 'Catalogue' },
    { href: '/panier', icon: 'fa-shopping-cart', label: 'Panier' },
    { href: '/client/commandes', icon: 'fa-shopping-bag', label: 'Mes commandes' },
    { href: '/client/offres', icon: 'fa-file-alt', label: 'Mes offres' },
    { href: '/messagerie', icon: 'fa-comment-dots', label: 'Messages' },
    { href: '/profil', icon: 'fa-user-edit', label: 'Profil' },
    { href: '/parametres', icon: 'fa-cog', label: 'Paramètres' },
  ]

  const freelancerLinks = [
    { href: '/freelance', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: '/freelance/missions', icon: 'fa-tasks', label: 'Missions' },
    { href: '/freelance/services', icon: 'fa-cogs', label: 'Mes services' },
    { href: '/portfolio', icon: 'fa-briefcase', label: 'Portfolio' },
    { href: '/freelance/statistiques', icon: 'fa-chart-line', label: 'Statistiques' },
    { href: '/messagerie', icon: 'fa-comment-dots', label: 'Messages' },
    { href: '/profil', icon: 'fa-user-edit', label: 'Profil' },
    { href: '/parametres', icon: 'fa-cog', label: 'Paramètres' },
  ]

  const links = isClient ? clientLinks : freelancerLinks

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-40 flex flex-col"
           style={{ background: 'rgba(10,10,16,0.95)', backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="p-6 border-b border-white/5">
        <Link href={isClient ? '/client' : '/freelance'} className="text-xl font-bold no-underline"
              style={{ fontFamily: "'Clash Display', sans-serif" }}>
          <span className="text-white">Synergy</span>
          <span style={{ color: 'var(--primary)' }}>Craft</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all no-underline ${
              isActive(link.href)
                ? 'bg-purple-500/15 text-white shadow-sm border border-purple-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className={`fas ${link.icon} w-5 text-center ${isActive(link.href) ? 'text-purple-400' : ''}`}></i>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            {(user.first_name?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.first_name || user.email}
            </p>
            <p className="text-xs text-gray-500">{isClient ? 'Client' : 'Freelance'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <i className="fas fa-sign-out-alt w-5 text-center"></i>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
