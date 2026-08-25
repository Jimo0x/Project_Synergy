'use client'

import './login.css'
import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import type { UserRole } from '@/lib/database.types'

import ThreeDBackground from '@/components/auth/ThreeDBackground'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const cardRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    const init = async () => {
      const gsapModule = await import('gsap')

      const tl = gsapModule.default.timeline()

      tl.fromTo('.glass-fragment',
        { opacity: 0, x: () => gsapModule.default.utils.random(-800, 800), y: () => gsapModule.default.utils.random(-800, 800), z: () => gsapModule.default.utils.random(300, 800), rotateX: () => gsapModule.default.utils.random(-360, 360), rotateY: () => gsapModule.default.utils.random(-360, 360), scale: () => gsapModule.default.utils.random(0.5, 2) },
        { opacity: 1, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 0.8, duration: 1.2, stagger: 0.05, ease: 'back.out(1.1)' }
      )
      .to('.glass-fragment', { opacity: 0, scale: 0.3, duration: 0.3, ease: 'power2.in' }, '-=0.15')
      .set('#fragments-container', { display: 'none' })
      .fromTo(cardRef.current,
        { opacity: 0, scale: 0.8, rotateX: 45, z: -200 },
        { opacity: 1, scale: 1, rotateX: 0, z: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo('.form-element',
        { opacity: 0, z: 150, y: 20 },
        { opacity: 1, z: 30, y: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(1.5)' },
        '-=0.4'
      )
    }

    init()

    const handleMouse = (e: MouseEvent) => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (centerY - y) / 15
      const rotateY = (x - centerX) / 15
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }

    const handleLeave = () => {
      const card = cardRef.current
      if (!card) return
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    }

    document.addEventListener('mousemove', handleMouse)
    document.addEventListener('mouseleave', handleLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : authError.message)
      setLoading(false)
      cardRef.current?.classList.add('shake-error')
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      setTimeout(() => cardRef.current?.classList.remove('shake-error'), 500)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('accounts_user')
        .select('role')
        .eq('id', user.id)
        .single() as unknown as { data: { role: UserRole } | null }

      router.push(profile?.role === 'client' ? '/client' : '/freelance')
    }
  }

  const registered = searchParams.get('registered') === 'true'

  return (
    <div className="login-page">
      <ThreeDBackground />
      <div className="bg-blur-image"></div>
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      <div id="fragments-container">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`glass-fragment frag-${i}`} />
        ))}
      </div>

      <div id="auth-card" ref={cardRef} className="login-card">
        <div className="avatar-container form-element">
          <div className="avatar-glow"></div>
          <div className="avatar-inner">
            <i className="fas fa-user-shield"></i>
          </div>
        </div>

        <div className="text-center mb-8 form-element">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Espace Connexion
          </h2>
          <p className="text-sm text-gray-400">Heureux de vous revoir sur la plateforme</p>
        </div>

        {registered && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.75rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ADE80', fontSize: '0.82rem' }} className="form-element">
            <i className="fas fa-check-circle mr-1"></i> Compte créé avec succès ! Connectez-vous.
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: '0.82rem' }} className="form-element">
            <i className="fas fa-exclamation-triangle mr-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="glass-input-wrapper form-element">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-input" placeholder="Nom d'utilisateur ou e-mail" required />
            <i className="fas fa-envelope input-icon"></i>
          </div>

          <div className="glass-input-wrapper form-element">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="glass-input" placeholder="Mot de passe" required />
            <i className="fas fa-lock input-icon"></i>
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <i className={`fas fa-eye${showPw ? '-slash' : ''}`}></i>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 form-element">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="checkbox checkbox-xs border-white/20 checked:border-primary"
                style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }} />
              <span>Se souvenir de moi</span>
            </label>
            <Link href="/forgot-password" className="hover:text-primary transition-colors">Mot de passe oublié ?</Link>
          </div>

          <div className="pt-4 form-element">
            <button type="submit" disabled={loading} className="btn-glow btn-glow-primary w-full py-4 rounded-xl font-bold tracking-wide">
              {loading ? 'Connexion...' : 'Se connecter'} <i className="fas fa-sign-in-alt ml-2"></i>
            </button>
          </div>
        </form>

        <div className="text-center mt-8 text-sm text-gray-400 form-element">
          Nouveau sur SynergyCraft ?{' '}
          <Link href="/register" className="text-secondary hover:underline font-medium">Créer un compte</Link>
        </div>
      </div>
    </div>
  )
}
