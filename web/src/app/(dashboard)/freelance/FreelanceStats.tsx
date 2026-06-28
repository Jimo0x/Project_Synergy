'use client'

interface Stats {
  rating: number
  available: boolean
  activeMissions: number
  availableMissions: number
}

export function FreelanceStats({ stats }: { stats: Stats }) {
  const items = [
    { icon: 'fa-star', label: 'Note', value: stats.rating.toFixed(1), color: 'from-yellow-500 to-yellow-600', suffix: '/5' },
    { icon: 'fa-tasks', label: 'Missions en cours', value: stats.activeMissions, color: 'from-cyan-500 to-cyan-600' },
    { icon: 'fa-search', label: 'Missions disponibles', value: stats.availableMissions, color: 'from-purple-500 to-purple-600' },
    { icon: 'fa-circle', label: 'Disponible', value: stats.available ? 'Oui' : 'Non', color: stats.available ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
            <i className={`fas ${item.icon} text-white text-sm`}></i>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold">{item.value}</p>
            {item.suffix && <span className="text-sm text-gray-500">{item.suffix}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
