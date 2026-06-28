'use client'

import type { UserRole } from '@/lib/database.types'

interface TopbarProps {
  user: {
    id: string
    email: string
    role: UserRole
  }
}

export default function DashboardTopbar({ user }: TopbarProps) {
  const isClient = user.role === 'client'

  return (
    <div className="topbar" style={{
      position: 'relative',
      zIndex: 20,
      maxWidth: '1600px',
      margin: '0 auto 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      justifyContent: isClient ? 'flex-start' : 'flex-end',
      padding: '0 2rem',
    }}>
      {isClient && (
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="fas fa-search" style={{
            position: 'absolute',
            left: '1.1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.85rem',
            pointerEvents: 'none',
          }}></i>
          <input type="text" placeholder="Rechercher un service, un freelancer…"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.875rem',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              color: 'white',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.4)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
          />
        </div>
      )}

      {isClient && (
        <div style={{ position: 'relative' }}>
          <button className="topbar-icon-btn" title="Notifications" style={{
            position: 'relative',
            width: '44px', height: '44px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)', fontSize: '1rem',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <i className="fas fa-bell"></i>
          </button>
        </div>
      )}

      <a href="/messagerie" className="topbar-icon-btn" title="Messages" style={{
        position: 'relative',
        width: '44px', height: '44px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.875rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)', fontSize: '1rem',
        cursor: 'pointer', transition: 'all 0.2s',
        textDecoration: 'none',
      }}>
        <i className="fas fa-comment-dots"></i>
      </a>

      {isClient && (
        <a href="/panier" className="topbar-icon-btn" title="Panier" style={{
          position: 'relative',
          width: '44px', height: '44px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)', fontSize: '1rem',
          cursor: 'pointer', transition: 'all 0.2s',
          textDecoration: 'none',
        }}>
          <i className="fas fa-shopping-cart"></i>
        </a>
      )}
    </div>
  )
}
