'use client'

import '../auth-reset.css'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="reset-page">
      <div className="reset-bg-glow glow-a"></div>
      <div className="reset-bg-glow glow-b"></div>

      <div className="reset-card">
        <div className="text-center mb-8">
          <div className="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-2xl"
               style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))', border: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="fas fa-key text-xl" style={{ color: 'var(--primary)' }}></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Mot de passe oublié
          </h2>
          <p className="text-sm text-gray-400">Entre ton email pour recevoir un lien de réinitialisation</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ADE80' }}>
              <i className="fas fa-paper-plane mr-2"></i>
              Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
            </div>
            <Link href="/login" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--secondary)' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRequest}>
            <div className="reset-input-wrapper">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     className="reset-input" placeholder="Adresse email" required />
              <i className="fas fa-envelope reset-icon"></i>
            </div>

            <button type="submit" disabled={loading}
                    className="btn-glow btn-glow-primary w-full py-3.5 rounded-xl font-bold tracking-wide disabled:opacity-60 mt-2">
              {loading ? 'Envoi...' : 'Envoyer le lien'} <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </form>
        )}

        <div className="text-center mt-8 text-sm text-gray-400">
          Pas encore de compte ?{' '}
          <Link href="/register" style={{ color: 'var(--secondary)' }} className="hover:underline font-medium">Créer un compte</Link>
        </div>
      </div>
    </div>
  )
}
