'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setDevRole(role: 'seeker' | 'landlord') {
  const cookieStore = await cookies()
  cookieStore.set('dev_role', role, { path: '/', maxAge: 60 * 60 * 24 })
  revalidatePath('/', 'layout')
}
