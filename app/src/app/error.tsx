'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[app error]', error)
  }, [error])

  return (
    <main style={{
      minHeight: '100vh', background: '#F7F4EF',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Manrope, sans-serif', padding: '24px', textAlign: 'center',
    }}>
      <svg viewBox="0 0 28 28" fill="none" width="40" height="40" style={{ marginBottom: 24 }}>
        <polygon points="14,2 26,24 2,24" fill="#D97757" />
        <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
      </svg>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#1A0F0A', marginBottom: 12 }}>
        Noget gik galt
      </h1>
      <p style={{ fontSize: 15, color: '#9C7B6E', maxWidth: 340, lineHeight: 1.6, marginBottom: 32 }}>
        Der opstod en uventet fejl. Prøv igen — eller kontakt os hvis det fortsætter.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 28px', borderRadius: 14,
            background: '#D97757', color: 'white',
            fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}
        >
          Prøv igen
        </button>
        <a href="/" style={{
          padding: '12px 24px', borderRadius: 14,
          background: 'white', color: '#4A3528',
          border: '1.5px solid #E8E0D8',
          fontSize: 15, fontWeight: 600, textDecoration: 'none',
        }}>
          Forsiden
        </a>
      </div>
    </main>
  )
}
