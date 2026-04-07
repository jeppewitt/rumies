'use client'

import { useState, useRef, useCallback, useTransition } from 'react'
import { createListing } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

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

  const fetchSuggestions = useCallback((q: string) => {
    if (!q || !CITIES.includes(city as City)) { setSuggestions([]); return }
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
        className="field-input"
        type="text"
        value={query}
        placeholder={city ? `Søg vejnavn i ${city}…` : 'Vælg by først'}
        disabled={!city}
        onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value) }}
        onBlur={handleBlur}
      />
      {open && suggestions.length > 0 && (
        <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--card)', border:'2px solid var(--border)', borderRadius:12, zIndex:50, boxShadow:'var(--shadow-md)', marginTop:4, overflow:'hidden' }}>
          {suggestions.map(s => (
            <div key={s} style={{ padding:'12px 16px', fontSize:15, cursor:'pointer', borderBottom:'1px solid var(--border)' }} onMouseDown={() => select(s)}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CSS = `
  :root {
    --bg:#F7F4EF; --card:#FFFFFF;
    --primary:#D97757; --primary-hover:#C4633F; --primary-soft:#F5E6DF;
    --accent:#7B9E87; --accent-soft:#E3EEE7;
    --ink:#1A0F0A; --ink2:#4A3528; --ink3:#9C7B6E;
    --border:#E8E0D8; --shadow-sm:0 1px 4px rgba(26,15,10,0.06); --shadow-md:0 4px 20px rgba(26,15,10,0.08);
  }
  .oo-root { font-family:var(--font-manrope),'Manrope',sans-serif; background:var(--bg); min-height:100vh; color:var(--ink); }
  .oo-nav { position:sticky; top:0; z-index:50; background:rgba(247,244,239,0.95); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); height:64px; padding:0 20px; display:flex; align-items:center; justify-content:space-between; }
  .nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; }
  .nav-logo svg { width:28px; height:28px; }
  .nav-logo-text { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:700; color:var(--ink); letter-spacing:-0.3px; }
  .nav-back { display:flex; align-items:center; gap:6px; font-size:14px; font-weight:600; color:var(--ink2); text-decoration:none; padding:8px 14px; border-radius:10px; border:1.5px solid var(--border); background:var(--card); transition:all 0.2s; }
  .nav-back:hover { border-color:var(--ink2); }
  .nav-back .material-symbols-rounded { font-size:18px; }
  .oo-page { max-width:560px; margin:0 auto; padding:40px 20px 80px; }
  .page-label { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--primary); margin-bottom:6px; }
  .page-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:clamp(26px,5vw,36px); font-weight:700; line-height:1.15; margin-bottom:8px; }
  .page-title em { font-style:italic; color:var(--primary); }
  .page-sub { font-size:15px; color:var(--ink3); margin-bottom:36px; line-height:1.6; }
  .form-grid { display:flex; flex-direction:column; gap:18px; margin-bottom:32px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .field-group { display:flex; flex-direction:column; gap:6px; }
  .field-label { font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink2); }
  .field-label span { font-weight:400; color:var(--ink3); text-transform:none; letter-spacing:0; }
  .field-input { padding:13px 16px; border-radius:12px; border:2px solid var(--border); background:var(--card); font-size:15px; font-weight:500; color:var(--ink); font-family:var(--font-manrope),'Manrope',sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; }
  .field-input:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(217,119,87,0.12); }
  .field-input.error { border-color:#E05252; }
  .field-input:disabled { opacity:0.5; cursor:not-allowed; }
  .field-select { padding:13px 16px; border-radius:12px; border:2px solid var(--border); background:var(--card); font-size:15px; font-weight:500; color:var(--ink); font-family:var(--font-manrope),'Manrope',sans-serif; outline:none; transition:border-color 0.2s; width:100%; appearance:none; cursor:pointer; }
  .field-select:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(217,119,87,0.12); }
  .field-select.error { border-color:#E05252; }
  .field-select:disabled { opacity:0.5; cursor:not-allowed; }
  .field-prefix { position:relative; }
  .field-prefix-label { position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:15px; font-weight:600; color:var(--ink3); pointer-events:none; }
  .field-prefix .field-input { padding-left:44px; }
  .field-suffix-label { position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:13px; font-weight:600; color:var(--ink3); pointer-events:none; }
  .error-msg { font-size:12px; color:#E05252; font-weight:600; }
  .upload-zone { border:2px dashed var(--border); border-radius:16px; padding:24px; text-align:center; cursor:pointer; position:relative; transition:border-color 0.2s,background 0.2s; background:var(--card); }
  .upload-zone:hover { border-color:var(--primary); background:var(--primary-soft); }
  .upload-zone.has-files { border-color:var(--accent); background:var(--accent-soft); border-style:solid; }
  .upload-input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
  .upload-icon .material-symbols-rounded { font-size:32px; color:var(--primary); }
  .upload-zone.has-files .upload-icon .material-symbols-rounded { color:var(--accent); }
  .upload-title { font-size:15px; font-weight:700; color:var(--ink); margin:8px 0 4px; }
  .upload-sub { font-size:13px; color:var(--ink3); }
  .upload-previews { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; justify-content:center; }
  .upload-thumb { width:64px; height:64px; object-fit:cover; border-radius:10px; border:2px solid var(--card); }
  .btn-primary { width:100%; padding:16px; border-radius:14px; background:var(--primary); color:white; font-size:16px; font-weight:700; border:none; cursor:pointer; font-family:var(--font-manrope),'Manrope',sans-serif; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-primary:hover { background:var(--primary-hover); }
  .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
  .btn-primary .material-symbols-rounded { font-size:20px; }
  .server-error { background:#FDF0EF; border:1.5px solid #F5C6C0; border-radius:12px; padding:12px 16px; font-size:14px; color:#C0392B; margin-bottom:20px; }
  @media (min-width:560px) {
    .oo-nav { padding:0 32px; }
  }
`

export default function OpretOpslagClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [street, setStreet] = useState('')
  const [rent, setRent] = useState('')
  const [sizeM2, setSizeM2] = useState('')
  const [sizeRoom, setSizeRoom] = useState('')
  const [moveDate, setMoveDate] = useState('')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  const districts = city && CITIES.includes(city as City) ? DISTRICTS[city as City] : []

  function setErr(key: string, hasError: boolean) {
    setErrors(prev => ({ ...prev, [key]: hasError }))
    return hasError
  }

  function handleUpload(files: FileList | null) {
    if (!files) return
    const MAX_MB = 5
    const arr = Array.from(files).slice(0, 8)
    const oversized = arr.filter(f => f.size > MAX_MB * 1024 * 1024)
    if (oversized.length) {
      setServerError(`Billeder må maks. være ${MAX_MB} MB — ${oversized.map(f => f.name).join(', ')} er for stor${oversized.length > 1 ? 'e' : ''}`)
      return
    }
    setServerError('')
    setUploadFiles(arr)
    setUploadPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  function validate() {
    let ok = true
    if (!city) ok = setErr('city', true) && false
    if (!rent || parseFloat(rent) <= 0) ok = setErr('rent', true) && false
    if (!sizeM2 || parseFloat(sizeM2) <= 0) ok = setErr('sizeM2', true) && false
    return ok
  }

  function handleSubmit() {
    if (!validate()) return
    startTransition(async () => {
      let imageUrls: string[] = []
      try {
        if (uploadFiles.length > 0) {
          const { uploadListingImages } = await import('@/lib/supabase/uploadListingImages')
          imageUrls = await uploadListingImages(uploadFiles, userId)
        }
      } catch {
        setServerError('Billedupload fejlede — prøv igen')
        return
      }

      const res = await createListing({
        city,
        district,
        street,
        price: Number(rent),
        sizeM2: Number(sizeM2),
        roomSizeM2: sizeRoom ? Number(sizeRoom) : null,
        availableFrom: moveDate || null,
        imageUrls,
      })

      if (res?.error) {
        setServerError(res.error)
      } else {
        router.push('/dashboard')
      }
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="oo-root">
        <nav className="oo-nav">
          <a className="nav-logo" href="/dashboard">
            <svg viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,24 2,24" fill="#D97757" />
              <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
            </svg>
            <span className="nav-logo-text">Rumies</span>
          </a>
          <a className="nav-back" href="/dashboard">
            <span className="material-symbols-rounded">arrow_back</span>
            Tilbage
          </a>
        </nav>

        <div className="oo-page">
          <div className="page-label">Udlejer</div>
          <h1 className="page-title">Opret dit <em>opslag</em></h1>
          <p className="page-sub">Fortæl om din bolig, så vi kan finde den rette roomie til dig.</p>

          {serverError && <div className="server-error">{serverError}</div>}

          <div className="form-grid">
            {/* By + Bydel */}
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">By</label>
                <select
                  className={'field-select' + (errors.city ? ' error' : '')}
                  value={city}
                  onChange={e => { setCity(e.target.value); setDistrict(''); setStreet(''); setErr('city', false) }}
                >
                  <option value="">Vælg by…</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <span className="error-msg">Vælg en by</span>}
              </div>
              <div className="field-group">
                <label className="field-label">Bydel</label>
                <select
                  className="field-select"
                  value={district}
                  disabled={!city}
                  onChange={e => setDistrict(e.target.value)}
                >
                  <option value="">{city ? 'Vælg bydel…' : 'Vælg by først'}</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Vejnavn */}
            <div className="field-group">
              <label className="field-label">Vejnavn <span>(valgfrit)</span></label>
              <StreetAutocomplete city={city} value={street} onChange={setStreet} />
            </div>

            {/* Husleje + Areal */}
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Husleje pr. måned</label>
                <div className="field-prefix">
                  <span className="field-prefix-label">kr.</span>
                  <input
                    className={'field-input' + (errors.rent ? ' error' : '')}
                    type="number" min="1000"
                    value={rent}
                    onChange={e => { setRent(e.target.value); setErr('rent', false) }}
                  />
                </div>
                {errors.rent && <span className="error-msg">Angiv husleje</span>}
              </div>
              <div className="field-group">
                <label className="field-label">Lejlighedens areal</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={'field-input' + (errors.sizeM2 ? ' error' : '')}
                    type="number" min="10"
                    style={{ paddingRight: 44 }}
                    value={sizeM2}
                    onChange={e => { setSizeM2(e.target.value); setErr('sizeM2', false) }}
                  />
                  <span className="field-suffix-label">m²</span>
                </div>
                {errors.sizeM2 && <span className="error-msg">Angiv størrelse</span>}
              </div>
            </div>

            {/* Værelse + Ledig fra */}
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Størrelse på værelse <span>(valgfrit)</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field-input"
                    type="number" min="5"
                    style={{ paddingRight: 44 }}
                    value={sizeRoom}
                    onChange={e => setSizeRoom(e.target.value)}
                  />
                  <span className="field-suffix-label">m²</span>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Ledig fra <span>(valgfrit)</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field-input"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={moveDate}
                    onChange={e => setMoveDate(e.target.value)}
                    style={{ paddingLeft: 44, color: moveDate ? 'var(--ink)' : 'transparent' }}
                  />
                  <span className="material-symbols-rounded" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--ink3)', fontSize:20, pointerEvents:'none' }}>calendar_today</span>
                  {!moveDate && <span style={{ position:'absolute', left:44, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'var(--ink3)', pointerEvents:'none' }}>Vælg dato</span>}
                </div>
              </div>
            </div>

            {/* Billeder */}
            <div className="field-group">
              <label className="field-label">Billeder af lejligheden <span>(valgfrit)</span></label>
              <div className={'upload-zone' + (uploadFiles.length > 0 ? ' has-files' : '')}>
                <input type="file" className="upload-input" accept="image/*" multiple onChange={e => handleUpload(e.target.files)} />
                <div className="upload-icon">
                  <span className="material-symbols-rounded">add_photo_alternate</span>
                </div>
                <div className="upload-title">
                  {uploadFiles.length > 0 ? `${uploadFiles.length} billede${uploadFiles.length > 1 ? 'r' : ''} valgt` : 'Upload billeder'}
                </div>
                <div className="upload-sub">
                  {uploadFiles.length > 0 ? 'Klik for at ændre valg' : 'Træk og slip, eller klik for at vælge · Maks. 8 billeder · 5 MB pr. stk.'}
                </div>
                {uploadPreviews.length > 0 && (
                  <div className="upload-previews">
                    {uploadPreviews.map((src, i) => <img key={i} className="upload-thumb" src={src} alt="" />)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Opretter…' : 'Opret opslag'}
            {!isPending && <span className="material-symbols-rounded">check</span>}
          </button>
        </div>
      </div>
    </>
  )
}
