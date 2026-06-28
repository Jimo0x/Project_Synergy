'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GlobeCanvas from '@/components/home/GlobeCanvas'

export default function HomePage() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          revealObserver.unobserve(entry.target)
          const counter = entry.target.querySelector('[data-count]')
          if (counter) animateCounter(counter as HTMLElement, parseInt((counter as HTMLElement).dataset.count || '0'), 1500)
        }
      })
    }, { threshold: 0.15 })

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el))

    document.querySelectorAll('[data-count]').forEach(el => {
      animateCounter(el as HTMLElement, parseInt((el as HTMLElement).dataset.count || '0'), 2000)
    })

    return () => revealObserver.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <div className="home-dark-wrap">
        <section id="home-hero">
          <GlobeCanvas />
          <div className="hero-noise" />

          <div className="hero-content-wrap">
            <div className="hero-tag">Marketplace Freelance · Bénin & Afrique de l'Ouest</div>

            <h1 className="hero-title">
              Connectez-vous aux<br />
              <span className="word-violet">meilleurs talents</span><br />
              <span className="word-outline">digitaux</span>
            </h1>

            <p className="hero-sub">
              SynergyCraft connecte les entrepreneurs ambitieux aux freelancers vérifiés pour transformer leurs idées en <strong>business rentable</strong>. Paiement Mobile Money inclus.
            </p>

            <div className="hero-btns">
              <Link href="/register?type=client" className="btn-glow btn-glow-primary">
                <i className="fas fa-search"></i> Trouver un expert
              </Link>
              <Link href="/register?type=freelancer" className="btn-glow btn-glow-ghost">
                <i className="fas fa-laptop-code"></i> Devenir Freelance
              </Link>
            </div>

            <div className="hero-metrics">
              <div>
                <span className="metric-val" data-count="200">0</span>
                <span className="metric-label">Projets réalisés</span>
              </div>
              <div>
                <span className="metric-val">100%</span>
                <span className="metric-label">Talents vérifiés</span>
              </div>
              <div>
                <span className="metric-val">J+1</span>
                <span className="metric-label">Paiement garanti</span>
              </div>
              <div>
                <span className="metric-val">24/7</span>
                <span className="metric-label">Support dédié</span>
              </div>
            </div>
          </div>

          <div className="scroll-hint hidden md:flex">
            <div className="scroll-hint-line"></div>
            Scroll
          </div>
        </section>

        <section className="dark-section py-16 lg:py-24" ref={el => { sectionRefs.current[0] = el }}>
          <div className="section-glow-v" style={{ top: '-200px', left: '-200px' }} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 lg:mb-16 reveal">
              <div className="eyebrow eyebrow-v">Votre objectif</div>
              <h2 className="section-title">
                Quel est votre <span className="gradient-text">objectif</span> aujourd'hui ?
              </h2>
              <p className="section-subtitle">Que vous soyez entrepreneur ou freelancer, SynergyCraft est fait pour vous.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="obj-card obj-card-v reveal reveal-delay-1">
                <div className="obj-icon obj-icon-v"><i className="fas fa-rocket"></i></div>
                <h3 className="obj-title">Je veux <span style={{ color: '#A78BFA' }}>lancer un projet</span></h3>
                <p className="obj-desc">Vous avez une idée ? Trouvez le talent qui la transforme en réalité, sans risque et rapidement.</p>
                <ul className="obj-list">
                  <li>Accès aux meilleurs talents vérifiés</li>
                  <li>Devis gratuits en 24h</li>
                  <li>Satisfait ou remboursé</li>
                </ul>
                <Link href="/register?type=client" className="btn-glow btn-glow-primary" style={{ fontSize: '0.85rem', padding: '0.65rem 1.5rem', width: '100%' }}>
                  Publier mon projet gratuitement
                </Link>
              </div>

              <div className="obj-card obj-card-c reveal reveal-delay-2">
                <div className="obj-icon obj-icon-c"><i className="fas fa-coins"></i></div>
                <h3 className="obj-title">Je veux <span style={{ color: '#22D3EE' }}>gagner de l'argent</span></h3>
                <p className="obj-desc">Vous avez du talent ? Rejoignez notre communauté et transformez vos compétences en revenus stables.</p>
                <ul className="obj-list">
                  <li>+1000 missions par mois</li>
                  <li>Commission réduite (5%)</li>
                  <li>Paiement sécurisé J+1</li>
                </ul>
                <Link href="/register?type=freelancer" className="btn-glow"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1.5rem', background: 'rgba(6,182,212,0.12)', color: '#22D3EE', border: '1px solid rgba(6,182,212,0.3)', width: '100%' }}>
                  Commencer à vendre
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="dark-section-alt py-16 lg:py-24">
          <div className="section-glow-c" style={{ top: '50%', right: '-150px', transform: 'translateY(-50%)' }} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 lg:mb-16 reveal">
              <div className="eyebrow eyebrow-c">Expertise</div>
              <h2 className="section-title">Des solutions pour <span style={{ color: '#22D3EE' }}>faire décoller</span> votre business</h2>
              <p className="section-subtitle">On ne vous vend pas juste de la technique — on vous vend des résultats mesurables.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              <div className="svc-card reveal reveal-delay-1">
                <div className="svc-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>
                  <i className="fas fa-eye"></i>
                </div>
                <h3 className="svc-title">Design qui Convertit</h3>
                <p className="svc-desc">Une identité visuelle qui capte l'attention et inspire confiance instantanément.</p>
                <Link href="/catalogue" className="svc-link" style={{ color: '#A78BFA' }}>
                  Voir les designers <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              <div className="svc-card reveal reveal-delay-2">
                <div className="svc-icon" style={{ background: 'rgba(6,182,212,0.1)', color: '#22D3EE' }}>
                  <i className="fas fa-laptop-code"></i>
                </div>
                <h3 className="svc-title">Sites Haute Performance</h3>
                <p className="svc-desc">Rapide, sécurisé et optimisé pour transformer les visiteurs en clients.</p>
                <Link href="/catalogue" className="svc-link" style={{ color: '#22D3EE' }}>
                  Voir les développeurs <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              <div className="svc-card reveal reveal-delay-3">
                <div className="svc-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#FBBF24' }}>
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="svc-title">Marketing Ciblé</h3>
                <p className="svc-desc">Touchez exactement votre cible et maximisez votre retour sur investissement.</p>
                <Link href="/catalogue" className="svc-link" style={{ color: '#FBBF24' }}>
                  Voir les marketeurs <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              <div className="svc-card reveal reveal-delay-4">
                <div className="svc-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#F472B6' }}>
                  <i className="fas fa-pen-nib"></i>
                </div>
                <h3 className="svc-title">Contenu & Copywriting</h3>
                <p className="svc-desc">Les mots qui convainquent, vendent et fidélisent votre audience.</p>
                <Link href="/catalogue" className="svc-link" style={{ color: '#F472B6' }}>
                  Voir les rédacteurs <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="dark-section py-16 lg:py-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 lg:mb-16 reveal">
              <div className="eyebrow eyebrow-v">Simple & rapide</div>
              <h2 className="section-title">Comment réaliser <span className="gradient-text">votre projet ?</span></h2>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-[36px] left-[12.5%] right-[12.5%] h-px"
                   style={{ background: 'linear-gradient(90deg,rgba(139,92,246,0.4),rgba(6,182,212,0.3))', zIndex: 0 }} />

              <div className="process-step reveal reveal-delay-1" style={{ position: 'relative', zIndex: 1 }}>
                <div className="step-num">1</div>
                <h3 className="step-title">Publiez</h3>
                <p className="step-desc">Décrivez votre besoin gratuitement en quelques clics.</p>
              </div>
              <div className="process-step reveal reveal-delay-2" style={{ position: 'relative', zIndex: 1 }}>
                <div className="step-num">2</div>
                <h3 className="step-title">Recevez</h3>
                <p className="step-desc">Des devis de freelancers qualifiés sous 24h.</p>
              </div>
              <div className="process-step reveal reveal-delay-3" style={{ position: 'relative', zIndex: 1 }}>
                <div className="step-num">3</div>
                <h3 className="step-title">Choisissez</h3>
                <p className="step-desc">Comparez les profils et sélectionnez le meilleur expert.</p>
              </div>
              <div className="process-step reveal reveal-delay-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="step-num">4</div>
                <h3 className="step-title">Réussissez</h3>
                <p className="step-desc">Payez une fois le travail validé. Satisfaction garantie.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="dark-section-alt py-16 lg:py-24">
          <div className="section-glow-v" style={{ bottom: '-200px', right: '-200px' }} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 lg:mb-16 reveal">
              <div className="eyebrow eyebrow-c">Témoignages</div>
              <h2 className="section-title">Ce que disent <span style={{ color: '#22D3EE' }}>nos utilisateurs</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="testi-card reveal reveal-delay-1">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">"J'ai posté ma mission le lundi, mercredi j'avais 3 devis, vendredi le travail commençait. Efficacité redoutable."</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,#8B5CF6,#06B6D4)' }}>MK</div>
                  <div>
                    <div className="testi-name">Marie Kessler</div>
                    <div className="testi-role">CEO BioStart</div>
                  </div>
                </div>
              </div>

              <div className="testi-card reveal reveal-delay-2">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">"SynergyCraft m'a permis de doubler mon CA cette année sans avoir à chasser les clients. La plateforme fait le travail."</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,#06B6D4,#8B5CF6)' }}>JP</div>
                  <div>
                    <div className="testi-name">Jean Patel</div>
                    <div className="testi-role">Développeur Fullstack</div>
                  </div>
                </div>
              </div>

              <div className="testi-card reveal reveal-delay-3">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">"Le système de paiement sécurisé me rassure énormément. Je sais que je suis payé si le travail est fait."</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>SL</div>
                  <div>
                    <div className="testi-name">Sophie Laurent</div>
                    <div className="testi-role">Directrice Marketing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dark-section py-16 lg:py-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="cta-wrap reveal">
              <div className="eyebrow eyebrow-v" style={{ justifyContent: 'center', position: 'relative', zIndex: 1 }}>Rejoignez-nous</div>
              <h2 className="section-title" style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                Prêt à passer au <span className="gradient-text">niveau supérieur ?</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(232,232,240,0.5)', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: '1.65', position: 'relative', zIndex: 1 }}>
                Ne laissez pas vos idées dormir. Des freelancers prêts à transformer votre vision attendent votre projet.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <Link href="/register?type=client" className="btn-glow btn-glow-primary">
                  Publier un projet
                </Link>
                <Link href="/register?type=freelancer" className="btn-glow btn-glow-ghost">
                  Je suis Freelance
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

function animateCounter(el: HTMLElement, target: number, duration: number) {
  let start = 0
  const step = target / (duration / 16)
  const timer = setInterval(() => {
    start += step
    if (start >= target) { el.textContent = target + '+'; clearInterval(timer); return }
    el.textContent = Math.floor(start) + '+'
  }, 16)
}
