'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function startConversation(otherUserId: string, listingId?: string): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Find eksisterende samtale (begge rækkefølger af deltagere)
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(participant_a_id.eq.${user.id},participant_b_id.eq.${otherUserId}),` +
      `and(participant_a_id.eq.${otherUserId},participant_b_id.eq.${user.id})`
    )
    .limit(1)
    .maybeSingle()

  if (existing) {
    redirect(`/chat?conv=${existing.id}`)
  }

  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      participant_a_id: user.id,
      participant_b_id: otherUserId,
      ...(listingId ? { listing_id: listingId } : {}),
    })
    .select('id')
    .single()

  if (error || !newConv) throw new Error(error?.message ?? 'Kunne ikke oprette samtale')

  redirect(`/chat?conv=${newConv.id}`)
}

// Returnerer true = tilføjet, false = fjernet
export async function toggleFavorite(listingId?: string, profileId?: string): Promise<boolean> {
  if (!listingId && !profileId) return false
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const query = supabase.from('favorites').select('id').eq('user_id', user.id)
  const { data: existing } = await (
    listingId
      ? query.eq('listing_id', listingId).maybeSingle()
      : query.eq('profile_id', profileId!).maybeSingle()
  )

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    revalidatePath('/dashboard')
    return false
  } else {
    await supabase.from('favorites').insert(
      listingId
        ? { user_id: user.id, listing_id: listingId }
        : { user_id: user.id, profile_id: profileId! }
    )
    revalidatePath('/dashboard')
    return true
  }
}
