'use server'

import { createClient } from '@/lib/supabase/server'

export async function signUpFromQuiz(email: string, password: string): Promise<{ error: string } | { success: true; needsConfirmation: boolean }> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/onboarding/complete`,
    },
  })
  if (error) {
    if (error.message.includes('already registered')) return { error: 'Der findes allerede en konto med den e-mail.' }
    if (error.message.includes('Password should be')) return { error: 'Adgangskoden skal være mindst 6 tegn.' }
    return { error: error.message }
  }
  // session er null hvis email-bekræftelse er påkrævet, sat hvis confirmation er slået fra
  return { success: true, needsConfirmation: data.session === null }
}
