'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-admin'
import { getPaymentProvider, PaymentProviderError } from '@/lib/payments'

const initiateSchema = z.object({
  orderId: z.number().int().positive(),
})

export type InitiatePaymentResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; message: string }

interface OrderForPayment {
  id: number
  price: number
  status: string
  client_id: string
  service?: { title?: string } | null
  payments_payment?: { status: string; created_at: string; provider_transaction_id: string | null }[]
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
}

export async function initiatePayment(input: unknown): Promise<InitiatePaymentResult> {
  const parsed = initiateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'Requête invalide.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'Session expirée, reconnecte-toi.' }
  }

  const { data: order } = await supabase
    .from('orders_order')
    .select('id, price, status, client_id, service:service_id(title)')
    .eq('id', parsed.data.orderId)
    .single() as unknown as { data: Omit<OrderForPayment, 'payments_payment'> | null }

  if (!order || order.client_id !== user.id) {
    return { ok: false, message: 'Commande introuvable.' }
  }

  if (order.status !== 'pending') {
    return { ok: false, message: 'Cette commande ne peut plus être payée.' }
  }

  // Lecture via service_role : la propriété de la commande est déjà vérifiée
  // ci-dessus, on ne dépend plus de la RLS sur payments_payment.
  const admin = createAdminClient()
  const { data: paymentRows } = await admin
    .from('payments_payment')
    .select('status, created_at, provider_transaction_id')
    .eq('order_id', order.id)
  const payments = (paymentRows as unknown as OrderForPayment['payments_payment']) ?? []

  const paid = payments.some((p) => p.status === 'succeeded')
  if (paid) {
    return { ok: false, message: 'Cette commande est déjà payée.' }
  }

  const { data: profile } = await supabase
    .from('accounts_user')
    .select('first_name, last_name, email')
    .eq('id', user.id)
    .single() as unknown as { data: { first_name: string; last_name: string; email: string } | null }
  if (!profile) {
    return { ok: false, message: 'Profil introuvable.' }
  }

  const provider = getPaymentProvider('fedapay')
  const returnUrl = `${appUrl()}/payment/return?order=${order.id}`

  try {
    // Relance : une tentative récente existe encore → régénérer son lien
    const now = Date.now()
    const recentPending = payments.find((p) => {
      const age = now - new Date(p.created_at).getTime()
      return p.status === 'pending' && age < 15 * 60 * 1000
    })
    if (recentPending?.provider_transaction_id) {
      const checkoutUrl = await provider.regenerateCheckoutUrl(recentPending.provider_transaction_id, {
        returnUrl,
      })
      return { ok: true, checkoutUrl }
    }

    const description = order.service?.title
      ? `Commande #${order.id} — ${order.service.title}`
      : `Commande SynergyCraft #${order.id}`

    const checkout = await provider.createCheckout({
      orderId: order.id,
      amount: Number(order.price),
      currency: 'XOF',
      description,
      customer: {
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
      },
      returnUrl,
      merchantReference: `order-${order.id}-${crypto.randomUUID()}`,
    })

    const { error: insertError } = await admin.from('payments_payment').insert({
      order_id: order.id,
      amount: Number(order.price),
      currency: 'XOF',
      provider: 'fedapay',
      provider_transaction_id: checkout.providerTransactionId,
      status: 'pending',
    })

    if (insertError) {
      return { ok: false, message: 'Erreur lors de l\'enregistrement du paiement. Réessaie.' }
    }

    return { ok: true, checkoutUrl: checkout.checkoutUrl }
  } catch (error) {
    if (error instanceof PaymentProviderError) {
      return { ok: false, message: error.message }
    }
    return { ok: false, message: 'Erreur inattendue lors de l\'initiation du paiement.' }
  }
}

export type PaymentStateResult =
  | { ok: true; state: 'pending' | 'succeeded' | 'failed' }
  | { ok: false; message: string }

const stateSchema = z.object({ orderId: z.number().int().positive() })

/**
 * État réel du paiement lu en base (mis à jour uniquement par le webhook signé).
 * Le paramètre ?status= renvoyé par le provider n'est JAMAIS utilisé comme source de vérité.
 */
export async function getPaymentState(input: unknown): Promise<PaymentStateResult> {
  const parsed = stateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'Requête invalide.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'Session expirée, reconnecte-toi.' }
  }

  // RLS participants : la commande d'un autre est invisible → refus explicite.
  // Les paiements sont ensuite lus via service_role (propriété déjà vérifiée).
  const { data: order } = await supabase
    .from('orders_order')
    .select('client_id, freelancer_id')
    .eq('id', parsed.data.orderId)
    .single() as unknown as { data: { client_id: string; freelancer_id: string | null } | null }

  if (!order || (order.client_id !== user.id && order.freelancer_id !== user.id)) {
    return { ok: false, message: 'Commande introuvable.' }
  }

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('payments_payment')
    .select('status')
    .eq('order_id', parsed.data.orderId)

  const statuses = (rows as unknown as { status: string }[] | null) ?? []
  if (statuses.length === 0) {
    return { ok: false, message: 'Paiement introuvable.' }
  }

  const state: 'pending' | 'succeeded' | 'failed' = statuses.some((p) => p.status === 'succeeded')
    ? 'succeeded'
    : statuses.some((p) => p.status === 'pending')
      ? 'pending'
      : 'failed'

  return { ok: true, state }
}

const syncSchema = z.object({ orderId: z.number().int().positive() })

/**
 * Synchro au retour : interroge FedaPay pour chaque paiement encore 'pending'
 * de la commande et met à jour la base si un statut final est constaté.
 * Filet de sécurité quand le webhook n'est pas encore configuré (local)
 * ou a été manqué (production). Le webhook reste la source principale.
 */
export async function syncPaymentFromProvider(input: unknown): Promise<PaymentStateResult> {
  const parsed = syncSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'Requête invalide.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'Session expirée, reconnecte-toi.' }
  }

  // RLS participants : impossible de synchroniser la commande d'un autre
  const { data: order } = await supabase
    .from('orders_order')
    .select('client_id, freelancer_id')
    .eq('id', parsed.data.orderId)
    .single() as unknown as { data: { client_id: string; freelancer_id: string | null } | null }

  if (!order || (order.client_id !== user.id && order.freelancer_id !== user.id)) {
    return { ok: false, message: 'Commande introuvable.' }
  }

  const admin = createAdminClient()
  const { data: pendings } = await admin
    .from('payments_payment')
    .select('id, provider_transaction_id')
    .eq('order_id', parsed.data.orderId)
    .eq('status', 'pending')

  if (pendings && pendings.length > 0) {
    const provider = getPaymentProvider('fedapay')

    for (const pending of pendings.slice(0, 1)) {
      if (!pending.provider_transaction_id) continue
      try {
        const outcome = await provider.fetchTransactionStatus(pending.provider_transaction_id)
        if (outcome === 'pending') continue

        await admin
          .from('payments_payment')
          .update({ status: outcome })
          .eq('id', pending.id)
          .eq('status', 'pending')

        // Paiement validé → la commande sort du panier et attend l'acceptation
        if (outcome === 'succeeded') {
          await admin
            .from('orders_order')
            .update({ status: 'paid' })
            .eq('id', parsed.data.orderId)
            .eq('status', 'pending')
        }
      } catch (error) {
        // Provider injoignable ou erreur transitoire : on laisse le polling continuer
        if (!(error instanceof PaymentProviderError)) throw error
      }
    }
  }

  return getPaymentState(input)
}
