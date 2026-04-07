'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { startConversation, toggleFavorite } from './actions'
import { signOut } from '@/app/actions/auth'

// ── TYPES ──────────────────────────────────────────────────────
export type MatchCard = {
  id: string
  name: string
  age?: number
  emoji: string
  bg: string
  imageUrl?: string
  city: string
  area: string
  job: string
  budget: number
  score: number
  verified: boolean
  tags: string[]
  cityFilter: string
  otherUserId: string
  listingId?: string
  otherProfileId?: string
}

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
  :root {
    --bg: #F7F4EF; --bg2: #F0EAE2; --card: #FFFFFF;
    --primary: #D97757; --primary-hover: #C4633F;
    --primary-light: #F0C4B2; --primary-soft: #F5E6DF;
    --accent: #7B9E87; --accent-soft: #E3EEE7; --accent-light: #C8DDD0;
    --ink: #1A0F0A; --ink2: #4A3528; --ink3: #9C7B6E;
    --border: #E8E0D8; --white: #FFFFFF;
    --gold: #C9A84C; --gold-soft: #F5EDD0;
    --shadow: 0 2px 12px rgba(26,15,10,0.08);
    --shadow-hover: 0 8px 32px rgba(26,15,10,0.14);
  }
  .mc-root {
    font-family: var(--font-manrope), 'Manrope', sans-serif;
    background: var(--bg); color: var(--ink); min-height: 100vh;
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  }
  .mc-nav {
    z-index: 100; background: rgba(247,244,239,0.95); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border); padding: 0 16px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0;
  }
  .nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--ink); }
  .nav-logo svg { width:32px; height:32px; }
  .nav-logo-text { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:700; letter-spacing:-0.3px; color:var(--ink); }
  .nav-links { display:none; align-items:center; gap:4px; }
  .nav-link { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; text-decoration:none; font-size:14px; font-weight:500; color:var(--ink2); cursor:pointer; border:none; background:none; font-family:var(--font-manrope),'Manrope',sans-serif; transition:all 0.2s; }
  .nav-link:hover { background:var(--border); color:var(--ink); }
  .nav-link.active { background:var(--primary); color:white; }
  .nav-link .material-symbols-rounded { font-size:18px; }
  .nav-avatar { width:36px; height:36px; border-radius:50%; background:var(--accent-light); display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid var(--border); }
  .nav-right { display:flex; align-items:center; gap:8px; }
  .logout-btn { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; border:1.5px solid var(--border); background:none; cursor:pointer; color:var(--ink3); transition:all 0.2s; }
  .logout-btn:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-soft); }
  .logout-btn .material-symbols-rounded { font-size:18px; }
  .mc-page { max-width:1200px; margin:0 auto; padding:16px 16px 80px; }
  .page-header { display:flex; flex-direction:column; align-items:flex-start; gap:12px; margin-bottom:32px; }
  .page-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:24px; font-weight:700; line-height:1.1; }
  .page-title span { color:var(--primary); font-style:italic; }
  .page-subtitle { font-size:14px; color:var(--ink3); margin-top:4px; }
  .sort-select { padding:8px 12px; border-radius:10px; border:1.5px solid var(--border); background:var(--white); font-size:13px; font-weight:500; color:var(--ink2); cursor:pointer; font-family:var(--font-manrope),'Manrope',sans-serif; outline:none; }
  .sort-select:focus { border-color:var(--primary); }
  .view-toggle { display:flex; gap:0; border-radius:12px; border:1.5px solid var(--border); background:var(--white); overflow:hidden; flex-shrink:0; }
  .view-toggle-btn { padding:8px 14px; font-size:13px; font-weight:600; border:none; background:transparent; color:var(--ink3); cursor:pointer; font-family:var(--font-manrope),'Manrope',sans-serif; transition:all 0.2s; display:flex; align-items:center; gap:5px; }
  .view-toggle-btn .material-symbols-rounded { font-size:15px; }
  .view-toggle-btn.active { background:var(--ink); color:white; }
  .view-toggle-btn:not(.active):hover { background:var(--bg2); color:var(--ink); }
  .header-controls { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .tabs { display:flex; border-bottom:1.5px solid var(--border); margin-bottom:20px; overflow-x:auto; }
  .tab { display:flex; align-items:center; gap:6px; padding:12px 20px; font-size:14px; font-weight:600; color:var(--ink3); cursor:pointer; border-bottom:2.5px solid transparent; margin-bottom:-1.5px; transition:all 0.2s; background:none; border-top:none; border-left:none; border-right:none; font-family:var(--font-manrope),'Manrope',sans-serif; }
  .tab:hover { color:var(--ink); }
  .tab.active { color:var(--primary); border-bottom-color:var(--primary); }
  .tab-badge { background:var(--primary); color:white; font-size:11px; font-weight:700; padding:2px 7px; border-radius:10px; line-height:1.4; }
  .tab-badge.fav { background:var(--gold); }
  .filter-bar { display:flex; align-items:center; gap:10px; flex-wrap:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:4px; scrollbar-width:none; margin-bottom:24px; }
  .filter-bar::-webkit-scrollbar { display:none; }
  .filter-chip { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:20px; font-size:13px; font-weight:500; border:1.5px solid var(--border); background:var(--white); color:var(--ink2); cursor:pointer; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; flex-shrink:0; }
  .filter-chip:hover { border-color:var(--primary); color:var(--primary); }
  .filter-chip.active { background:var(--ink); border-color:var(--ink); color:white; }
  .filter-chip .material-symbols-rounded { font-size:15px; }
  .matches-grid { display:grid; grid-template-columns:1fr; gap:14px; }
  .match-card { background:var(--white); border-radius:16px; border:1.5px solid var(--border); overflow:hidden; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); position:relative; cursor:pointer; animation:cardIn 0.4s ease both; }
  @keyframes cardIn { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  .match-card:hover { box-shadow:var(--shadow-hover); transform:translateY(-3px); border-color:var(--primary-light); }
  .match-card.is-favorite { border-color:var(--gold); }
  .card-img { width:100%; height:160px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:64px; }
  .bg-rose     { background:#F5C6BC; }
  .bg-sage     { background:#C8DDD0; }
  .bg-sky      { background:#BED4E8; }
  .bg-peach    { background:#F5DEC0; }
  .bg-lavender { background:#D5C8E8; }
  .bg-mint     { background:#C2E0D4; }
  .score-badge { display:flex; align-items:center; gap:6px; margin-bottom:10px; }
  .score-ring { width:36px; height:36px; position:relative; }
  .score-ring svg { transform:rotate(-90deg); width:36px; height:36px; }
  .score-ring-bg   { fill:none; stroke:#F2EDE4; stroke-width:3; }
  .score-ring-fill { fill:none; stroke-width:3; stroke-linecap:round; transition:stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1); }
  .score-high   { stroke:#7B9E87; }
  .score-medium { stroke:#D97757; }
  .score-low    { stroke:#C9A84C; }
  .score-number { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:10px; font-weight:700; color:var(--ink); }
  .score-label { font-size:12px; font-weight:700; color:var(--ink); line-height:1.2; }
  .score-label small { display:block; font-size:10px; font-weight:500; color:var(--ink3); }
  .verified-badge { position:absolute; top:12px; right:12px; background:var(--accent); color:white; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:600; display:flex; align-items:center; gap:3px; }
  .verified-badge .material-symbols-rounded { font-size:13px; }
  .fav-btn { position:absolute; top:10px; left:10px; width:34px; height:34px; border-radius:50%; border:none; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:2; transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
  .fav-btn:hover { transform:scale(1.15); }
  .fav-btn .material-symbols-rounded { font-size:18px; color:var(--ink3); transition:color 0.2s; }
  .fav-btn.active .material-symbols-rounded { color:var(--gold); }
  @keyframes favPop { 0%{transform:scale(1);} 50%{transform:scale(1.4);} 100%{transform:scale(1);} }
  .fav-btn.pop { animation:favPop 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  .card-body { padding:16px; }
  .card-name-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
  .card-name { font-family:var(--font-fraunces),'Fraunces',serif; font-size:18px; font-weight:600; }
  .card-age  { font-size:14px; color:var(--ink3); }
  .card-meta { font-size:13px; color:var(--ink3); margin-bottom:12px; display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
  .card-meta .material-symbols-rounded { font-size:14px; }
  .dot { width:3px; height:3px; border-radius:50%; background:var(--border); display:inline-block; }
  .card-budget { display:flex; align-items:center; gap:6px; padding:8px 12px; background:var(--bg2); border-radius:8px; margin-bottom:12px; font-size:13px; font-weight:500; color:var(--ink2); }
  .card-budget .material-symbols-rounded { font-size:16px; color:var(--accent); }
  .card-budget strong { color:var(--ink); font-weight:700; }
  .card-traits { display:flex; flex-wrap:wrap; gap:6px; }
  .trait-tag { display:flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:500; background:var(--bg2); color:var(--ink2); border:1px solid var(--border); }
  .trait-tag .material-symbols-rounded { font-size:13px; color:var(--primary); }
  .card-footer { padding:12px 16px; border-top:1px solid var(--border); display:flex; gap:8px; }
  .btn-msg { flex:1; padding:9px; min-height:44px; border-radius:10px; border:none; background:var(--primary); color:white; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; font-family:var(--font-manrope),'Manrope',sans-serif; transition:background 0.2s; }
  .btn-msg:hover { background:#C4633F; }
  .btn-msg .material-symbols-rounded { font-size:16px; }
  .btn-profile { padding:9px 12px; min-height:44px; border-radius:10px; border:1.5px solid var(--border); background:var(--white); color:var(--ink2); font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; font-family:var(--font-manrope),'Manrope',sans-serif; transition:all 0.2s; }
  .btn-profile:hover { border-color:var(--ink); color:var(--ink); }
  .btn-profile .material-symbols-rounded { font-size:16px; }
  .empty-state { grid-column:1/-1; text-align:center; padding:80px 20px; }
  .empty-icon  { font-size:56px; margin-bottom:16px; display:block; }
  .empty-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:22px; font-weight:600; margin-bottom:8px; }
  .empty-sub   { font-size:14px; color:var(--ink3); }
  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); background:var(--ink); color:white; padding:12px 20px; border-radius:12px; font-size:14px; font-weight:500; display:flex; align-items:center; gap:8px; box-shadow:0 8px 24px rgba(0,0,0,0.2); transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1); z-index:1000; white-space:nowrap; }
  .toast.show { transform:translateX(-50%) translateY(0); }
  .bottomnav { display:flex; position:fixed; bottom:0; left:0; right:0; height:60px; background:var(--card); border-top:1px solid var(--border); z-index:200; box-shadow:0 -2px 16px rgba(26,15,10,0.07); padding-bottom:env(safe-area-inset-bottom,0px); }
  .bn-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; text-decoration:none; color:var(--ink3); font-size:10px; font-weight:600; font-family:var(--font-manrope),'Manrope',sans-serif; transition:color 0.2s; }
  .bn-item .material-symbols-rounded { font-size:22px; }
  .bn-item.active { color:var(--primary); }
  @media (min-width:768px) {
    .mc-nav { padding:0 32px; }
    .nav-links { display:flex; }
    .mc-root  { padding-bottom:0; }
    .mc-page  { padding:40px 32px 80px; }
    .page-title { font-size:36px; }
    .page-header { flex-direction:row; align-items:flex-end; gap:16px; }
    .matches-grid { grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
    .filter-bar { flex-wrap:wrap; overflow:visible; padding-bottom:0; scrollbar-width:auto; }
    .card-img { height:180px; }
    .bottomnav { display:none; }
  }
`

const EMOJIS = ['👩‍🎓', '👨‍💻', '🎨', '🏋️', '🌿', '🎸', '📚', '🧑‍🍳', '🎯', '🌸', '🦋', '🎵']
const BGS = ['bg-sage', 'bg-sky', 'bg-rose', 'bg-lavender', 'bg-mint', 'bg-peach']

function scoreColor(s: number) {
  return s >= 85 ? 'score-high' : s >= 70 ? 'score-medium' : 'score-low'
}

function ScoreRing({ score }: { score: number }) {
  const circ = 2 * Math.PI * 15
  const offset = circ - (score / 100) * circ
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(offset)
    }
  }, [offset])

  return (
    <div className="score-ring">
      <svg viewBox="0 0 36 36">
        <circle className="score-ring-bg" cx="18" cy="18" r="15" />
        <circle
          ref={ringRef}
          className={`score-ring-fill ${scoreColor(score)}`}
          cx="18" cy="18" r="15"
          strokeDasharray={circ.toFixed(2)}
          strokeDashoffset={circ.toFixed(2)}
        />
      </svg>
      <div className="score-number">{score}%</div>
    </div>
  )
}

interface ToastState { icon: string; msg: string; show: boolean }

export default function MatchesClient({
  cards,
  userRole,
  displayName,
  initialFavIds = [],
  userCity = '',
}: {
  cards: MatchCard[]
  userRole: string
  displayName: string
  initialFavIds?: string[]
  userCity?: string
}) {
  const [favs, setFavs] = useState<Set<string>>(() => new Set(initialFavIds))
  const [popFav, setPopFav] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'alle' | 'favoritter'>('alle')
  const [activeFilter, setActiveFilter] = useState(userCity.toLowerCase() || 'alle')
  const [sortBy, setSortBy] = useState('score')
  const [viewMode, setViewMode] = useState<'matches' | 'alle'>('matches')
  const [toast, setToast] = useState<ToastState>({ icon: '', msg: '', show: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pendingConv, setPendingConv] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function showToast(icon: string, msg: string) {
    setToast({ icon, msg, show: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800)
  }

  function toggleFav(e: React.MouseEvent, card: MatchCard) {
    e.stopPropagation()
    const id = card.id
    setPopFav(id)
    setTimeout(() => setPopFav(null), 350)
    const isCurrentlyFav = favs.has(id)
    setFavs(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        showToast('⭐', 'Fjernet fra favoritter')
      } else {
        next.add(id)
        showToast('⭐', 'Tilføjet til favoritter!')
      }
      return next
    })
    // Persist til DB (listing for søgende, profil for udlejere)
    if (card.listingId || card.otherProfileId) {
      startTransition(async () => {
        const saved = await toggleFavorite(card.listingId, card.listingId ? undefined : card.otherProfileId)
        // Korrigér state hvis server returnerer anderledes resultat
        if (saved !== !isCurrentlyFav) {
          setFavs(prev => {
            const next = new Set(prev)
            if (saved) next.add(id)
            else next.delete(id)
            return next
          })
        }
      })
    }
  }

  // ── FILTER + SORT ──
  function getList() {
    let list = [...cards]
    if (viewMode === 'matches') list = list.filter(c => c.score >= 70)
    if (activeFilter !== 'alle') list = list.filter(c => c.cityFilter === activeFilter || c.tags.includes(activeFilter))
    if (activeTab === 'favoritter') list = list.filter(c => favs.has(c.id))
    if (sortBy === 'budget-desc') list.sort((a, b) => b.budget - a.budget)
    else if (sortBy === 'budget-asc') list.sort((a, b) => a.budget - b.budget)
    else list.sort((a, b) => b.score - a.score)
    return list
  }

  const list = getList()

  // ── UNIQUE CITIES for filter chips ──
  const cities = Array.from(new Set(cards.map(c => c.cityFilter).filter(Boolean)))

  const totalCount = userRole === 'landlord' ? cards.length : cards.length
  const subtitle = activeTab === 'favoritter'
    ? `Du har gemt <strong>${list.length} favorit${list.length !== 1 ? 'ter' : ''}</strong>`
    : viewMode === 'matches'
      ? `Fandt <strong>${list.length} ${userRole === 'landlord' ? 'roomie' : 'bolig'}${list.length !== 1 ? userRole === 'landlord' ? 's' : 'er' : ''}</strong> der matcher din livsstil`
      : `Viser alle <strong>${list.length} ${userRole === 'landlord' ? 'rumies' : 'lejligheder'}</strong> — sorteret efter match`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mc-root">

        {/* NAV */}
        <nav className="mc-nav">
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

        <div className="mc-page">

          {/* PAGE HEADER */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Dine <span>matches</span></h1>
              <p
                className="page-subtitle"
                dangerouslySetInnerHTML={{ __html: subtitle }}
              />
            </div>
            <div className="header-controls">
              <div className="view-toggle">
                <button
                  className={'view-toggle-btn' + (viewMode === 'matches' ? ' active' : '')}
                  onClick={() => setViewMode('matches')}
                >
                  <span className="material-symbols-rounded">auto_awesome</span>
                  Bedste matches
                </button>
                <button
                  className={'view-toggle-btn' + (viewMode === 'alle' ? ' active' : '')}
                  onClick={() => setViewMode('alle')}
                >
                  <span className="material-symbols-rounded">grid_view</span>
                  {userRole === 'landlord' ? 'Se alle rumies' : 'Se alle lejligheder'}
                </button>
              </div>
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="score">Sortér: Bedste match</option>
                <option value="budget-desc">Sortér: Højeste budget</option>
                <option value="budget-asc">Sortér: Laveste budget</option>
              </select>
            </div>
          </div>

          {/* TABS */}
          <div className="tabs">
            <button
              className={'tab' + (activeTab === 'alle' ? ' active' : '')}
              onClick={() => setActiveTab('alle')}
            >
              <span className="material-symbols-rounded">people</span>
              Alle matches
              <span className="tab-badge">{cards.length}</span>
            </button>
            <button
              className={'tab' + (activeTab === 'favoritter' ? ' active' : '')}
              onClick={() => setActiveTab('favoritter')}
            >
              <span className="material-symbols-rounded">star</span>
              Favoritter
              <span className="tab-badge fav">{favs.size}</span>
            </button>
          </div>

          {/* FILTER BAR */}
          <div className="filter-bar">
            <button
              className={'filter-chip' + (activeFilter === 'alle' ? ' active' : '')}
              onClick={() => setActiveFilter('alle')}
            >
              Alle
            </button>
            {cities.map(city => (
              <button
                key={city}
                className={'filter-chip' + (activeFilter === city ? ' active' : '')}
                onClick={() => setActiveFilter(city)}
              >
                <span className="material-symbols-rounded">location_on</span>
                {city.charAt(0).toUpperCase() + city.slice(1)}
              </button>
            ))}
            {cards.some(c => c.tags.includes('dyrevenlig')) && (
              <button
                className={'filter-chip' + (activeFilter === 'dyrevenlig' ? ' active' : '')}
                onClick={() => setActiveFilter('dyrevenlig')}
              >
                <span className="material-symbols-rounded">pets</span>
                Dyrevenlig
              </button>
            )}
            {cards.some(c => c.tags.includes('ikke-ryger')) && (
              <button
                className={'filter-chip' + (activeFilter === 'ikke-ryger' ? ' active' : '')}
                onClick={() => setActiveFilter('ikke-ryger')}
              >
                <span className="material-symbols-rounded">smoke_free</span>
                Ikke-ryger
              </button>
            )}
          </div>

          {/* GRID */}
          <div className="matches-grid">
            {list.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  {activeTab === 'favoritter' ? '⭐' : '🔍'}
                </span>
                <div className="empty-title">
                  {activeTab === 'favoritter' ? 'Ingen favoritter endnu' : 'Ingen matches med dette filter'}
                </div>
                <div className="empty-sub">
                  {activeTab === 'favoritter'
                    ? 'Tryk på stjerne-ikonet på et kort for at gemme det.'
                    : 'Prøv at justere dine filtre.'}
                </div>
              </div>
            ) : (
              list.map((card, i) => {
                const circ = 2 * Math.PI * 15
                const isFav = favs.has(card.id)
                return (
                  <div
                    key={card.id}
                    className={'match-card' + (isFav ? ' is-favorite' : '')}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className={`card-img ${card.imageUrl ? '' : card.bg}`}>
                      {card.imageUrl
                        ? <img src={card.imageUrl} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : card.emoji}
                      <button
                        className={'fav-btn' + (isFav ? ' active' : '') + (popFav === card.id ? ' pop' : '')}
                        onClick={e => toggleFav(e, card)}
                        title="Favorit"
                      >
                        <span className="material-symbols-rounded">star</span>
                      </button>
                      {card.verified && (
                        <div className="verified-badge">
                          <span className="material-symbols-rounded">verified</span>
                          Verificeret
                        </div>
                      )}
                    </div>

                    <div className="card-body">
                      <div className="score-badge">
                        <ScoreRing score={card.score} />
                        <div className="score-label">Match<small>score</small></div>
                      </div>
                      <div className="card-name-row">
                        <span className="card-name">{card.name}</span>
                        {card.age && <span className="card-age">{card.age} år</span>}
                      </div>
                      <div className="card-meta">
                        <span className="material-symbols-rounded">location_on</span>
                        {card.area ? `${card.area}, ` : ''}{card.city}
                        {card.job && (
                          <>
                            <span className="dot" />
                            {card.job}
                          </>
                        )}
                      </div>
                      <div className="card-budget">
                        <span className="material-symbols-rounded">payments</span>
                        {userRole === 'landlord'
                          ? <>Kan betale op til <strong>{card.budget.toLocaleString('da-DK')} kr/md</strong></>
                          : <>Husleje <strong>{card.budget.toLocaleString('da-DK')} kr/md</strong></>
                        }
                      </div>
                      {card.tags.length > 0 && (
                        <div className="card-traits">
                          {card.tags.map(tag => (
                            <span key={tag} className="trait-tag">
                              <span className="material-symbols-rounded">check_circle</span>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <button
                        className="btn-msg"
                        disabled={pendingConv === card.id}
                        onClick={() => {
                          setPendingConv(card.id)
                          startTransition(() => startConversation(card.otherUserId, card.listingId))
                        }}
                      >
                        <span className="material-symbols-rounded">chat_bubble</span>
                        {pendingConv === card.id ? 'Opretter...' : 'Send besked'}
                      </button>
                      {card.otherProfileId ? (
                        <a
                          className="btn-profile"
                          href={`/profil/${card.otherProfileId}${card.listingId ? `?listing=${card.listingId}` : ''}`}
                        >
                          <span className="material-symbols-rounded">open_in_new</span>Profil
                        </a>
                      ) : (
                        <button className="btn-profile" disabled>
                          <span className="material-symbols-rounded">open_in_new</span>Profil
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* TOAST */}
        <div className={'toast' + (toast.show ? ' show' : '')}>
          <span>{toast.icon}</span>
          <span>{toast.msg}</span>
        </div>

        {/* BOTTOM NAV (mobile) */}
        <nav className="bottomnav">
          <a className="bn-item" href="/dashboard"><span className="material-symbols-rounded">home</span><span>Hjem</span></a>
          <a className="bn-item active" href="/matches"><span className="material-symbols-rounded">favorite</span><span>Matches</span></a>
          <a className="bn-item" href="/chat"><span className="material-symbols-rounded">chat_bubble</span><span>Beskeder</span></a>
        </nav>
      </div>
    </>
  )
}
