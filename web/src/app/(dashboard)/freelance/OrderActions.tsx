'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus, type OrderAction } from '@/app/actions/orders'

interface OrderActionsProps {
  orderId: number
  status: string
  onUpdated: (orderId: number, newStatus: string) => void
}

export function OrderActions({ orderId, status, onUpdated }: OrderActionsProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (action: OrderAction, newStatus: string) => {
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, action })
      if (result.ok) {
        onUpdated(orderId, newStatus)
      } else {
        setError(result.message)
      }
    })
  }

  const baseClass =
    'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  if (status === 'paid') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${baseClass} text-white`}
            style={{ background: 'var(--gradient)', boxShadow: '0 0 15px rgba(139,92,246,0.35)' }}
            disabled={pending}
            onClick={() => run('accept', 'accepted')}
          >
            <i className="fas fa-check"></i>
            {pending ? '...' : 'Accepter'}
          </button>
          <button
            type="button"
            className={`${baseClass} bg-transparent`}
            style={{ border: '1px solid rgba(239,68,68,0.35)', color: '#EF4444' }}
            disabled={pending}
            onClick={() => run('decline', 'cancelled')}
          >
            <i className="fas fa-xmark"></i>
            Refuser
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          className={`${baseClass} text-white`}
          style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', boxShadow: '0 0 15px rgba(6,182,212,0.3)' }}
          disabled={pending}
          onClick={() => run('start', 'in_progress')}
        >
          <i className="fas fa-play"></i>
          {pending ? '...' : 'Démarrer'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  if (status === 'in_progress') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          className={`${baseClass} text-white`}
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}
          disabled={pending}
          onClick={() => run('deliver', 'delivered')}
        >
          <i className="fas fa-paper-plane"></i>
          {pending ? '...' : 'Livrer'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  return null
}
