'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

const createOrderSchema = z.object({
  serviceId: z.number().int().positive(),
})

export type CreateOrderResult = { ok: true } | { ok: false; message: string }

interface ServicePricing {
  id: number
  price: number
  is_active: boolean
  created_by_id: string | null
}

export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'Requête invalide.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'Session expirée, reconnecte-toi.' }
  }

  const { data: service } = await supabase
    .from('services_service')
    .select('id, price, is_active, created_by_id')
    .eq('id', parsed.data.serviceId)
    .single() as unknown as { data: ServicePricing | null }

  if (!service || !service.is_active) {
    return { ok: false, message: "Ce service n'est pas disponible." }
  }

  if (service.created_by_id === user.id) {
    return { ok: false, message: 'Tu ne peux pas commander ton propre service.' }
  }

  const { data: profile } = await supabase
    .from('accounts_user')
    .select('role')
    .eq('id', user.id)
    .single() as unknown as { data: { role: string } | null }

  if (profile?.role !== 'client') {
    return { ok: false, message: 'Seul un compte client peut passer commande.' }
  }

  const price = service.price

  const { error: insertError } = await supabase
    .from('orders_order')
    .insert({
      service_id: service.id,
      client_id: user.id,
      price,
      status: 'pending',
      ...(service.created_by_id ? { freelancer_id: service.created_by_id } : {}),
    })

  if (insertError) {
    return { ok: false, message: 'Erreur lors de la création de la commande.' }
  }

  redirect('/panier')
}

const updateOrderStatusSchema = z.object({
  orderId: z.number().int().positive(),
  action: z.enum(['accept', 'decline', 'start', 'deliver']),
})

export type OrderAction = z.infer<typeof updateOrderStatusSchema>['action']

export type UpdateOrderStatusResult = { ok: true } | { ok: false; message: string }

const actionTransitions: Record<OrderAction, { from: Database['public']['Enums']['order_status']; to: Database['public']['Enums']['order_status'] }> = {
  accept: { from: 'paid', to: 'accepted' },
  decline: { from: 'paid', to: 'cancelled' },
  start: { from: 'accepted', to: 'in_progress' },
  deliver: { from: 'in_progress', to: 'delivered' },
}

export async function updateOrderStatus(input: unknown): Promise<UpdateOrderStatusResult> {
  const parsed = updateOrderStatusSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'Requête invalide.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'Session expirée, reconnecte-toi.' }
  }

  const { data: profile } = await supabase
    .from('accounts_user')
    .select('role')
    .eq('id', user.id)
    .single() as unknown as { data: { role: string } | null }

  if (profile?.role !== 'freelancer') {
    return { ok: false, message: 'Action réservée aux freelances.' }
  }

  const transition = actionTransitions[parsed.data.action]

  const { data: order } = await supabase
    .from('orders_order')
    .select('id, status, freelancer_id')
    .eq('id', parsed.data.orderId)
    .single() as unknown as { data: { id: number; status: string; freelancer_id: string | null } | null }

  if (!order || order.freelancer_id !== user.id) {
    return { ok: false, message: "Cette commande ne t'est pas assignée." }
  }

  if (order.status !== transition.from) {
    return { ok: false, message: 'Le statut a déjà changé, actualise la page.' }
  }

  const { data: updated, error } = await supabase
    .from('orders_order')
    .update({ status: transition.to })
    .eq('id', parsed.data.orderId)
    .eq('status', transition.from)
    .select('id')

  if (error || !updated || updated.length === 0) {
    return { ok: false, message: 'La mise à jour a échoué, actualise et réessaie.' }
  }

  revalidatePath('/freelance')
  revalidatePath('/freelance/missions')
  revalidatePath('/client/commandes')

  return { ok: true }
}
