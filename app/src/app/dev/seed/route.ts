import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Kun tilgængelig i development' }, { status: 403 })
  }

  const admin = createAdminClient()
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const log: string[] = []

  try {

    // ── 1. Auth-brugere via signUp (kræver ikke service_role) ─
    async function getOrCreateAuthId(email: string, password: string): Promise<string> {
      // Forsøg signup
      const { data: signUpData, error: signUpErr } = await anon.auth.signUp({ email, password })
      if (!signUpErr && signUpData.user) {
        await anon.auth.signOut()
        log.push(`✓ Oprettet: ${email}`)
        return signUpData.user.id
      }
      // Bruger eksisterer allerede — log ind for at få ID
      const { data: loginData, error: loginErr } = await anon.auth.signInWithPassword({ email, password })
      if (!loginErr && loginData.user) {
        await anon.auth.signOut()
        log.push(`✓ Eksisterende bruger: ${email}`)
        return loginData.user.id
      }
      // Forkert password — prøv at nulstille (kun muligt med admin)
      if (loginErr) throw new Error(`Login fejlede for ${email}: ${loginErr.message}. Slet brugeren manuelt i Supabase dashboard og prøv igen.`)
      throw new Error(`Ukendt fejl for ${email}`)
    }

    const seekerAuthId   = await getOrCreateAuthId('sogende@test.dk', 'test1234')
    const landlordAuthId = await getOrCreateAuthId('udlejer@test.dk', 'test1234')
    log.push(`  seeker id:   ${seekerAuthId}`)
    log.push(`  landlord id: ${landlordAuthId}`)

    // Placeholder-billeder (ingen upload nødvendig)
    const AVATAR_EMMA   = 'https://picsum.photos/seed/emma/200/200'
    const AVATAR_MIKKEL = 'https://picsum.photos/seed/mikkel/200/200'
    const LISTING_IMGS  = [
      'https://picsum.photos/seed/apt1/800/600',
      'https://picsum.photos/seed/apt2/800/600',
      'https://picsum.photos/seed/apt3/800/600',
    ]

    // ── 1b. Custom users-tabel ────────────────────────────────
    const { error: usersErr } = await admin.from('users').upsert([
      { id: seekerAuthId,   email: 'sogende@test.dk', email_verified: true },
      { id: landlordAuthId, email: 'udlejer@test.dk', email_verified: true },
    ], { onConflict: 'id' })
    if (usersErr) throw new Error(`users upsert: ${usersErr.message}`)
    log.push('✓ users-tabel OK')

    // ── 2. Profiler ───────────────────────────────────────────
    const { data: sp, error: spErr } = await admin
      .from('profiles')
      .upsert({ user_id: seekerAuthId, display_name: 'Emma', age: 24, bio: 'Studerer til lærer og søger et roligt hjem i Aarhus.', role: 'seeker', city: 'Aarhus', district: 'Aarhus C', is_active: true, avatar_url: AVATAR_EMMA }, { onConflict: 'user_id' })
      .select('id').single()
    if (spErr) throw new Error(`profiles (seeker): ${spErr.message}`)
    log.push(`✓ Profil Emma (${sp.id})`)

    const { data: lp, error: lpErr } = await admin
      .from('profiles')
      .upsert({ user_id: landlordAuthId, display_name: 'Mikkel', age: 31, bio: 'Freelance designer der lejer et dejligt 2-værelses ud på Trøjborg.', role: 'landlord', city: 'Aarhus', district: 'Trøjborg', is_active: true, avatar_url: AVATAR_MIKKEL }, { onConflict: 'user_id' })
      .select('id').single()
    if (lpErr) throw new Error(`profiles (landlord): ${lpErr.message}`)
    log.push(`✓ Profil Mikkel (${lp.id})`)

    // ── 3. Quiz ───────────────────────────────────────────────
    const { error: qsErr } = await admin.from('quiz_answers').upsert(
      { profile_id: sp.id, sleep_schedule: 'early_bird', cleanliness: 4, social_level: 3, parties: false, smoker: false, pet_friendly: true },
      { onConflict: 'profile_id' }
    )
    if (qsErr) throw new Error(`quiz_answers (seeker): ${qsErr.message}`)
    log.push('✓ Quiz Emma')

    const { error: qlErr } = await admin.from('quiz_answers').upsert(
      { profile_id: lp.id, sleep_schedule: 'early_bird', cleanliness: 4, social_level: 3, parties: false, smoker: false, pet_friendly: false },
      { onConflict: 'profile_id' }
    )
    if (qlErr) throw new Error(`quiz_answers (landlord): ${qlErr.message}`)
    log.push('✓ Quiz Mikkel')

    // ── 4. Søgepræferencer ────────────────────────────────────
    const { error: prefErr } = await admin.from('seeker_preferences').upsert(
      { profile_id: sp.id, budget_min: 4000, budget_max: 7500, preferred_cities: ['Aarhus'], available_from: '2025-08-01' },
      { onConflict: 'profile_id' }
    )
    if (prefErr) throw new Error(`seeker_preferences: ${prefErr.message}`)
    log.push('✓ Præferencer Emma')

    // ── 5. Listing ────────────────────────────────────────────
    const { data: listing, error: listingErr } = await admin
      .from('listings')
      .upsert({ landlord_id: landlordAuthId, title: 'Lys 2-værelses på Trøjborg', price: 6500, rooms: 2, size_m2: 68, available_from: '2025-08-01', city: 'Aarhus', district: 'Trøjborg', is_active: true, image_urls: LISTING_IMGS }, { onConflict: 'landlord_id' })
      .select('id').single()
    if (listingErr) throw new Error(`listings: ${listingErr.message}`)
    log.push(`✓ Listing (${listing.id})`)

    // ── 6. Samtale ────────────────────────────────────────────
    const { data: conv, error: convErr } = await admin
      .from('conversations')
      .upsert({ participant_a_id: seekerAuthId, participant_b_id: landlordAuthId, listing_id: listing.id }, { onConflict: 'participant_a_id,participant_b_id,listing_id' })
      .select('id').single()
    if (convErr) throw new Error(`conversations: ${convErr.message}`)
    log.push(`✓ Samtale (${conv.id})`)

    // ── 7. Beskeder (kun hvis tomme) ──────────────────────────
    const { count } = await admin.from('messages').select('*', { count: 'exact', head: true }).eq('conversation_id', conv.id)
    if (!count || count === 0) {
      const { error: msgErr } = await admin.from('messages').insert([
        { conversation_id: conv.id, sender_id: seekerAuthId,   content: 'Hej Mikkel! Jeg er meget interesseret i din lejlighed på Trøjborg. Hvornår kan man tidligst flytte ind?' },
        { conversation_id: conv.id, sender_id: landlordAuthId, content: 'Hej Emma! Den er ledig fra 1. august. Vil du gerne se den? 😊' },
        { conversation_id: conv.id, sender_id: seekerAuthId,   content: 'Ja tak! Er du ledig i næste uge?' },
        { conversation_id: conv.id, sender_id: landlordAuthId, content: 'Tirsdag eller torsdag passer mig godt — hvad er bedst for dig?' },
      ])
      if (msgErr) throw new Error(`messages: ${msgErr.message}`)
      log.push('✓ 4 beskeder oprettet')
    } else {
      log.push(`✓ Samtale har allerede ${count} beskeder`)
    }

    log.push('✓ Seed færdig! Log ind med sogende@test.dk / test1234')
    return NextResponse.json({ ok: true, log })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    log.push(`✗ FEJL: ${msg}`)
    return NextResponse.json({ ok: false, log }, { status: 500 })
  }
}
