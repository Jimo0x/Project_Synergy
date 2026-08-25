import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ServiceDetail } from './ServiceDetail'

export const dynamic = 'force-dynamic'

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services_service')
    .select('*, created_by_id')
    .eq('slug', slug)
    .single() as unknown as { data: Parameters<typeof ServiceDetail>[0]['service'] | null }

  if (!service) notFound()

  let creator: Parameters<typeof ServiceDetail>[0]['creator'] = null
  if (service.created_by_id) {
    const { data: user } = await supabase
      .from('public_profiles')
      .select('id, first_name, last_name, role')
      .eq('id', service.created_by_id)
      .single() as unknown as { data: { id: string; first_name: string; last_name: string; role: string } | null }
    creator = user
  }

  return <ServiceDetail service={service} creator={creator} />
}
