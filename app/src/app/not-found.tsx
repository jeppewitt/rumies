import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh', background: '#F7F4EF',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Manrope, sans-serif', padding: '24px', textAlign: 'center',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet" />

      <svg viewBox="0 0 28 28" fill="none" width="40" height="40" style={{ marginBottom: 24 }}>
        <polygon points="14,2 26,24 2,24" fill="#D97757" />
        <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
      </svg>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 72, fontWeight: 700, color: '#D97757', lineHeight: 1, marginBottom: 8 }}>
        404
      </h1>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#1A0F0A', marginBottom: 12 }}>
        Siden findes ikke
      </h2>
      <p style={{ fontSize: 15, color: '#9C7B6E', maxWidth: 340, lineHeight: 1.6, marginBottom: 32 }}>
        Den side du leder efter eksisterer ikke eller er blevet flyttet.
      </p>

      <Link href="/" style={{
        padding: '12px 28px', borderRadius: 14,
        background: '#D97757', color: 'white',
        fontSize: 15, fontWeight: 700, textDecoration: 'none',
      }}>
        Tilbage til forsiden
      </Link>
    </main>
  )
}
