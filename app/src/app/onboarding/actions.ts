'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type OnboardingData = {
  role: 'seeker' | 'landlord'
  displayName: string
  age: number
  city: string
  district: string
  sleepSchedule: 'early_bird' | 'night_owl' | 'flexible'
  cleanliness: number
  cleaningSplit: 'strict_rotation' | 'when_needed' | 'each_own'
  diet: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'
  sharedCooking: boolean
  socialLevel: number
  guestsFrequency: 'rarely' | 'sometimes' | 'often'
  parties: boolean
  smoker: boolean
  petFriendly: boolean
  noiseTolerance: number
  budgetMax?: number
  availableFrom?: string
  listingTitle?: string
  listingDescription?: string
  listingPrice?: number
  listingRooms?: number
  listingSizeM2?: number
  listingRoomSizeM2?: number
  imageUrls?: string[]
  avatarUrl?: string
}

export async function saveOnboarding(data: OnboardingData): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login') as never

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      display_name: data.displayName,
      age: data.age,
      city: data.city,
      district: data.district,
      role: data.role,
      ...(data.avatarUrl ? { avatar_url: data.avatarUrl } : {}),
    }, { onConflict: 'user_id' })
    .select('id')
    .single()

  if (profileError || !profile) {
    console.error('[onboarding profil]', profileError)
    return { error: `Profil: ${profileError?.message ?? 'ukendt fejl'} (code: ${profileError?.code ?? '?'})` }
  }

  const { error: quizError } = await supabase.from('quiz_answers').upsert({
    profile_id: profile.id,
    sleep_schedule: data.sleepSchedule,
    cleanliness: data.cleanliness,
    cleaning_split: data.cleaningSplit,
    diet: data.diet,
    shared_cooking: data.sharedCooking,
    social_level: data.socialLevel,
    guests_frequency: data.guestsFrequency,
    parties: data.parties,
    smoker: data.smoker,
    pet_friendly: data.petFriendly,
    noise_tolerance: data.noiseTolerance,
  }, { onConflict: 'profile_id' })

  if (quizError) {
    console.error('[onboarding quiz]', quizError)
    return { error: `Quiz: ${quizError.message} (code: ${quizError.code})` }
  }

  if (data.role === 'seeker') {
    await supabase.from('seeker_preferences').upsert({
      profile_id: profile.id,
      budget_min: 0,
      budget_max: data.budgetMax,
      available_from: data.availableFrom ?? null,
      preferred_cities: [data.city],
    }, { onConflict: 'profile_id' })
  } else {
    const { data: existing } = await supabase
      .from('listings')
      .select('id')
      .eq('landlord_id', user.id)
      .single()

    if (!existing) {
      await supabase.from('listings').insert({
        landlord_id: user.id,
        title: data.listingTitle ?? `Bolig i ${data.city}`,
        description: data.listingDescription ?? null,
        price: data.listingPrice ?? 0,
        rooms: data.listingRooms ?? null,
        size_m2: data.listingSizeM2 ?? null,
        room_size_m2: data.listingRoomSizeM2 ?? null,
        city: data.city,
        district: data.district ?? null,
        available_from: data.availableFrom ?? null,
        image_urls: data.imageUrls ?? [],
      })
    } else {
      // Opdater billeder hvis nye er uploadet
      if (data.imageUrls && data.imageUrls.length > 0) {
        await supabase.from('listings')
          .update({ image_urls: data.imageUrls })
          .eq('id', existing.id)
      }
    }
  }

  return { success: true }
}
