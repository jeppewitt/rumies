import Link from 'next/link'

export default function KontaktPage() {
  return (
    <>
      <style>{`
        body { font-family: 'Manrope', sans-serif; background: #F7F4EF; color: #1A0F0A; margin: 0; }
        .topnav { position: sticky; top: 0; z-index: 100; background: rgba(247,244,239,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #E8E0D8; padding: 0 24px; height: 64px; display: flex; align-items: center; }
        .container { max-width: 600px; margin: 0 auto; padding: 64px 24px 80px; text-align: center; }
        h1 { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 700; color: #1A0F0A; margin-bottom: 16px; }
        p { font-size: 16px; color: #4A3528; line-height: 1.75; margin-bottom: 32px; }
        .card { background: white; border-radius: 20px; border: 1px solid #E8E0D8; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .icon { width: 56px; height: 56px; border-radius: 16px; background: #F5E6DF; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .email-link { font-size: 18px; font-weight: 700; color: #D97757; text-decoration: none; }
        .email-link:hover { text-decoration: underline; }
        .note { font-size: 13px; color: #9C7B6E; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet" />

      <nav className="topnav">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg viewBox="0 0 28 28" fill="none" width="24" height="24">
            <polygon points="14,2 26,24 2,24" fill="#D97757" />
            <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
          </svg>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#1A0F0A' }}>Rumies</span>
        </Link>
      </nav>

      <div className="container">
        <h1>Kontakt os</h1>
        <p>Har du spørgsmål, feedback eller brug for hjælp? Vi svarer inden for 1-2 hverdage.</p>

        <div className="card">
          <div className="icon">✉️</div>
          <a href="mailto:hej@rumies.dk" className="email-link">hej@rumies.dk</a>
          <span className="note">Svar inden for 1–2 hverdage</span>
        </div>
      </div>
    </>
  )
}
