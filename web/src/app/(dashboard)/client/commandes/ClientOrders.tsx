'use client'
import Link from 'next/link'

interface OrderWithService {
  id: number
  service_id: number
  freelancer_id: string | null
  status: string
  price: number
  created_at: string
  due_date: string | null
  service: { title: string; slug: string } | null
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

export default function ClientOrders({ orders }: { orders: OrderWithService[] }) {
  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
        <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <i className="fas fa-shopping-bag text-5xl text-gray-600 mb-4"></i>
          <p className="text-gray-500 mb-4">Aucune commande pour le moment</p>
          <Link href="/catalogue" className="btn-glow btn-glow-primary no-underline px-8 py-3">Découvrir les services</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const st = statusLabels[order.status] || { label: order.status, color: '#6B7280' }
          return (
            <div key={order.id} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{order.service?.title || `Service #${order.service_id}`}</p>
                  <p className="text-xs text-gray-500 mt-1">Commande #{order.id} • {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold gradient-text">{order.price.toLocaleString('fr-FR')} FCFA</p>
                  <span className="inline-block mt-1 text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: `${st.color}20`, color: st.color }}>
                    {st.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
