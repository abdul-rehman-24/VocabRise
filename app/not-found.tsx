import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary))' }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          404
        </h1>
        <p className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          Page Not Found
        </p>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 text-white rounded-lg font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--gradient-primary)' }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
