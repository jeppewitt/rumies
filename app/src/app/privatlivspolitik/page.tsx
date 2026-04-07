import Link from 'next/link'

export default function PrivatlivspolitikPage() {
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
        .responsible { background: white; border: 1px solid #E8E0D8; border-radius: 16px; padding: 20px 24px; margin-top: 8px; font-size: 14px; color: #4A3528; line-height: 1.8; }
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
        <h1>Privatlivspolitik</h1>
        <p className="updated">Sidst opdateret: april 2026</p>

        <p>Rumies behandler dine personoplysninger i overensstemmelse med GDPR og den danske databeskyttelseslov. Denne politik beskriver, hvilke oplysninger vi indsamler, hvordan vi bruger dem, og hvilke rettigheder du har.</p>

        <h2>Dataansvarlig</h2>
        <div className="responsible">
          <strong>Rumies</strong><br />
          E-mail: <a href="mailto:hej@rumies.dk">hej@rumies.dk</a>
        </div>

        <h2>Hvilke oplysninger indsamler vi?</h2>
        <p>Når du opretter en profil indsamler vi:</p>
        <ul>
          <li><strong>Obligatorisk:</strong> E-mailadresse og adgangskode (krypteret)</li>
          <li><strong>Profil:</strong> Navn, alder, by og eventuelt profilbillede</li>
          <li><strong>Livsstilsquiz:</strong> Svar om søvnvaner, ryddelighed, rygevaner, kæledyr og sociale præferencer — bruges til matching</li>
          <li><strong>For søgende:</strong> Budget og ønsket disponeringstidspunkt</li>
          <li><strong>For udlejere:</strong> Boligens adresse, pris og billeder</li>
          <li><strong>Kommunikation:</strong> Beskeder sendt via platformens beskedsystem</li>
        </ul>

        <h2>Formål med behandlingen</h2>
        <p>Vi bruger dine oplysninger til at:</p>
        <ul>
          <li>Beregne match-score og vise dig relevante profiler og boliger</li>
          <li>Muliggøre direkte kommunikation mellem søgende og udlejere</li>
          <li>Sende nødvendige service-emails (bekræftelse, adgangskode-reset)</li>
          <li>Forbedre og vedligeholde platformens funktioner</li>
        </ul>
        <p>Vi bruger ikke dine oplysninger til markedsføring fra tredjeparter og sælger dem ikke videre.</p>

        <h2>Opbevaring og sletning</h2>
        <p>Din profil er synlig for andre indloggede brugere så længe den er aktiv. Profiler der ikke har været logget ind i over 6 måneder skjules automatisk, men kan genaktiveres ved login.</p>
        <p>Du kan til enhver tid anmode om sletning af din konto og alle tilknyttede data ved at skrive til <a href="mailto:hej@rumies.dk">hej@rumies.dk</a>. Vi sletter dine oplysninger inden for 30 dage.</p>

        <h2>Databehandlere</h2>
        <p>Vi anvender følgende underleverandører til at drive platformen:</p>
        <ul>
          <li><strong>Supabase</strong> (supabase.com) — databasehosting og autentificering. Data lagres i EU (Frankfurt).</li>
        </ul>
        <p>Alle databehandlere er underlagt databehandleraftaler i overensstemmelse med GDPR.</p>

        <h2>Cookies</h2>
        <p>Vi bruger udelukkende nødvendige cookies til at opretholde din session (login). Læs mere på vores <a href="/cookies">cookieside</a>.</p>

        <h2>Dine rettigheder</h2>
        <p>Som bruger har du ret til at:</p>
        <ul>
          <li><strong>Indsigt:</strong> Se hvilke oplysninger vi har om dig</li>
          <li><strong>Berigtigelse:</strong> Få rettet forkerte oplysninger</li>
          <li><strong>Sletning:</strong> Få dine oplysninger slettet</li>
          <li><strong>Dataportabilitet:</strong> Modtage en kopi af dine data i et læsbart format</li>
          <li><strong>Indsigelse:</strong> Gøre indsigelse mod behandlingen</li>
        </ul>
        <p>Kontakt os på <a href="mailto:hej@rumies.dk">hej@rumies.dk</a> for at udøve dine rettigheder. Du kan også klage til <a href="https://www.datatilsynet.dk" target="_blank" rel="noreferrer">Datatilsynet</a>.</p>
      </div>
    </>
  )
}
