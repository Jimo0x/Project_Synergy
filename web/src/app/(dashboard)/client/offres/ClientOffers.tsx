'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Offer {
  id: number
  title: string
  description: string
  category: string
  budget_min: number | null
  budget_max: number | null
  deadline_days: number
  status: string
  created_at: string
}

export default function ClientOffers({ offers }: { offers: Offer[] }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'web', budget_min: '', budget_max: '', deadline_days: '7' })
  const supabase = createClient()

  const createOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('accounts_clientoffer').insert({
      client_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category as any,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      deadline_days: Number(form.deadline_days),
    } as any)

    setShowForm(false)
    window.location.reload()
  }

  const categoryNames: Record<string, string> = {
    web: 'Développement Web', design: 'Design Graphique', marketing: 'Marketing Digital',
    branding: 'Branding', seo: 'SEO', maintenance: 'Maintenance', writing: 'Rédaction', other: 'Autres',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes offres</h1>
          <p className="text-gray-500 text-sm mt-1">Publiez un brief pour trouver le freelance idéal</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
                className="btn-glow btn-glow-primary px-6 py-2.5 text-sm">
          <i className="fas fa-plus mr-2"></i>Nouvelle offre
        </button>
      </div>

      {showForm && (
        <form onSubmit={createOffer} className="p-8 rounded-2xl mb-8 space-y-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Titre</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                   className="w-full px-4 py-3 rounded-xl text-white text-sm"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm resize-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {Object.entries(categoryNames).map(([k, v]) => (
                  <option key={k} value={k} className="bg-gray-900">{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Budget min (FCFA)</label>
              <input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Budget max (FCFA)</label>
              <input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-3 rounded-xl text-sm text-gray-400"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
            <button type="submit" className="btn-glow btn-glow-primary px-8 py-3 text-sm">Publier l&apos;offre</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {offers.map((offer) => (
          <div key={offer.id} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                    {categoryNames[offer.category] || offer.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    offer.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {offer.status === 'open' ? 'Ouverte' : 'Fermée'}
                  </span>
                </div>
                <h3 className="font-bold">{offer.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{offer.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                  {offer.budget_min && offer.budget_max && (
                    <span><i className="fas fa-money-bill mr-1"></i>{offer.budget_min.toLocaleString('fr-FR')} - {offer.budget_max.toLocaleString('fr-FR')} FCFA</span>
                  )}
                  <span><i className="far fa-calendar mr-1"></i>Délai: {offer.deadline_days} jours</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {offers.length === 0 && !showForm && (
          <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <i className="fas fa-file-alt text-5xl text-gray-600 mb-4"></i>
            <p className="text-gray-500">Aucune offre pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
