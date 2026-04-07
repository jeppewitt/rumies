'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-5 rounded-xl bg-primary text-white font-bold text-sm cursor-pointer transition hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed mt-1"
    >
      {pending ? 'Vent...' : children}
    </button>
  )
}
