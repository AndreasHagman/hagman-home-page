'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/personal')
    } else {
      setError('Wrong password')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <p className="text-xs font-mono text-accent tracking-[0.2em] uppercase mb-4">
          Admin
        </p>
        <h1
          className="font-display text-3xl text-foreground mb-8"
          style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
        >
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted text-sm font-mono focus:outline-none focus:border-accent transition-colors duration-200"
          />

          {error && (
            <p className="text-sm font-mono text-accent">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-accent text-background font-medium text-sm rounded-full transition-all duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a
          href="/personal"
          className="block mt-6 text-center text-xs font-mono text-muted hover:text-foreground transition-colors duration-200"
        >
          ← Back to personal page
        </a>
      </div>
    </main>
  )
}
