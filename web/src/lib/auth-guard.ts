import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { UserRole } from '@/lib/database.types'

export async function requireRole(
  allowed: UserRole[],
): Promise<{ id: string; role: UserRole }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('accounts_user')
    .select('id, role')
    .eq('id', user.id)
    .single() as unknown as { data: { id: string; role: UserRole } | null }

  if (!profile) {
    redirect('/login')
  }

  if (!allowed.includes(profile.role)) {
    redirect(profile.role === 'freelancer' ? '/freelance' : '/client')
  }

  return profile
}
