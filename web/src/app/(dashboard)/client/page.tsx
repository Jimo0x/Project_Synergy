import { createClient } from '@/lib/supabase'
import { DashboardStats } from './DashboardStats'
import { RecentOrders } from './RecentOrders'

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('accounts_clientprofile')
    .select('total_orders, is_verified')
    .eq('user_id', user.id)
    .single() as unknown as { data: { total_orders: number; is_verified: boolean } | null }

  const { count: pendingOrders } = await supabase
    .from('orders_order')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .in('status', ['pending', 'accepted', 'in_progress'])

  const { data: activeOrders } = await supabase
    .from('orders_order')
    .select('id, service_id, status, price, created_at, updated_at')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tableau de Bord Client</h1>
      <p className="text-gray-500 text-sm mb-8">Bienvenue dans votre espace client</p>

      <DashboardStats
        totalOrders={profile?.total_orders ?? 0}
        pendingOrders={pendingOrders ?? 0}
        isVerified={profile?.is_verified ?? false}
      />

      <RecentOrders orders={activeOrders ?? []} />
    </div>
  )
}
