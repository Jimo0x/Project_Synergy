'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Service {
  id: number
  title: string
  slug: string
  description: string
  category: string
  price: number
  delivery_time_days: number
  is_active: boolean
}

export default function FreelanceServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'web', price: '', delivery_time_days: '7' })
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('services_service')
        .select('*')
        .eq('created_by_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setServices(data || []))
    })
  }, [])

  const createService = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('services_service').insert({
      title: form.title,
      description: form.description,
      category: form.category as any,
      price: Number(form.price),
      delivery_time_days: Number(form.delivery_time_days),
      created_by_id: user.id,
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
          <h1 className="text-2xl font-bold">Mes services</h1>
          <p className="text-gray-500 text-sm mt-1">Proposez vos services aux clients</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
                className="btn-glow btn-glow-primary px-6 py-2.5 text-sm">
          <i className="fas fa-plus mr-2"></i>Nouveau service
        </button>
      </div>

      {showForm && (
        <form onSubmit={createService} className="p-8 rounded-2xl mb-8 space-y-4"
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
              <label className="block text-sm text-gray-400 mb-2">Prix (FCFA)</label>
              <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Délai (jours)</label>
              <input type="number" required value={form.delivery_time_days} onChange={(e) => setForm({ ...form, delivery_time_days: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-3 rounded-xl text-sm text-gray-400"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
            <button type="submit" className="btn-glow btn-glow-primary px-8 py-3 text-sm">Publier</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                  {categoryNames[service.category] || service.category}
                </span>
                <h3 className="font-bold mt-1">{service.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{service.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold gradient-text">{service.price.toLocaleString('fr-FR')} FCFA</p>
                <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full font-medium ${
                  service.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {service.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && !showForm && (
          <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <i className="fas fa-cogs text-5xl text-gray-600 mb-4"></i>
            <p className="text-gray-500">Aucun service pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
