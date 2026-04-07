'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { Logo } from '@/components/Logo'
import { SubmitButton } from '@/components/SubmitButton'

export default function SignupPage() {
  const [state, action] = useActionState(signUp, null)

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <Logo className="w-7 h-7" />
          <span className="font-display text-xl font-bold text-ink tracking-tight">Rumies</span>
        </Link>

        {/* Kort */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Opret din profil</h1>
          <p className="text-ink3 text-sm mb-7">Gratis at starte · Ingen kreditkort</p>

          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-ink2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="dig@eksempel.dk"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-ink text-sm placeholder:text-ink3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-ink2">
                Adgangskode
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Mindst 6 tegn"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-ink text-sm placeholder:text-ink3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {state.error}
              </p>
            )}

            <SubmitButton>Opret konto</SubmitButton>
          </form>

          <p className="text-xs text-ink3 text-center mt-5 leading-relaxed">
            Ved at oprette en konto accepterer du vores{' '}
            <Link href="/vilkaar" className="underline hover:text-ink2">vilkår</Link>
            {' '}og{' '}
            <Link href="/privatlivspolitik" className="underline hover:text-ink2">privatlivspolitik</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-ink3 mt-6">
          Har du allerede en konto?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log ind
          </Link>
        </p>
      </div>
    </main>
  )
}
