import { requireRole } from '@/lib/auth-guard'

export default async function ClientAreaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['client', 'admin'])
  return <>{children}</>
}
