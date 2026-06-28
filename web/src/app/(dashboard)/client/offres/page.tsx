import { createClient } from '@/lib/supabase'
import ClientOffers from './ClientOffers'

export const dynamic = 'force-dynamic'

export default async function OffresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: offers } = await supabase
    .from('accounts_clientoffer')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return <ClientOffers offers={offers ?? []} />
}
