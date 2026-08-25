'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import type { OrdersOrderRow } from '@/lib/database.types'

type CartOrder = OrdersOrderRow & {
  service?: { title?: string; slug?: string; price?: number } | null
  payments_payment?: { status: string }[] | null
}

export default function PanierPage() {
  const [orders, setOrders] = useState<CartOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(() => {
    return supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      return supabase
        .from('orders_order')
        .select('*, service:service_id(title, slug, price), payments_payment(status)')
        .eq('client_id', user.id)
        .eq('status', 'pending')
        .then(({ data }) => {
          setOrders((data as unknown as CartOrder[]) || [])
          setLoading(false)
        })
    })
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const isPaid = (order: CartOrder) =>
    Boolean(order.payments_payment?.some((p) => p.status === 'succeeded'))

  const handlePay = async (orderId: number) => {
    setError(null)
    setPayingId(orderId)

    const { initiatePayment } = await import('@/app/actions/payments')
    const result = await initiatePayment({ orderId })

    if (!result.ok) {
      setError(result.message)
      setPayingId(null)
      return
    }

    window.location.assign(result.checkoutUrl)
  }

  if (loading) {
    return (
      <p className="text-gray-500 py-12 text-center">
        <i className="fas fa-circle-notch fa-spin mr-2"></i>Chargement du panier...
      </p>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon panier</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
          <i className="fas fa-exclamation-triangle mr-2"></i>{error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <i className="fas fa-shopping-cart text-5xl text-gray-600 mb-4"></i>
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <Link href="/catalogue" className="btn-glow btn-glow-primary no-underline px-8 py-3">Parcourir les services</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h3 className="font-bold">{order.service?.title || `Service #${order.service_id}`}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Commande #{order.id}
                  {isPaid(order) && (
                    <span className="ml-3 text-green-400"><i className="fas fa-check-circle mr-1"></i>Payée</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className="font-bold gradient-text">{order.price.toLocaleString('fr-FR')} FCFA</p>
                {!isPaid(order) && (
                  <button onClick={() => handlePay(order.id)} disabled={payingId !== null}
                          className="btn-glow btn-glow-primary px-6 py-2.5 disabled:opacity-60 whitespace-nowrap">
                    {payingId === order.id
                      ? <><i className="fas fa-circle-notch fa-spin mr-2"></i>Redirection...</>
                      : <><i className="fas fa-credit-card mr-2"></i>Payer</>}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="p-6 rounded-2xl flex items-center justify-between"
               style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="font-bold">Total à payer</p>
              <p className="text-xs text-gray-500 mt-1">
                Mobile Money (MTN, Orange, Moov) et cartes — via FedaPay
              </p>
            </div>
            <p className="font-bold gradient-text text-xl">
              {orders.filter((o) => !isPaid(o))
                .reduce((sum, o) => sum + Number(o.price), 0)
                .toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
