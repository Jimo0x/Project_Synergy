'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function PanierPage() {
  const [orders, setOrders] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('orders_order')
        .select('*, service:service_id(title, slug, price)')
        .eq('client_id', user.id)
        .eq('status', 'pending')
        .then(({ data }) => setOrders(data || []))
    })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon panier</h1>

      {orders.length === 0 ? (
        <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <i className="fas fa-shopping-cart text-5xl text-gray-600 mb-4"></i>
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <Link href="/catalogue" className="btn-glow btn-glow-primary no-underline px-8 py-3">Parcourir les services</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="p-6 rounded-2xl flex items-center justify-between"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h3 className="font-bold">{order.service?.title || `Service #${order.service_id}`}</h3>
                <p className="text-xs text-gray-500 mt-1">Commande #{order.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold gradient-text">{order.price.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          ))}
          <div className="p-6 rounded-2xl flex items-center justify-between"
               style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-bold">Total</p>
            <p className="font-bold gradient-text text-xl">
              {orders.reduce((sum: number, o: any) => sum + Number(o.price), 0).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
