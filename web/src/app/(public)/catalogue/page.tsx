'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

interface Service {
  id: number
  title: string
  slug: string
  description: string
  category: string
  price: number
  delivery_time_days: number
  image: string | null
}

const categoryNames: Record<string, string> = {
  web: 'Développement Web', design: 'Design Graphique', marketing: 'Marketing Digital',
  branding: 'Branding', seo: 'SEO', maintenance: 'Maintenance', writing: 'Rédaction', other: 'Autres',
}

const categories = [
  { value: 'Design Graphique', label: 'Design', icon: 'fa-palette' },
  { value: 'Développement Web', label: 'Dev Web', icon: 'fa-code' },
  { value: 'Marketing Digital', label: 'Marketing', icon: 'fa-chart-line' },
  { value: 'SEO', label: 'SEO', icon: 'fa-search' },
  { value: 'Branding', label: 'Branding', icon: 'fa-gem' },
  { value: 'Rédaction', label: 'Rédaction', icon: 'fa-pen-nib' },
]

const filterCategories = [
  { value: 'Design Graphique', label: 'Design Graphique', count: 12 },
  { value: 'Développement Web', label: 'Développement Web', count: 8 },
  { value: 'Marketing Digital', label: 'Marketing Digital', count: 10 },
  { value: 'Branding', label: 'Branding', count: 6 },
  { value: 'SEO', label: 'SEO', count: 5 },
  { value: 'Maintenance', label: 'Maintenance', count: 4 },
  { value: 'Rédaction', label: 'Rédaction', count: 3 },
]

export default function CataloguePage() {
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activePill, setActivePill] = useState('all')
  const [priceMax, setPriceMax] = useState(5000)
  const [sortBy, setSortBy] = useState('default')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filterCategories.map(c => c.value))
  const [deliveryFilter, setDeliveryFilter] = useState('all')
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('services_service')
      .select('id, title, slug, description, category, price, delivery_time_days, image')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setServices(data || []))

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('accounts_user').select('role').eq('id', user.id).single()
          .then(({ data }) => setUserRole((data as { role: string } | null)?.role || null))
      }
    })
  }, [])

  const filtered = services.filter(s => {
    const matchesSearch = !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPill = activePill === 'all' || categoryNames[s.category] === activePill
    const matchesPrice = s.price <= (priceMax >= 5000 ? Infinity : priceMax)
    const matchesCategory = selectedCategories.includes(categoryNames[s.category])
    return matchesSearch && matchesPill && matchesPrice && matchesCategory
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return 0
  })

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }, [])

  return (
    <div>
      <section className="cat-hero">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="cat-eyebrow">
                <i className="fas fa-store"></i> Catalogue
              </div>
              <h1 className="cat-title">
                Trouvez le <br />
                <span className="gradient-text">Service</span> qu'il<br />
                vous faut !
              </h1>
              <p className="cat-subtitle">
                Des services digitaux de qualité, livrés par des talents vérifiés au Bénin et en Afrique de l'Ouest.
              </p>
              <div style={{ marginTop: '-1rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {userRole === 'client' && (
                  <button onClick={() => setShowOfferModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.3)', transition: 'transform 0.2s' }}>
                    <i className="fas fa-plus"></i> Publier un besoin (Offre projet)
                  </button>
                )}
                {userRole === 'freelancer' && (
                  <Link href="/devis"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #818cf8, #7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                    <i className="fas fa-bullhorn"></i> Voir les projets clients
                  </Link>
                )}
              </div>
            </div>
            <div className="cat-stats">
              <div>
                <span className="cat-stat-num gradient-text">{services.length}+</span>
                <span className="cat-stat-label">Services</span>
              </div>
              <div>
                <span className="cat-stat-num gradient-text">4.8★</span>
                <span className="cat-stat-label">Note moy.</span>
              </div>
              <div>
                <span className="cat-stat-num gradient-text">200+</span>
                <span className="cat-stat-label">Projets livrés</span>
              </div>
            </div>
          </div>

          <div className="pill-row">
            <button className={`sc-pill ${activePill === 'all' ? 'active' : ''}`} onClick={() => setActivePill('all')}>
              <i className="fas fa-th-large"></i> Tout voir
            </button>
            {categories.map(cat => (
              <button key={cat.value} className={`sc-pill ${activePill === cat.value ? 'active' : ''}`}
                onClick={() => setActivePill(activePill === cat.value ? 'all' : cat.value)}>
                <i className={`fas ${cat.icon}`}></i> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="cat-layout">
          <aside className="cat-sidebar">
            <div className="filter-card">
              <div className="filter-block-title">
                <span><i className="fas fa-filter mr-1"></i> Catégories</span>
                <button onClick={() => setSelectedCategories(filterCategories.map(c => c.value))}
                  style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Réinitialiser
                </button>
              </div>
              <div>
                {filterCategories.map(cat => (
                  <label key={cat.value} className="filter-opt">
                    <input type="checkbox" checked={selectedCategories.includes(cat.value)}
                      onChange={() => toggleCategory(cat.value)} />
                    <span className="filter-opt-label">{cat.label}</span>
                    <span className="filter-count-badge">{cat.count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-card">
              <div className="filter-block-title">Budget maximum</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>0 FCFA</span>
                <span className="price-val">{priceMax >= 5000 ? '5 000+ FCFA' : priceMax.toLocaleString('fr') + ' FCFA'}</span>
              </div>
              <input type="range" min="0" max="5000" value={priceMax}
                onChange={e => setPriceMax(parseInt(e.target.value))} className="price-range-input" />
            </div>

            <div className="filter-card">
              <div className="filter-block-title">Délai de livraison</div>
              <label className="filter-opt">
                <input type="radio" name="delivery" checked={deliveryFilter === 'all'} onChange={() => setDeliveryFilter('all')} />
                <span className="filter-opt-label">Tous les délais</span>
              </label>
              <label className="filter-opt">
                <input type="radio" name="delivery" checked={deliveryFilter === 'express'} onChange={() => setDeliveryFilter('express')} />
                <span className="filter-opt-label">Express (24–48h)</span>
                <span className="filter-count-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#16A34A' }}>Rapide</span>
              </label>
              <label className="filter-opt">
                <input type="radio" name="delivery" checked={deliveryFilter === 'standard'} onChange={() => setDeliveryFilter('standard')} />
                <span className="filter-opt-label">Standard (3–5 jours)</span>
              </label>
            </div>

            <div className="sidebar-cta">
              <h4>Besoin d'un devis ?</h4>
              <p>Décrivez votre projet et recevez des offres personnalisées sous 24h.</p>
              <Link href="/devis">
                Demander un devis <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </aside>

          <main>
            <div className="cat-toolbar">
              <div className="cat-search">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Rechercher un service…" value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="cat-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Pertinence</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <span className="cat-results"><strong>{sorted.length}</strong> résultats</span>
            </div>

            <div className="cat-grid">
              {sorted.map(service => (
                <Link key={service.id} href={`/services/${service.slug}`} className="no-underline">
                  <article className="sc-card" data-category={categoryNames[service.category]} data-price={service.price}>
                    <div className="sc-card-img-wrap">
                      {service.image ? (
                        <img src={service.image} alt={service.title} className="sc-card-img" loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-image" style={{ fontSize: '2rem', color: 'rgba(139,92,246,0.3)' }}></i>
                        </div>
                      )}
                      <span className="sc-card-badge">{categoryNames[service.category] || service.category}</span>
                      <button className="sc-card-fav" onClick={e => { e.preventDefault(); e.currentTarget.classList.toggle('active'); const i = e.currentTarget.querySelector('i'); if (i) i.className = e.currentTarget.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart' }} aria-label="Favoris">
                        <i className="far fa-heart"></i>
                      </button>
                    </div>
                    <div className="sc-card-body">
                      <div className="sc-price-row">
                        <span className="sc-price">{service.price.toLocaleString('fr')} FCFA</span>
                        <span className="sc-delivery"><i className="far fa-clock"></i> {service.delivery_time_days}j</span>
                      </div>
                      <h3 className="sc-title">{service.title}</h3>
                      <p className="sc-desc">{service.description}</p>
                      <div className="sc-footer">
                        <div>
                          <div className="sc-rating"><i className="fas fa-star"></i> 4.8</div>
                          <span className="sc-reviews">Nouveau</span>
                        </div>
                        <span className="sc-btn">
                          Voir <i className="fas fa-arrow-right"></i>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <i className="fas fa-box-open fa-4x text-gray-500 mb-4"></i>
                <h3 className="text-xl font-bold text-white mb-2">Aucun service disponible</h3>
                <p className="text-gray-400">Revenez plus tard ou contactez-nous pour plus d'informations.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {showOfferModal && (
        <div className="sc-modal-overlay active" onClick={e => { if (e.target === e.currentTarget) setShowOfferModal(false) }}>
          <div className="sc-modal">
            <button className="sc-modal-close" onClick={() => setShowOfferModal(false)}><i className="fas fa-times"></i></button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Publier une offre de projet
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Détaillez votre besoin afin que les freelancers qualifiés puissent vous faire des propositions directes.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const data = Object.fromEntries(new FormData(form))
              await supabase.from('services_clientrequest').insert({
                title: data.title, description: data.description,
                category: data.category, budget_min: data.budget_min ? parseInt(data.budget_min as string) : null,
                budget_max: data.budget_max ? parseInt(data.budget_max as string) : null,
                deadline_days: parseInt(data.deadline_days as string),
                status: 'open',
              } as any)
              setShowOfferModal(false)
            }}>
              <div className="form-group">
                <label htmlFor="offer_title">Titre de votre projet</label>
                <input type="text" name="title" id="offer_title" className="form-control" placeholder="Ex: Création d'un site e-commerce" required />
              </div>
              <div className="form-group">
                <label htmlFor="offer_desc">Description détaillée</label>
                <textarea name="description" id="offer_desc" className="form-control" rows={4} placeholder="Décrivez les fonctionnalités attendues, les livrables..." required></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="offer_cat">Catégorie</label>
                <select name="category" id="offer_cat" className="form-control">
                  <option value="web">Développement Web</option>
                  <option value="design">Design Graphique</option>
                  <option value="marketing">Marketing Digital</option>
                  <option value="branding">Branding</option>
                  <option value="seo">SEO</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="writing">Rédaction</option>
                  <option value="other">Autres</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="offer_budget_min">Budget Min (FCFA)</label>
                  <input type="number" name="budget_min" id="offer_budget_min" className="form-control" placeholder="Optionnel" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="offer_budget_max">Budget Max (FCFA)</label>
                  <input type="number" name="budget_max" id="offer_budget_max" className="form-control" placeholder="Optionnel" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="offer_deadline">Délai souhaité (jours)</label>
                <input type="number" name="deadline_days" id="offer_deadline" className="form-control" defaultValue={7} min={1} required />
              </div>
              <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
                <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', border: 'none', fontWeight: 750, fontSize: '0.85rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }}>
                  Publier l'offre <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
