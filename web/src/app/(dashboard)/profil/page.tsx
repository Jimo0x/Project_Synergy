import { createClient } from '@/lib/supabase'
import { ProfileForm } from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('freelancers_freelancerprofile')
    .select('*')
    .eq('user_id', user.id)
    .single() as unknown as { data: any | null }

  const { data: clientProfile } = await supabase
    .from('accounts_clientprofile')
    .select('*')
    .eq('user_id', user.id)
    .single() as unknown as { data: any | null }

  const { data: freelancerProfile } = await supabase
    .from('freelancers_freelancerprofile')
    .select('*')
    .eq('user_id', user.id)
    .single() as unknown as { data: any | null }

  const { data: skills } = await supabase
    .from('freelancers_skill')
    .select('*')
    .order('name')

  return (
    <ProfileForm
      user={profile}
      clientProfile={clientProfile}
      freelancerProfile={freelancerProfile}
      skills={skills ?? []}
    />
  )
}
