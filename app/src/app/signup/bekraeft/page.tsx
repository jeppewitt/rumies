'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { createBrowserClient } from '@supabase/ssr'

export default function BekræftPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  // searchParams er async i Next.js 15 — vi bruger en wrapper
  return <BekræftInner searchParamsPromise={searchParams} />
}

function BekræftInner({ searchParamsPromise }: { searchParamsPromise: Promise<{ email?: string }> }) {
  const [email, setEmail] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    searchParamsPromise.then(p => setEmail(p.email ?? ''))
  }, [searchParamsPromise])

  async function handleResend() {
    if (!email || loading) return
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">

        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <Logo className="w-7 h-7" />
          <span className="font-display text-xl font-bold text-ink tracking-tight">Rumies</span>
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">📬</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Tjek din indbakke</h1>
          <p className="text-ink3 text-sm leading-relaxed mb-6">
            Vi har sendt dig en bekræftelsesmail. Klik på linket i e-mailen for at aktivere din konto.
          </p>

          {email && (
            <div className="border-t border-border pt-5">
              <p className="text-ink3 text-xs mb-3">Fik du ikke mailen?</p>
              {sent ? (
                <p className="text-sm font-semibold text-accent">Sendt igen ✓</p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {loading ? 'Sender...' : 'Gensend bekræftelsesmail'}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-ink3 mt-6">
          Kom tilbage?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log ind
          </Link>
        </p>
      </div>
    </main>
  )
}
