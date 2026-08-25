'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'

type State = 'checking' | 'pending' | 'succeeded' | 'failed' | 'unknown'

function PaymentReturnContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order')
  const [state, setState] = useState<State>('checking')
  const attemptsRef = useRef(0)

  // Le webhook peut arriver quelques secondes après le retour provider :
  // polling borné toutes les 3s (max ~30s), source de vérité = base de données.
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      if (!orderId) {
        if (!cancelled) setState('unknown')
        return
      }
      const { getPaymentState, syncPaymentFromProvider } = await import('@/app/actions/payments')

      // Synchro serveur → FedaPay au premier passage, puis à mi-parcours
      // (filet de sécurité si le webhook n'a pas encore frappé)
      if (attemptsRef.current === 0 || attemptsRef.current === 4) {
        await syncPaymentFromProvider({ orderId: Number(orderId) })
        if (cancelled) return
      }

      const result = await getPaymentState({ orderId: Number(orderId) })
      if (cancelled) return

      if (!result.ok) {
        setState('unknown')
        return
      }

      setState(result.state === 'failed' ? 'failed' : result.state)

      if (result.state === 'pending' && attemptsRef.current < 10) {
        attemptsRef.current += 1
        timer = setTimeout(poll, 3000)
      }
    }

    poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [orderId])

  return (
    <div style={{ background: '#050508', minHeight: '100vh' }} className="flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl p-10 text-center"
           style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {state === 'checking' && (
          <>
            <i className="fas fa-circle-notch fa-spin text-4xl mb-6" style={{ color: 'var(--primary)' }}></i>
            <h1 className="text-xl font-bold mb-2">Vérification du paiement...</h1>
            <p className="text-sm text-gray-500">Quelques secondes suffisent en général.</p>
          </>
        )}

        {state === 'pending' && (
          <>
            <i className="fas fa-hourglass-half text-4xl mb-6" style={{ color: 'var(--secondary)' }}></i>
            <h1 className="text-xl font-bold mb-2">Paiement en cours de confirmation</h1>
            <p className="text-sm text-gray-500">
              Termine la validation sur ton téléphone si besoin. Cette page se met à jour automatiquement.
            </p>
          </>
        )}

        {state === 'succeeded' && (
          <>
            <i className="fas fa-circle-check text-4xl mb-6 text-green-400"></i>
            <h1 className="text-xl font-bold mb-2">Paiement confirmé !</h1>
            <p className="text-sm text-gray-500 mb-8">Ta commande est payée et visible dans tes commandes.</p>
            <Link href="/client/commandes" className="btn-glow btn-glow-primary no-underline px-8 py-3 inline-block">
              Mes commandes
            </Link>
          </>
        )}

        {(state === 'failed' || state === 'unknown') && (
          <>
            <i className="fas fa-circle-xmark text-4xl mb-6" style={{ color: '#F87171' }}></i>
            <h1 className="text-xl font-bold mb-2">{state === 'failed' ? 'Paiement non abouti' : 'Informations introuvables'}</h1>
            <p className="text-sm text-gray-500 mb-8">
              Aucun montant n&apos;a été débité. Tu peux relancer le paiement depuis ton panier.
            </p>
            <button onClick={() => router.push('/panier')} className="btn-glow btn-glow-primary px-8 py-3">
              Retour au panier
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturnContent />
    </Suspense>
  )
}
