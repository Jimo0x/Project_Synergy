import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import type { UserRole } from '@/lib/database.types'

function safeRelativePath(value: string | null): string {
  if (!value) return '/'
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeRelativePath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && next !== '/') {
      return NextResponse.redirect(`${origin}${next}`)
    }
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('accounts_user')
          .select('role')
          .eq('id', user.id)
          .single() as unknown as { data: { role: UserRole } | null }

        const redirect = profile?.role === 'client' ? '/client' : '/freelance'
        return NextResponse.redirect(`${origin}${redirect}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
