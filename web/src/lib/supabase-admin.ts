import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import type { Database } from './database.types'

let adminClient: ReturnType<typeof createSupabaseAdmin<Database>> | null = null

/**
 * Client service_role — usage STRICTEMENT serveur (webhooks, server actions).
 * Bypass le RLS : ne jamais importer depuis un composant client.
 */
export function createAdminClient() {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error('Configuration serveur manquante : SUPABASE_SERVICE_ROLE_KEY non définie')
  }

  adminClient = createSupabaseAdmin<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return adminClient
}
