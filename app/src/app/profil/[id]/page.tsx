import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProfilClient, { type ProfileData, type LifestyleTag, type CompatRow } from './ProfilClient'
import { calcScore } from '@/lib/calcScore'

const EMOJIS = ['👩‍🎓', '👨‍💻', '🎨', '🏋️', '🌿', '🎸', '📚', '🧑‍🍳', '🎯', '🌸']
function pick(arr: string[], id: string) { return arr[id.charCodeAt(0) % arr.length] }

function fmtDate(d: string | null | undefined): string {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  const m = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']
  return `${dt.getDate()}. ${m[dt.getMonth()]} ${dt.getFullYear()}`
}

type QuizRow = {
  sleep_schedule?: string | null
  cleanliness?: number | null
  diet?: string | null
  smoker?: boolean | null
  pet_friendly?: boolean | null
  shared_cooking?: boolean | null
  social_level?: number | null
  parties?: boolean | null
}

function quizToTags(quiz: QuizRow): LifestyleTag[] {
  const tags: LifestyleTag[] = []
  if (quiz.sleep_schedule === 'early_bird') tags.push({ label: 'Morgenmenneske', icon: 'wb_sunny' })
  if (quiz.sleep_schedule === 'night_owl')  tags.push({ label: 'Natteravn', icon: 'nights_stay' })
  if (quiz.sleep_schedule === 'flexible')   tags.push({ label: 'Fleksibel søvn', icon: 'schedule' })
  if (quiz.cleanliness != null && quiz.cleanliness >= 4)
    tags.push({ label: quiz.cleanliness === 5 ? 'Meget ryddelig' : 'Ryddelig', icon: 'cleaning_services' })
  if (quiz.smoker === false) tags.push({ label: 'Ikke-ryger', icon: 'smoke_free' })
  if (quiz.pet_friendly)    tags.push({ label: 'Dyrevenlig', icon: 'pets' })
  if (quiz.diet === 'vegetarian') tags.push({ label: 'Vegetar', icon: 'eco' })
  if (quiz.diet === 'vegan')      tags.push({ label: 'Veganer', icon: 'eco' })
  if (quiz.shared_cooking)        tags.push({ label: 'Madentusiast', icon: 'restaurant' })
  if (quiz.social_level != null && quiz.social_level >= 4) tags.push({ label: 'Social', icon: 'group' })
  if (quiz.parties === false) tags.push({ label: 'Stille hjemmeliv', icon: 'house' })
  return tags
}

function calcCompat(viewerQuiz: QuizRow, targetQuiz: QuizRow): CompatRow[] {
  const rows: CompatRow[] = []
  // Sleep schedule
  if (viewerQuiz.sleep_schedule && targetQuiz.sleep_schedule) {
    const pct = viewerQuiz.sleep_schedule === targetQuiz.sleep_schedule ? 100
      : viewerQuiz.sleep_schedule === 'flexible' || targetQuiz.sleep_schedule === 'flexible' ? 75 : 40
    rows.push({ label: 'Søvnvaner', pct })
  }
  // Cleanliness
  if (viewerQuiz.cleanliness != null && targetQuiz.cleanliness != null) {
    const diff = Math.abs(viewerQuiz.cleanliness - targetQuiz.cleanliness)
    rows.push({ label: 'Ryddelighed', pct: Math.max(0, 100 - diff * 20) })
  }
  // Social
  if (viewerQuiz.social_level != null && targetQuiz.social_level != null) {
    const diff = Math.abs(viewerQuiz.social_level - targetQuiz.social_level)
    rows.push({ label: 'Sociale vaner', pct: Math.max(0, 100 - diff * 20) })
  }
  // Smoking
  if (viewerQuiz.smoker != null && targetQuiz.smoker != null) {
    rows.push({ label: 'Rygning', pct: viewerQuiz.smoker === targetQuiz.smoker ? 100 : 30 })
  }
  // Pets
  if (viewerQuiz.pet_friendly != null && targetQuiz.pet_friendly != null) {
    rows.push({ label: 'Kæledyr', pct: viewerQuiz.pet_friendly === targetQuiz.pet_friendly ? 100 : 60 })
  }
  return rows
}

export default async function ProfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ listing?: string }>
}) {
  const { id } = await params
  const { listing: listingParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch target profile
  const { data: target } = await supabase
    .from('profiles')
    .select('id, user_id, display_name, age, bio, role, city, district, is_active, avatar_url')
    .eq('id', id)
    .single()

  if (!target) notFound()

  // Fetch current user's profile
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  // Fetch own quiz via direct query (same approach as matches page — avoids nested select inconsistency)
  const { data: myQuizDirect } = myProfile ? await supabase
    .from('quiz_answers')
    .select('sleep_schedule, cleanliness, diet, smoker, pet_friendly, shared_cooking, social_level, parties')
    .eq('profile_id', myProfile.id)
    .maybeSingle() : { data: null }

  // Fetch target quiz_answers
  const { data: targetQuizRaw } = await supabase
    .from('quiz_answers')
    .select('sleep_schedule, cleanliness, diet, smoker, pet_friendly, shared_cooking, social_level, parties')
    .eq('profile_id', target.id)
    .maybeSingle()

  const targetQuiz = targetQuizRaw as QuizRow | null
  const tags: LifestyleTag[] = targetQuiz ? quizToTags(targetQuiz) : []

  // Role-specific data
  let budgetMax: number | undefined
  let availableFrom: string | undefined
  let listingPrice: number | undefined
  let listingRooms: number | undefined
  let listingSize: number | undefined
  let listingAvailableFrom: string | undefined
  let listingImageUrls: string[] | undefined
  let matchScore: number | undefined

  if (target.role === 'seeker') {
    const { data: prefs } = await supabase
      .from('seeker_preferences')
      .select('budget_max, available_from')
      .eq('profile_id', target.id)
      .maybeSingle()
    budgetMax = prefs?.budget_max ? Number(prefs.budget_max) : undefined
    availableFrom = fmtDate((prefs as { available_from?: string } | null)?.available_from)

    // Match score: beregn direkte fra quiz-svar
    if (myProfile?.role === 'landlord') {
      if (myQuizDirect && targetQuiz) {
        matchScore = calcScore(myQuizDirect as QuizRow, targetQuiz)
      }
    }
  } else {
    // Landlord profile — get their listing (prefer ?listing= param for score-konsistens)
    const listingQuery = supabase
      .from('listings')
      .select('id, price, rooms, size_m2, available_from, image_urls')
      .eq('landlord_id', target.user_id)
      .eq('is_active', true)

    const { data: listing } = await (
      listingParam
        ? listingQuery.eq('id', listingParam).maybeSingle()
        : listingQuery.maybeSingle()
    )
    if (listing) {
      listingPrice = listing.price ? Number(listing.price) : undefined
      listingRooms = listing.rooms ? Number(listing.rooms) : undefined
      listingSize  = listing.size_m2 ? Number(listing.size_m2) : undefined
      listingAvailableFrom = fmtDate(listing.available_from)
      listingImageUrls = (listing.image_urls as string[] | null) ?? undefined

      // Match score: beregn direkte fra quiz-svar
      if (myProfile?.role === 'seeker') {
        if (myQuizDirect && targetQuiz) {
          matchScore = calcScore(myQuizDirect as QuizRow, targetQuiz)
        }
        // Tæl visning (kun når en søgende ser en udlejers listing)
        if (user.id !== target.user_id) {
          const { error: rpcErr } = await supabase.rpc('increment_listing_views', { p_listing_id: listing.id })
          if (rpcErr) console.error('[view_count] rpc fejl:', rpcErr)
        }
      }
    }
  }

  // Compatibility
  let compat: CompatRow[] | undefined
  if (myQuizDirect && targetQuiz) {
    compat = calcCompat(myQuizDirect as QuizRow, targetQuiz)
  }

  // otherUserId er den person vi kigger på — bruges til at starte chat
  const otherUserId = String(target.user_id)
  // listingId er kun relevant når søgende kigger på en udlejers listing
  const chatListingId = target.role === 'landlord' && listingParam
    ? listingParam
    : undefined

  const profile: ProfileData = {
    id: target.id,
    name: String(target.display_name ?? ''),
    age: target.age ? Number(target.age) : undefined,
    emoji: pick(EMOJIS, target.id),
    avatarUrl: target.avatar_url ? String(target.avatar_url) : undefined,
    location: [target.district, target.city].filter(Boolean).join(', '),
    role: target.role as 'seeker' | 'landlord',
    verified: false,
    bio: target.bio ? String(target.bio) : undefined,
    tags,
    matchScore,
    otherUserId,
    listingId: chatListingId,
    budgetMax,
    smoker: targetQuiz?.smoker ?? undefined,
    petFriendly: targetQuiz?.pet_friendly ?? undefined,
    availableFrom,
    listingPrice,
    listingRooms,
    listingSize,
    listingAvailableFrom,
    listingImageUrls,
    compat,
  }

  return <ProfilClient profile={profile} />
}
