import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import './globals.css'
import { cookies } from 'next/headers'
import DevRoleToggle from '@/components/DevRoleToggle'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Rumies — Find en roomie du rent faktisk kan lide',
  description: 'Rumies matcher dig med kommende roomies baseret på livsstil, søvnvaner og hverdagsrytme.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDev = process.env.NODE_ENV === 'development'
  const cookieStore = isDev ? await cookies() : null
  const devRole = cookieStore?.get('dev_role')?.value as 'seeker' | 'landlord' | undefined

  return (
    <html lang="da" className={`${fraunces.variable} ${manrope.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        {isDev && devRole && <DevRoleToggle currentRole={devRole} />}
      </body>
    </html>
  )
}
