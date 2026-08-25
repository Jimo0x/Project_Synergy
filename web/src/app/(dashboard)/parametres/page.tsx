'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function SettingsPage() {
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.new !== password.confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setError('Session introuvable, reconnecte-toi.')
      return
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password.current,
    })
    if (verifyError) {
      setError('Mot de passe actuel incorrect.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: password.new })
    if (updateError) {
      if (updateError.message.toLowerCase().includes('same as the old')) {
        setError('Le nouveau mot de passe doit être différent de l\'ancien.')
      } else {
        setError('Impossible de mettre à jour le mot de passe. Réessaie.')
      }
      return
    }

    setSuccess('Mot de passe mis à jour')
    setPassword({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Paramètres</h1>
      <p className="text-gray-500 text-sm mb-8">Gérez vos paramètres de compte</p>

      <div className="space-y-6">
        <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold mb-6">Changer le mot de passe</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {error && <div className="p-3 rounded-lg text-sm text-red-400 bg-red-500/10">{error}</div>}
            {success && <div className="p-3 rounded-lg text-sm text-green-400 bg-green-500/10">{success}</div>}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mot de passe actuel</label>
              <input type="password" required value={password.current}
                     onChange={(e) => setPassword({ ...password, current: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nouveau mot de passe</label>
              <input type="password" required minLength={6} value={password.new}
                     onChange={(e) => setPassword({ ...password, new: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirmer le mot de passe</label>
              <input type="password" required minLength={6} value={password.confirm}
                     onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <button type="submit" className="btn-glow btn-glow-primary px-8 py-3">
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
