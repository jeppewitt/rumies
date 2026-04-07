import Link from 'next/link'

export default function CookiesPage() {
  return (
    <>
      <style>{`
        body { font-family: 'Manrope', sans-serif; background: #F7F4EF; color: #1A0F0A; margin: 0; }
        .topnav { position: sticky; top: 0; z-index: 100; background: rgba(247,244,239,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #E8E0D8; padding: 0 24px; height: 64px; display: flex; align-items: center; }
        .container { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }
        h1 { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 700; color: #1A0F0A; margin-bottom: 8px; }
        .updated { font-size: 13px; color: #9C7B6E; margin-bottom: 40px; }
        h2 { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; color: #1A0F0A; margin: 36px 0 12px; }
        p, li { font-size: 15px; color: #4A3528; line-height: 1.75; }
        p { margin-bottom: 12px; }
        ul { padding-left: 20px; margin: 8px 0 16px; }
        li { margin-bottom: 8px; }
        a { color: #D97757; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        th { text-align: left; padding: 10px 14px; background: white; border: 1px solid #E8E0D8; font-weight: 700; color: #1A0F0A; }
        td { padding: 10px 14px; border: 1px solid #E8E0D8; color: #4A3528; vertical-align: top; }
        tr:nth-child(even) td { background: #FAFAF8; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Manrope:wght@400;600&display=swap" rel="stylesheet" />

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
        <h1>Cookies</h1>
        <p className="updated">Sidst opdateret: april 2026</p>

        <p>Rumies bruger cookies for at platformen kan fungere korrekt. Denne side forklarer hvilke cookies vi sætter, og hvad de bruges til.</p>

        <h2>Hvad er en cookie?</h2>
        <p>En cookie er en lille tekstfil der gemmes i din browser, når du besøger et website. Cookies bruges til at huske information om dit besøg, f.eks. at du er logget ind.</p>

        <h2>Hvilke cookies bruger vi?</h2>
        <p>Vi bruger udelukkende <strong>nødvendige cookies</strong> — altså cookies der er strengt nødvendige for at platformen kan fungere. Vi bruger ingen tracking-, analyse- eller markedsføringscookies.</p>

        <table>
          <thead>
            <tr>
              <th>Navn</th>
              <th>Formål</th>
              <th>Udløb</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>sb-[id]-auth-token</code></td>
              <td>Holder dig logget ind (session-token fra Supabase Auth)</td>
              <td>1 uge</td>
            </tr>
            <tr>
              <td><code>sb-[id]-auth-token-code-verifier</code></td>
              <td>Sikkerhedsverifikation ved login (PKCE-flow)</td>
              <td>Session</td>
            </tr>
          </tbody>
        </table>

        <h2>Tredjeparts cookies</h2>
        <p>Vi bruger <strong>ingen</strong> tredjeparts tracking-cookies fra f.eks. Google Analytics, Facebook eller lignende. Dine besøgsdata deles ikke med annoncenetværk.</p>

        <h2>Sådan sletter du cookies</h2>
        <p>Du kan til enhver tid slette cookies i din browsers indstillinger. Vær opmærksom på at sletning af session-cookies logger dig ud af Rumies.</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Chrome</a></li>
          <li><a href="https://support.mozilla.org/da/kb/slet-cookies-fjern-oplysninger-websites-har-lagret" target="_blank" rel="noreferrer">Firefox</a></li>
          <li><a href="https://support.apple.com/da-dk/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
        </ul>

        <h2>Spørgsmål</h2>
        <p>Kontakt os på <a href="mailto:hej@rumies.dk">hej@rumies.dk</a> hvis du har spørgsmål til vores brug af cookies.</p>
      </div>
    </>
  )
}
