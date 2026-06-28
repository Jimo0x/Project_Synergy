import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('core_portfolio')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: testimonials } = await supabase
    .from('core_testimonial')
    .select('*')
    .order('created_at', { ascending: false })

  const categoryNames: Record<string, string> = {
    design: 'Design Graphique',
    web: 'Développement Web',
    marketing: 'Marketing Digital',
    branding: 'Branding',
  }

  return (
    <div className="py-20" style={{ background: '#050508' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Notre <span className="gradient-text">Portfolio</span></h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Découvrez nos réalisations et les projets qui ont transformé nos clients.
          </p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {projects.map((project: any) => (
              <div key={project.id} className="group rounded-2xl overflow-hidden transition-all duration-300"
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="h-52 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(6,182,212,0.05))' }}>
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-image text-4xl" style={{ color: 'rgba(139,92,246,0.2)' }}></i>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                    {categoryNames[project.category] || project.category}
                  </span>
                  <h3 className="font-bold mt-2">{project.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.technologies.split(',').map((tech: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)' }}>{tech.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-briefcase text-5xl text-gray-600 mb-4"></i>
            <p className="text-gray-500">Le portfolio sera bientôt disponible</p>
          </div>
        )}

        {testimonials && testimonials.length > 0 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-10">Ce qu&apos;ils disent de <span className="gradient-text">nous</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t: any) => (
                <div key={t.id} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className={`fas fa-star text-xs ${i < t.rating ? 'text-yellow-500' : 'text-gray-700'}`}></i>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 italic mb-4">{t.content}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      {t.client_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.client_name}</p>
                      {t.client_company && <p className="text-xs text-gray-500">{t.client_company}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
