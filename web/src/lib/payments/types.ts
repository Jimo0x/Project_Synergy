export type PaymentProviderId = 'fedapay'
// Extensible : 'stripe' | 'paypal' — ajouter un fichier provider + entrée registry.

export type PaymentOutcome = 'succeeded' | 'failed' | 'refunded'

export interface CheckoutCustomer {
  email: string
  firstName?: string
  lastName?: string
}

export interface CreateCheckoutInput {
  orderId: number
  /** Montant entier en FCFA (XOF n'a pas de sous-unité) */
  amount: number
  currency: 'XOF'
  description: string
  customer: CheckoutCustomer
  /** URL absolue de retour après paiement (callback_url FedaPay) */
  returnUrl: string
  /** Référence marchande unique (order-<id>-<uuid>) */
  merchantReference: string
}

export interface CreateCheckoutResult {
  providerTransactionId: string
  checkoutUrl: string
}

/** Événement normalisé issu du webhook, après vérification de signature. */
export interface ProviderEvent {
  providerTransactionId: string
  outcome: PaymentOutcome
  rawName: string
  rawPayload: unknown
}

export interface PaymentProviderAdapter {
  id: PaymentProviderId
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>
  /**
   * Régénère une URL de checkout pour une transaction existante (relance).
   * Met d'abord à jour son callback_url au cas où l'URL de l'app aurait changé
   * (ex : tunnel ngrok remplacé par localhost).
   */
  regenerateCheckoutUrl(
    providerTransactionId: string,
    opts: { returnUrl: string },
  ): Promise<string>
  /**
   * Interroge le provider pour connaître l'état réel d'une transaction.
   * Utilisé par la synchro au retour (filet de sécurité si webhook absent/manqué).
   */
  fetchTransactionStatus(providerTransactionId: string): Promise<PaymentOutcome | 'pending'>
  /**
   * Vérifie la signature du webhook et retourne l'événement normalisé,
   * ou null si l'événement est ignoré. Lève PaymentProviderError si invalide.
   */
  verifyAndParseWebhook(rawBody: string, headers: Headers): ProviderEvent | null
}

export class PaymentProviderError extends Error {
  readonly httpStatus?: number

  constructor(message: string, httpStatus?: number) {
    super(message)
    this.name = 'PaymentProviderError'
    this.httpStatus = httpStatus
  }
}
