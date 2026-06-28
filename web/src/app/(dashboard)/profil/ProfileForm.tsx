'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { UserRole } from '@/lib/database.types'

interface ProfileData {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  notif_email: boolean
  notif_push: boolean
  notif_newsletter: boolean
}

interface ClientProfileData {
  phone: string
  country: string
  city: string
  preferred_payment: string
  avatar: string | null
}

interface FreelancerProfileData {
  bio: string
  hourly_rate: number | null
  portfolio_url: string | null
  linkedin_url: string | null
  github_url: string | null
  avatar: string | null
}

interface Skill {
  id: number
  name: string
}

export function ProfileForm({
  user,
  clientProfile,
  freelancerProfile,
  skills,
}: {
  user: ProfileData | null
  clientProfile: ClientProfileData | null
  freelancerProfile: FreelancerProfileData | null
  skills: Skill[]
}) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: clientProfile?.phone || '',
    country: clientProfile?.country || 'Benin',
    city: clientProfile?.city || '',
    preferred_payment: clientProfile?.preferred_payment || 'mtn_momo',
    bio: freelancerProfile?.bio || '',
    hourly_rate: freelancerProfile?.hourly_rate || null,
    linkedin_url: freelancerProfile?.linkedin_url || '',
    github_url: freelancerProfile?.github_url || '',
    notif_email: user?.notif_email ?? true,
    notif_push: user?.notif_push ?? true,
    notif_newsletter: user?.notif_newsletter ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    await (supabase.from('accounts_user') as any).update({
      first_name: form.first_name,
      last_name: form.last_name,
      notif_email: form.notif_email,
      notif_push: form.notif_push,
      notif_newsletter: form.notif_newsletter,
    }).eq('id', authUser.id)

    if (user?.role === 'client' && clientProfile) {
      await (supabase.from('accounts_clientprofile') as any).update({
        phone: form.phone,
        country: form.country,
        city: form.city,
        preferred_payment: form.preferred_payment,
      }).eq('user_id', authUser.id)
    }

    if (user?.role === 'freelancer' && freelancerProfile) {
      await (supabase.from('freelancers_freelancerprofile') as any).update({
        bio: form.bio,
        hourly_rate: form.hourly_rate,
        linkedin_url: form.linkedin_url || null,
        github_url: form.github_url || null,
      }).eq('user_id', authUser.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Mon Profil</h1>
      <p className="text-gray-500 text-sm mb-8">Gérez vos informations personnelles</p>

      <div className="space-y-6">
        <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold mb-6">Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Prénom</label>
              <input type="text" value={form.first_name} onChange={update('first_name')}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom</label>
              <input type="text" value={form.last_name} onChange={update('last_name')}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input type="email" value={user?.email || ''} disabled
                   className="w-full px-4 py-3 rounded-xl text-gray-500 text-sm cursor-not-allowed"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </div>

        {user?.role === 'client' && (
          <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold mb-6">Informations client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Téléphone</label>
                <input type="text" value={form.phone} onChange={update('phone')}
                       className="w-full px-4 py-3 rounded-xl text-white text-sm"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Pays</label>
                  <input type="text" value={form.country} onChange={update('country')}
                         className="w-full px-4 py-3 rounded-xl text-white text-sm"
                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ville</label>
                  <input type="text" value={form.city} onChange={update('city')}
                         className="w-full px-4 py-3 rounded-xl text-white text-sm"
                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Paiement préféré</label>
                <select value={form.preferred_payment} onChange={update('preferred_payment')}
                        className="w-full px-4 py-3 rounded-xl text-white text-sm"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="mtn_momo" className="bg-gray-900">MTN Mobile Money</option>
                  <option value="orange_money" className="bg-gray-900">Orange Money</option>
                  <option value="stripe" className="bg-gray-900">Stripe</option>
                  <option value="paypal" className="bg-gray-900">PayPal</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'freelancer' && (
          <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold mb-6">Profil freelance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bio</label>
                <textarea rows={4} value={form.bio} onChange={update('bio')}
                          className="w-full px-4 py-3 rounded-xl text-white text-sm resize-none"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Taux horaire (FCFA)</label>
                  <input type="number" value={form.hourly_rate || ''} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value ? Number(e.target.value) : null })}
                         className="w-full px-4 py-3 rounded-xl text-white text-sm"
                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">LinkedIn</label>
                <input type="url" value={form.linkedin_url} onChange={update('linkedin_url')}
                       className="w-full px-4 py-3 rounded-xl text-white text-sm"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">GitHub</label>
                <input type="url" value={form.github_url} onChange={update('github_url')}
                       className="w-full px-4 py-3 rounded-xl text-white text-sm"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              {skills.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Compétences disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s.id} className="px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold mb-6">Notifications</h2>
          <div className="space-y-3">
            {[
              { field: 'notif_email', label: 'Notifications par email' },
              { field: 'notif_push', label: 'Notifications push' },
              { field: 'notif_newsletter', label: 'Newsletter' },
            ].map((n) => (
              <label key={n.field} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={(form as any)[n.field]} onChange={(e) => setForm({ ...form, [n.field]: e.target.checked })}
                       className="w-4 h-4 rounded" style={{ accentColor: 'var(--primary)' }} />
                <span className="text-sm text-gray-300">{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {saved && <span className="text-green-400 text-sm self-center"><i className="fas fa-check mr-1"></i>Sauvegardé</span>}
          <button onClick={handleSave} disabled={saving}
                  className="btn-glow btn-glow-primary px-10 py-3 disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
