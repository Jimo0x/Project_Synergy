import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { UserRole } from '@/lib/database.types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('accounts_user')
    .select('role')
    .eq('id', user.id)
    .single() as unknown as { data: { role: UserRole } | null }

  if (profile?.role === 'freelancer') {
    redirect('/freelance')
  }
  redirect('/client')
}
