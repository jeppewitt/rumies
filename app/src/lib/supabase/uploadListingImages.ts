import { createBrowserClient } from '@supabase/ssr'

export async function uploadListingImages(files: File[], userId: string): Promise<string[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const urls: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('listing-images').upload(path, file)
    if (error) throw new Error(`Upload fejlede: ${error.message}`)
    const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}
