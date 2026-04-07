'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Forkert e-mail eller adgangskode.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Bekræft din e-mail inden du logger ind.' }
    }
    return { error: 'Noget gik galt. Prøv igen.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('[signUp fejl]', error.message, error)
    if (error.message.includes('already registered')) {
      return { error: 'Der findes allerede en konto med den e-mail.' }
    }
    if (error.message.includes('Password should be')) {
      return { error: 'Adgangskoden skal være mindst 6 tegn.' }
    }
    return { error: `Fejl: ${error.message}` }
  }

  redirect(`/signup/bekraeft?email=${encodeURIComponent(email)}`)
}

export async function requestPasswordReset(
  _prevState: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/nulstil-adgangskode`,
  })

  if (error) return { error: `Fejl: ${error.message}` }
  return { success: true }
}

export async function updatePassword(
  _prevState: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: `Fejl: ${error.message}` }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
