import { fedapayAdapter } from './fedapay'
import { type PaymentProviderAdapter, type PaymentProviderId, PaymentProviderError } from './types'

const providers: Record<PaymentProviderId, PaymentProviderAdapter> = {
  fedapay: fedapayAdapter,
}

export function getPaymentProvider(id: PaymentProviderId): PaymentProviderAdapter {
  const adapter = providers[id]
  if (!adapter) throw new PaymentProviderError(`Provider inconnu : ${id}`)
  return adapter
}

export type { PaymentProviderId, PaymentOutcome, ProviderEvent } from './types'
export { PaymentProviderError } from './types'
