'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function StatistiquesPage() {
  const [stats, setStats] = useState({ totalOrders: 0, completed: 0, revenue: 0, avgRating: 0 })
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      const { data: orders } = await supabase
        .from('orders_order')
        .select('status, price')
        .eq('freelancer_id', user.id) as unknown as { data: { status: string; price: number }[] | null }

      const totalOrders = orders?.length || 0
      const completed = orders?.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0
      const revenue = orders?.reduce((sum, o) => sum + Number(o.price), 0) || 0

      const { data: profile } = await supabase
        .from('freelancers_freelancerprofile')
        .select('rating')
        .eq('user_id', user.id)
        .single() as unknown as { data: { rating: number } | null }

      setStats({ totalOrders, completed, revenue, avgRating: profile?.rating || 0 })
    })
  }, [])

  const items = [
    { icon: 'fa-shopping-bag', label: 'Commandes totales', value: stats.totalOrders, color: 'from-purple-500 to-purple-600' },
    { icon: 'fa-check-circle', label: 'Terminées', value: stats.completed, color: 'from-green-500 to-green-600' },
    { icon: 'fa-money-bill', label: 'Revenu total', value: `${stats.revenue.toLocaleString('fr-FR')} FCFA`, color: 'from-cyan-500 to-cyan-600' },
    { icon: 'fa-star', label: 'Note moyenne', value: stats.avgRating.toFixed(1), color: 'from-yellow-500 to-yellow-600', suffix: '/5' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistiques</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
              <i className={`fas ${item.icon} text-white text-sm`}></i>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{item.value}</p>
              {item.suffix && <span className="text-sm text-gray-500">{item.suffix}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
