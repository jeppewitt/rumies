'use server'

import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/siteUrl'

export async function signUpFromQuiz(email: string, password: string): Promise<{ error: string } | { success: true; needsConfirmation: boolean }> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/onboarding/complete`,
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
