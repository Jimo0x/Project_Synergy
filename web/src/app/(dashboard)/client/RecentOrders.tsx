'use client'
import Link from 'next/link'

interface Order {
  id: number
  service_id: number
  status: string
  price: number
  created_at: string
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

export function RecentOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <i className="fas fa-shopping-bag text-4xl text-gray-600 mb-3"></i>
        <p className="text-gray-500">Aucune commande pour le moment</p>
        <Link href="/catalogue" className="btn-glow btn-glow-primary inline-block mt-4 no-underline px-6 py-2 text-sm">
          Découvrir les services
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="p-6 border-b border-white/5">
        <h2 className="font-bold">Dernières commandes</h2>
      </div>
      <div className="divide-y divide-white/5">
        {orders.map((order) => {
          const st = statusLabels[order.status] || { label: order.status, color: '#6B7280' }
          return (
            <div key={order.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Commande #{order.id}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">{order.price.toLocaleString('fr-FR')} FCFA</span>
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: `${st.color}20`, color: st.color }}>
                  {st.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
