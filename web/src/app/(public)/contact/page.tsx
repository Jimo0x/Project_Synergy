'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('core_contactmessage').insert(form as any)
    setSent(true)
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value })

  return (
    <div className="py-20" style={{ background: '#050508' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-gray-500">Une question, un projet ? Nous sommes là pour vous</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5 p-8 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {sent && (
            <div className="p-4 rounded-xl text-sm text-green-400 bg-green-500/10 border border-green-500/20">
              <i className="fas fa-check-circle mr-2"></i>Message envoyé ! Nous vous répondrons rapidement.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom</label>
              <input type="text" required value={form.name} onChange={update('name')}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input type="email" required value={form.email} onChange={update('email')}
                     className="w-full px-4 py-3 rounded-xl text-white text-sm"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Téléphone</label>
            <input type="tel" value={form.phone} onChange={update('phone')}
                   className="w-full px-4 py-3 rounded-xl text-white text-sm"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Sujet</label>
            <input type="text" required value={form.subject} onChange={update('subject')}
                   className="w-full px-4 py-3 rounded-xl text-white text-sm"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Message</label>
            <textarea required rows={5} value={form.message} onChange={update('message')}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm resize-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <button type="submit" className="btn-glow btn-glow-primary w-full py-3">
            <i className="fas fa-paper-plane mr-2"></i>Envoyer
          </button>
        </form>
      </div>
    </div>
  )
}
