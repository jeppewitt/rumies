export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_SITE_URL er ikke sat. Tilføj den som environment variable i Vercel.')
    }
    return 'http://localhost:3000'
  }
  return url
}
