'use client'

import './register.css'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'

import ThreeDBackground from '@/components/auth/ThreeDBackground'



export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'client' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw1, setShowPw1] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [pwScore, setPwScore] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightCardRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    const queryRole = searchParams.get('type')
    if (queryRole === 'freelancer') selectRole('freelancer')

    const init = async () => {
      await new Promise(r => setTimeout(r, 300))

      const gsapModule = await import('gsap')

      if (window.innerWidth >= 1024 && leftPanelRef.current) {
        const tl = gsapModule.default.timeline()
        tl.fromTo(leftPanelRef.current,
          { opacity: 0, scale: 0.9, rotateY: -25, z: -150, transformOrigin: 'left center' },
          { opacity: 1, scale: 1, rotateY: 0, z: 0, duration: 1.2, ease: 'power3.out' }
        )
        .fromTo(rightCardRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          '-=1.0'
        )
        setTimeout(startTypewriter, 800)
      } else if (rightCardRef.current) {
        gsapModule.default.fromTo(rightCardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 })
      }
    }

    init()

    const handleMouse = (e: MouseEvent) => {
      if (window.innerWidth < 1024 || !leftPanelRef.current) return
      const x = (window.innerWidth / 2 - e.clientX) / 50
      const y = (window.innerHeight / 2 - e.clientY) / 50
      leftPanelRef.current.style.transform = `perspective(1000px) rotateY(${-x * 0.5}deg) rotateX(${y * 0.5}deg)`
    }

    const handleLeave = () => {
      if (window.innerWidth < 1024 || !leftPanelRef.current) return
      leftPanelRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    }

    document.addEventListener('mousemove', handleMouse)
    document.addEventListener('mouseleave', handleLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  const selectRole = useCallback((role: string) => {
    setForm(prev => ({ ...prev, role }))
  }, [])

  const startTypewriter = useCallback(() => {
    const titleEl = document.getElementById('typewriter-title')
    const subEl = document.getElementById('typewriter-sub')
    if (!titleEl || !subEl) return

    const texts = [
      'Connectez talent et ambition',
      "Rejoignez des centaines d'entrepreneurs et de freelancers qui font confiance à SynergyCraft en Afrique de l'Ouest."
    ]

    let charIndex = 0
    let textIndex = 0
    titleEl.textContent = ''
    subEl.textContent = ''

    const type = () => {
      if (textIndex === 0) {
        if (charIndex < texts[0].length) {
          titleEl.textContent += texts[0][charIndex]
          charIndex++
          setTimeout(type, 30)
        } else {
          textIndex++
          charIndex = 0
          setTimeout(type, 300)
        }
      } else if (textIndex === 1) {
        if (charIndex < texts[1].length) {
          subEl.textContent += texts[1][charIndex]
          charIndex++
          setTimeout(type, 15)
        } else {
          startLoopMessages()
        }
      }
    }
    type()
  }, [])

  const startLoopMessages = useCallback(() => {
    const messages = document.querySelectorAll('.loop-message')
    if (!messages.length) return
    let i = 1
    const show = (idx: number) => {
      messages.forEach((m, j) => {
        (m as HTMLElement).style.opacity = j === idx ? '1' : '0'
        ;(m as HTMLElement).style.visibility = j === idx ? 'visible' : 'hidden'
      })
    }
    show(0)
    setInterval(() => { show(i); i = (i + 1) % messages.length }, 4000)
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError, data } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { first_name: form.first_name, last_name: form.last_name, role: form.role },
      },
    })

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Cet email est déjà utilisé' : authError.message)
      setLoading(false)
      rightCardRef.current?.classList.add('shake-error-active')
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      setTimeout(() => rightCardRef.current?.classList.remove('shake-error-active'), 500)
      return
    }

    if (data.user) {
      router.push('/login?registered=true')
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const onPwChange = (val: string) => {
    let score = 0
    if (val.length >= 8) score++
    if (/[A-Z]/.test(val)) score++
    if (/[0-9]/.test(val)) score++
    if (/[^A-Za-z0-9]/.test(val)) score++
    setPwScore(score)
    update('password')({ target: { value: val } } as any)
  }

  return (
    <div className="reg-page">
      <ThreeDBackground />
      <div className="bg-blur-image"></div>
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      <div className="reg-wrap">
        <aside className="reg-left" ref={leftPanelRef} id="left-info-panel">
          <div>
            <div className="reg-left-logo">
              <div className="reg-left-logo-icon">
                <i className="fas fa-layer-group"></i>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700 }}>Synergy<span style={{ color: 'var(--primary)' }}>Craft</span></div>
                <div style={{ fontSize: '0.65rem', opacity: 0.65, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Marketplace Freelance</div>
              </div>
            </div>

            <div style={{ transform: 'translateZ(40px)' }}>
              <h2 id="typewriter-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem', minHeight: '75px' }}></h2>
              <p id="typewriter-sub" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, minHeight: '50px' }}></p>
            </div>

            <div className="dynamic-messages-box">
              <div className="loop-message">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-bolt text-sm"></i></div>
                  Inscription rapide
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '2.5rem', margin: 0 }}>Créez votre profil en moins de 2 minutes sans aucun engagement financier.</p>
              </div>
              <div className="loop-message">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-shield-alt text-sm"></i></div>
                  Paiement Sécurisé
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '2.5rem', margin: 0 }}>Système d&apos;escrow intégré avec MTN MoMo, Orange Money & Stripe.</p>
              </div>
              <div className="loop-message">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-star text-sm"></i></div>
                  Talents Vérifiés
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '2.5rem', margin: 0 }}>Accédez à une communauté d&apos;experts validés et notés par leurs clients.</p>
              </div>
            </div>
          </div>

          <div style={{ transform: 'translateZ(20px)', marginTop: 'auto', paddingTop: '2rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
              <i className="fas fa-quote-left" style={{ opacity: 0.4, marginRight: '0.3rem', fontSize: '0.9rem' }}></i>
              <strong>SynergyCraft</strong> m&apos;a permis de trouver un développeur sérieux en 48h. Le système d&apos;escrow m&apos;a rassuré dès le départ.
            </p>
            <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>AK</div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Ayao Kpossou</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>CEO, StartupBénin</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="reg-card" ref={rightCardRef} id="register-auth-card">
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Créer un compte
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(232,232,240,0.5)' }}>
              Rejoignez SynergyCraft gratuitement dès aujourd&apos;hui.
            </p>
          </div>

          {error && (
            <div className="reg-error">
              <i className="fas fa-exclamation-circle" style={{ marginTop: '0.1rem', flexShrink: 0 }}></i>
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.625rem', letterSpacing: '0.03em', color: 'rgba(232,232,240,0.7)' }}>
              Je m&apos;inscris en tant que
            </p>
            <div className="role-grid">
              <button type="button" className={`role-btn ${form.role === 'client' ? 'role-active-client' : ''}`}
                onClick={() => selectRole('client')}>
                <div className="role-check-badge"><i className="fas fa-check"></i></div>
                <div className="role-btn-icon"><i className="fas fa-shopping-bag"></i></div>
                <span className="role-btn-title">Client</span>
                <span className="role-btn-sub">Je cherche un expert pour mon projet</span>
              </button>
              <button type="button" className={`role-btn ${form.role === 'freelancer' ? 'role-active-freelancer' : ''}`}
                onClick={() => selectRole('freelancer')}>
                <div className="role-check-badge"><i className="fas fa-check"></i></div>
                <div className="role-btn-icon"><i className="fas fa-laptop-code"></i></div>
                <span className="role-btn-title">Freelancer</span>
                <span className="role-btn-sub">Je propose mes services digitaux</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} id="registerForm">
            <input type="hidden" name="role" value={form.role} />

            <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1.1rem' }}>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label className="field-label">Prénom</label>
                <div className="field-input-wrap">
                  <i className="fas fa-user"></i>
                  <input type="text" value={form.first_name} onChange={update('first_name')} className="field-input" placeholder="Jean" required />
                </div>
              </div>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label className="field-label">Nom</label>
                <div className="field-input-wrap">
                  <i className="fas fa-user"></i>
                  <input type="text" value={form.last_name} onChange={update('last_name')} className="field-input" placeholder="Dupont" />
                </div>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Adresse e-mail</label>
              <div className="field-input-wrap">
                <i className="far fa-envelope"></i>
                <input type="email" value={form.email} onChange={update('email')} className="field-input" placeholder="jean@exemple.com" required />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Mot de passe</label>
              <div className="field-input-wrap">
                <i className="fas fa-lock"></i>
                <input type={showPw1 ? 'text' : 'password'} value={form.password}
                  onChange={e => onPwChange(e.target.value)} className="field-input" placeholder="Minimum 8 caractères" required
                  style={{ paddingRight: '2.75rem' }} />
                <button type="button" className="toggle-pw" onClick={() => setShowPw1(!showPw1)}>
                  <i className={`fas fa-eye${showPw1 ? '-slash' : ''}`}></i>
                </button>
              </div>
              <div className="pw-strength">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`pw-bar ${pwScore > i ? (pwScore <= 1 ? 'weak' : pwScore <= 2 ? 'medium' : 'strong') : ''}`} />
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Confirmer le mot de passe</label>
              <div className="field-input-wrap">
                <i className="fas fa-shield-alt"></i>
                <input type={showPw2 ? 'text' : 'password'} className="field-input" placeholder="Répétez votre mot de passe" required
                  style={{ paddingRight: '2.75rem' }} />
                <button type="button" className="toggle-pw" onClick={() => setShowPw2(!showPw2)}>
                  <i className={`fas fa-eye${showPw2 ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <input type="checkbox" id="cgu" name="cgu" required
                style={{ width: '16px', height: '16px', marginTop: '0.15rem', accentColor: 'var(--primary)', flexShrink: 0, cursor: 'pointer' }} />
              <label htmlFor="cgu" style={{ fontSize: '0.78rem', color: 'rgba(232,232,240,0.4)', cursor: 'pointer', lineHeight: 1.5 }}>
                J&apos;accepte les <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Conditions d&apos;utilisation</a>
                et la <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Politique de confidentialité</a> de SynergyCraft.
              </label>
            </div>

            <button type="submit" disabled={loading} className="reg-submit" id="submit-btn">
              <i className="fas fa-user-plus"></i>
              {form.role === 'client' ? 'Créer mon compte Client' : 'Rejoindre en tant que Freelancer'}
            </button>
          </form>

          <div className="social-divider">ou s&apos;inscrire avec</div>
          <div className="social-row">
            <a href="#" className="social-btn social-btn-google">
              <i className="fab fa-google"></i> Google
            </a>
            <a href="#" className="social-btn social-btn-linkedin">
              <i className="fab fa-linkedin-in"></i> LinkedIn
            </a>
            <a href="#" className="social-btn social-btn-twitter">
              <i className="fab fa-twitter"></i> Twitter
            </a>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'rgba(232,232,240,0.5)' }}>
            Déjà inscrit ?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
