'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { ServicesClientRequestRow } from '@/lib/database.types'
import { OrderActions } from '../OrderActions'

interface MyOrder {
  id: number
  status: string
  price: number
  created_at: string
  service?: { title: string } | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#F59E0B' },
  paid: { label: 'Payée', color: '#10B981' },
  accepted: { label: 'Acceptée', color: '#8B5CF6' },
  in_progress: { label: 'En cours', color: '#06B6D4' },
  delivered: { label: 'Livrée', color: '#10B981' },
  completed: { label: 'Terminée', color: '#10B981' },
  cancelled: { label: 'Annulée', color: '#EF4444' },
}

const categoryNames: Record<string, string> = {
  web: 'Développement Web', design: 'Design Graphique', marketing: 'Marketing Digital',
  branding: 'Branding', seo: 'SEO', maintenance: 'Maintenance', writing: 'Rédaction', other: 'Autres',
}

export default function MissionsPage() {
  const [myOrders, setMyOrders] = useState<MyOrder[]>([])
  const [missions, setMissions] = useState<ServicesClientRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const [ordersRes, requestsRes] = await Promise.all([
        supabase
          .from('orders_order')
          .select('id, status, price, created_at, service:service_id(title)')
          .eq('freelancer_id', user.id)
          .in('status', ['paid', 'accepted', 'in_progress', 'delivered'])
          .order('created_at', { ascending: false }) as unknown as Promise<{ data: MyOrder[] | null }>,
        supabase
          .from('services_clientrequest')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false }),
      ])

      setMyOrders(ordersRes.data || [])
      setMissions(requestsRes.data || [])
      setLoading(false)
    }

    load()
  }, [supabase])

  const handleOrderUpdated = useCallback((orderId: number, newStatus: string) => {
    setMyOrders((prev) =>
      newStatus === 'cancelled'
        ? prev.filter((o) => o.id !== orderId)
        : prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Missions</h1>

      <section className="mb-12">
        <h2 className="font-bold text-lg mb-4">Mes commandes</h2>

        {loading ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <i className="fas fa-inbox text-4xl text-gray-600 mb-3"></i>
            <p className="text-gray-500">Aucune commande à traiter pour le moment</p>
            <p className="text-xs text-gray-600 mt-1">Les commandes payées sur tes services apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.map((order) => {
              const st = statusLabels[order.status] || { label: order.status, color: '#6B7280' }
              return (
                <div key={order.id} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                          #{order.id}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{ background: `${st.color}20`, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      <p className="font-medium mt-1 truncate">{order.service?.title || 'Service supprimé'}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-sm font-semibold whitespace-nowrap">{order.price.toLocaleString('fr-FR')} FCFA</span>
                      <OrderActions orderId={order.id} status={order.status} onUpdated={handleOrderUpdated} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-lg mb-4">Demandes clients ouvertes</h2>

        {missions.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <i className="fas fa-search text-4xl text-gray-600 mb-3"></i>
            <p className="text-gray-500">Aucune demande disponible pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.id} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                  {categoryNames[mission.category] || mission.category}
                </span>
                <h3 className="font-bold mt-1">{mission.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{mission.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span><i className="fas fa-money-bill mr-1"></i>{mission.budget.toLocaleString('fr-FR')} FCFA</span>
                  {mission.deadline && (
                    <span><i className="far fa-calendar mr-1"></i>Deadline : {new Date(mission.deadline).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
