'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { updatePassword } from '@/app/actions/auth'
import { Logo } from '@/components/Logo'
import { SubmitButton } from '@/components/SubmitButton'

export default function NulstilAdgangskodePage() {
  const [state, action] = useActionState(updatePassword, null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (state && 'success' in state) {
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }, [state, router])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const pw = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value
    if (pw !== confirm) {
      e.preventDefault()
      setConfirmError('Adgangskoderne matcher ikke.')
    } else {
      setConfirmError(null)
    }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <Logo className="w-7 h-7" />
          <span className="font-display text-xl font-bold text-ink tracking-tight">Rumies</span>
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Ny adgangskode</h1>
          <p className="text-ink3 text-sm mb-7">Vælg en ny adgangskode til din konto.</p>

          {state && 'success' in state ? (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
              Adgangskoden er opdateret. Du bliver sendt videre...
            </div>
          ) : (
            <form action={action} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-ink2">
                  Ny adgangskode
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Mindst 6 tegn"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-ink text-sm placeholder:text-ink3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="text-sm font-semibold text-ink2">
                  Bekræft adgangskode
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Gentag adgangskoden"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-ink text-sm placeholder:text-ink3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              {(confirmError || state?.error) && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {confirmError ?? state?.error}
                </p>
              )}

              <SubmitButton>Gem ny adgangskode</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
