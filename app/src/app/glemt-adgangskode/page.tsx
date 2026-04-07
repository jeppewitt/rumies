'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'
import { Logo } from '@/components/Logo'
import { SubmitButton } from '@/components/SubmitButton'

export default function GlemtAdgangskodePage() {
  const [state, action] = useActionState(requestPasswordReset, null)

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <Logo className="w-7 h-7" />
          <span className="font-display text-xl font-bold text-ink tracking-tight">Rumies</span>
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Glemt adgangskode?</h1>
          <p className="text-ink3 text-sm mb-7">
            Skriv din e-mail, så sender vi dig et link til at nulstille din adgangskode.
          </p>

          {state && 'success' in state ? (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
              Tjek din indbakke — vi har sendt et nulstillingslink til dig.
            </div>
          ) : (
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

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {state.error}
                </p>
              )}

              <SubmitButton>Send nulstillingslink</SubmitButton>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink3 mt-6">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Tilbage til login
          </Link>
        </p>
      </div>
    </main>
  )
}
