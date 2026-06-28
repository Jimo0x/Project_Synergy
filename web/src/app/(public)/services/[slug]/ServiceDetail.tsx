'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface Service {
  id: number
  title: string
  description: string
  category: string
  price: number
  delivery_time_days: number
  created_by_id: string | null
  image: string | null
  is_active: boolean
}

interface Creator {
  id: string
  first_name: string
  last_name: string
  email: string
}

const categoryNames: Record<string, string> = {
  web: 'Développement Web',
  design: 'Design Graphique',
  marketing: 'Marketing Digital',
  branding: 'Branding',
  seo: 'SEO',
  maintenance: 'Maintenance',
  writing: 'Rédaction',
  other: 'Autres',
}

export function ServiceDetail({ service, creator }: { service: Service; creator: Creator | null }) {
  const router = useRouter()

  const handleOrder = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: order, error } = await supabase
      .from('orders_order')
      .insert({
        service_id: service.id,
        client_id: user.id,
        price: service.price,
        status: 'pending',
      } as any)
      .select()
      .single() as unknown as { data: any; error: any }

    if (error) {
      alert('Erreur lors de la commande')
      return
    }

    router.push('/panier')
  }

  return (
    <div className="min-h-screen" style={{ background: '#050508' }}>
      <div className="container mx-auto px-4 py-12">
        <Link href="/catalogue" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 no-underline">
          <i className="fas fa-arrow-left"></i> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
              {categoryNames[service.category] || service.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-6">{service.title}</h1>

            <div className="rounded-2xl overflow-hidden mb-8 h-80 flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(6,182,212,0.05))', border: '1px solid rgba(255,255,255,0.06)' }}>
              {service.image ? (
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-code text-6xl" style={{ color: 'rgba(139,92,246,0.2)' }}></i>
              )}
            </div>

            <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">{service.description}</p>
            </div>

            <div className="mt-6 p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-xl font-bold mb-4">Délai de livraison</h2>
              <div className="flex items-center gap-3">
                <i className="far fa-clock text-2xl" style={{ color: 'var(--secondary)' }}></i>
                <span className="text-gray-400">Livré sous <strong className="text-white">{service.delivery_time_days} jours</strong></span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="p-8 rounded-2xl sticky top-24" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-3xl font-bold gradient-text mb-6">
                {service.price.toLocaleString('fr-FR')} FCFA
              </p>

              <button onClick={handleOrder}
                      className="btn-glow btn-glow-primary w-full py-3 mb-4">
                <i className="fas fa-shopping-cart mr-2"></i>
                Commander
              </button>

              {creator && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-3">Proposé par</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {(creator.first_name?.[0] || creator.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{creator.first_name} {creator.last_name}</p>
                      <p className="text-xs text-gray-500">Freelance</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
