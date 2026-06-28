import { createClient } from '@/lib/supabase'
import ClientOrders from './ClientOrders'

export const dynamic = 'force-dynamic'

export default async function CommandesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: orders } = await supabase
    .from('orders_order')
    .select('*, service:service_id(title, slug)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return <ClientOrders orders={orders ?? []} />
}
