import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OverviewClient from './OverviewClient'

const QUIZ_COUNT = 12

export default async function OverviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Hent IDs vi skal bruge til specifikke states
  let myProfileId: string | null = null
  let otherProfileId: string | null = null
  let convId: string | null = null

  if (user) {
    const { data: me } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single()
    myProfileId = me?.id ?? null

    // Find en anden profil til profilvisning
    const { data: other } = await supabase.from('profiles')
      .select('id').neq('user_id', user.id).limit(1).single()
    otherProfileId = other?.id ?? null

    // Find en samtale til chat open-state
    const { data: conv } = await supabase.from('conversations')
      .select('id')
      .or(`participant_a_id.eq.${user.id},participant_b_id.eq.${user.id}`)
      .limit(1).single()
    convId = conv?.id ?? null
  }

  const frames = [
    // ── Offentlige sider ──────────────────────────────────────
    { group: 'Landing',     label: 'Forside',            url: '/?preview=1' },
    { group: 'Auth',        label: 'Login',              url: '/login' },
    { group: 'Auth',        label: 'Signup bekræft',     url: '/signup/bekraeft' },

    // ── Onboarding ────────────────────────────────────────────
    { group: 'Onboarding',  label: 'Vælg rolle',         url: '/onboarding?preview=1&step=role' },
    ...Array.from({ length: QUIZ_COUNT }, (_, i) => ({
      group: 'Onboarding',
      label: `Quiz ${i + 1}/${QUIZ_COUNT}`,
      url: `/onboarding?preview=1&step=quiz&q=${i}&role=søgende`,
    })),
    { group: 'Onboarding',  label: 'Info – søgende',     url: '/onboarding?preview=1&step=info&role=søgende' },
    { group: 'Onboarding',  label: 'Info – udlejer',     url: '/onboarding?preview=1&step=info&role=udlejer' },
    { group: 'Onboarding',  label: 'Success',            url: '/onboarding?preview=1&step=success&role=søgende' },

    // ── Dashboard ─────────────────────────────────────────────
    { group: 'Dashboard',   label: 'Dashboard',          url: '/dashboard' },

    // ── Matches ───────────────────────────────────────────────
    { group: 'Matches',     label: 'Alle matches',       url: '/matches' },
    { group: 'Matches',     label: 'Favoritter',         url: '/matches?tab=favoritter' },

    // ── Chat ──────────────────────────────────────────────────
    { group: 'Chat',        label: 'Samtaleliste',       url: '/chat' },
    ...(convId ? [
      { group: 'Chat',      label: 'Åben samtale',       url: `/chat?conv=${convId}` },
    ] : []),

    // ── Profil ────────────────────────────────────────────────
    ...(myProfileId ? [
      { group: 'Profil',    label: 'Min profil',         url: `/profil/${myProfileId}` },
    ] : []),
    ...(otherProfileId ? [
      { group: 'Profil',    label: 'Anden profil',       url: `/profil/${otherProfileId}` },
    ] : []),
  ]

  return <OverviewClient frames={frames} />
}
