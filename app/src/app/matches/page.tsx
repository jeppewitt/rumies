import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import MatchesClient, { type MatchCard } from './MatchesClient'
import { calcScore } from '@/lib/calcScore'

const EMOJIS = ['👩‍🎓', '👨‍💻', '🎨', '🏋️', '🌿', '🎸', '📚', '🧑‍🍳', '🎯', '🌸', '🦋', '🎵']
const BGS = ['bg-sage', 'bg-sky', 'bg-rose', 'bg-lavender', 'bg-mint', 'bg-peach']

function pickByIndex(arr: string[], idx: number) { return arr[idx % arr.length] }

type QuizRow = {
  sleep_schedule?: string | null
  cleanliness?: number | null
  social_level?: number | null
  smoker?: boolean | null
  pet_friendly?: boolean | null
  parties?: boolean | null
}

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, role, city, district')
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

  let cards: MatchCard[] = []

  if (profile.role === 'seeker') {
    // ── SØGENDE: hent listings + beregn score i TypeScript (samme som profilsiden) ──
    const { data: myQuizRow } = await supabase
      .from('quiz_answers')
      .select('sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties')
      .eq('profile_id', profile.id)
      .maybeSingle()

    const myQuiz: QuizRow = myQuizRow ?? {}

    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, city, district, price, rooms, size_m2, available_from, landlord_id, image_urls')
      .eq('is_active', true)
      .neq('landlord_id', user.id)
      .order('created_at', { ascending: false })

    const landlordUserIds = [...new Set((listings ?? []).map(l => String(l.landlord_id)))]

    // Hent udlejerprofiler (profil-ID + user_id)
    type LandlordProfile = { id: string; quiz: QuizRow }
    let landlordByUserId: Record<string, LandlordProfile> = {}
    if (landlordUserIds.length > 0) {
      const { data: lps } = await supabase
        .from('profiles')
        .select('id, user_id')
        .in('user_id', landlordUserIds)

      // Hent quiz-svar separat (samme måde som profilsiden)
      const profileIds = (lps ?? []).map(p => String(p.id))
      let quizByProfileId: Record<string, QuizRow> = {}
      if (profileIds.length > 0) {
        const { data: quizRows } = await supabase
          .from('quiz_answers')
          .select('profile_id, sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties')
          .in('profile_id', profileIds)
        for (const q of quizRows ?? []) {
          quizByProfileId[String(q.profile_id)] = q as QuizRow
        }
      }

      for (const p of lps ?? []) {
        landlordByUserId[String(p.user_id)] = {
          id: String(p.id),
          quiz: quizByProfileId[String(p.id)] ?? {},
        }
      }
    }

    cards = (listings ?? []).map((l, i) => {
      const landlord = landlordByUserId[String(l.landlord_id)]
      const score = landlord ? calcScore(myQuiz, landlord.quiz) : 70
      return {
        id: String(l.id),
        name: String(l.title ?? 'Bolig'),
        emoji: '🏠',
        bg: pickByIndex(BGS, i),
        imageUrl: (l.image_urls as string[] | null)?.[0] ?? undefined,
        city: String(l.city ?? ''),
        area: String(l.district ?? ''),
        job: [l.rooms && `${l.rooms} vær.`, l.size_m2 && `${l.size_m2} m²`].filter(Boolean).join(' · '),
        budget: Number(l.price ?? 0),
        score,
        verified: score >= 85,
        tags: [],
        cityFilter: String(l.city ?? '').toLowerCase(),
        otherUserId: String(l.landlord_id),
        listingId: String(l.id),
        otherProfileId: landlord?.id ?? undefined,
      }
    }).sort((a, b) => b.score - a.score)

  } else {
    // ── UDLEJER: beregn score i TypeScript mod udlejers egne quiz-svar ──
    const { data: myQuizRow } = await supabase
      .from('quiz_answers')
      .select('sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties')
      .eq('profile_id', profile.id)
      .maybeSingle()

    const myQuiz: QuizRow = myQuizRow ?? {}

    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, age, city, district, seeker_preferences(budget_max, available_from), quiz_answers(sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties)')
      .eq('role', 'seeker')
      .eq('is_active', true)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })

    cards = (data ?? []).map((s, i) => {
      const prefs = (s.seeker_preferences as { budget_max?: number }[] | null)?.[0]
      const quiz = (s.quiz_answers as QuizRow[] | null)?.[0] ?? {}
      const tags: string[] = []
      if (quiz?.pet_friendly) tags.push('dyrevenlig')
      if (quiz?.smoker === false) tags.push('ikke-ryger')
      const score = calcScore(myQuiz, quiz)
      return {
        id: String(s.id),
        name: String(s.display_name ?? 'Roomie'),
        age: s.age ? Number(s.age) : undefined,
        emoji: pickByIndex(EMOJIS, i),
        bg: pickByIndex(BGS, i),
        city: String(s.city ?? ''),
        area: String(s.district ?? ''),
        job: String(s.city ?? ''),
        budget: Number(prefs?.budget_max ?? 0),
        score,
        verified: score >= 85,
        tags,
        cityFilter: String(s.city ?? '').toLowerCase(),
        otherUserId: String(s.user_id),
        otherProfileId: String(s.id),
      } satisfies MatchCard
    })

    // Sortér efter score
    cards.sort((a, b) => b.score - a.score)
  }

  // Hent favoritter — listings for søgende, profiler for udlejere
  const { data: favRows } = await supabase
    .from('favorites')
    .select('listing_id, profile_id')
    .eq('user_id', user.id)

  const initialFavIds = (favRows ?? []).map(f =>
    String(f.listing_id ?? f.profile_id)
  )

  return (
    <MatchesClient
      cards={cards}
      userRole={profile.role as string}
      displayName={profile.display_name as string}
      initialFavIds={initialFavIds}
      userCity={String(profile.city ?? '')}
    />
  )
}
