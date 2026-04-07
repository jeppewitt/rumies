'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding, type OnboardingData } from '@/app/onboarding/actions'

export default function OnboardingCompletePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function save() {
      const raw = localStorage.getItem('rumies_pending_quiz')
      if (!raw) { router.push('/onboarding'); return }

      let data: OnboardingData
      try { data = JSON.parse(raw) } catch { router.push('/dashboard'); return }

      const result = await saveOnboarding(data)
      if ('error' in result) {
        setStatus('error')
        setError(result.error)
      } else {
        localStorage.removeItem('rumies_pending_quiz')
        router.push('/dashboard')
      }
    }
    save()
  }, [router])

  // Show loading/error UI with same CSS vars as rest of app
  if (status === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif', background: '#F7F4EF' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
        <p style={{ color: '#E05252', marginBottom: 16 }}>{error}</p>
        <a href="/onboarding" style={{ color: '#D97757' }}>Prøv manuelt onboarding</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif', background: '#F7F4EF' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
        <p style={{ color: '#4A3528', fontWeight: 600 }}>Opretter din profil...</p>
      </div>
    </div>
  )
}
