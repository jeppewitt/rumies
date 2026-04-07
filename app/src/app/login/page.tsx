'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { Logo } from '@/components/Logo'
import { SubmitButton } from '@/components/SubmitButton'

export default function LoginPage() {
  const [state, action] = useActionState(signIn, null)

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
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Velkommen tilbage</h1>
          <p className="text-ink3 text-sm mb-7">Log ind på din Rumies-konto</p>

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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-ink2">
                  Adgangskode
                </label>
                <Link href="/glemt-adgangskode" className="text-xs text-primary hover:underline">
                  Glemt adgangskode?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-ink text-sm placeholder:text-ink3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {state.error}
              </p>
            )}

            <SubmitButton>Log ind</SubmitButton>
          </form>
        </div>

        <p className="text-center text-sm text-ink3 mt-6">
          Ingen konto?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Opret gratis profil
          </Link>
        </p>
      </div>
    </main>
  )
}
