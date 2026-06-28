'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { ServicesClientRequestRow } from '@/lib/database.types'

export default function MissionsPage() {
  const [missions, setMissions] = useState<ServicesClientRequestRow[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('services_clientrequest')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .then(({ data }) => setMissions(data || []))
  }, [])

  const categoryNames: Record<string, string> = {
    web: 'Développement Web', design: 'Design Graphique', marketing: 'Marketing Digital',
    branding: 'Branding', seo: 'SEO', maintenance: 'Maintenance', writing: 'Rédaction', other: 'Autres',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Missions disponibles</h1>

      {missions.length === 0 ? (
        <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <i className="fas fa-search text-5xl text-gray-600 mb-4"></i>
          <p className="text-gray-500">Aucune mission disponible pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <div key={mission.id} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                    {categoryNames[mission.category] || mission.category}
                  </span>
                  <h3 className="font-bold text-lg mt-1">{mission.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{mission.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <span><i className="fas fa-money-bill mr-1"></i>{mission.budget.toLocaleString('fr-FR')} FCFA</span>
                    <span><i className="far fa-calendar mr-1"></i>Deadline: {new Date(mission.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
