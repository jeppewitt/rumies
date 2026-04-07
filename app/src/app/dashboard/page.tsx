import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardSoegendeClient from './DashboardSoegendeClient'
import DashboardUdlejerClient, { type InterestedPerson } from './DashboardUdlejerClient'
import { calcScore } from '@/lib/calcScore'

const S_EMOJIS = ['👩‍🎓', '👨‍💻', '🎨', '🏋️', '🌿', '🎸', '📚', '🧑‍🍳', '🎯', '🌸']

function pick(arr: string[], idx: number) { return arr[idx % arr.length] }

function fmtDate(d: string | null | undefined): string {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  const m = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']
  return `${dt.getDate()}. ${m[dt.getMonth()]} ${dt.getFullYear()}`
}

type QuizRow = {
  sleep_schedule?: string | null
  cleanliness?: number | null
  social_level?: number | null
  smoker?: boolean | null
  pet_friendly?: boolean | null
  parties?: boolean | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, role, city, district, is_active')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Dev-only: rolle-override via cookie
  if (process.env.NODE_ENV === 'development') {
    const cookieStore = await cookies()
    const devRole = cookieStore.get('dev_role')?.value
    if (devRole === 'seeker' || devRole === 'landlord') {
      profile.role = devRole
    }
  }

  const { count: convCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .or(`participant_a_id.eq.${user.id},participant_b_id.eq.${user.id}`)

  // ── SØGENDE ──────────────────────────────────────────────────────────────
  if (profile.role === 'seeker') {
    const [
      { count: favCount },
      { data: prefsData },
      { count: listingCount },
      { data: myQuizRow },
      { data: listings },
    ] = await Promise.all([
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('seeker_preferences').select('budget_max, preferred_cities, available_from').eq('profile_id', profile.id).maybeSingle(),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true).neq('landlord_id', user.id),
      supabase.from('quiz_answers').select('sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties').eq('profile_id', profile.id).maybeSingle(),
      supabase.from('listings').select('id, title, city, district, price, rooms, size_m2, landlord_id, image_urls').eq('is_active', true).eq('city', profile.city).neq('landlord_id', user.id).order('created_at', { ascending: false }).limit(20),
    ])

    const prefs = prefsData as { budget_max?: number; preferred_cities?: string[]; available_from?: string } | null
    const myQuiz: QuizRow = myQuizRow ?? {}

    // Hent landlord-quiz for at beregne match-scores
    const landlordIds = [...new Set((listings ?? []).map(l => String(l.landlord_id)))]
    let topMatches: { id: string; title: string; location: string; price: number; score: number; imageUrl?: string }[] = []
    if (landlordIds.length > 0) {
      const { data: landlordProfiles } = await supabase
        .from('profiles')
        .select('id, user_id')
        .in('user_id', landlordIds)
      const profileIds = (landlordProfiles ?? []).map(p => String(p.id))
      let quizByProfileId: Record<string, QuizRow> = {}
      if (profileIds.length > 0) {
        const { data: quizRows } = await supabase
          .from('quiz_answers')
          .select('profile_id, sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties')
          .in('profile_id', profileIds)
        for (const q of quizRows ?? []) quizByProfileId[String(q.profile_id)] = q as QuizRow
      }
      const profileByUserId: Record<string, string> = {}
      for (const p of landlordProfiles ?? []) profileByUserId[String(p.user_id)] = String(p.id)

      topMatches = (listings ?? [])
        .map(l => {
          const profileId = profileByUserId[String(l.landlord_id)]
          const quiz = profileId ? (quizByProfileId[profileId] ?? {}) : {}
          const score = calcScore(myQuiz, quiz)
          return {
            id: String(l.id),
            title: String(l.title ?? 'Bolig'),
            location: [l.district, l.city].filter(Boolean).join(', '),
            price: Number(l.price ?? 0),
            score,
            imageUrl: (l.image_urls as string[] | null)?.[0],
          }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    }

    return (
      <DashboardSoegendeClient
        displayName={String(profile.display_name ?? '')}
        stats={{
          conversationCount: convCount ?? 0,
          favoritesCount: favCount ?? 0,
        }}
        prefs={{
          city: prefs?.preferred_cities?.[0] ?? profile.city ?? undefined,
          district: profile.district ?? undefined,
          budgetMax: prefs?.budget_max ?? undefined,
          availableFrom: fmtDate(prefs?.available_from),
          availableFromRaw: prefs?.available_from ?? undefined,
        }}
        totalListings={listingCount ?? 0}
        topMatches={topMatches}
        profileId={String(profile.id)}
        isActive={profile.is_active !== false}
      />
    )
  }

  // ── UDLEJER ───────────────────────────────────────────────────────────────
  const [
    { data: listing },
    { data: convs },
    { data: myLandlordQuizRow },
  ] = await Promise.all([
    supabase.from('listings').select('id, title, city, district, price, size_m2, room_size_m2, available_from, view_count, is_active, image_urls').eq('landlord_id', user.id).maybeSingle(),
    supabase.from('conversations').select('participant_a_id, created_at').eq('participant_b_id', user.id).order('created_at', { ascending: false }),
    supabase.from('quiz_answers').select('sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties').eq('profile_id', profile.id).maybeSingle(),
  ])

  const myLandlordQuiz: QuizRow = myLandlordQuizRow ?? {}
  const seekerUserIds = (convs ?? []).map(c => c.participant_a_id as string)

  let interested: InterestedPerson[] = []
  if (seekerUserIds.length > 0) {
    const { data: seekers } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, age, city, district, quiz_answers(sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties), seeker_preferences(budget_max)')
      .in('user_id', seekerUserIds)

    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    interested = (seekers ?? []).map((s, i) => {
      const quiz = (s.quiz_answers as QuizRow[] | null)?.[0] ?? {}
      const sprefs = (s.seeker_preferences as { budget_max?: number }[] | null)?.[0]
      const convDate = convs?.find(c => c.participant_a_id === s.user_id)?.created_at
      const traits: string[] = []
      if (quiz?.pet_friendly) traits.push('Dyrevenlig')
      if (quiz?.smoker === false) traits.push('Ikke-ryger')
      const score = calcScore(myLandlordQuiz, quiz)
      return {
        id: String(s.id),
        name: String(s.display_name ?? 'Roomie'),
        age: s.age ? Number(s.age) : undefined,
        emoji: pick(S_EMOJIS, i),
        location: [s.district, s.city].filter(Boolean).join(', '),
        budget: sprefs?.budget_max ? Number(sprefs.budget_max) : undefined,
        score,
        verified: score >= 85,
        isNew: convDate ? new Date(convDate).getTime() > cutoff : false,
        traits,
      }
    })
  }

  return (
    <DashboardUdlejerClient
      displayName={String(profile.display_name ?? '')}
      stats={{
        viewCount: listing ? Number((listing as { view_count?: number }).view_count ?? 0) : 0,
        conversationCount: convCount ?? 0,
      }}
      listing={listing ? (() => {
        const title = String(listing.title ?? '')
        const street = title.includes(',') ? title.split(',')[0].trim() : undefined
        return {
          title,
          city: String(listing.city ?? ''),
          district: listing.district ? String(listing.district) : undefined,
          street,
          price: Number(listing.price ?? 0),
          size: listing.size_m2 ? Number(listing.size_m2) : undefined,
          roomSize: (listing as { room_size_m2?: number }).room_size_m2 ? Number((listing as { room_size_m2?: number }).room_size_m2) : undefined,
          availableFrom: fmtDate(listing.available_from),
          availableFromRaw: listing.available_from ? String(listing.available_from) : undefined,
          imageUrls: (listing as { image_urls?: string[] }).image_urls ?? [],
          isActive: (listing as { is_active?: boolean }).is_active !== false,
          tags: [(listing as { is_active?: boolean }).is_active !== false ? 'Synlig' : 'Inaktiv'],
        }
      })() : undefined}
      interested={interested}
      profileId={String(profile.id)}
      listingId={listing ? String((listing as { id: string }).id) : undefined}
      userId={user.id}
    />
  )
}
