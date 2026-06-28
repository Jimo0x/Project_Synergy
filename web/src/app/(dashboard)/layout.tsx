import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { DashboardSidebar } from '@/components/layout/Sidebar'
import DashboardTopbar from '@/components/layout/DashboardTopbar'
import type { UserRole } from '@/lib/database.types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('accounts_user')
    .select('id, email, first_name, last_name, role')
    .eq('id', user.id)
    .single() as unknown as { data: { id: string; email: string; first_name: string; last_name: string; role: UserRole } | null }

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#050508' }}>
      <DashboardSidebar user={profile} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar user={profile} />
        <DashboardTopbar user={profile} />
        <main className="flex-1 p-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
