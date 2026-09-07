import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'
import { DEMO_MODE } from '@/lib/demo'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>
}) {
  // Demo: ingen login og ingen profil-tjek — flowet kører rent lokalt
  if (DEMO_MODE) {
    return (
      <Suspense fallback={null}>
        <OnboardingClient userId="demo" />
      </Suspense>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { preview } = await searchParams
  const isPreview = process.env.NODE_ENV === 'development' && preview === '1'

  if (!isPreview) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profile) redirect('/dashboard')
  }

  return (
    <Suspense fallback={null}>
      <OnboardingClient userId={user.id} />
    </Suspense>
  )
}
