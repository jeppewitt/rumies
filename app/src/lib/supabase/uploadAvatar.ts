import { createBrowserClient } from '@supabase/ssr'

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw new Error(`Avatar-upload fejlede: ${error.message}`)
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
