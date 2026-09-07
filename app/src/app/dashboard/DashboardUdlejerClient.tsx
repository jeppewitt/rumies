'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { signOut } from '@/app/actions/auth'
import { toggleListingActive, updateListing } from '@/app/actions/profile'

const CITIES = ['København', 'Aarhus', 'Odense'] as const
type City = typeof CITIES[number]
const DISTRICTS: Record<City, string[]> = {
  'København': ['Indre By', 'Nørrebro', 'Vesterbro', 'Østerbro', 'Amager Øst', 'Amager Vest', 'Valby', 'Vanløse', 'Bispebjerg', 'Brønshøj', 'Frederiksberg'],
  'Aarhus':    ['Aarhus C', 'Aarhus N', 'Aarhus V', 'Trøjborg', 'Risskov', 'Hasle', 'Viby J', 'Brabrand', 'Åbyhøj', 'Skejby', 'Højbjerg'],
  'Odense':    ['Odense C', 'Odense N', 'Odense NV', 'Odense S', 'Odense SV', 'Bolbro', 'Dalum', 'Vollsmose'],
}
const MUNICIPALITY_CODES: Record<City, string> = {
  'København': '0101', 'Aarhus': '0751', 'Odense': '0461',
}

function StreetAutocomplete({ city, value, onChange }: { city: string; value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const confirmed = useRef(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQuery(value); confirmed.current = value }, [value])

  const fetch_ = useCallback((q: string) => {
    if (!q || !city || !CITIES.includes(city as City)) { setSuggestions([]); return }
    const code = MUNICIPALITY_CODES[city as City]
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.dataforsyningen.dk/vejnavne/autocomplete?q=${encodeURIComponent(q)}&kommunekode=${code}&per_side=8`)
        const data = await res.json()
        setSuggestions((data as { vejnavn: { navn: string } }[]).map(d => d.vejnavn.navn))
        setOpen(true)
      } catch { setSuggestions([]) }
    }, 250)
  }, [city])

  function select(name: string) {
    setQuery(name); onChange(name); confirmed.current = name
    setSuggestions([]); setOpen(false)
  }

  function handleBlur() {
    setTimeout(() => { setOpen(false); setQuery(confirmed.current) }, 150)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="edit-input"
        type="text"
        value={query}
        placeholder={city ? `Søg vejnavn i ${city}…` : 'Vælg by først'}
        disabled={!city}
        onChange={e => { setQuery(e.target.value); fetch_(e.target.value) }}
        onBlur={handleBlur}
      />
      {open && suggestions.length > 0 && (
        <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--card)', border:'1.5px solid var(--border)', borderRadius:10, zIndex:50, boxShadow:'var(--shadow-md)', marginTop:4, overflow:'hidden' }}>
          {suggestions.map(s => (
            <div
              key={s}
              style={{ padding:'10px 14px', fontSize:14, cursor:'pointer', borderBottom:'1px solid var(--border)' }}
              onMouseDown={() => select(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export type InterestedPerson = {
  id: string
  name: string
  age?: number
  emoji: string
  location: string
  budget?: number
  score: number
  verified: boolean
  isNew: boolean
  traits: string[]
}

type Listing = {
  title: string
  city: string
  district?: string
  street?: string
  price: number
  size?: number
  roomSize?: number
  availableFrom: string
  availableFromRaw?: string
  imageUrls: string[]
  isActive: boolean
  tags: string[]
}

type Props = {
  displayName: string
  stats: { viewCount: number; conversationCount: number }
  listing?: Listing
  interested: InterestedPerson[]
  profileId: string
  listingId?: string
  userId: string
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
  .du-root { font-family:var(--font-manrope),'Manrope',sans-serif; background:var(--bg); color:var(--ink); min-height:100vh; padding-bottom:calc(60px + env(safe-area-inset-bottom,0px)); }
  .du-nav { z-index:100; background:rgba(247,244,239,0.95); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:0 16px; height:64px; display:flex; align-items:center; justify-content:space-between; }
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
  .logout-btn:hover { border-color:#D97757; color:#D97757; background:var(--primary-soft); }
  .logout-btn .material-symbols-rounded { font-size:18px; }
  .du-page { max-width:1100px; margin:0 auto; padding:20px 16px 80px; }
  .page-label { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--primary); margin-bottom:6px; }
  .page-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:32px; font-weight:700; line-height:1.1; margin-bottom:6px; }
  .page-title em { font-style:italic; color:var(--primary); }
  .page-sub { font-size:14px; color:var(--ink3); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .stats-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:32px; }
  .stat-card { background:var(--card); border-radius:16px; border:1px solid var(--border); padding:20px; box-shadow:var(--shadow-sm); animation:fadeUp 0.4s ease both; }
  .stat-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
  .stat-icon .material-symbols-rounded { font-size:22px; }
  .stat-icon.orange { background:var(--primary-soft); } .stat-icon.orange .material-symbols-rounded { color:var(--primary); }
  .stat-icon.green  { background:var(--accent-soft);  } .stat-icon.green  .material-symbols-rounded { color:var(--accent); }
  .stat-icon.gold   { background:var(--gold-soft);    } .stat-icon.gold   .material-symbols-rounded { color:var(--gold); }
  .stat-val { font-family:var(--font-fraunces),'Fraunces',serif; font-size:24px; font-weight:700; color:var(--ink); line-height:1; margin-bottom:4px; }
  .stat-label { font-size:13px; color:var(--ink3); }
  .apt-card { background:var(--card); border-radius:20px; border:1px solid var(--border); padding:24px; margin-bottom:28px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:16px; animation:fadeUp 0.4s 0.1s ease both; }
  .apt-img { width:120px; height:88px; border-radius:12px; flex-shrink:0; background:linear-gradient(135deg,#E8C9BC,#F5DEC0); display:flex; align-items:center; justify-content:center; font-size:40px; border:1px solid var(--border); }
  .apt-info { flex:1; }
  .apt-address { font-family:var(--font-fraunces),'Fraunces',serif; font-size:18px; font-weight:700; color:var(--ink); margin-bottom:4px; }
  .apt-meta { font-size:13px; color:var(--ink3); margin-bottom:12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .apt-meta .material-symbols-rounded { font-size:14px; }
  .apt-dot { width:3px; height:3px; border-radius:50%; background:var(--border); display:inline-block; }
  .apt-tags { display:flex; gap:8px; flex-wrap:wrap; }
  .apt-tag { font-size:12px; font-weight:600; padding:5px 12px; border-radius:999px; background:var(--bg); color:var(--ink2); border:1px solid var(--border); display:inline-flex; align-items:center; gap:5px; }
  .apt-tag .material-symbols-rounded { font-size:13px; color:var(--primary); }
  .apt-actions { display:flex; flex-direction:column; gap:8px; flex-shrink:0; }
  .apt-btn { padding:9px 18px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; display:flex; align-items:center; gap:6px; white-space:nowrap; }
  .apt-btn.primary { background:var(--primary); color:white; border:none; }
  .apt-btn.primary:hover { background:var(--primary-hover); }
  .apt-btn.secondary { background:var(--card); color:var(--ink2); border:1.5px solid var(--border); }
  .apt-btn.secondary:hover { border-color:var(--ink2); }
  .apt-btn.share { background:var(--accent-soft); color:var(--accent); border:1.5px solid transparent; }
  .apt-btn.share:hover { border-color:var(--accent); }
  .apt-btn.rented { background:#FDF0EF; color:#C0392B; border:1.5px solid #F5C6C0; }
  .apt-btn.rented:hover { background:#FAE0DE; }
  .apt-btn.reactivate { background:var(--accent-soft); color:var(--accent); border:1.5px solid transparent; }
  .apt-btn.reactivate:hover { border-color:var(--accent); }
  .apt-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .apt-btn .material-symbols-rounded { font-size:16px; }
  .apt-inactive-banner { background:#FDF5F2; border:1.5px solid #E8C9BC; border-radius:12px; padding:10px 16px; margin-bottom:12px; font-size:13px; color:var(--ink2); display:flex; align-items:center; gap:8px; }
  .apt-inactive-banner .material-symbols-rounded { font-size:16px; color:#D97757; flex-shrink:0; }
  .no-listing { background:var(--card); border-radius:20px; border:2px dashed var(--border); padding:40px 24px; margin-bottom:28px; text-align:center; }
  .no-listing-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:18px; font-weight:600; color:var(--ink2); margin-bottom:8px; }
  .no-listing-sub { font-size:14px; color:var(--ink3); margin-bottom:20px; }
  .no-listing-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; background:var(--primary); color:white; border:none; font-size:14px; font-weight:700; cursor:pointer; font-family:var(--font-manrope),'Manrope',sans-serif; transition:background 0.2s; }
  .no-listing-btn:hover { background:var(--primary-hover); }
  .tabs { display:flex; border-bottom:1.5px solid var(--border); margin-bottom:24px; }
  .tab { display:flex; align-items:center; gap:6px; padding:12px 20px; font-size:14px; font-weight:600; color:var(--ink3); cursor:pointer; border-bottom:2.5px solid transparent; margin-bottom:-1.5px; transition:all 0.2s; background:none; border-top:none; border-left:none; border-right:none; font-family:var(--font-manrope),'Manrope',sans-serif; }
  .tab:hover { color:var(--ink); }
  .tab.active { color:var(--primary); border-bottom-color:var(--primary); }
  .tab .material-symbols-rounded { font-size:17px; }
  .tab-badge { background:var(--primary); color:white; font-size:11px; font-weight:700; padding:2px 7px; border-radius:999px; line-height:1.4; }
  .interested-grid { display:flex; flex-direction:column; gap:14px; }
  @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .interested-card { background:var(--card); border-radius:16px; border:1.5px solid var(--border); padding:20px; display:flex; flex-wrap:wrap; align-items:center; gap:12px; transition:all 0.2s; animation:cardIn 0.4s ease both; }
  .interested-card:hover { box-shadow:var(--shadow-md); border-color:var(--primary-soft); transform:translateY(-1px); }
  .interested-card.new-req { border-color:var(--primary); }
  .interested-avatar { width:56px; height:56px; border-radius:50%; flex-shrink:0; background:var(--bg); display:flex; align-items:center; justify-content:center; font-size:26px; border:2px solid var(--border); position:relative; }
  .verified-dot { position:absolute; bottom:0; right:0; width:18px; height:18px; border-radius:50%; background:var(--accent); border:2px solid var(--card); display:flex; align-items:center; justify-content:center; }
  .verified-dot .material-symbols-rounded { font-size:11px; color:white; }
  .interested-info { flex:1; min-width:0; }
  .interested-name-row { display:flex; align-items:center; gap:8px; margin-bottom:3px; flex-wrap:wrap; }
  .interested-name { font-family:var(--font-fraunces),'Fraunces',serif; font-size:16px; font-weight:700; color:var(--ink); }
  .new-badge { background:var(--primary); color:white; font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; }
  .interested-meta { font-size:13px; color:var(--ink3); margin-bottom:10px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .interested-meta .material-symbols-rounded { font-size:14px; }
  .meta-dot { width:3px; height:3px; border-radius:50%; background:var(--border); display:inline-block; }
  .interested-traits { display:flex; gap:6px; flex-wrap:wrap; }
  .trait { font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; background:var(--bg); color:var(--ink2); border:1px solid var(--border); display:inline-flex; align-items:center; gap:4px; }
  .trait .material-symbols-rounded { font-size:12px; color:var(--primary); }
  .interested-score { flex-shrink:0; text-align:center; display:flex; flex-direction:column; align-items:center; gap:4px; order:-1; }
  .score-ring { width:48px; height:48px; position:relative; }
  .score-ring svg { transform:rotate(-90deg); width:48px; height:48px; }
  .ring-bg   { fill:none; stroke:var(--border); stroke-width:4; }
  .ring-fill { fill:none; stroke-width:4; stroke-linecap:round; transition:stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1); }
  .ring-high   { stroke:var(--accent); }
  .ring-medium { stroke:var(--primary); }
  .ring-num { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:11px; font-weight:800; color:var(--ink); }
  .score-label { font-size:11px; font-weight:600; color:var(--ink3); }
  .interested-actions { display:flex; flex-direction:column; gap:7px; flex-shrink:0; width:100%; margin-top:4px; }
  .action-btn { padding:8px 16px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; display:flex; align-items:center; gap:5px; white-space:nowrap; }
  .action-btn.primary { background:var(--primary); color:white; border:none; }
  .action-btn.primary:hover { background:var(--primary-hover); }
  .action-btn.secondary { background:var(--card); color:var(--ink2); border:1.5px solid var(--border); }
  .action-btn.secondary:hover { border-color:var(--ink2); }
  .action-btn.danger { background:var(--card); color:#C0392B; border:1.5px solid #F5C6C0; }
  .action-btn.danger:hover { background:#FDF0EF; }
  .action-btn .material-symbols-rounded { font-size:15px; }
  .empty-state { text-align:center; padding:64px 20px; }
  .empty-icon { font-size:48px; margin-bottom:16px; }
  .empty-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:600; color:var(--ink2); margin-bottom:8px; }
  .empty-sub { font-size:14px; color:var(--ink3); }
  .edit-panel { overflow:hidden; max-height:0; transition:max-height 0.35s ease, opacity 0.25s ease; opacity:0; }
  .edit-panel.open { max-height:700px; opacity:1; }
  .edit-panel-inner { padding-top:16px; border-top:1px solid var(--border); margin-top:16px; display:flex; flex-direction:column; gap:12px; }
  .edit-field { display:flex; flex-direction:column; gap:5px; }
  .edit-label { font-size:12px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink3); }
  .edit-select, .edit-input { width:100%; padding:10px 12px; border-radius:10px; border:1.5px solid var(--border); font-size:14px; font-family:var(--font-manrope),'Manrope',sans-serif; color:var(--ink); background:var(--bg); outline:none; transition:border-color 0.2s; appearance:none; }
  .edit-select:focus, .edit-input:focus { border-color:var(--primary); }
  .edit-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .img-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .img-thumb { position:relative; border-radius:10px; overflow:hidden; aspect-ratio:4/3; background:var(--bg); border:1.5px solid var(--border); }
  .img-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
  .img-remove { position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; background:rgba(26,15,10,0.6); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:white; }
  .img-remove .material-symbols-rounded { font-size:14px; }
  .img-add { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; aspect-ratio:4/3; border-radius:10px; border:2px dashed var(--border); cursor:pointer; transition:border-color 0.2s; background:none; font-family:var(--font-manrope),'Manrope',sans-serif; }
  .img-add:hover { border-color:var(--primary); }
  .img-add .material-symbols-rounded { font-size:24px; color:var(--ink3); }
  .img-add span { font-size:11px; color:var(--ink3); font-weight:600; }
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
    .du-nav { position:sticky; top:0; padding:0 32px; }
    .nav-links { display:flex; }
    .du-root { padding-bottom:0; }
    .du-page { padding:36px 32px 80px; }
    .stats-row { grid-template-columns:repeat(3,1fr); gap:14px; }
    .stat-val { font-size:28px; }
    .apt-card { flex-direction:row; gap:24px; align-items:center; }
    .interested-card { flex-wrap:nowrap; gap:18px; }
    .interested-actions { width:auto; margin-top:0; }
    .interested-score { order:0; }
    .bottomnav { display:none; }
  }
`

export default function DashboardUdlejerClient({ displayName, stats, listing, interested, profileId, listingId, userId }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'interesserede' | 'nye' | 'arkiv'>('interesserede')
  const [toast, setToast] = useState<ToastState>({ icon: '', msg: '', show: false })
  const [animated, setAnimated] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [listingActive, setListingActive] = useState(listing?.isActive ?? true)
  const [listingPending, startListingTransition] = useTransition()

  // Edit panel
  const [editOpen, setEditOpen] = useState(false)
  const [editCity, setEditCity] = useState(listing?.city ?? '')
  const [editDistrict, setEditDistrict] = useState(listing?.district ?? '')
  const [editStreet, setEditStreet] = useState(listing?.street ?? '')
  const [editPrice, setEditPrice] = useState(listing?.price ? String(listing.price) : '')
  const [editSize, setEditSize] = useState(listing?.size ? String(listing.size) : '')
  const [editRoomSize, setEditRoomSize] = useState(listing?.roomSize ? String(listing.roomSize) : '')
  const [editDate, setEditDate] = useState(listing?.availableFromRaw ?? '')
  const [editImages, setEditImages] = useState<string[]>(listing?.imageUrls ?? [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [savePending, startSave] = useTransition()

  const editDistricts = editCity && CITIES.includes(editCity as City) ? DISTRICTS[editCity as City] : []

  function openEdit() {
    setEditCity(listing?.city ?? '')
    setEditDistrict(listing?.district ?? '')
    setEditStreet(listing?.street ?? '')
    setEditPrice(listing?.price ? String(listing.price) : '')
    setEditSize(listing?.size ? String(listing.size) : '')
    setEditRoomSize(listing?.roomSize ? String(listing.roomSize) : '')
    setEditDate(listing?.availableFromRaw ?? '')
    setEditImages(listing?.imageUrls ?? [])
    setEditOpen(true)
  }

  async function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const MAX_MB = 5
    const oversized = files.filter(f => f.size > MAX_MB * 1024 * 1024)
    if (oversized.length) {
      showToast('❌', `Maks. ${MAX_MB} MB pr. billede`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const { uploadListingImages } = await import('@/lib/supabase/uploadListingImages')
      const urls = await uploadListingImages(files, userId)
      setEditImages(prev => [...prev, ...urls])
    } catch {
      showToast('❌', 'Upload fejlede — prøv igen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleSaveListing() {
    if (!listingId) return
    startSave(async () => {
      const res = await updateListing(listingId, {
        city: editCity,
        district: editDistrict,
        street: editStreet,
        price: editPrice ? Number(editPrice) : null,
        sizeM2: editSize ? Number(editSize) : null,
        roomSizeM2: editRoomSize ? Number(editRoomSize) : null,
        availableFrom: editDate || null,
        imageUrls: editImages,
      })
      if (res?.error) {
        showToast('❌', 'Noget gik galt — prøv igen')
      } else {
        setEditOpen(false)
        showToast('✅', 'Opslag opdateret!')
      }
    })
  }

  function handleToggleListing() {
    if (!listingId) return
    const newVal = !listingActive
    setListingActive(newVal)
    startListingTransition(async () => {
      const res = await toggleListingActive(listingId, newVal)
      if (res?.error) {
        setListingActive(!newVal)
        showToast('❌', 'Noget gik galt — prøv igen')
      } else {
        showToast(newVal ? '✅' : '🎉', newVal ? 'Boligen er nu synlig igen' : 'Boligen er markeret som udlejet')
      }
    })
  }

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [])

  function showToast(icon: string, msg: string) {
    setToast({ icon, msg, show: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800)
  }

  function dismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]))
    showToast('🗑️', 'Ansøgning arkiveret')
  }

  function getList() {
    if (activeTab === 'arkiv') return interested.filter(p => dismissed.has(p.id))
    const base = interested.filter(p => !dismissed.has(p.id))
    if (activeTab === 'nye') return base.filter(p => p.isNew)
    return base
  }

  const list = getList()
  const activeCount = interested.filter(p => !dismissed.has(p.id)).length
  const newCount = interested.filter(p => p.isNew && !dismissed.has(p.id)).length
  const circ20 = 2 * Math.PI * 20

  const aptAddress = listing
    ? [listing.district, listing.city].filter(Boolean).join(', ')
    : ''

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="du-root">

        <nav className="du-nav">
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

        <div className="du-page">

          <div className="page-label">Udlejer</div>
          <h1 className="page-title">Godmorgen, <em>{displayName}</em> 👋</h1>
          <p className="page-sub" style={{ marginBottom: 32 }}>
            {newCount > 0
              ? `Du har ${newCount} nye interesserede siden sidst — her er et overblik.`
              : 'Her er et overblik over din bolig og interesserede.'}
          </p>

          {/* STATS */}
          <div className="stats-row">
            <div className="stat-card" style={{ animationDelay: '0s' }}>
              <div className="stat-icon orange"><span className="material-symbols-rounded">visibility</span></div>
              <div className="stat-val">{stats.viewCount}</div>
              <div className="stat-label">Boligvisninger</div>
            </div>
            <div className="stat-card" style={{ animationDelay: '0.06s' }}>
              <div className="stat-icon gold"><span className="material-symbols-rounded">chat_bubble</span></div>
              <div className="stat-val">{stats.conversationCount}</div>
              <div className="stat-label">Samtaler i alt</div>
            </div>
            <div className="stat-card" style={{ animationDelay: '0.12s' }}>
              <div className="stat-icon green"><span className="material-symbols-rounded">new_releases</span></div>
              <div className="stat-val">{newCount}</div>
              <div className="stat-label">Nye i dag</div>
            </div>
          </div>

          {/* APARTMENT CARD */}
          {listing ? (
            <>
            <div className="apt-card">
              <div className="apt-img">
                {listing.imageUrls?.[0]
                  ? <img src={listing.imageUrls[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  : '🏠'}
              </div>
              <div className="apt-info">
                {!listingActive && (
                  <div className="apt-inactive-banner">
                    <span className="material-symbols-rounded">visibility_off</span>
                    Boligen er markeret som udlejet og er ikke synlig for søgende.
                  </div>
                )}
                <div className="apt-address">{aptAddress || listing.title}</div>
                <div className="apt-meta">
                  {listing.size && <><span className="material-symbols-rounded">square_foot</span>{listing.size} m²</>}
                  {listing.roomSize && <><span className="apt-dot" /><span className="material-symbols-rounded">single_bed</span>{listing.roomSize} m² værelse</>}
                  <span className="apt-dot" />
                  <span className="material-symbols-rounded">payments</span>
                  {listing.price.toLocaleString('da-DK')} kr/md
                  {listing.availableFrom && (
                    <><span className="apt-dot" /><span className="material-symbols-rounded">calendar_today</span>Ledig fra {listing.availableFrom}</>
                  )}
                </div>
                <div className="apt-tags">
                  {(listingActive ? ['Synlig'] : ['Inaktiv']).map(tag => (
                    <span key={tag} className="apt-tag">
                      <span className="material-symbols-rounded">
                        {tag === 'Synlig' ? 'visibility' : 'visibility_off'}
                      </span>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="apt-actions">
                <button className="apt-btn primary" onClick={() => editOpen ? setEditOpen(false) : openEdit()}>
                  <span className="material-symbols-rounded">{editOpen ? 'close' : 'edit'}</span>
                  {editOpen ? 'Luk' : 'Redigér opslag'}
                </button>
                {listingId && (
                  listingActive ? (
                    <button className="apt-btn rented" onClick={handleToggleListing} disabled={listingPending}>
                      <span className="material-symbols-rounded">check_circle</span>Marker som udlejet
                    </button>
                  ) : (
                    <button className="apt-btn reactivate" onClick={handleToggleListing} disabled={listingPending}>
                      <span className="material-symbols-rounded">play_circle</span>Genudlej boligen
                    </button>
                  )
                )}
                {listingId && (
                  <button className="apt-btn share" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/profil/${profileId}?listing=${listingId}`)
                    showToast('🔗', 'Boliglink kopieret!')
                  }}>
                    <span className="material-symbols-rounded">share</span>Del din bolig
                  </button>
                )}
              </div>
            </div>
            <div className={'edit-panel' + (editOpen ? ' open' : '')}>
              <div className="edit-panel-inner">
                <div className="edit-row">
                  <div className="edit-field">
                    <label className="edit-label">By</label>
                    <select className="edit-select" value={editCity} onChange={e => { setEditCity(e.target.value); setEditDistrict(''); setEditStreet('') }}>
                      <option value="">Vælg by</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Bydel</label>
                    <select className="edit-select" value={editDistrict} onChange={e => setEditDistrict(e.target.value)} disabled={editDistricts.length === 0}>
                      <option value="">Vælg bydel</option>
                      {editDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Vejnavn</label>
                  <StreetAutocomplete city={editCity} value={editStreet} onChange={setEditStreet} />
                </div>
                <div className="edit-row">
                  <div className="edit-field">
                    <label className="edit-label">Husleje (kr/md)</label>
                    <input className="edit-input" type="number" min={0} step={500} value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="F.eks. 7500" />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Lejlighedens areal (m²)</label>
                    <input className="edit-input" type="number" min={1} value={editSize} onChange={e => setEditSize(e.target.value)} placeholder="F.eks. 65" />
                  </div>
                </div>
                <div className="edit-row">
                  <div className="edit-field">
                    <label className="edit-label">Størrelse på værelse (m²)</label>
                    <input className="edit-input" type="number" min={1} value={editRoomSize} onChange={e => setEditRoomSize(e.target.value)} placeholder="Valgfrit" />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Ledig fra</label>
                    <input className="edit-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Billeder</label>
                  <div className="img-grid">
                    {editImages.map((url, i) => (
                      <div key={url} className="img-thumb">
                        <img src={url} alt={`Billede ${i + 1}`} />
                        <button className="img-remove" onClick={() => setEditImages(prev => prev.filter((_, j) => j !== i))}>
                          <span className="material-symbols-rounded">close</span>
                        </button>
                      </div>
                    ))}
                    {editImages.length < 6 && (
                      <button className="img-add" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <span className="material-symbols-rounded">{uploading ? 'hourglass_empty' : 'add_photo_alternate'}</span>
                        <span>{uploading ? 'Uploader…' : 'Tilføj'}</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageAdd} />
                </div>
                <div className="edit-actions">
                  <button className="edit-cancel" onClick={() => setEditOpen(false)}>Annuller</button>
                  <button className="edit-save" onClick={handleSaveListing} disabled={savePending || uploading || !editCity}>
                    {savePending ? 'Gemmer…' : 'Gem ændringer'}
                  </button>
                </div>
              </div>
            </div>
            </>
          ) : (
            <div className="no-listing">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
              <div className="no-listing-title">Du har ingen aktiv bolig endnu</div>
              <div className="no-listing-sub">Opret dit første opslag for at tiltrække potentielle roomies.</div>
              <a className="no-listing-btn" href="/opret-opslag">
                <span className="material-symbols-rounded">add</span>Opret opslag
              </a>
            </div>
          )}

          {/* TABS */}
          <div className="tabs">
            <button
              className={'tab' + (activeTab === 'interesserede' ? ' active' : '')}
              onClick={() => setActiveTab('interesserede')}
            >
              <span className="material-symbols-rounded">people</span>Interesserede
              <span className="tab-badge">{activeCount}</span>
            </button>
            <button
              className={'tab' + (activeTab === 'nye' ? ' active' : '')}
              onClick={() => setActiveTab('nye')}
            >
              <span className="material-symbols-rounded">new_releases</span>Nye i dag
              <span className="tab-badge">{newCount}</span>
            </button>
            <button
              className={'tab' + (activeTab === 'arkiv' ? ' active' : '')}
              onClick={() => setActiveTab('arkiv')}
            >
              <span className="material-symbols-rounded">archive</span>Arkiv
            </button>
          </div>

          {/* INTERESTED GRID */}
          <div className="interested-grid">
            {list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{activeTab === 'nye' ? '🎉' : '🏠'}</div>
                <div className="empty-title">
                  {activeTab === 'nye' ? 'Ingen nye i dag' : activeTab === 'arkiv' ? 'Arkivet er tomt' : 'Ingen interesserede endnu'}
                </div>
                <div className="empty-sub">
                  {activeTab === 'nye'
                    ? 'Nye interesserede vises her så snart nogen udtrykker interesse.'
                    : activeTab === 'arkiv'
                    ? 'Afviste ansøgninger vises her.'
                    : 'Del dit opslag for at tiltrække potentielle roomies.'}
                </div>
              </div>
            ) : list.map((p, i) => {
              const offset = circ20 - (p.score / 100) * circ20
              return (
                <div
                  key={p.id}
                  className={'interested-card' + (p.isNew && activeTab !== 'arkiv' ? ' new-req' : '')}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="interested-avatar">
                    {p.emoji}
                    {p.verified && (
                      <div className="verified-dot">
                        <span className="material-symbols-rounded">check</span>
                      </div>
                    )}
                  </div>
                  <div className="interested-info">
                    <div className="interested-name-row">
                      <span className="interested-name">{p.name}{p.age ? `, ${p.age}` : ''}</span>
                      {p.isNew && activeTab !== 'arkiv' && <span className="new-badge">Ny</span>}
                    </div>
                    <div className="interested-meta">
                      <span className="material-symbols-rounded">location_on</span>
                      {p.location}
                      {p.budget && (
                        <>
                          <span className="meta-dot" />
                          <span className="material-symbols-rounded">payments</span>
                          {p.budget.toLocaleString('da-DK')} kr/md
                        </>
                      )}
                    </div>
                    {p.traits.length > 0 && (
                      <div className="interested-traits">
                        {p.traits.map(t => (
                          <span key={t} className="trait">
                            <span className="material-symbols-rounded">check_circle</span>{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="interested-score">
                    <div className="score-ring">
                      <svg viewBox="0 0 48 48">
                        <circle className="ring-bg" cx="24" cy="24" r="20" />
                        <circle
                          className={'ring-fill ' + (p.score >= 80 ? 'ring-high' : 'ring-medium')}
                          cx="24" cy="24" r="20"
                          strokeDasharray={circ20.toFixed(1)}
                          strokeDashoffset={animated ? offset.toFixed(1) : circ20.toFixed(1)}
                        />
                      </svg>
                      <div className="ring-num">{p.score}%</div>
                    </div>
                    <div className="score-label">Match</div>
                  </div>
                  <div className="interested-actions">
                    <a className="action-btn primary" href="/chat">
                      <span className="material-symbols-rounded">chat_bubble</span>Skriv
                    </a>
                    <a className="action-btn secondary" href={`/profil/${p.id}`} target="_blank" rel="noopener noreferrer">
                      <span className="material-symbols-rounded">open_in_new</span>Profil
                    </a>
                    {activeTab !== 'arkiv' && (
                      <button className="action-btn danger" onClick={() => dismiss(p.id)}>
                        <span className="material-symbols-rounded">close</span>Afvis
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
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
