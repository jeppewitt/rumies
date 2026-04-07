import Link from 'next/link'

export default function VilkaarPage() {
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
        <h1>Brugerbetingelser</h1>
        <p className="updated">Sidst opdateret: april 2026</p>

        <p>Ved at oprette en profil på Rumies accepterer du nedenstående betingelser. Læs dem grundigt inden du tager platformen i brug.</p>

        <h2>1. Betingelser for oprettelse og brug af profiler</h2>
        <p>For at oprette en profil på Rumies skal du være mindst 16 år gammel. Du er selv ansvarlig for rigtigheden af de oplysninger du angiver, og du må kun oprette én profil per person.</p>
        <p>Det er ikke tilladt at angive kontaktoplysninger såsom telefonnummer, e-mail eller sociale medier direkte i din profilbeskrivelse eller dit brugernavn med henblik på at omgå platformens beskedsystem. Profiler der forsøger dette, vil blive ændret eller slettet uden varsel.</p>

        <h2>2. Forbudt indhold</h2>
        <p>Følgende er ikke tilladt på Rumies:</p>
        <ul>
          <li>Kommerciel udnyttelse af platformen, herunder reklame for produkter eller tjenester</li>
          <li>Stødende, diskriminerende eller hadefuldt indhold</li>
          <li>Eksplicit seksuelt materiale</li>
          <li>Indhold der krænker andres ophavsret eller personlige rettigheder</li>
          <li>Falske oplysninger om dig selv eller den bolig du tilbyder</li>
          <li>Brug af en anden persons e-mail eller telefonnummer</li>
        </ul>
        <p>Brug af falsk identitet eller chikane vil blive anmeldt til politiet med IP-adresse og tidsstempel for profiloprettelse.</p>

        <h2>3. Ansvar for adgangskode</h2>
        <p>Du er selv ansvarlig for at holde din adgangskode hemmelig. Rumies kan ikke holdes ansvarlig for ændringer foretaget af andre, hvis de har fået adgang til dine loginoplysninger.</p>

        <h2>4. Rumies' rolle</h2>
        <p>Rumies er en formidlingsplatform der forbinder søgende og udlejere. Vi er ikke part i lejeaftaler og påtager os intet ansvar for disse. Vi anbefaler altid at anvende skriftlige lejekontrakter og evt. <a href="https://www.boligejer.dk" target="_blank" rel="noreferrer">standardkontrakter fra relevante organisationer</a>.</p>
        <p>Vi forbeholder os ret til at slette profiler der vurderes at indeholde urigtige oplysninger eller på anden måde overtræder disse betingelser — uden forudgående varsel.</p>

        <h2>5. Ændringer i betingelserne</h2>
        <p>Rumies forbeholder sig retten til at opdatere disse betingelser. Væsentlige ændringer meddeles via e-mail. Fortsat brug af platformen efter en opdatering udgør accept af de nye betingelser.</p>

        <h2>6. Kontakt</h2>
        <p>Spørgsmål til betingelserne? Skriv til os på <a href="mailto:hej@rumies.dk">hej@rumies.dk</a>.</p>
      </div>
    </>
  )
}
