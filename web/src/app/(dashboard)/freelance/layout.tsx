import { requireRole } from '@/lib/auth-guard'

export default async function FreelanceAreaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['freelancer', 'admin'])
  return <>{children}</>
}
