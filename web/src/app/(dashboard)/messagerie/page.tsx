'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { AccountsMessageRow, AccountsUserRow } from '@/lib/database.types'

export default function MessageriePage() {
  const [conversations, setConversations] = useState<(AccountsMessageRow & { other_user: AccountsUserRow })[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AccountsMessageRow[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  useEffect(() => {
    if (!userId) return

    const fetchConversations = async () => {
      const { data: sent } = await supabase
        .from('accounts_message')
        .select('*, other_user:receiver_id(*)')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })

      const { data: received } = await supabase
        .from('accounts_message')
        .select('*, other_user:sender_id(*)')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })

      const all = [...(sent || []), ...(received || [])]
      const unique = new Map()
      all.forEach((msg: any) => {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        if (!unique.has(otherId)) unique.set(otherId, msg)
      })
      setConversations(Array.from(unique.values()))
    }

    fetchConversations()

    const channel = supabase
      .channel('messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'accounts_message', filter: `receiver_id=eq.${userId}` },
        (payload) => {
          const newMsg = payload.new as AccountsMessageRow
          setMessages((prev) => [...prev, newMsg])
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    if (!selectedUserId || !userId) return

    supabase
      .from('accounts_message')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${selectedUserId},receiver_id.eq.${selectedUserId}`)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []))
  }, [selectedUserId, userId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !selectedUserId) return

    await supabase.from('accounts_message').insert({
      sender_id: userId,
      receiver_id: selectedUserId,
      body: newMessage.trim(),
    } as any)

    setNewMessage('')
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-0 rounded-2xl overflow-hidden"
         style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-80 border-r border-white/5 overflow-y-auto">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-bold">Conversations</h2>
        </div>
        {conversations.map((conv: any) => {
          const other = conv.other_user
          const isUnread = !conv.is_read && conv.receiver_id === userId
          return (
            <button key={conv.id} onClick={() => setSelectedUserId(other?.id)}
                    className={`w-full text-left p-4 transition-colors border-b border-white/5 ${
                      selectedUserId === other?.id ? 'bg-purple-500/10' : 'hover:bg-white/5'
                    }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(other?.first_name?.[0] || other?.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'text-gray-300'}`}>
                    {other?.first_name || other?.email || 'Inconnu'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{conv.body}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-4 rounded-2xl ${
                    msg.sender_id === userId
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    <p className="text-sm">{msg.body}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-3">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                       placeholder="Écrivez votre message..."
                       className="flex-1 px-4 py-3 rounded-xl text-white text-sm"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button onClick={sendMessage}
                        className="btn-glow btn-glow-primary px-6 py-3 text-sm">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-comment-dots text-5xl text-gray-600 mb-4"></i>
              <p className="text-gray-500">Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
