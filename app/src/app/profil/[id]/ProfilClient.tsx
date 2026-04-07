'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { startConversation } from '../../matches/actions'
import { signOut } from '@/app/actions/auth'

export type LifestyleTag = { label: string; icon: string }

function ShareButton() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="btn-share"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      <span className="material-symbols-rounded">{copied ? 'check' : 'share'}</span>
      {copied ? 'Kopieret!' : 'Del profil'}
    </button>
  )
}

export type CompatRow = { label: string; pct: number }

export type ProfileData = {
  id: string
  name: string
  age?: number
  emoji: string
  avatarUrl?: string
  location: string
  role: 'seeker' | 'landlord'
  verified: boolean
  bio?: string
  tags: LifestyleTag[]
  matchScore?: number
  otherUserId?: string   // auth user_id — til chat
  listingId?: string     // listing_id — til chat (seeker → udlejer)
  // Seeker stats
  budgetMax?: number
  smoker?: boolean
  petFriendly?: boolean
  availableFrom?: string
  // Landlord stats (listing)
  listingPrice?: number
  listingRooms?: number
  listingSize?: number
  listingAvailableFrom?: string
  listingImageUrls?: string[]
  compat?: CompatRow[]
}

const CSS = `
  :root {
    --bg:#F7F4EF; --card:#FFFFFF;
    --primary:#D97757; --primary-hover:#C4633F; --primary-soft:#F5E6DF;
    --accent:#7B9E87; --accent-soft:#E3EEE7;
    --ink:#1A0F0A; --ink2:#4A3528; --ink3:#9C7B6E;
    --border:#E8E0D8;
    --gold:#C9A84C; --gold-soft:#F5EDD0;
    --shadow-sm:0 1px 4px rgba(26,15,10,0.06);
    --shadow-md:0 4px 20px rgba(26,15,10,0.08);
  }
  .pr-root { font-family:var(--font-manrope),'Manrope',sans-serif; background:var(--bg); color:var(--ink); min-height:100vh; padding-bottom:calc(60px + env(safe-area-inset-bottom,0px)); }
  .pr-nav { z-index:100; background:rgba(247,244,239,0.9); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:0 16px; height:64px; display:flex; align-items:center; justify-content:space-between; }
  .nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; }
  .nav-logo svg { width:28px; height:28px; }
  .nav-logo-text { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:700; color:var(--ink); letter-spacing:-0.3px; }
  .nav-links { display:none; align-items:center; gap:4px; }
  .nav-link { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; font-size:14px; font-weight:500; color:var(--ink2); cursor:pointer; border:none; background:none; font-family:var(--font-manrope),'Manrope',sans-serif; transition:all 0.2s; text-decoration:none; }
  .nav-link:hover { background:var(--border); color:var(--ink); }
  .nav-link.active { background:var(--primary); color:white; }
  .nav-link .material-symbols-rounded { font-size:18px; }
  .nav-avatar { width:36px; height:36px; border-radius:50%; background:var(--accent-soft); border:2px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .nav-right { display:flex; align-items:center; gap:8px; }
  .logout-btn { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; border:1.5px solid var(--border); background:none; cursor:pointer; color:var(--ink3); transition:all 0.2s; }
  .logout-btn:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-soft); }
  .logout-btn .material-symbols-rounded { font-size:18px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .pr-page { max-width:1080px; margin:0 auto; padding:20px 16px 80px; display:grid; grid-template-columns:1fr; gap:20px; align-items:start; }
  .back-link { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:600; color:var(--ink3); text-decoration:none; margin-bottom:24px; transition:color 0.2s; background:none; border:none; cursor:pointer; font-family:var(--font-manrope),'Manrope',sans-serif; padding:0; }
  .back-link:hover { color:var(--ink); }
  .back-link .material-symbols-rounded { font-size:18px; }
  .sidebar { display:flex; flex-direction:column; gap:16px; }
  .profile-card { background:var(--card); border-radius:20px; border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow-md); animation:fadeUp 0.5s ease both; }
  .profile-hero { height:140px; background:linear-gradient(135deg,#E8C9BC 0%,#C8DDD0 100%); position:relative; overflow:hidden; }
  .profile-hero-pattern { position:absolute; inset:0; background-image:radial-gradient(circle at 20% 50%,rgba(217,119,87,0.15) 0%,transparent 60%),radial-gradient(circle at 80% 20%,rgba(123,158,135,0.15) 0%,transparent 50%); }
  .profile-avatar-wrap { position:absolute; bottom:-36px; left:50%; transform:translateX(-50%); }
  .profile-avatar { width:80px; height:80px; border-radius:50%; border:4px solid var(--card); background:var(--bg); display:flex; align-items:center; justify-content:center; font-size:36px; box-shadow:var(--shadow-md); overflow:hidden; }
  .profile-body { padding:48px 20px 24px; text-align:center; }
  .profile-name { font-family:var(--font-fraunces),'Fraunces',serif; font-size:22px; font-weight:700; color:var(--ink); margin-bottom:4px; }
  .profile-location { font-size:13px; color:var(--ink3); display:flex; align-items:center; justify-content:center; gap:4px; margin-bottom:14px; }
  .profile-location .material-symbols-rounded { font-size:15px; }
  .badges-row { display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .role-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:999px; font-size:12px; font-weight:700; }
  .role-badge.udlejer { background:var(--primary-soft); color:var(--primary); }
  .role-badge.søgende { background:var(--accent-soft); color:var(--accent); }
  .role-badge .material-symbols-rounded { font-size:14px; }
  .verified-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:999px; background:var(--accent-soft); color:var(--accent); font-size:12px; font-weight:700; }
  .verified-badge .material-symbols-rounded { font-size:14px; }
  .match-score-wrap { background:var(--bg); border-radius:14px; padding:16px; margin-bottom:16px; border:1px solid var(--border); display:flex; align-items:center; gap:14px; }
  .match-ring { width:52px; height:52px; position:relative; flex-shrink:0; }
  .match-ring svg { transform:rotate(-90deg); width:52px; height:52px; }
  .ring-bg   { fill:none; stroke:var(--border); stroke-width:4; }
  .ring-fill { fill:none; stroke-width:4; stroke-linecap:round; stroke:var(--accent); transition:stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1); }
  .ring-num { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:13px; font-weight:800; color:var(--ink); }
  .match-label { font-size:16px; font-weight:800; color:var(--ink); }
  .match-label-sub { font-size:12px; color:var(--ink3); margin-top:2px; }
  .match-stars { display:flex; gap:2px; margin-top:5px; }
  .match-stars .material-symbols-rounded { font-size:14px; color:var(--gold); }
  .btn-primary { width:100%; padding:13px 16px; background:var(--primary); color:white; border:none; border-radius:12px; font-size:14px; font-weight:700; font-family:var(--font-manrope),'Manrope',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:7px; margin-bottom:10px; }
  .btn-primary:hover { background:var(--primary-hover); transform:translateY(-1px); box-shadow:0 4px 16px rgba(217,119,87,0.3); }
  .btn-primary .material-symbols-rounded { font-size:17px; }
  .btn-secondary { width:100%; padding:12px 16px; background:var(--card); color:var(--ink2); border:1.5px solid var(--border); border-radius:12px; font-size:14px; font-weight:600; font-family:var(--font-manrope),'Manrope',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:7px; text-decoration:none; }
  .btn-secondary:hover { border-color:var(--ink2); color:var(--ink); }
  .btn-secondary .material-symbols-rounded { font-size:17px; }
  .btn-share { width:100%; padding:12px 16px; background:var(--accent-soft); color:var(--accent); border:1.5px solid transparent; border-radius:12px; font-size:14px; font-weight:600; font-family:var(--font-manrope),'Manrope',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:7px; }
  .btn-share:hover { border-color:var(--accent); }
  .btn-share .material-symbols-rounded { font-size:17px; }
  .quick-stats { background:var(--card); border-radius:16px; border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow-sm); animation:fadeUp 0.5s 0.1s ease both; }
  .stat-row { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; border-bottom:1px solid var(--border); }
  .stat-row:last-child { border-bottom:none; }
  .stat-left { display:flex; align-items:center; gap:10px; }
  .stat-icon { width:32px; height:32px; border-radius:8px; background:var(--bg); display:flex; align-items:center; justify-content:center; }
  .stat-icon .material-symbols-rounded { font-size:17px; color:var(--primary); }
  .stat-label { font-size:13px; color:var(--ink3); }
  .stat-val { font-size:13px; font-weight:700; color:var(--ink); }
  .main-col { display:flex; flex-direction:column; gap:20px; }
  .section { background:var(--card); border-radius:20px; border:1px solid var(--border); padding:20px; box-shadow:var(--shadow-sm); animation:fadeUp 0.5s ease both; }
  .section-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:700; color:var(--ink); margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .section-title .material-symbols-rounded { font-size:20px; color:var(--primary); }
  .bio-text { font-size:15px; color:var(--ink2); line-height:1.75; white-space:pre-line; }
  .tags-grid { display:flex; flex-wrap:wrap; gap:8px; }
  .tag { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:600; background:var(--bg); color:var(--ink2); border:1.5px solid var(--border); transition:all 0.2s; }
  .tag:hover { border-color:var(--primary); color:var(--primary); }
  .tag .material-symbols-rounded { font-size:15px; color:var(--primary); }
  .gallery { display:grid; grid-template-columns:1fr; gap:10px; }
  .gallery-main { grid-column:1/-1; height:180px; border-radius:14px; overflow:hidden; background:linear-gradient(135deg,#E8C9BC,#F5DEC0); display:flex; align-items:center; justify-content:center; font-size:48px; border:1px solid var(--border); }
  .compat-grid { display:flex; flex-direction:column; gap:12px; }
  .compat-row { display:flex; align-items:center; gap:14px; }
  .compat-label { font-size:13px; font-weight:600; color:var(--ink2); width:110px; flex-shrink:0; }
  .compat-bar-wrap { flex:1; height:8px; background:var(--border); border-radius:999px; overflow:hidden; }
  .compat-bar { height:100%; border-radius:999px; background:var(--accent); transition:width 1.2s cubic-bezier(0.22,1,0.36,1); }
  .compat-bar.medium { background:var(--primary); }
  .compat-bar.low    { background:var(--gold); }
  .compat-pct { font-size:12px; font-weight:700; color:var(--ink3); width:36px; text-align:right; }
  .no-bio { font-size:14px; color:var(--ink3); font-style:italic; }
  .bottomnav { display:flex; position:fixed; bottom:0; left:0; right:0; height:60px; background:var(--card); border-top:1px solid var(--border); z-index:200; box-shadow:0 -2px 16px rgba(26,15,10,0.07); padding-bottom:env(safe-area-inset-bottom,0px); }
  .bn-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; text-decoration:none; color:var(--ink3); font-size:10px; font-weight:600; font-family:var(--font-manrope),'Manrope',sans-serif; transition:color 0.2s; }
  .bn-item .material-symbols-rounded { font-size:22px; }
  .bn-item.active { color:var(--primary); }
  @media (min-width:768px) {
    .pr-nav { position:sticky; top:0; padding:0 32px; }
    .nav-links { display:flex; }
    .pr-root { padding-bottom:0; }
    .pr-page { grid-template-columns:300px 1fr; padding:40px 32px 80px; gap:28px; }
    .sidebar { position:sticky; top:84px; }
    .gallery { grid-template-columns:1fr 1fr; }
    .gallery-main { height:220px; }
    .section { padding:28px; }
    .compat-label { width:130px; }
    .tag { font-size:13px; padding:7px 14px; }
    .bottomnav { display:none; }
  }
`

function matchQuality(score: number): { sub: string; stars: number } {
  if (score >= 90) return { sub: 'Meget stærkt match', stars: 5 }
  if (score >= 80) return { sub: 'Stærkt match', stars: 4 }
  if (score >= 70) return { sub: 'Godt match', stars: 3 }
  return { sub: 'Moderat match', stars: 2 }
}

function ImageGallery({ urls }: { urls?: string[] }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const touchStartX = useRef(0)

  if (!urls || urls.length === 0) return <div className="gallery-main">🏠</div>

  const prev = () => setActive(i => (i - 1 + urls.length) % urls.length)
  const next = () => setActive(i => (i + 1) % urls.length)

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  return (
    <>
      {/* Inline galleri */}
      <div className="gallery">
        <div
          className="gallery-main"
          style={{ padding: 0, cursor: 'zoom-in' }}
          onClick={() => setLightbox(true)}
        >
          <img src={urls[active]} alt="Bolig" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {urls.length > 1 && (
            <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '3px 10px' }}>
              {active + 1} / {urls.length}
            </div>
          )}
        </div>
        {urls.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {urls.map((url, i) => (
              <img
                key={i} src={url} alt=""
                onClick={() => setActive(i)}
                style={{
                  width: 72, height: 72, objectFit: 'cover', borderRadius: 10,
                  border: `2px solid ${i === active ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox via portal — undgår at parent transforms begrænser fixed-position */}
      {lightbox && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <img
            src={urls[active]} alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }}
          />
          {urls.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: 12, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: 12, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                {urls.map((_, i) => (
                  <div key={i} onClick={e => { e.stopPropagation(); setActive(i) }} style={{ width: i === active ? 20 : 8, height: 8, borderRadius: 4, background: i === active ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }} />
                ))}
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

export default function ProfilClient({ profile }: { profile: ProfileData }) {
  const [animated, setAnimated] = useState(false)
  const [barWidths, setBarWidths] = useState<Record<string, number>>({})
  const [isPending, startTransition] = useTransition()
  const circ22 = 2 * Math.PI * 22
  const score = profile.matchScore ?? 0
  const offset = circ22 - (score / 100) * circ22
  const quality = matchQuality(score)

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setAnimated(true)
      if (profile.compat) {
        const widths: Record<string, number> = {}
        profile.compat.forEach(row => { widths[row.label] = row.pct })
        setBarWidths(widths)
      }
    })
    return () => cancelAnimationFrame(t)
  }, [profile.compat])

  const stats: { icon: string; label: string; val: string }[] = []
  if (profile.role === 'seeker') {
    if (profile.budgetMax) stats.push({ icon: 'payments', label: 'Budget maks.', val: `${profile.budgetMax.toLocaleString('da-DK')} kr/md` })
    stats.push({ icon: 'smoke_free', label: 'Rygning', val: profile.smoker ? 'Ryger' : 'Ikke-ryger' })
    stats.push({ icon: 'pets', label: 'Kæledyr', val: profile.petFriendly ? 'Tilladt' : 'Ikke tilladt' })
    if (profile.availableFrom) stats.push({ icon: 'calendar_today', label: 'Ledig fra', val: profile.availableFrom })
  } else {
    if (profile.listingPrice) stats.push({ icon: 'payments', label: 'Husleje', val: `${profile.listingPrice.toLocaleString('da-DK')} kr/md` })
    if (profile.listingRooms) stats.push({ icon: 'door_front', label: 'Værelser', val: String(profile.listingRooms) })
    if (profile.listingSize) stats.push({ icon: 'square_foot', label: 'Størrelse', val: `${profile.listingSize} m²` })
    if (profile.listingAvailableFrom) stats.push({ icon: 'calendar_today', label: 'Ledig fra', val: profile.listingAvailableFrom })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pr-root">

        <nav className="pr-nav">
          <a className="nav-logo" href="/matches">
            <svg viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,24 2,24" fill="#D97757" />
              <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
            </svg>
            <span className="nav-logo-text">Rumies</span>
          </a>
          <div className="nav-links">
            <a className="nav-link" href="/dashboard"><span className="material-symbols-rounded">home</span>Hjem</a>
            <a className="nav-link active" href="/matches"><span className="material-symbols-rounded">favorite</span>Matches</a>
            <a className="nav-link" href="/chat"><span className="material-symbols-rounded">chat_bubble</span>Beskeder</a>
          </div>
          <div className="nav-right">
            <form action={signOut}>
              <button type="submit" className="logout-btn" title="Log ud">
                <span className="material-symbols-rounded">logout</span>
              </button>
            </form>
            <a className="nav-avatar" href="/dashboard">
              <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'var(--ink3)' }}>person</span>
            </a>
          </div>
        </nav>

        <div className="pr-page">

          {/* ── SIDEBAR ── */}
          <aside className="sidebar">

            <div className="profile-card">
              <div className="profile-hero">
                <div className="profile-hero-pattern" />
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar">
                    {profile.avatarUrl
                      ? <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : profile.emoji}
                  </div>
                </div>
              </div>
              <div className="profile-body">
                <h1 className="profile-name">{profile.name}{profile.age ? `, ${profile.age}` : ''}</h1>
                {profile.location && (
                  <div className="profile-location">
                    <span className="material-symbols-rounded">location_on</span>
                    {profile.location}
                  </div>
                )}
                <div className="badges-row">
                  <span className={`role-badge ${profile.role === 'landlord' ? 'udlejer' : 'søgende'}`}>
                    <span className="material-symbols-rounded">{profile.role === 'landlord' ? 'home' : 'search'}</span>
                    {profile.role === 'landlord' ? 'Udlejer' : 'Søger bolig'}
                  </span>
                  {profile.verified && (
                    <span className="verified-badge">
                      <span className="material-symbols-rounded">verified</span>Verificeret
                    </span>
                  )}
                </div>

                {score > 0 && (
                  <div className="match-score-wrap">
                    <div className="match-ring">
                      <svg viewBox="0 0 52 52">
                        <circle className="ring-bg" cx="26" cy="26" r="22" />
                        <circle
                          className="ring-fill"
                          cx="26" cy="26" r="22"
                          strokeDasharray={circ22.toFixed(1)}
                          strokeDashoffset={animated ? offset.toFixed(1) : circ22.toFixed(1)}
                        />
                      </svg>
                      <div className="ring-num">{score}%</div>
                    </div>
                    <div>
                      <div className="match-label">{score}% Match</div>
                      <div className="match-label-sub">{quality.sub}</div>
                      <div className="match-stars">
                        {Array.from({ length: quality.stars }).map((_, i) => (
                          <span key={i} className="material-symbols-rounded">star</span>
                        ))}
                        {quality.stars < 5 && <span className="material-symbols-rounded">star_half</span>}
                      </div>
                    </div>
                  </div>
                )}

                {profile.otherUserId ? (
                  <button
                    className="btn-primary"
                    disabled={isPending}
                    onClick={() => startTransition(() =>
                      startConversation(profile.otherUserId!, profile.listingId)
                    )}
                  >
                    <span className="material-symbols-rounded">chat_bubble</span>
                    {isPending ? 'Opretter samtale...' : `Skriv til ${profile.name}`}
                  </button>
                ) : (
                  <a className="btn-primary" href="/chat">
                    <span className="material-symbols-rounded">chat_bubble</span>
                    Skriv til {profile.name}
                  </a>
                )}
                <a className="btn-secondary" href="/matches">
                  <span className="material-symbols-rounded">arrow_back</span>
                  Tilbage til matches
                </a>
                <ShareButton />
              </div>
            </div>

            {stats.length > 0 && (
              <div className="quick-stats">
                {stats.map(s => (
                  <div key={s.label} className="stat-row">
                    <div className="stat-left">
                      <div className="stat-icon"><span className="material-symbols-rounded">{s.icon}</span></div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                    <div className="stat-val">{s.val}</div>
                  </div>
                ))}
              </div>
            )}

          </aside>

          {/* ── MAIN ── */}
          <div className="main-col">

            <a className="back-link" href="/matches">
              <span className="material-symbols-rounded">arrow_back</span>
              Tilbage til matches
            </a>

            {/* Bio */}
            <div className="section" style={{ animationDelay: '0.05s' }}>
              <div className="section-title">
                <span className="material-symbols-rounded">person</span>Om mig
              </div>
              {profile.bio
                ? <p className="bio-text">{profile.bio}</p>
                : <p className="no-bio">Ingen beskrivelse endnu.</p>
              }
            </div>

            {/* Lifestyle */}
            {profile.tags.length > 0 && (
              <div className="section" style={{ animationDelay: '0.1s' }}>
                <div className="section-title">
                  <span className="material-symbols-rounded">favorite</span>Livsstil &amp; vaner
                </div>
                <div className="tags-grid">
                  {profile.tags.map(t => (
                    <span key={t.label} className="tag">
                      <span className="material-symbols-rounded">{t.icon}</span>{t.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery (udlejer only) */}
            {profile.role === 'landlord' && (
              <div className="section" style={{ animationDelay: '0.15s' }}>
                <div className="section-title">
                  <span className="material-symbols-rounded">photo_library</span>Billeder
                </div>
                <ImageGallery urls={profile.listingImageUrls} />
              </div>
            )}

            {/* Compatibility */}
            {profile.compat && profile.compat.length > 0 && (
              <div className="section" style={{ animationDelay: '0.15s' }}>
                <div className="section-title">
                  <span className="material-symbols-rounded">analytics</span>Jeres kompatibilitet
                </div>
                <div className="compat-grid">
                  {profile.compat.map(row => (
                    <div key={row.label} className="compat-row">
                      <div className="compat-label">{row.label}</div>
                      <div className="compat-bar-wrap">
                        <div
                          className={'compat-bar' + (row.pct >= 80 ? '' : row.pct >= 60 ? ' medium' : ' low')}
                          style={{ width: animated ? `${barWidths[row.label] ?? 0}%` : '0%' }}
                        />
                      </div>
                      <div className="compat-pct">{row.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM NAV */}
        <nav className="bottomnav">
          <a className="bn-item" href="/dashboard"><span className="material-symbols-rounded">home</span><span>Hjem</span></a>
          <a className="bn-item active" href="/matches"><span className="material-symbols-rounded">favorite</span><span>Matches</span></a>
          <a className="bn-item" href="/chat"><span className="material-symbols-rounded">chat_bubble</span><span>Beskeder</span></a>
        </nav>
      </div>
    </>
  )
}
