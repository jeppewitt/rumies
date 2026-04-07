import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OpretOpslagClient from './OpretOpslagClient'

export default async function OpretOpslagPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'landlord') redirect('/dashboard')

  const { data: existing } = await supabase
    .from('listings')
    .select('id')
    .eq('landlord_id', user.id)
    .maybeSingle()

  if (existing) redirect('/dashboard')

  return <OpretOpslagClient userId={user.id} />
}
