'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSearchActive(isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ikke logget ind' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function createListing(data: {
  city: string
  district: string
  street: string
  price: number
  sizeM2: number
  roomSizeM2: number | null
  availableFrom: string | null
  imageUrls: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ikke logget ind' }

  const { data: existing } = await supabase
    .from('listings')
    .select('id')
    .eq('landlord_id', user.id)
    .maybeSingle()

  if (existing) return { error: 'Du har allerede et opslag' }

  const title = data.street
    ? `${data.street}, ${data.district || data.city}`
    : `Bolig i ${data.city}`

  const { error } = await supabase.from('listings').insert({
    landlord_id: user.id,
    title,
    city: data.city,
    district: data.district || null,
    price: data.price,
    size_m2: data.sizeM2,
    room_size_m2: data.roomSizeM2,
    available_from: data.availableFrom || null,
    image_urls: data.imageUrls,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateSeekerPrefs(data: {
  city: string
  district: string
  budgetMax: number | null
  availableFrom: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ikke logget ind' }

  const { data: profile } = await supabase
    .from('profiles')
    .update({ city: data.city, district: data.district })
    .eq('user_id', user.id)
    .select('id')
    .single()

  if (!profile) return { error: 'Profil ikke fundet' }

  await supabase.from('seeker_preferences').upsert({
    profile_id: profile.id,
    budget_max: data.budgetMax,
    available_from: data.availableFrom || null,
    preferred_cities: data.city ? [data.city] : [],
  }, { onConflict: 'profile_id' })

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateListing(listingId: string, data: {
  city: string
  district: string
  street: string
  price: number | null
  sizeM2: number | null
  roomSizeM2: number | null
  availableFrom: string | null
  imageUrls?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ikke logget ind' }

  const title = data.street
    ? `${data.street}, ${data.district || data.city}`
    : `Bolig i ${data.city}`

  const { error } = await supabase
    .from('listings')
    .update({
      title,
      city: data.city,
      district: data.district || null,
      price: data.price,
      size_m2: data.sizeM2,
      room_size_m2: data.roomSizeM2,
      available_from: data.availableFrom || null,
      ...(data.imageUrls !== undefined ? { image_urls: data.imageUrls } : {}),
    })
    .eq('id', listingId)
    .eq('landlord_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function toggleListingActive(listingId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ikke logget ind' }

  const { error } = await supabase
    .from('listings')
    .update({ is_active: isActive })
    .eq('id', listingId)
    .eq('landlord_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { ok: true }
}
