import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getPaymentProvider, PaymentProviderError, type ProviderEvent } from '@/lib/payments'
import type { PaymentsPaymentUpdate, PaymentStatus } from '@/lib/database.types'

export async function POST(request: Request) {
  let event: ProviderEvent | null
  try {
    // Corps BRUT obligatoire : toute re-sérialisation invaliderait la signature HMAC
    const rawBody = await request.text()
    const provider = getPaymentProvider('fedapay')
    event = provider.verifyAndParseWebhook(rawBody, request.headers)
  } catch (error) {
    if (error instanceof PaymentProviderError) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Webhook non traité' }, { status: 400 })
  }

  if (!event) {
    // Événement connu mais sans action (ex: transaction.created) → acquitter
    return NextResponse.json({ received: true })
  }

  try {
    const admin = createAdminClient()

    // Idempotence : on ne met à jour que les paiements encore 'pending'
    const status: PaymentStatus =
      event.outcome === 'succeeded'
        ? 'succeeded'
        : event.outcome === 'refunded'
          ? 'refunded'
          : 'failed'

    const update: PaymentsPaymentUpdate = { status }

    // Idempotence : seuls les paiements encore 'pending' sont traités
    const { data: pendings } = await admin
      .from('payments_payment')
      .select('id, order_id')
      .eq('provider_transaction_id', event.providerTransactionId)
      .eq('status', 'pending')

    const rows = (pendings as unknown as { id: number; order_id: number }[] | null) ?? []
    if (rows.length === 0) {
      return NextResponse.json({ received: true })
    }
    const orderId = rows[0].order_id

    await admin
      .from('payments_payment')
      .update(update)
      .eq('provider_transaction_id', event.providerTransactionId)
      .eq('status', 'pending')

    // Paiement validé → la commande sort du panier et attend l'acceptation
    if (status === 'succeeded') {
      await admin
        .from('orders_order')
        .update({ status: 'paid' })
        .eq('id', orderId)
        .eq('status', 'pending')
    }

    return NextResponse.json({ received: true })
  } catch {
    // 500 → FedaPay retentera (retry automatique jusqu'à 9 fois)
    return NextResponse.json({ error: 'Traitement différé' }, { status: 500 })
  }
}
