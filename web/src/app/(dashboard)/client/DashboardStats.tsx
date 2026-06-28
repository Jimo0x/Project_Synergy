'use client'

interface DashboardStatsProps {
  totalOrders: number
  pendingOrders: number
  isVerified: boolean
}

export function DashboardStats({ totalOrders, pendingOrders, isVerified }: DashboardStatsProps) {
  const stats = [
    { icon: 'fa-shopping-bag', label: 'Commandes totales', value: totalOrders, color: 'from-purple-500 to-purple-600' },
    { icon: 'fa-clock', label: 'En cours', value: pendingOrders, color: 'from-cyan-500 to-cyan-600' },
    { icon: faCheckCircle, label: 'Compte vérifié', value: isVerified ? 'Oui' : 'Non', color: isVerified ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600' },
    { icon: 'fa-star', label: 'Note moyenne', value: '4.8', color: 'from-yellow-500 to-yellow-600' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
            <i className={`fas ${stat.icon} text-white text-sm`}></i>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

const faCheckCircle = 'fa-check-circle'
