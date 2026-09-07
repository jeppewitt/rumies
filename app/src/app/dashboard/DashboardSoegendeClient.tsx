'use client'

import { useState, useRef, useTransition } from 'react'
import { signOut } from '@/app/actions/auth'
import { toggleSearchActive, updateSeekerPrefs } from '@/app/actions/profile'

const CITIES = ['København', 'Aarhus', 'Odense'] as const
type City = typeof CITIES[number]
const DISTRICTS: Record<City, string[]> = {
  'København': ['Indre By', 'Nørrebro', 'Vesterbro', 'Østerbro', 'Amager Øst', 'Amager Vest', 'Valby', 'Vanløse', 'Bispebjerg', 'Brønshøj', 'Frederiksberg'],
  'Aarhus':    ['Aarhus C', 'Aarhus N', 'Aarhus V', 'Trøjborg', 'Risskov', 'Hasle', 'Viby J', 'Brabrand', 'Åbyhøj', 'Skejby', 'Højbjerg'],
  'Odense':    ['Odense C', 'Odense N', 'Odense NV', 'Odense S', 'Odense SV', 'Bolbro', 'Dalum', 'Vollsmose'],
}

type TopMatch = {
  id: string
  title: string
  location: string
  price: number
  score: number
  imageUrl?: string
}

type Props = {
  displayName: string
  stats: { conversationCount: number; favoritesCount: number }
  prefs: { city?: string; district?: string; budgetMax?: number; availableFrom?: string; availableFromRaw?: string }
  totalListings: number
  topMatches: TopMatch[]
  profileId: string
  isActive: boolean
}

type ToastState = { icon: string; msg: string; show: boolean }

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
  .ds-root { font-family:var(--font-manrope),'Manrope',sans-serif; background:var(--bg); color:var(--ink); min-height:100vh; padding-bottom:calc(60px + env(safe-area-inset-bottom,0px)); }
  .ds-nav { z-index:100; background:rgba(247,244,239,0.95); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:0 16px; height:64px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; }
  .nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; }
  .nav-logo svg { width:28px; height:28px; }
  .nav-logo-text { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:700; color:var(--ink); letter-spacing:-0.3px; }
  .nav-links { display:none; align-items:center; gap:4px; }
  .nav-link { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; font-size:14px; font-weight:500; color:var(--ink2); cursor:pointer; border:none; background:none; font-family:var(--font-manrope),'Manrope',sans-serif; transition:all 0.2s; text-decoration:none; }
  .nav-link:hover { background:var(--border); color:var(--ink); }
  .nav-link.active { background:var(--primary); color:white; }
  .nav-link .material-symbols-rounded { font-size:18px; }
  .nav-right { display:flex; align-items:center; gap:8px; }
  .logout-btn { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; border:1.5px solid var(--border); background:none; cursor:pointer; color:var(--ink3); transition:all 0.2s; }
  .logout-btn:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-soft); }
  .logout-btn .material-symbols-rounded { font-size:18px; }
  .nav-avatar { width:36px; height:36px; border-radius:50%; background:var(--accent-soft); border:2px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; text-decoration:none; }
  .ds-page { max-width:800px; margin:0 auto; padding:32px 16px 80px; }
  .page-label { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--primary); margin-bottom:6px; }
  .page-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:32px; font-weight:700; line-height:1.1; margin-bottom:6px; }
  .page-title em { font-style:italic; color:var(--primary); }
  .page-sub { font-size:14px; color:var(--ink3); margin-bottom:32px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .stats-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:28px; }
  .stat-card { background:var(--card); border-radius:16px; border:1px solid var(--border); padding:20px; box-shadow:var(--shadow-sm); animation:fadeUp 0.4s ease both; }
  .stat-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
  .stat-icon .material-symbols-rounded { font-size:22px; }
  .stat-icon.orange { background:var(--primary-soft); } .stat-icon.orange .material-symbols-rounded { color:var(--primary); }
  .stat-icon.green  { background:var(--accent-soft);  } .stat-icon.green  .material-symbols-rounded { color:var(--accent); }
  .stat-icon.gold   { background:var(--gold-soft);    } .stat-icon.gold   .material-symbols-rounded { color:var(--gold); }
  .stat-val { font-family:var(--font-fraunces),'Fraunces',serif; font-size:24px; font-weight:700; color:var(--ink); margin-bottom:4px; }
  .stat-label { font-size:13px; color:var(--ink3); }
  .prefs-card { background:var(--card); border-radius:16px; border:1px solid var(--border); padding:20px 24px; margin-bottom:20px; box-shadow:var(--shadow-sm); animation:fadeUp 0.4s 0.08s ease both; }
  .prefs-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .prefs-title { font-size:15px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:8px; }
  .prefs-title .material-symbols-rounded { font-size:17px; color:var(--primary); }
  .prefs-edit { padding:7px 14px; border-radius:10px; font-size:13px; font-weight:700; background:var(--card); color:var(--ink2); border:1.5px solid var(--border); cursor:pointer; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; display:flex; align-items:center; gap:5px; }
  .prefs-edit:hover { border-color:var(--primary); color:var(--primary); }
  .prefs-edit .material-symbols-rounded { font-size:15px; }
  .pref-chips { display:flex; gap:8px; flex-wrap:wrap; }
  .pref-chip { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:999px; font-size:13px; font-weight:600; background:var(--bg); color:var(--ink2); border:1.5px solid var(--border); }
  .pref-chip .material-symbols-rounded { font-size:14px; color:var(--primary); }
  .pref-empty { font-size:13px; color:var(--ink3); font-style:italic; }
  .matches-section { margin-bottom:20px; animation:fadeUp 0.4s 0.14s ease both; }
  .matches-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .matches-title { font-size:15px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:8px; }
  .matches-title .material-symbols-rounded { font-size:17px; color:var(--primary); }
  .matches-see-all { display:inline-flex; align-items:center; gap:4px; font-size:13px; font-weight:700; color:var(--primary); text-decoration:none; padding:6px 12px; border-radius:8px; transition:background 0.2s; }
  .matches-see-all:hover { background:var(--primary-soft); }
  .matches-see-all .material-symbols-rounded { font-size:15px; }
  .match-cards { display:flex; flex-direction:column; gap:10px; }
  .match-card { background:var(--card); border-radius:16px; border:1.5px solid var(--border); padding:16px 18px; display:flex; align-items:center; gap:14px; text-decoration:none; transition:all 0.2s; }
  .match-card:hover { border-color:var(--primary-soft); box-shadow:var(--shadow-md); transform:translateY(-1px); }
  .match-img { width:52px; height:52px; border-radius:12px; background:linear-gradient(135deg,#E8C9BC,#F5DEC0); flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:22px; border:1px solid var(--border); }
  .match-img img { width:100%; height:100%; object-fit:cover; }
  .match-info { flex:1; min-width:0; }
  .match-title { font-size:14px; font-weight:700; color:var(--ink); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .match-meta { font-size:12px; color:var(--ink3); display:flex; align-items:center; gap:6px; }
  .match-meta .material-symbols-rounded { font-size:13px; }
  .match-score { flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:3px; }
  .score-pill { font-size:13px; font-weight:800; padding:4px 10px; border-radius:999px; }
  .score-pill.high { background:var(--accent-soft); color:var(--accent); }
  .score-pill.mid  { background:var(--primary-soft); color:var(--primary); }
  .score-label { font-size:10px; font-weight:600; color:var(--ink3); text-transform:uppercase; letter-spacing:0.05em; }
  .no-matches { background:var(--card); border-radius:16px; border:2px dashed var(--border); padding:32px 20px; text-align:center; }
  .no-matches-icon { font-size:36px; margin-bottom:10px; }
  .no-matches-title { font-size:14px; font-weight:700; color:var(--ink2); margin-bottom:6px; }
  .no-matches-sub { font-size:13px; color:var(--ink3); margin-bottom:16px; }
  .no-matches-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; background:var(--primary); color:white; font-size:13px; font-weight:700; text-decoration:none; transition:background 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; }
  .no-matches-btn:hover { background:var(--primary-hover); }
  .no-matches-btn .material-symbols-rounded { font-size:16px; }
  .share-row { margin-bottom:20px; animation:fadeUp 0.4s 0.2s ease both; }
  .share-btn { display:inline-flex; align-items:center; gap:8px; background:var(--card); color:var(--ink2); padding:10px 18px; border-radius:12px; font-size:13px; font-weight:600; border:1.5px solid var(--border); cursor:pointer; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; }
  .share-btn:hover { border-color:var(--primary); color:var(--primary); }
  .share-btn .material-symbols-rounded { font-size:16px; }
  .status-card { background:var(--card); border-radius:16px; border:1.5px solid var(--border); padding:16px 20px; margin-bottom:20px; display:flex; align-items:center; gap:12px; animation:fadeUp 0.4s 0.04s ease both; }
  .status-card.paused { border-color:#E8C9BC; background:#FDF5F2; }
  .status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .status-dot.on { background:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
  .status-dot.off { background:var(--ink3); box-shadow:0 0 0 3px var(--border); }
  .status-info { flex:1; min-width:0; }
  .status-title { font-size:14px; font-weight:700; color:var(--ink); margin-bottom:2px; }
  .status-sub { font-size:12px; color:var(--ink3); }
  .status-btn { padding:8px 16px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; border:1.5px solid; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; white-space:nowrap; display:flex; align-items:center; gap:5px; flex-shrink:0; }
  .status-btn .material-symbols-rounded { font-size:15px; }
  .status-btn.pause { background:var(--card); color:var(--ink2); border-color:var(--border); }
  .status-btn.pause:hover { border-color:var(--ink2); }
  .status-btn.activate { background:var(--accent); color:white; border-color:transparent; }
  .status-btn.activate:hover { background:#6A8E76; }
  .status-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .edit-panel { overflow:hidden; max-height:0; transition:max-height 0.3s ease, opacity 0.25s ease; opacity:0; }
  .edit-panel.open { max-height:600px; opacity:1; }
  .edit-panel-inner { padding-top:16px; border-top:1px solid var(--border); margin-top:16px; display:flex; flex-direction:column; gap:12px; }
  .edit-field { display:flex; flex-direction:column; gap:5px; }
  .edit-label { font-size:12px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink3); }
  .edit-select, .edit-input { width:100%; padding:10px 12px; border-radius:10px; border:1.5px solid var(--border); font-size:14px; font-family:var(--font-manrope),'Manrope',sans-serif; color:var(--ink); background:var(--bg); outline:none; transition:border-color 0.2s; appearance:none; }
  .edit-select:focus, .edit-input:focus { border-color:var(--primary); }
  .edit-actions { display:flex; gap:8px; padding-top:4px; }
  .edit-save { flex:1; padding:10px; border-radius:10px; background:var(--primary); color:white; font-size:14px; font-weight:700; border:none; cursor:pointer; font-family:var(--font-manrope),'Manrope',sans-serif; transition:background 0.2s; }
  .edit-save:hover { background:var(--primary-hover); }
  .edit-save:disabled { opacity:0.6; cursor:not-allowed; }
  .edit-cancel { padding:10px 18px; border-radius:10px; background:none; border:1.5px solid var(--border); color:var(--ink2); font-size:14px; font-weight:600; cursor:pointer; font-family:var(--font-manrope),'Manrope',sans-serif; transition:all 0.2s; }
  .edit-cancel:hover { border-color:var(--ink2); }
  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); background:var(--ink); color:white; padding:12px 20px; border-radius:12px; font-size:14px; font-weight:500; display:flex; align-items:center; gap:8px; box-shadow:0 8px 24px rgba(0,0,0,0.2); transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1); z-index:1000; white-space:nowrap; }
  .toast.show { transform:translateX(-50%) translateY(0); }
  .bottomnav { display:flex; position:fixed; bottom:0; left:0; right:0; height:60px; background:var(--card); border-top:1px solid var(--border); z-index:200; box-shadow:0 -2px 16px rgba(26,15,10,0.07); padding-bottom:env(safe-area-inset-bottom,0px); }
  .bn-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; text-decoration:none; color:var(--ink3); font-size:10px; font-weight:600; font-family:var(--font-manrope),'Manrope',sans-serif; transition:color 0.2s; }
  .bn-item .material-symbols-rounded { font-size:22px; }
  .bn-item.active { color:var(--primary); }
  @media (min-width:768px) {
    .ds-nav { padding:0 32px; }
    .nav-links { display:flex; }
    .ds-root { padding-bottom:0; }
    .ds-page { padding:40px 32px 80px; }
    .stats-row { grid-template-columns:repeat(3,1fr); gap:14px; }
    .stat-val { font-size:28px; }
    .bottomnav { display:none; }
  }
`

export default function DashboardSoegendeClient({ displayName, stats, prefs, totalListings, topMatches, profileId, isActive: initialActive }: Props) {
  const [toast, setToast] = useState<ToastState>({ icon: '', msg: '', show: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [active, setActive] = useState(initialActive)
  const [pending, startTransition] = useTransition()

  // Edit panel
  const [editOpen, setEditOpen] = useState(false)
  const [editCity, setEditCity] = useState(prefs.city ?? '')
  const [editDistrict, setEditDistrict] = useState(prefs.district ?? '')
  const [editBudget, setEditBudget] = useState(prefs.budgetMax ? String(prefs.budgetMax) : '')
  const [editDate, setEditDate] = useState(prefs.availableFromRaw ?? '')
  const [savePending, startSave] = useTransition()

  const districts = editCity && CITIES.includes(editCity as City) ? DISTRICTS[editCity as City] : []

  function openEdit() {
    setEditCity(prefs.city ?? '')
    setEditDistrict(prefs.district ?? '')
    setEditBudget(prefs.budgetMax ? String(prefs.budgetMax) : '')
    setEditDate(prefs.availableFromRaw ?? '')
    setEditOpen(true)
  }

  function handleSave() {
    startSave(async () => {
      const res = await updateSeekerPrefs({
        city: editCity,
        district: editDistrict,
        budgetMax: editBudget ? Number(editBudget) : null,
        availableFrom: editDate || null,
      })
      if (res?.error) {
        showToast('❌', 'Noget gik galt — prøv igen')
      } else {
        setEditOpen(false)
        showToast('✅', 'Søgekriterier gemt!')
      }
    })
  }

  function handleToggleActive() {
    const newVal = !active
    setActive(newVal)
    startTransition(async () => {
      const res = await toggleSearchActive(newVal)
      if (res?.error) {
        setActive(!newVal)
        showToast('❌', 'Noget gik galt — prøv igen')
      } else {
        showToast(newVal ? '✅' : '⏸️', newVal ? 'Din søgning er nu aktiv' : 'Din søgning er sat på pause')
      }
    })
  }

  function showToast(icon: string, msg: string) {
    setToast({ icon, msg, show: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ds-root">

        <nav className="ds-nav">
          <a className="nav-logo" href="/dashboard">
            <svg viewBox="0 0 40 38" fill="none">
              <polygon points="20,2 38,17 2,17" fill="#D97757" />
              <rect x="5" y="16" width="30" height="20" rx="2" fill="#D97757" />
              <circle cx="15" cy="27" r="5.5" fill="#F7F4EF" opacity="0.92" />
              <circle cx="25" cy="27" r="5.5" fill="#F7F4EF" opacity="0.60" />
              <path d="M20,22 a5.5,5.5 0 0 1 0,10 a5.5,5.5 0 0 1 0,-10" fill="#F7F4EF" opacity="0.30" />
            </svg>
            <span className="nav-logo-text">Rumies</span>
          </a>
          <div className="nav-links">
            <a className="nav-link active" href="/dashboard"><span className="material-symbols-rounded">home</span>Hjem</a>
            <a className="nav-link" href="/matches"><span className="material-symbols-rounded">favorite</span>Matches</a>
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

        <div className="ds-page">

          <div className="page-label">Søgende</div>
          <h1 className="page-title">Hej, <em>{displayName}</em> 👋</h1>
          <p className="page-sub">Her er et overblik over din søgning og aktivitet.</p>

          {/* STATS */}
          <div className="stats-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card" style={{ animationDelay: '0s' }}>
              <div className="stat-icon green"><span className="material-symbols-rounded">chat_bubble</span></div>
              <div className="stat-val">{stats.conversationCount}</div>
              <div className="stat-label">Samtaler</div>
            </div>
            <div className="stat-card" style={{ animationDelay: '0.06s' }}>
              <div className="stat-icon gold"><span className="material-symbols-rounded">star</span></div>
              <div className="stat-val">{stats.favoritesCount}</div>
              <div className="stat-label">Gemte favoritter</div>
            </div>
          </div>

          {/* STATUS TOGGLE */}
          <div className={'status-card' + (active ? '' : ' paused')}>
            <div className={'status-dot ' + (active ? 'on' : 'off')} />
            <div className="status-info">
              <div className="status-title">{active ? 'Din søgning er aktiv' : 'Din søgning er på pause'}</div>
              <div className="status-sub">
                {active
                  ? 'Du er synlig for udlejere og kan modtage matches.'
                  : 'Du er usynlig for udlejere. Ingen nye matches mens du er på pause.'}
              </div>
            </div>
            <button
              className={'status-btn ' + (active ? 'pause' : 'activate')}
              onClick={handleToggleActive}
              disabled={pending}
            >
              <span className="material-symbols-rounded">{active ? 'pause_circle' : 'play_circle'}</span>
              {active ? 'Sæt på pause' : 'Genaktivér'}
            </button>
          </div>

          {/* SØGEKRITERIER */}
          <div className="prefs-card">
            <div className="prefs-header">
              <div className="prefs-title">
                <span className="material-symbols-rounded">tune</span>
                Dine søgekriterier
              </div>
              <button className="prefs-edit" onClick={() => editOpen ? setEditOpen(false) : openEdit()}>
                <span className="material-symbols-rounded">{editOpen ? 'close' : 'edit'}</span>
                {editOpen ? 'Luk' : 'Redigér'}
              </button>
            </div>
            <div className="pref-chips">
              {prefs.city && (
                <span className="pref-chip">
                  <span className="material-symbols-rounded">location_on</span>
                  {[prefs.district, prefs.city].filter(Boolean).join(', ')}
                </span>
              )}
              {prefs.budgetMax && (
                <span className="pref-chip">
                  <span className="material-symbols-rounded">payments</span>
                  Maks. {prefs.budgetMax.toLocaleString('da-DK')} kr/md
                </span>
              )}
              {prefs.availableFrom && (
                <span className="pref-chip">
                  <span className="material-symbols-rounded">calendar_today</span>
                  Fra {prefs.availableFrom}
                </span>
              )}
              {!prefs.city && !prefs.budgetMax && !prefs.availableFrom && (
                <span className="pref-empty">Ingen søgekriterier sat endnu.</span>
              )}
            </div>

            {/* EDIT PANEL */}
            <div className={'edit-panel' + (editOpen ? ' open' : '')}>
              <div className="edit-panel-inner">
                <div className="edit-field">
                  <label className="edit-label">By</label>
                  <select
                    className="edit-select"
                    value={editCity}
                    onChange={e => { setEditCity(e.target.value); setEditDistrict('') }}
                  >
                    <option value="">Vælg by</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {districts.length > 0 && (
                  <div className="edit-field">
                    <label className="edit-label">Bydel (valgfrit)</label>
                    <select
                      className="edit-select"
                      value={editDistrict}
                      onChange={e => setEditDistrict(e.target.value)}
                    >
                      <option value="">Alle bydele</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
                <div className="edit-field">
                  <label className="edit-label">Maks. budget (kr/md)</label>
                  <input
                    className="edit-input"
                    type="number"
                    min={0}
                    step={500}
                    placeholder="F.eks. 8000"
                    value={editBudget}
                    onChange={e => setEditBudget(e.target.value)}
                  />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Ledig fra (valgfrit)</label>
                  <input
                    className="edit-input"
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                  />
                </div>
                <div className="edit-actions">
                  <button className="edit-cancel" onClick={() => setEditOpen(false)}>Annuller</button>
                  <button className="edit-save" onClick={handleSave} disabled={savePending || !editCity}>
                    {savePending ? 'Gemmer…' : 'Gem ændringer'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TOP MATCHES */}
          <div className="matches-section">
            <div className="matches-header">
              <div className="matches-title">
                <span className="material-symbols-rounded">favorite</span>
                Dine bedste matches
              </div>
              <a className="matches-see-all" href="/matches">
                Se alle {totalListings}
                <span className="material-symbols-rounded">arrow_forward</span>
              </a>
            </div>
            {topMatches.length > 0 ? (
              <div className="match-cards">
                {topMatches.map(m => (
                  <a key={m.id} className="match-card" href={`/matches`}>
                    <div className="match-img">
                      {m.imageUrl
                        ? <img src={m.imageUrl} alt={m.title} />
                        : '🏠'}
                    </div>
                    <div className="match-info">
                      <div className="match-title">{m.title}</div>
                      <div className="match-meta">
                        <span className="material-symbols-rounded">location_on</span>
                        {m.location || 'Ukendt lokation'}
                        <span style={{ margin: '0 2px', opacity: 0.4 }}>·</span>
                        <span className="material-symbols-rounded">payments</span>
                        {m.price.toLocaleString('da-DK')} kr/md
                      </div>
                    </div>
                    <div className="match-score">
                      <span className={'score-pill ' + (m.score >= 75 ? 'high' : 'mid')}>{m.score}%</span>
                      <span className="score-label">Match</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="no-matches">
                <div className="no-matches-icon">🏠</div>
                <div className="no-matches-title">Ingen boliger fundet endnu</div>
                <div className="no-matches-sub">Der er ingen aktive boliger i dit område lige nu.</div>
                <a className="no-matches-btn" href="/matches">
                  <span className="material-symbols-rounded">search</span>Søg alligevel
                </a>
              </div>
            )}
          </div>

          {/* DEL PROFIL */}
          <div className="share-row">
            <button
              className="share-btn"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/profil/${profileId}`)
                showToast('🔗', 'Profillink kopieret!')
              }}
            >
              <span className="material-symbols-rounded">share</span>
              Del din profil
            </button>
          </div>


        </div>

        {/* TOAST */}
        <div className={'toast' + (toast.show ? ' show' : '')}>
          <span>{toast.icon}</span><span>{toast.msg}</span>
        </div>

        {/* BOTTOM NAV */}
        <nav className="bottomnav">
          <a className="bn-item active" href="/dashboard"><span className="material-symbols-rounded">home</span><span>Hjem</span></a>
          <a className="bn-item" href="/matches"><span className="material-symbols-rounded">favorite</span><span>Matches</span></a>
          <a className="bn-item" href="/chat"><span className="material-symbols-rounded">chat_bubble</span><span>Beskeder</span></a>
        </nav>
      </div>
    </>
  )
}
