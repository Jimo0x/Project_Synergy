'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import type { UserRole } from '@/lib/database.types'

interface NavbarProps {
  user?: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: UserRole
  } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="navbar" aria-label="Navigation principale">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Link href={user ? (user.role === 'client' ? '/client' : '/freelance') : '/'}
                  className="font-bold text-xl p-0 no-underline hover:bg-transparent"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}>
              <span className="text-white">Synergy</span>
              <span style={{ color: 'var(--primary)' }}>Craft</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {!user ? (
              <>
                <Link href="/" className="nav-link">Accueil</Link>
                <Link href="/catalogue" className="nav-link">Services</Link>
                <Link href="/login" className="nav-link">Connexion</Link>
                <Link href="/register" className="btn-glow btn-glow-primary ml-2 py-2 px-6 no-underline" style={{ fontSize: '0.85rem' }}>
                  S&apos;inscrire
                </Link>
              </>
            ) : user.role === 'client' ? (
              <ClientNav />
            ) : (
              <FreelancerNav />
            )}
          </div>

          <div className="lg:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}
                    className="btn btn-ghost btn-circle text-white">
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden mt-2 pb-4 space-y-2"
               style={{ background: 'rgba(10,10,16,0.95)', backdropFilter: 'blur(10px)' }}>
            {!user ? (
              <>
                <Link href="/" className="block px-4 py-2 text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Accueil</Link>
                <Link href="/catalogue" className="block px-4 py-2 text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Services</Link>
                <Link href="/login" className="block px-4 py-2 text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Connexion</Link>
                <Link href="/register" className="block px-4 py-2 text-primary font-semibold" onClick={() => setMenuOpen(false)}>S&apos;inscrire</Link>
              </>
            ) : (
              <>
                <Link href="/profil" className="block px-4 py-2 text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Mon Profil</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                        className="block w-full text-left px-4 py-2 text-red-400">
                  Déconnexion
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .navbar {
          padding: 1rem 0;
          background: rgba(5, 5, 8, 0.65) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .nav-link {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          font-weight: 500;
          white-space: nowrap;
          color: rgba(232, 232, 240, 0.75);
          text-decoration: none;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: white;
        }
      `}</style>
    </nav>
  )
}

function ClientNav() {
  const supabase = createClient()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/client" className="nav-link">Accueil</Link>
      <Link href="/catalogue" className="nav-link">Catalogue</Link>
      <Link href="/panier" className="nav-link">Panier</Link>
      <Link href="/messagerie" className="nav-link">Messages</Link>
      <Link href="/contact" className="nav-link">Contact</Link>
      <div className="relative group ml-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/15 text-white font-semibold text-sm">
          <i className="fas fa-user-circle"></i>
          <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem' }}></i>
        </button>
        <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
             style={{ transform: 'translateY(-10px)', background: 'rgba(10,10,16,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="py-2">
            <Link href="/client" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-tachometer-alt mr-2 text-purple-500"></i>Tableau de bord</Link>
            <Link href="/profil" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-user-edit mr-2 text-purple-500"></i>Mon profil</Link>
            <Link href="/client/commandes" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-shopping-bag mr-2 text-purple-500"></i>Mes commandes</Link>
            <Link href="/messagerie" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-comment-dots mr-2 text-purple-500"></i>Messagerie</Link>
            <Link href="/parametres" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-cog mr-2 text-purple-500"></i>Paramètres</Link>
            <div className="border-t border-gray-800 my-1"></div>
            <button onClick={handleLogout} className="block w-full text-left px-5 py-3 text-red-400 hover:bg-red-500/10 no-underline"><i className="fas fa-sign-out-alt mr-2"></i>Déconnexion</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FreelancerNav() {
  const supabase = createClient()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/freelance" className="nav-link">Accueil</Link>
      <Link href="/freelance/missions" className="nav-link">Missions</Link>
      <Link href="/freelance/services" className="nav-link">Mes offres</Link>
      <Link href="/messagerie" className="nav-link">Messages</Link>
      <div className="relative group ml-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/15 text-white font-semibold text-sm">
          <i className="fas fa-user-circle"></i>
          <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem' }}></i>
        </button>
        <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
             style={{ transform: 'translateY(-10px)', background: 'rgba(10,10,16,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="py-2">
            <Link href="/freelance" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-tachometer-alt mr-2 text-purple-500"></i>Tableau de bord</Link>
            <Link href="/profil" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-user-edit mr-2 text-purple-500"></i>Mon profil</Link>
            <Link href="/portfolio" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-briefcase mr-2 text-purple-500"></i>Mon portfolio</Link>
            <Link href="/messagerie" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-comment-dots mr-2 text-purple-500"></i>Messagerie</Link>
            <Link href="/freelance/statistiques" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-chart-line mr-2 text-purple-500"></i>Statistiques</Link>
            <Link href="/parametres" className="block px-5 py-3 text-gray-300 hover:text-white hover:bg-purple-500/15 no-underline"><i className="fas fa-cog mr-2 text-purple-500"></i>Paramètres</Link>
            <div className="border-t border-gray-800 my-1"></div>
            <button onClick={handleLogout} className="block w-full text-left px-5 py-3 text-red-400 hover:bg-red-500/10 no-underline"><i className="fas fa-sign-out-alt mr-2"></i>Déconnexion</button>
          </div>
        </div>
      </div>
    </div>
  )
}
