import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CSS = `
  :root {
    --bg: #F7F4EF; --card: #FFFFFF;
    --primary: #D97757; --primary-hover: #C4633F;
    --primary-soft: #F5E6DF;
    --accent: #7B9E87; --accent-soft: #E3EEE7;
    --ink: #1A0F0A; --ink2: #4A3528; --ink3: #9C7B6E;
    --border: #E8E0D8;
    --gold: #C9A84C; --gold-soft: #F5EDD0;
    --shadow-sm: 0 1px 4px rgba(26,15,10,0.06);
    --shadow-md: 0 4px 20px rgba(26,15,10,0.08);
    --shadow-lg: 0 12px 48px rgba(26,15,10,0.11);
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Manrope',sans-serif; background:var(--bg); color:var(--ink); }

  /* NAV */
  .topnav {
    position:sticky; top:0; z-index:100;
    background:rgba(247,244,239,0.95);
    backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);
    padding:0 16px; height:64px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; }
  .nav-logo svg { width:28px; height:28px; }
  .nav-logo-text { font-family:'Fraunces',serif; font-size:20px; font-weight:700; color:var(--ink); letter-spacing:-0.3px; }
  .nav-right { display:flex; align-items:center; gap:10px; }
  .nav-login {
    padding:8px 18px; border-radius:999px;
    font-size:14px; font-weight:600; color:var(--ink2);
    border:1.5px solid var(--border); background:var(--card);
    text-decoration:none; transition:all 0.2s;
  }
  .nav-login:hover { border-color:var(--ink2); }
  .nav-cta {
    padding:9px 20px; border-radius:999px;
    font-size:14px; font-weight:700; color:white;
    background:var(--primary); border:none;
    text-decoration:none; transition:all 0.2s;
  }
  .nav-cta:hover { background:var(--primary-hover); }

  /* HERO */
  .hero {
    max-width:1100px; margin:0 auto;
    padding:72px 16px 40px;
    display:grid; grid-template-columns:1fr;
    gap:28px; align-items:center;
  }
  .hero-title {
    font-family:'Fraunces',serif;
    font-size:clamp(36px,5vw,54px);
    font-weight:700; line-height:1.1;
    color:var(--ink); margin-bottom:20px; letter-spacing:-0.5px;
  }
  .hero-title em { font-style:italic; color:var(--primary); }
  .hero-sub { font-size:17px; color:var(--ink3); line-height:1.7; margin-bottom:32px; max-width:440px; }
  .hero-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .btn-hero-primary {
    padding:15px 28px; border-radius:14px;
    background:var(--primary); color:white; border:none;
    font-size:16px; font-weight:700;
    display:flex; align-items:center; gap:8px; text-decoration:none;
    transition:all 0.2s;
  }
  .btn-hero-primary:hover { background:var(--primary-hover); transform:translateY(-1px); box-shadow:0 6px 20px rgba(217,119,87,0.3); }
  .btn-hero-primary .material-symbols-rounded { font-size:20px; }
  .btn-hero-secondary {
    padding:15px 24px; border-radius:14px;
    background:var(--card); color:var(--ink2);
    border:1.5px solid var(--border);
    font-size:15px; font-weight:600;
    display:flex; align-items:center; gap:8px; text-decoration:none;
    transition:all 0.2s;
  }
  .btn-hero-secondary:hover { border-color:var(--ink2); color:var(--ink); }
  .hero-trust { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--ink3); margin-top:16px; }
  .hero-trust .material-symbols-rounded { font-size:15px; color:var(--accent); }

  /* HERO CARDS */
  .hero-card-stack { position:relative; height:268px; }
  .hero-card {
    position:absolute; background:var(--card);
    border-radius:20px; border:1.5px solid var(--border);
    box-shadow:var(--shadow-lg); overflow:hidden;
  }
  .hero-card.main { width:210px; left:50%; top:16px; transform:translateX(-50%); animation:floatMain 4s ease-in-out infinite; }
  .hero-card.left  { width:158px; left:0;  top:60px; transform:rotate(-6deg); animation:floatLeft 4s 0.8s ease-in-out infinite; opacity:0.85; }
  .hero-card.right { width:158px; right:0; top:76px; transform:rotate(5deg);  animation:floatRight 4s 1.6s ease-in-out infinite; opacity:0.85; }
  @keyframes floatMain  { 0%,100%{transform:translateX(-50%) translateY(0)}   50%{transform:translateX(-50%) translateY(-8px)} }
  @keyframes floatLeft  { 0%,100%{transform:rotate(-6deg) translateY(0)}       50%{transform:rotate(-6deg) translateY(-6px)} }
  @keyframes floatRight { 0%,100%{transform:rotate(5deg) translateY(0)}        50%{transform:rotate(5deg) translateY(-6px)} }
  .hc-img { height:90px; display:flex; align-items:center; justify-content:center; font-size:36px; position:relative; }
  .hc-img.c1 { background:linear-gradient(135deg,#C8DDD0,#E3EEE7); }
  .hc-img.c2 { background:linear-gradient(135deg,#BED4E8,#D5C8E8); }
  .hc-img.c3 { background:linear-gradient(135deg,#F5C6BC,#F5DEC0); }
  .hc-score {
    position:absolute; bottom:10px; left:10px;
    background:white; border-radius:8px; padding:4px 10px;
    font-size:12px; font-weight:800; color:var(--accent);
    box-shadow:0 2px 8px rgba(0,0,0,0.1);
  }
  .hc-body { padding:12px 14px; }
  .hc-name { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:var(--ink); margin-bottom:2px; }
  .hc-meta { font-size:11px; color:var(--ink3); margin-bottom:8px; }
  .hc-tags { display:flex; gap:4px; flex-wrap:wrap; }
  .hc-tag { font-size:10px; font-weight:600; padding:3px 8px; border-radius:999px; background:var(--bg); color:var(--ink2); border:1px solid var(--border); }

  /* TRUST BAR */
  .trust-bar { border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:20px 32px; background:var(--card); }
  .trust-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:center; gap:16px; flex-wrap:wrap; }
  .trust-item { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--ink2); }
  .trust-item .material-symbols-rounded { font-size:18px; color:var(--primary); }

  /* SECTIONS */
  .section { max-width:1100px; margin:0 auto; padding:48px 16px; }
  .section-label { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--primary); margin-bottom:12px; text-align:center; }
  .section-title { font-family:'Fraunces',serif; font-size:clamp(28px,4vw,40px); font-weight:700; color:var(--ink); text-align:center; line-height:1.15; margin-bottom:16px; }
  .section-title em { font-style:italic; color:var(--primary); }
  .section-sub { font-size:16px; color:var(--ink3); text-align:center; max-width:540px; margin:0 auto 56px; line-height:1.65; }

  /* HOW IT WORKS */
  .steps-grid { display:grid; grid-template-columns:1fr; gap:28px; }
  .step { text-align:center; padding:0 20px; }
  .step-num {
    width:56px; height:56px; border-radius:50%;
    background:var(--primary); color:white;
    font-family:'Fraunces',serif; font-size:22px; font-weight:700;
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 20px; box-shadow:0 4px 16px rgba(217,119,87,0.3);
  }
  .step-title { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:var(--ink); margin-bottom:8px; }
  .step-desc  { font-size:14px; color:var(--ink3); line-height:1.6; }

  /* FEATURES */
  .features-grid { display:grid; grid-template-columns:1fr; gap:16px; }
  .feature-card {
    background:var(--card); border-radius:20px;
    border:1px solid var(--border); padding:28px;
    box-shadow:var(--shadow-sm); transition:all 0.2s;
  }
  .feature-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
  .feature-icon { width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
  .feature-icon .material-symbols-rounded { font-size:26px; }
  .feature-icon.orange { background:var(--primary-soft); }
  .feature-icon.orange .material-symbols-rounded { color:var(--primary); }
  .feature-icon.green  { background:var(--accent-soft); }
  .feature-icon.green  .material-symbols-rounded { color:var(--accent); }
  .feature-icon.gold   { background:var(--gold-soft); }
  .feature-icon.gold   .material-symbols-rounded { color:var(--gold); }
  .feature-title { font-family:'Fraunces',serif; font-size:18px; font-weight:700; color:var(--ink); margin-bottom:8px; }
  .feature-desc  { font-size:14px; color:var(--ink3); line-height:1.65; }

  /* CTA */
  .cta-section { background:var(--ink); padding:80px 32px; text-align:center; }
  .cta-inner { max-width:600px; margin:0 auto; }
  .cta-title { font-family:'Fraunces',serif; font-size:clamp(28px,4vw,42px); font-weight:700; color:white; line-height:1.15; margin-bottom:16px; }
  .cta-title em { font-style:italic; color:var(--primary); }
  .cta-sub { font-size:16px; color:rgba(255,255,255,0.6); margin-bottom:32px; line-height:1.6; }
  .cta-btn {
    display:inline-flex; align-items:center; gap:8px;
    padding:16px 32px; border-radius:14px;
    background:var(--primary); color:white; border:none;
    font-size:16px; font-weight:700;
    text-decoration:none; transition:all 0.2s;
  }
  .cta-btn:hover { background:var(--primary-hover); transform:translateY(-1px); box-shadow:0 6px 24px rgba(217,119,87,0.4); }
  .cta-btn .material-symbols-rounded { font-size:20px; }
  .cta-note { font-size:13px; color:rgba(255,255,255,0.4); margin-top:14px; }

  /* FOOTER */
  footer { background:var(--card); border-top:1px solid var(--border); padding:28px 32px; }
  .footer-inner { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; align-items:flex-start; gap:16px; }
  .footer-logo { display:flex; align-items:center; gap:8px; text-decoration:none; }
  .footer-logo-text { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:var(--ink); }
  .footer-copy { font-size:13px; color:var(--ink3); }
  .footer-links { display:flex; gap:20px; }
  .footer-links a { font-size:13px; color:var(--ink3); text-decoration:none; transition:color 0.2s; }
  .footer-links a:hover { color:var(--primary); }

  @media (min-width: 768px) {
    .topnav { padding:0 32px; }
    .hero { grid-template-columns:1fr 1fr; padding:80px 32px; gap:60px; }
    .hero-card-stack { height:420px; }
    .hero-card.main { width:260px; top:20px; }
    .hero-card.left { width:200px; top:80px; }
    .hero-card.right { width:200px; top:100px; }
    .hc-img { height:120px; font-size:44px; }
    .section { padding:80px 32px; }
    .features-grid { grid-template-columns:repeat(3,1fr); gap:20px; }
    .steps-grid { grid-template-columns:repeat(3,1fr); gap:0; }
    .trust-inner { gap:40px; }
    .footer-inner { flex-direction:row; align-items:center; justify-content:space-between; }
  }
`

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams
  if (!preview) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" rel="stylesheet" />

      {/* NAV */}
      <nav className="topnav">
        <Link className="nav-logo" href="/">
          <svg viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="#D97757" />
            <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
          </svg>
          <span className="nav-logo-text">Rumies</span>
        </Link>
        <div className="nav-right">
          <Link className="nav-login" href="/login">Log ind</Link>
          <Link className="nav-cta" href="/signup">Kom i gang</Link>
        </div>
      </nav>

      {/* HERO */}
      <section>
        <div className="hero">
          <div className="hero-left">
            <h1 className="hero-title">Find en roomie du <em>rent faktisk</em> kan lide at bo med</h1>
            <p className="hero-sub">Rumies matcher dig med kommende roomies baseret på livsstil, søvnvaner og hverdagsrytme — ikke bare et tilfældigt Facebook-opslag.</p>
            <div className="hero-actions">
              <Link className="btn-hero-primary" href="/quiz">
                <span className="material-symbols-rounded">arrow_forward</span>
                Opret gratis profil
              </Link>
              <Link className="btn-hero-secondary" href="/login">
                <span className="material-symbols-rounded">play_circle</span>
                Se hvordan det virker
              </Link>
            </div>
            <div className="hero-trust">
              <span className="material-symbols-rounded">lock</span>
              Gratis at starte · Ingen skjulte abonnementer
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-card left">
                <div className="hc-img c2">👨‍💻
                  <div className="hc-score">87% match</div>
                </div>
                <div className="hc-body">
                  <div className="hc-name">Mikkel, 25</div>
                  <div className="hc-meta">Vesterbro · 7.500 kr/md</div>
                  <div className="hc-tags">
                    <span className="hc-tag">Ikke-ryger</span>
                    <span className="hc-tag">Ryddelig</span>
                  </div>
                </div>
              </div>

              <div className="hero-card main">
                <div className="hc-img c1">👩‍🎓
                  <div className="hc-score">92% match</div>
                </div>
                <div className="hc-body">
                  <div className="hc-name">Sofie, 24</div>
                  <div className="hc-meta">Nørrebro · 6.500 kr/md</div>
                  <div className="hc-tags">
                    <span className="hc-tag">Morgenmenneske</span>
                    <span className="hc-tag">Vegetar</span>
                    <span className="hc-tag">Ikke-ryger</span>
                  </div>
                </div>
              </div>

              <div className="hero-card right">
                <div className="hc-img c3">🎨
                  <div className="hc-score">84% match</div>
                </div>
                <div className="hc-body">
                  <div className="hc-name">Emma, 23</div>
                  <div className="hc-meta">Trøjborg, Aarhus · 4.800 kr/md</div>
                  <div className="hc-tags">
                    <span className="hc-tag">Dyrevenlig</span>
                    <span className="hc-tag">Vegetar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item"><span className="material-symbols-rounded">verified</span>Bekræftede profiler</div>
          <div className="trust-item"><span className="material-symbols-rounded">favorite</span>Matching på livsstil</div>
          <div className="trust-item"><span className="material-symbols-rounded">chat_bubble</span>Beskeder inden for platformen</div>
          <div className="trust-item"><span className="material-symbols-rounded">lock</span>Ingen skjulte abonnementer</div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ background: 'var(--card)', maxWidth: '100%', padding: '80px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
          <div className="section-label">Sådan virker det</div>
          <h2 className="section-title" style={{ marginBottom: '56px' }}>Tre trin til dit <em>næste hjem</em></h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-title">Opret profil</div>
              <div className="step-desc">Vælg din rolle, udfyld livsstilsquizzen og angiv dit budget eller din lejlighed. Tager under 5 minutter.</div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-title">Se dine matches</div>
              <div className="step-desc">Algoritmen beregner et match-score baseret på livsstil, by og budget. Se de bedste matches med det samme.</div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-title">Tag kontakt</div>
              <div className="step-desc">Send en besked direkte på platformen — ingen private numre nødvendige. Arranger en fremvisning og find din næste roomie.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-label">Hvad gør Rumies anderledes</div>
        <h2 className="section-title">Bygget på <em>tillid</em></h2>
        <p className="section-sub">Tre kernefunktioner der løser de problemer eksisterende platforme aldrig har taget seriøst.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon orange"><span className="material-symbols-rounded">verified</span></div>
            <div className="feature-title">Bekræftede profiler</div>
            <div className="feature-desc">Alle brugere bekræfter deres e-mail ved oprettelse, og nye profiler gennemgås. Ingen falske profiler — kun rigtige mennesker der leder efter et hjem.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon green"><span className="material-symbols-rounded">favorite</span></div>
            <div className="feature-title">Livsstilsmatching</div>
            <div className="feature-desc">En 12-spørgsmåls quiz kortlægger dine vaner på tværs af søvn, ryddelighed, mad og sociale præferencer. Algoritmen finder dit bedste match.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon gold"><span className="material-symbols-rounded">chat_bubble</span></div>
            <div className="feature-title">Sikkert beskedsystem</div>
            <div className="feature-desc">Kommuniker direkte på platformen — ingen behov for at udveksle private numre med fremmede, før du er tryg ved personen.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Klar til at finde din næste <em>roomie?</em></h2>
          <p className="cta-sub">Opret din gratis profil på under 5 minutter og se hvem der matcher din livsstil i dag.</p>
          <Link className="cta-btn" href="/quiz">
            <span className="material-symbols-rounded">arrow_forward</span>
            Kom i gang — det er gratis
          </Link>
          <div className="cta-note">Ingen kreditkort krævet · Ingen skjulte abonnementer</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <Link className="footer-logo" href="/">
            <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
              <polygon points="14,2 26,24 2,24" fill="#D97757" />
              <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
            </svg>
            <span className="footer-logo-text">Rumies</span>
          </Link>
          <span className="footer-copy">© 2026 Rumies.dk — Bygget i Danmark 🇩🇰</span>
          <div className="footer-links">
            <a href="/privatlivspolitik">Privatlivspolitik</a>
            <a href="/vilkaar">Vilkår</a>
            <a href="/cookies">Cookies</a>
            <a href="/kontakt">Kontakt</a>
          </div>
        </div>
      </footer>
    </>
  )
}
