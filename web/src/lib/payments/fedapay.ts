import { createHmac, timingSafeEqual } from 'crypto'
import {
  type CreateCheckoutInput,
  type CreateCheckoutResult,
  type PaymentOutcome,
  type PaymentProviderAdapter,
  type ProviderEvent,
  PaymentProviderError,
} from './types'

const SIGNATURE_MAX_AGE_SECONDS = 300

function apiKey(): string {
  const key = process.env.FEDAPAY_SECRET_KEY
  if (!key) throw new PaymentProviderError('FEDAPAY_SECRET_KEY non configurée')
  return key
}

function baseUrl(): string {
  // Le sandbox et la production ont des hosts distincts ; on déduit du préfixe
  // de la clé secrète, avec surcharge possible via FEDAPAY_BASE_URL.
  if (process.env.FEDAPAY_BASE_URL) return process.env.FEDAPAY_BASE_URL.replace(/\/$/, '')
  return apiKey().includes('sandbox')
    ? 'https://sandbox-api.fedapay.com'
    : 'https://api.fedapay.com'
}

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null
}

/**
 * L'enveloppe de réponse FedaPay varie selon les versions d'API.
 * On cherche l'objet transaction sous les clés connues.
 */
function extractTransaction(payload: unknown): JsonRecord {
  const envelope = asRecord(payload)
  for (const key of ['v1/transaction', 'transaction', 'entity', 'data']) {
    const candidate = envelope ? asRecord(envelope[key]) : null
    if (candidate) return candidate
  }
  if (envelope && typeof envelope.id === 'number') return envelope
  throw new PaymentProviderError('Réponse FedaPay inattendue (transaction introuvable)')
}

async function fedapayFetch(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    })
  } catch {
    throw new PaymentProviderError('FedaPay injoignable, réessaie plus tard')
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new PaymentProviderError(`Erreur FedaPay (${response.status})`, response.status)
  }
  return body
}

async function generateToken(providerTransactionId: string): Promise<CreateCheckoutResult> {
  const payload: unknown = await fedapayFetch(
    `/v1/transactions/${encodeURIComponent(providerTransactionId)}/token`,
    { method: 'POST' },
  )

  const tokenEnvelope = asRecord(payload)
  const token = tokenEnvelope && typeof tokenEnvelope.token === 'string' ? tokenEnvelope.token : null
  const url = tokenEnvelope && typeof tokenEnvelope.url === 'string' ? tokenEnvelope.url : null
  if (!token || !url || !url.startsWith('https://')) {
    throw new PaymentProviderError('URL de paiement FedaPay invalide')
  }
  return { providerTransactionId, checkoutUrl: url }
}

function mapEventName(name: string): PaymentOutcome | null {
  switch (name) {
    case 'transaction.approved':
      return 'succeeded'
    case 'transaction.declined':
    case 'transaction.canceled':
    case 'transaction.expired':
      return 'failed'
    case 'transaction.refunded':
      return 'refunded'
    default:
      return null
  }
}

export function verifyFedapaySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): void {
  if (!signatureHeader) {
    throw new PaymentProviderError('Signature webhook absente')
  }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [k, v] = part.split('=')
      return [k?.trim(), v?.trim()]
    }),
  )
  const timestamp = parts['t']
  const received = parts['s']
  if (!timestamp || !received) {
    throw new PaymentProviderError('Signature webhook mal formée')
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
  if (!Number.isFinite(age) || age > SIGNATURE_MAX_AGE_SECONDS) {
    throw new PaymentProviderError('Timestamp webhook hors tolérance (replay ?)')
  }

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')

  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(received, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new PaymentProviderError('Signature webhook invalide')
  }
}

export const fedapayAdapter: PaymentProviderAdapter = {
  id: 'fedapay',

  async fetchTransactionStatus(providerTransactionId: string): Promise<PaymentOutcome | 'pending'> {
    const payload: unknown = await fedapayFetch(
      `/v1/transactions/${encodeURIComponent(providerTransactionId)}`,
    )

    const transaction = extractTransaction(payload)
    const status = typeof transaction.status === 'string' ? transaction.status : ''

    switch (status) {
      case 'approved':
      case 'approved_partially_refunded':
        return 'succeeded'
      case 'declined':
      case 'canceled':
      case 'expired':
        return 'failed'
      case 'refunded':
        return 'refunded'
      default:
        return 'pending'
    }
  },

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const payload: unknown = await fedapayFetch('/v1/transactions', {
      method: 'POST',
      body: JSON.stringify({
        description: input.description,
        amount: input.amount,
        currency: { iso: input.currency },
        callback_url: input.returnUrl,
        customer: {
          firstname: input.customer.firstName || 'Client',
          lastname: input.customer.lastName || 'SynergyCraft',
          email: input.customer.email,
        },
        custom_metadata: { order_id: String(input.orderId), source: 'synergycraft' },
        merchant_reference: input.merchantReference,
      }),
    })

    const transaction = extractTransaction(payload)
    const id = transaction.id
    if (typeof id !== 'number') {
      throw new PaymentProviderError('ID transaction FedaPay manquant')
    }

    const checkout = await generateToken(String(id))
    return { providerTransactionId: String(id), checkoutUrl: checkout.checkoutUrl }
  },

  async regenerateCheckoutUrl(
    providerTransactionId: string,
    opts: { returnUrl: string },
  ): Promise<string> {
    // Best effort : on rafraîchit le callback_url (l'URL publique de l'app peut
    // avoir changé depuis la création de la transaction). Un échec n'est pas
    // bloquant : la synchro au retour reste fonctionnelle.
    try {
      await fedapayFetch(`/v1/transactions/${encodeURIComponent(providerTransactionId)}`, {
        method: 'PUT',
        body: JSON.stringify({ callback_url: opts.returnUrl }),
      })
    } catch {
      // Transaction déjà finalisée ou champ non modifiable : on tente quand même
      // la régénération du lien.
    }
    const result = await generateToken(providerTransactionId)
    return result.checkoutUrl
  },

  verifyAndParseWebhook(rawBody: string, headers: Headers): ProviderEvent | null {
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET
    if (!secret) throw new PaymentProviderError('FEDAPAY_WEBHOOK_SECRET non configurée')

    verifyFedapaySignature(rawBody, headers.get('x-fedapay-signature'), secret)

    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      throw new PaymentProviderError('Payload webhook non-JSON')
    }

    const envelope = asRecord(parsed)
    const name = envelope && typeof envelope.name === 'string' ? envelope.name : ''
    const entity =
      (envelope ? asRecord(envelope.entity) : null) ??
      (envelope ? asRecord(envelope.data) : null)

    const rawId = entity?.id
    const providerTransactionId =
      typeof rawId === 'string' ? rawId : typeof rawId === 'number' ? String(rawId) : null

    if (!providerTransactionId) return null

    const outcome = mapEventName(name)
    if (!outcome) return null

    return { providerTransactionId, outcome, rawName: name, rawPayload: parsed }
  },
}
