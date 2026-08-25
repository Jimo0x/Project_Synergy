'use client'

import '../auth-reset.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const [passwords, setPasswords] = useState({ next: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState<'checking' | 'ok' | 'invalid'>('checking')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionChecked(user ? 'ok' : 'invalid')
    })
  }, [supabase])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (passwords.next.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: passwords.next })

    if (updateError) {
      setError("Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.")
      setLoading(false)
      return
    }

    await supabase.auth.signOut({ scope: 'others' })
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="reset-page">
      <div className="reset-bg-glow glow-a"></div>
      <div className="reset-bg-glow glow-b"></div>

      <div className="reset-card">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Nouveau mot de passe
          </h2>
          <p className="text-sm text-gray-400">Choisis un mot de passe robuste pour sécuriser ton compte</p>
        </div>

        {sessionChecked === 'invalid' && (
          <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
            Lien invalide ou expiré.
            <Link href="/forgot-password" className="block mt-2 underline hover:text-white">Demander un nouveau lien</Link>
          </div>
        )}

        {sessionChecked === 'invalid' ? null : success ? (
          <div className="text-center">
            <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ADE80' }}>
              <i className="fas fa-check-circle mr-1"></i> Mot de passe mis à jour. Les autres sessions ont été déconnectées.
            </div>
            <Link href="/login" className="btn-glow btn-glow-primary inline-block px-8 py-3 no-underline font-bold">
              Se connecter
            </Link>
          </div>
        ) : sessionChecked === 'checking' ? (
          <p className="text-center text-sm text-gray-500 py-8">
            <i className="fas fa-circle-notch fa-spin mr-2"></i>Vérification du lien...
          </p>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-1">
            {error && (
              <div className="mb-5 p-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                <i className="fas fa-exclamation-triangle mr-1"></i> {error}
              </div>
            )}

            <div className="reset-input-wrapper">
              <input type="password" value={passwords.next} required minLength={8}
                     onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                     className="reset-input" placeholder="Nouveau mot de passe (min. 8 caractères)" />
              <i className="fas fa-lock reset-icon"></i>
            </div>

            <div className="reset-input-wrapper">
              <input type="password" value={passwords.confirm} required minLength={8}
                     onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                     className="reset-input" placeholder="Confirmer le mot de passe" />
              <i className="fas fa-lock reset-icon"></i>
            </div>

            <button type="submit" disabled={loading || sessionChecked !== 'ok'}
                    className="btn-glow btn-glow-primary w-full py-3.5 rounded-xl font-bold tracking-wide disabled:opacity-60">
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}

        <div className="text-center mt-8 text-sm text-gray-400">
          <Link href="/login" className="hover:text-white transition-colors">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  )
}
