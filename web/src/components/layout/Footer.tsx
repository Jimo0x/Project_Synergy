'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer-premium py-12 mt-auto">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="footer-main-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  <span className="text-white">Synergy</span>
                  <span className="text-primary">Craft</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(232, 232, 240, 0.5)' }}>
                Nous connectons les talents digitaux de l&apos;Afrique de l&apos;Ouest aux projets les plus ambitieux du continent.
              </p>
              <div className="flex space-x-3 pt-2">
                <a href="#" className="footer-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" className="footer-icon" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" className="footer-icon" aria-label="GitHub"><i className="fab fa-github"></i></a>
              </div>
            </div>

            <div>
              <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>Liens Rapides</h3>
              <ul className="space-y-3.5">
                <li><Link href="/" className="footer-link text-sm">Accueil Platform</Link></li>
                <li><Link href="/catalogue" className="footer-link text-sm">Catalogue Services</Link></li>
                <li><Link href="/contact" className="footer-link text-sm">Support & Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>Expertises</h3>
              <ul className="space-y-3.5">
                <li><a href="#" className="footer-link text-sm">Développement Mobile & Web</a></li>
                <li><a href="#" className="footer-link text-sm">Design UI/UX & High-Tech</a></li>
                <li><a href="#" className="footer-link text-sm">Systèmes & Bases de données</a></li>
              </ul>
            </div>

            <div className="footer-glass-box p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center">
                  <i className="text-cyan-400 fas fa-paper-plane mr-2"></i> Newsletter
                </h3>
                <p className="text-xs mb-4" style={{ color: 'rgba(232, 232, 240, 0.5)' }}>
                  Restez branché sur les nouveautés tech et opportunités freelances.
                </p>
              </div>
              <div className="space-y-3">
                <input type="email" placeholder="Votre adresse email"
                       className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-lg py-5 px-4" />
                <button className="btn-glow btn-glow-primary w-full py-2.5 text-xs rounded-lg">
                  S&apos;abonner
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 my-8"></div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-xs" style={{ color: 'rgba(232, 232, 240, 0.4)' }}>
            <p>&copy; {new Date().getFullYear()} SynergyCraft. Conçu pour l&apos;excellence numérique.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Conditions d&apos;utilisation</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-premium {
          background: linear-gradient(180deg, #0c0c1a 0%, #06060c 100%);
          color: rgba(232, 232, 240, 0.6);
          position: relative;
          overflow: hidden;
          border-top: 2px solid transparent;
          border-image: linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent) 1;
          box-shadow: 0 -15px 35px rgba(0, 0, 0, 0.6);
        }
        .footer-main-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 2rem;
          padding: 3.5rem 2.5rem;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.05), 0 20px 40px rgba(0,0,0,0.3);
          backdrop-filter: blur(8px);
        }
        .footer-glass-box {
          background: rgba(5, 5, 10, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 1.25rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .footer-link {
          position: relative;
          transition: all 0.3s ease;
          color: rgba(232, 232, 240, 0.6);
          display: inline-block;
          text-decoration: none;
        }
        .footer-link:hover {
          color: white;
          transform: translateX(4px);
        }
        .footer-icon {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(232, 232, 240, 0.8);
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .footer-icon:hover {
          background: var(--gradient);
          border-color: transparent;
          color: white;
          transform: translateY(-4px) rotate(8deg);
          box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </footer>
  )
}
