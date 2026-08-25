import { createClient } from '@/lib/supabase'
import { FreelanceStats } from './FreelanceStats'
import { RecentMissions } from './RecentMissions'

export default async function FreelanceDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('freelancers_freelancerprofile')
    .select('rating, available')
    .eq('user_id', user.id)
    .single() as unknown as { data: { rating: number; available: boolean } | null }

  const { count: activeMissions } = await supabase
    .from('orders_order')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .in('status', ['paid', 'accepted', 'in_progress'])

  const { data: recentOrders } = await supabase
    .from('orders_order')
    .select('id, service_id, status, price, created_at, service:service_id(title)')
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: availableMissions } = await supabase
    .from('services_clientrequest')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  const stats = {
    rating: profile?.rating ?? 0,
    available: profile?.available ?? true,
    activeMissions: activeMissions ?? 0,
    availableMissions: availableMissions ?? 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tableau de Bord Freelance</h1>
      <p className="text-gray-500 text-sm mb-8">Bienvenue dans votre espace freelance</p>

      <FreelanceStats stats={stats} />
      <RecentMissions orders={recentOrders ?? []} />
    </div>
  )
}
