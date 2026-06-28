import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
      <div className="text-center">
        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page introuvable</p>
        <Link href="/" className="btn-glow btn-glow-primary px-8 py-3 no-underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
