'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signUpFromQuiz } from './actions'

// ── QUIZ DATA ──────────────────────────────────────────────────
const QUIZ = [
  { cat: 'Søvnvaner', catIcon: 'bedtime',
    q: 'Hvornår vågner du normalt op på hverdage?',
    sub: 'Din morgenrytme er en af de vigtigste faktorer i et godt roomie-match.',
    opts: [
      { icon: 'wb_twilight',  title: 'Tidlig fugl',    sub: 'Oppe inden kl. 7',              val: 'early' },
      { icon: 'wb_sunny',     title: 'Morgenmenneske', sub: 'Oppe kl. 7–9',                  val: 'morning' },
      { icon: 'schedule',     title: 'Formiddagstype', sub: 'Oppe kl. 9–11',                 val: 'mid' },
      { icon: 'nights_stay',  title: 'Natteravn',      sub: 'Oppe efter kl. 11 eller senere', val: 'night' },
    ]
  },
  { cat: 'Søvnvaner', catIcon: 'bedtime',
    q: 'Hvornår går du typisk i seng?',
    sub: 'En roomie med samme sengetid giver ro til begge parter.',
    opts: [
      { icon: 'bedtime',      title: 'Inden 22:00',  sub: 'Tidlig sengetid',           val: 'early-bed' },
      { icon: 'dark_mode',    title: '22–24',        sub: 'Gennemsnitlig sengetid',     val: 'avg-bed' },
      { icon: 'local_bar',    title: 'Sent',         sub: 'Ofte oppe efter midnat',     val: 'late-bed' },
    ]
  },
  { cat: 'Ryddelighed', catIcon: 'cleaning_services',
    q: 'Hvor ryddeligt foretrækker du, der er derhjemme?',
    sub: 'Uenighed om ryddelighed er den hyppigste årsag til roomie-konflikter.',
    opts: [
      { icon: 'cleaning_services', title: 'Meget ryddeligt',    sub: 'Altid rent og organiseret',  val: 'very-clean' },
      { icon: 'check_circle',      title: 'Rimeligt ryddeligt', sub: 'Rydder op jævnligt',         val: 'clean' },
      { icon: 'sentiment_neutral', title: 'Afslappet',          sub: 'Lever fint med lidt rod',    val: 'relaxed' },
    ]
  },
  { cat: 'Ryddelighed', catIcon: 'cleaning_services',
    q: 'Hvordan forholder du dig til fællesarealer som køkken og bad?',
    sub: 'Fællesarealer kræver fælles forventninger.',
    opts: [
      { icon: 'kitchen',          title: 'Rengør straks',     sub: 'Vasker op og rydder op med det samme', val: 'clean-now' },
      { icon: 'event_available',  title: 'Inden for dagen',   sub: 'Rydder op samme dag',                 val: 'clean-today' },
      { icon: 'calendar_month',   title: 'Ugentlig runde',    sub: 'Foretrækker en fast ugentlig plan',    val: 'clean-weekly' },
    ]
  },
  { cat: 'Gæster & fester', catIcon: 'celebration',
    q: 'Hvor ofte har du venner eller gæster forbi?',
    sub: 'Så vi matcher dig med nogen der deler din sociale energi.',
    opts: [
      { icon: 'groups',  title: 'Ofte',      sub: 'Næsten hver uge',             val: 'social-high' },
      { icon: 'people',  title: 'Af og til', sub: 'Et par gange om måneden',     val: 'social-mid' },
      { icon: 'person',  title: 'Sjældent',  sub: 'Foretrækker rolige aftener',  val: 'social-low' },
    ]
  },
  { cat: 'Gæster & fester', catIcon: 'celebration',
    q: 'Hvordan har du det med spontane fester eller støjende aftener?',
    sub: 'Ærlighed her sparer mange akavede samtaler senere.',
    opts: [
      { icon: 'celebration',      title: 'Elsker det',     sub: 'Jo mere fest, jo bedre',            val: 'party-yes' },
      { icon: 'thumb_up',         title: 'Fint af og til', sub: 'Men gerne med lidt varsel',         val: 'party-sometimes' },
      { icon: 'do_not_disturb',   title: 'Nej tak',        sub: 'Foretrækker ro og forudsigelighed', val: 'party-no' },
    ]
  },
  { cat: 'Ryger & kæledyr', catIcon: 'pets',
    q: 'Ryger du?',
    sub: 'Vigtigt for dem med allergi eller præferencer for røgfrit miljø.',
    opts: [
      { icon: 'smoking_rooms',  title: 'Ja, indendørs', sub: 'Ryger indenfor',     val: 'smoker-in' },
      { icon: 'outdoor_garden', title: 'Ja, udendørs',  sub: 'Ryger kun udenfor',  val: 'smoker-out' },
      { icon: 'smoke_free',     title: 'Ikke-ryger',    sub: 'Ryger ikke',          val: 'non-smoker' },
    ]
  },
  { cat: 'Ryger & kæledyr', catIcon: 'pets',
    q: 'Har du eller ønsker du kæledyr?',
    sub: 'Allergier og præferencer spiller en stor rolle i hverdagen.',
    opts: [
      { icon: 'pets',     title: 'Ja, har kæledyr',  sub: 'Jeg har et eller flere dyr',       val: 'has-pet' },
      { icon: 'favorite', title: 'Vil gerne have',   sub: 'Planlægger at skaffe et dyr',      val: 'wants-pet' },
      { icon: 'block',    title: 'Ingen kæledyr',    sub: 'Foretrækker et kæledyrsfrit hjem', val: 'no-pet' },
    ]
  },
  { cat: 'Mad & køkken', catIcon: 'restaurant',
    q: 'Hvordan bruger du køkkenet?',
    sub: 'Delt køkken kræver enighed om vaner og renlighed.',
    opts: [
      { icon: 'restaurant',     title: 'Laver mad hver dag',  sub: 'Elsker at lave mad',     val: 'cook-daily' },
      { icon: 'local_dining',   title: 'Laver mad jævnligt',  sub: 'Nogle dage om ugen',     val: 'cook-often' },
      { icon: 'takeout_dining', title: 'Mest takeaway',       sub: 'Sjældent i køkkenet',    val: 'cook-rarely' },
    ]
  },
  { cat: 'Mad & køkken', catIcon: 'restaurant',
    q: 'Har du særlige kostpræferencer?',
    sub: 'Kan være relevant for delt indkøb og maddage.',
    opts: [
      { icon: 'eco',        title: 'Vegetar/veganer', sub: 'Spiser ikke kød',               val: 'vegetarian' },
      { icon: 'set_meal',   title: 'Fleksitarier',    sub: 'Mest plantebaseret, men fleksibel', val: 'flexiterian' },
      { icon: 'lunch_dining', title: 'Altesspiser',   sub: 'Spiser alt',                    val: 'omnivore' },
    ]
  },
  { cat: 'Hjemmeliv', catIcon: 'home',
    q: 'Hvor meget tid tilbringer du hjemme på en typisk hverdag?',
    sub: 'Hjælper os finde nogen du trives med i dagligdagen.',
    opts: [
      { icon: 'laptop_mac',      title: 'Det meste af dagen', sub: 'Arbejder/studerer hjemmefra', val: 'homebody' },
      { icon: 'directions_run',  title: 'Mest ude',            sub: 'Hjemme primært til at sove', val: 'active' },
      { icon: 'balance',         title: 'Mix',                 sub: 'Lidt af begge',              val: 'mix' },
    ]
  },
  { cat: 'Hjemmeliv', catIcon: 'home',
    q: 'Hvad er vigtigst for dig i et godt roomie-forhold?',
    sub: 'Det her giver os det bedste billede af dig som roomie.',
    opts: [
      { icon: 'handshake',    title: 'Respekt og privatliv', sub: 'Lukkede døre og egne rytmer', val: 'respect' },
      { icon: 'diversity_3',  title: 'Fællesskab',           sub: 'Hygge, middage og samvær',    val: 'community' },
      { icon: 'emoji_people', title: 'Begge dele',           sub: 'Fleksibel alt efter humør',   val: 'balanced' },
    ]
  },
]

const LABELS: Record<string, string> = {
  early: 'Tidlig fugl', morning: 'Morgenmenneske', mid: 'Formiddagstype', night: 'Natteravn',
  'early-bed': 'Sov inden 22', 'avg-bed': 'Sov kl. 22–24', 'late-bed': 'Sent i seng',
  'very-clean': 'Meget ryddelig', clean: 'Ryddelig', relaxed: 'Afslappet ryddelighed',
  'clean-now': 'Rydder straks op', 'clean-today': 'Rydder op samme dag', 'clean-weekly': 'Ugentlig rengøring',
  'social-high': 'Social', 'social-mid': 'Afbalanceret social', 'social-low': 'Rolige aftener',
  'party-yes': 'Festglad', 'party-sometimes': 'Fest af og til', 'party-no': 'Foretrækker ro',
  'smoker-in': 'Ryger indendørs', 'smoker-out': 'Ryger udendørs', 'non-smoker': 'Ikke-ryger',
  'has-pet': 'Har kæledyr', 'wants-pet': 'Vil have kæledyr', 'no-pet': 'Ingen kæledyr',
  'cook-daily': 'Madentusiast', 'cook-often': 'Laver mad jævnligt', 'cook-rarely': 'Takeaway-fan',
  vegetarian: 'Vegetar/veganer', flexiterian: 'Fleksitarier', omnivore: 'Altesspiser',
  homebody: 'Hjemme-type', active: 'Aktiv livsstil', mix: 'Fleksibel',
  respect: 'Respektfuld roomie', community: 'Fællesskabsorienteret', balanced: 'Afbalanceret',
  skip: 'Sprang over',
}

// ── GEO-KONSTANTER ─────────────────────────────────────────────
const CITIES = ['København', 'Aarhus', 'Odense'] as const
type City = typeof CITIES[number]

const DISTRICTS: Record<City, string[]> = {
  'København': ['Indre By', 'Nørrebro', 'Vesterbro', 'Østerbro', 'Amager Øst', 'Amager Vest', 'Valby', 'Vanløse', 'Bispebjerg', 'Brønshøj', 'Frederiksberg'],
  'Aarhus':    ['Aarhus C', 'Aarhus N', 'Aarhus V', 'Trøjborg', 'Risskov', 'Hasle', 'Viby J', 'Brabrand', 'Åbyhøj', 'Skejby', 'Højbjerg'],
  'Odense':    ['Odense C', 'Odense N', 'Odense NV', 'Odense S', 'Odense SV', 'Bolbro', 'Dalum', 'Vollsmose'],
}

const MUNICIPALITY_CODES: Record<City, string> = {
  'København': '0101',
  'Aarhus':    '0751',
  'Odense':    '0461',
}

// ── TYPES ──────────────────────────────────────────────────────
type Screen = 'role' | 'quiz' | 'info' | 'signup'
type Role = 'udlejer' | 'søgende'

interface InfoForm {
  name: string; age: string
  // søgende
  searchCity: string; searchDistrict: string; budgetMax: string; moveDate: string
  // udlejer
  street: string; city: string; district: string; rent: string
  sizeM2: string; sizeRoom: string
}

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
  :root {
    --bg: #F7F4EF; --card: #FFFFFF;
    --primary: #D97757; --primary-hover: #C4633F; --primary-soft: #F5E6DF;
    --accent: #7B9E87; --accent-soft: #E3EEE7;
    --ink: #1A0F0A; --ink2: #4A3528; --ink3: #9C7B6E;
    --border: #E8E0D8; --gold: #C9A84C; --gold-soft: #F5EDD0;
    --shadow-sm: 0 1px 4px rgba(26,15,10,0.06);
    --shadow-md: 0 4px 20px rgba(26,15,10,0.08);
    --r: 20px;
  }
  .ob-root {
    font-family: var(--font-manrope), 'Manrope', sans-serif;
    background: var(--bg); min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; color: var(--ink);
  }
  .topnav {
    width: 100%; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    position: fixed; top: 0; left: 0; z-index: 50;
    background: rgba(247,244,239,0.85); backdrop-filter: blur(12px);
    border-bottom: 1px solid transparent;
  }
  .logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  .logo svg { width: 28px; height: 28px; }
  .logo-text { font-family: var(--font-fraunces), 'Fraunces', serif; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: -0.3px; }
  .nav-login { font-size: 14px; font-weight: 600; color: var(--ink2); text-decoration: none; padding: 8px 18px; border-radius: 999px; border: 1.5px solid var(--border); background: var(--card); transition: all 0.2s; }
  .nav-login:hover { border-color: var(--ink2); }
  .stage { width: 100%; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 72px 16px 40px; }
  .screen { width: 100%; max-width: 560px; animation: screenIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes screenIn { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes screenOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-12px); } }
  @keyframes quizSlideIn  { from { opacity:0; transform:translateX(32px);  } to { opacity:1; transform:translateX(0); } }
  @keyframes quizSlideBack { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
  .quiz-animate-fwd  { animation: quizSlideIn  0.32s cubic-bezier(0.22,1,0.36,1) both; }
  .quiz-animate-back { animation: quizSlideBack 0.32s cubic-bezier(0.22,1,0.36,1) both; }
  .step-indicator { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:32px; }
  .step-dot { width:8px; height:8px; border-radius:999px; background:var(--border); transition:all 0.35s cubic-bezier(0.22,1,0.36,1); }
  .step-dot.active { background:var(--primary); width:24px; }
  .step-dot.done   { background:var(--accent); }
  .screen-label { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--primary); margin-bottom:8px; }
  .screen-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:clamp(26px,5vw,36px); font-weight:700; color:var(--ink); line-height:1.15; margin-bottom:10px; }
  .screen-title em { font-style:italic; color:var(--primary); }
  .screen-sub { font-size:15px; color:var(--ink3); line-height:1.6; margin-bottom:32px; }
  .role-grid { display:grid; grid-template-columns:1fr; gap:14px; margin-bottom:28px; }
  .role-card { background:var(--card); border:2px solid var(--border); border-radius:var(--r); padding:20px 16px; cursor:pointer; transition:all 0.2s cubic-bezier(0.22,1,0.36,1); text-align:center; position:relative; overflow:hidden; }
  .role-card:hover { border-color:var(--primary); box-shadow:var(--shadow-md); transform:translateY(-2px); }
  .role-card.selected { border-color:var(--primary); background:var(--primary-soft); box-shadow:0 0 0 4px rgba(217,119,87,0.12); }
  .role-card.selected .role-check { opacity:1; transform:scale(1); }
  .role-icon { width:56px; height:56px; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; background:var(--bg); transition:background 0.2s; }
  .role-card.selected .role-icon { background:var(--primary); }
  .role-icon .material-symbols-rounded { font-size:28px; color:var(--primary); }
  .role-card.selected .role-icon .material-symbols-rounded { color:white; }
  .role-name { font-family:var(--font-fraunces),'Fraunces',serif; font-size:18px; font-weight:600; color:var(--ink); margin-bottom:6px; }
  .role-desc { font-size:13px; color:var(--ink3); line-height:1.5; }
  .role-check { position:absolute; top:12px; right:12px; width:22px; height:22px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(0.5); transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
  .role-check .material-symbols-rounded { font-size:14px; color:white; }
  .quiz-options { display:flex; flex-direction:column; gap:10px; margin-bottom:28px; }
  .quiz-option { background:var(--card); border:2px solid var(--border); border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:16px; cursor:pointer; transition:all 0.2s cubic-bezier(0.22,1,0.36,1); text-align:left; width:100%; font-family:var(--font-manrope),'Manrope',sans-serif; }
  .quiz-option:hover { border-color:var(--primary); box-shadow:var(--shadow-sm); transform:translateX(3px); }
  .quiz-option.selected { border-color:var(--primary); background:var(--primary-soft); }
  .quiz-opt-icon { width:44px; height:44px; flex-shrink:0; border-radius:12px; background:var(--bg); display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
  .quiz-opt-icon .material-symbols-rounded { font-size:22px; color:var(--primary); }
  .quiz-option.selected .quiz-opt-icon { background:var(--primary); }
  .quiz-option.selected .quiz-opt-icon .material-symbols-rounded { color:white; }
  .quiz-opt-title { font-size:15px; font-weight:600; color:var(--ink); margin-bottom:2px; }
  .quiz-opt-sub   { font-size:12px; color:var(--ink3); }
  .quiz-option.skip-opt { border-style:dashed; opacity:0.7; }
  .quiz-option.skip-opt .quiz-opt-icon .material-symbols-rounded { color:var(--ink3); }
  .quiz-option.skip-opt:hover { border-color:var(--ink3); box-shadow:none; transform:none; }
  .quiz-option.skip-opt.selected { border-color:var(--ink3); background:var(--bg); }
  .quiz-option.skip-opt.selected .quiz-opt-icon { background:var(--ink3); }
  .quiz-option.skip-opt.selected .quiz-opt-icon .material-symbols-rounded { color:white; }
  .progress-wrap { margin-bottom:28px; }
  .progress-row { display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:var(--ink3); margin-bottom:8px; }
  .progress-row span:first-child { color:var(--primary); text-transform:uppercase; letter-spacing:0.06em; }
  .progress-track { height:6px; background:var(--border); border-radius:999px; overflow:hidden; }
  .progress-fill { height:100%; background:var(--primary); border-radius:999px; transition:width 0.5s cubic-bezier(0.22,1,0.36,1); }
  .quiz-category { display:inline-flex; align-items:center; gap:5px; background:var(--gold-soft); color:var(--gold); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; padding:4px 10px; border-radius:999px; margin-bottom:12px; }
  .quiz-category .material-symbols-rounded { font-size:13px; }
  .form-grid { display:flex; flex-direction:column; gap:16px; margin-bottom:28px; }
  .form-row   { display:grid; grid-template-columns:1fr; gap:14px; }
  .field-group { display:flex; flex-direction:column; gap:6px; }
  .field-label { font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink2); }
  .field-input { padding:13px 16px; border-radius:12px; border:2px solid var(--border); background:var(--card); font-size:15px; font-weight:500; color:var(--ink); font-family:var(--font-manrope),'Manrope',sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; }
  .field-input:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(217,119,87,0.12); }
  .field-input::placeholder { color:var(--ink3); }
  .field-input.error { border-color:#E05252 !important; box-shadow:0 0 0 3px rgba(224,82,82,0.10) !important; }
  .field-prefix { position:relative; }
  .field-prefix .field-input { padding-left:44px; }
  .field-prefix-label { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; font-weight:600; color:var(--ink3); pointer-events:none; }
  .field-suffix-label { position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:14px; font-weight:600; color:var(--ink3); pointer-events:none; }
  .error-msg { font-size:12px; color:#E05252; margin-top:5px; font-weight:600; }
  .card { background:var(--card); border-radius:var(--r); border:1px solid var(--border); padding:32px; box-shadow:var(--shadow-md); }
  .btn-primary { width:100%; padding:16px; min-height:52px; background:var(--primary); color:white; border:none; border-radius:14px; font-size:16px; font-weight:700; font-family:var(--font-manrope),'Manrope',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-primary:hover { background:var(--primary-hover); transform:translateY(-1px); box-shadow:0 6px 20px rgba(217,119,87,0.3); }
  .btn-primary:active { transform:translateY(0); }
  .btn-primary:disabled { background:var(--border); color:var(--ink3); cursor:not-allowed; transform:none; box-shadow:none; }
  .btn-primary .material-symbols-rounded { font-size:20px; }
  .btn-back { display:flex; align-items:center; gap:6px; background:none; border:none; font-size:14px; font-weight:600; color:var(--ink3); cursor:pointer; padding:8px 0; font-family:var(--font-manrope),'Manrope',sans-serif; transition:color 0.2s; margin-bottom:24px; }
  .btn-back:hover { color:var(--ink); }
  .btn-back .material-symbols-rounded { font-size:18px; }
  .trust-line { display:flex; align-items:center; justify-content:center; gap:6px; font-size:12px; color:var(--ink3); margin-top:20px; }
  .trust-line .material-symbols-rounded { font-size:15px; }
  .success-icon { width:80px; height:80px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; animation:popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .success-icon .material-symbols-rounded { font-size:40px; color:var(--accent); }
  @keyframes popIn { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
  .summary-grid { display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:28px; }
  .summary-item { background:var(--bg); border-radius:12px; padding:14px 16px; border:1px solid var(--border); }
  .summary-item-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--ink3); margin-bottom:4px; }
  .summary-item-val   { font-size:15px; font-weight:600; color:var(--ink); }
  .summary-item-val.primary { color:var(--primary); }
  .field-select { width:100%; padding:13px 16px; border:1.5px solid var(--border); border-radius:12px; font-size:15px; font-family:var(--font-manrope),'Manrope',sans-serif; color:var(--ink); background:var(--card); appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%239C7B6E' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; cursor:pointer; transition:border-color 0.2s; }
  .field-select:focus { outline:none; border-color:var(--primary); }
  .field-select.error { border-color:#E05252; }
  .field-select:disabled { opacity:0.5; cursor:not-allowed; }
  .autocomplete-wrap { position:relative; }
  .autocomplete-dropdown { position:absolute; top:calc(100% + 4px); left:0; right:0; background:var(--card); border:1.5px solid var(--border); border-radius:12px; box-shadow:var(--shadow-md); z-index:200; overflow:hidden; max-height:220px; overflow-y:auto; }
  .autocomplete-item { padding:11px 16px; font-size:14px; color:var(--ink2); cursor:pointer; transition:background 0.15s; }
  .autocomplete-item:hover { background:var(--bg); }
  @media (min-width:600px) {
    .stage   { padding:100px 20px 60px; }
    .topnav  { padding:20px 32px; }
    .role-card  { padding:28px 20px; }
    .quiz-option { padding:16px 20px; }
    .role-grid    { grid-template-columns:1fr 1fr; }
    .form-row     { grid-template-columns:1fr 1fr; }
    .summary-grid { grid-template-columns:1fr 1fr; }
  }
`

// ── STREET AUTOCOMPLETE ────────────────────────────────────────
function StreetAutocomplete({ city, value, onChange, hasError }: {
  city: string; value: string; onChange: (v: string) => void; hasError?: boolean
}) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const confirmedValue = useRef(value)

  function handleInput(q: string) {
    setQuery(q); onChange(''); confirmedValue.current = ''; setOpen(true)
    if (timer.current) clearTimeout(timer.current)
    const code = MUNICIPALITY_CODES[city as City]
    if (!q.trim() || !code) { setSuggestions([]); return }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.dataforsyningen.dk/vejnavne/autocomplete?q=${encodeURIComponent(q)}&kommunekode=${code}&per_side=8`)
        const data = await res.json()
        setSuggestions((data as { tekst: string }[]).map(d => d.tekst))
      } catch { setSuggestions([]) }
    }, 250)
  }

  function select(name: string) {
    setQuery(name); onChange(name); confirmedValue.current = name
    setSuggestions([]); setOpen(false)
  }

  return (
    <div className="autocomplete-wrap">
      <input
        className={'field-input' + (hasError ? ' error' : '')}
        type="text"
        placeholder={city ? `Søg vejnavn i ${city}…` : 'Vælg by først'}
        value={query}
        disabled={!city}
        onChange={e => handleInput(e.target.value)}
        onBlur={() => setTimeout(() => { setOpen(false); setQuery(confirmedValue.current) }, 150)}
      />
      {open && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map(s => (
            <div key={s} className="autocomplete-item" onMouseDown={() => select(s)}>{s}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── HELPERS ────────────────────────────────────────────────────
function mapQuizToData(answers: Record<number, string>, role: Role, info: InfoForm) {
  const wakeMap: Record<string, 'early_bird' | 'night_owl' | 'flexible'> = {
    early: 'early_bird', morning: 'early_bird', mid: 'flexible', night: 'night_owl',
  }
  const bedMap: Record<string, 'early_bird' | 'night_owl' | 'flexible'> = {
    'early-bed': 'early_bird', 'avg-bed': 'flexible', 'late-bed': 'night_owl',
  }
  const cleanlinessMap: Record<string, number> = { 'very-clean': 5, clean: 3, relaxed: 1 }
  const splitMap: Record<string, 'strict_rotation' | 'when_needed' | 'each_own'> = {
    'clean-now': 'strict_rotation', 'clean-today': 'when_needed', 'clean-weekly': 'each_own',
  }
  const guestsMap: Record<string, 'rarely' | 'sometimes' | 'often'> = {
    'social-high': 'often', 'social-mid': 'sometimes', 'social-low': 'rarely',
  }
  const socialMap: Record<string, number> = { 'social-high': 5, 'social-mid': 3, 'social-low': 1 }
  const dietMap: Record<string, 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'> = {
    vegetarian: 'vegetarian', flexiterian: 'pescatarian', omnivore: 'omnivore',
  }
  const noiseMap: Record<string, number> = { homebody: 2, active: 4, mix: 3 }

  return {
    role: role === 'udlejer' ? ('landlord' as const) : ('seeker' as const),
    displayName: info.name,
    age: parseInt(info.age) || 25,
    city: role === 'udlejer' ? info.city : info.searchCity,
    district: role === 'udlejer' ? info.district : info.searchDistrict,
    sleepSchedule: bedMap[answers[1]] ?? wakeMap[answers[0]] ?? 'flexible' as const,
    cleanliness: cleanlinessMap[answers[2]] ?? 3,
    cleaningSplit: splitMap[answers[3]] ?? 'when_needed' as const,
    diet: dietMap[answers[9]] ?? 'omnivore' as const,
    sharedCooking: answers[8] !== 'cook-rarely',
    socialLevel: socialMap[answers[4]] ?? 3,
    guestsFrequency: guestsMap[answers[4]] ?? 'sometimes' as const,
    parties: answers[5] !== 'party-no',
    smoker: answers[6] === 'smoker-in' || answers[6] === 'smoker-out',
    petFriendly: answers[7] !== 'no-pet',
    noiseTolerance: noiseMap[answers[10]] ?? 3,
    budgetMax: role === 'søgende' && info.budgetMax ? parseInt(info.budgetMax) : undefined,
    availableFrom: info.moveDate || undefined,
    listingTitle: role === 'udlejer' ? (info.street ? `${info.street}, ${info.district || info.city}` : `Bolig i ${info.city}`) : undefined,
    listingPrice: role === 'udlejer' && info.rent ? parseInt(info.rent) : undefined,
    listingRooms: undefined as number | undefined,
    listingSizeM2: role === 'udlejer' && info.sizeM2 ? parseInt(info.sizeM2) : undefined,
    listingRoomSizeM2: role === 'udlejer' && info.sizeRoom ? parseInt(info.sizeRoom) : undefined,
    listingDescription: undefined as string | undefined,
  }
}

// ── COMPONENT ──────────────────────────────────────────────────
export default function QuizClient() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('role')
  const [role, setRole] = useState<Role | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizDir, setQuizDir] = useState<'fwd' | 'back'>('fwd')
  const [info, setInfo] = useState<InfoForm>({
    name: '', age: '',
    searchCity: '', searchDistrict: '', budgetMax: '', moveDate: '',
    street: '', city: '', district: '', rent: '', sizeM2: '', sizeRoom: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const totalDots = QUIZ.length + 2

  // ── DOTS ──
  function renderDots(activeIdx: number) {
    return Array.from({ length: totalDots }, (_, i) => (
      <div
        key={i}
        className={'step-dot' + (i === activeIdx ? ' active' : i < activeIdx ? ' done' : '')}
      />
    ))
  }

  // ── ROLE ──
  function selectRole(r: Role) {
    setRole(r)
  }

  function goToQuiz() {
    setCurrentQ(0)
    setQuizDir('fwd')
    setScreen('quiz')
  }

  // ── QUIZ ──
  function selectQuizOption(val: string) {
    setQuizAnswers(prev => ({ ...prev, [currentQ]: val }))
    setTimeout(() => {
      nextQuiz(val)
    }, 380)
  }

  function nextQuiz(justSelected?: string) {
    const answers = justSelected
      ? { ...quizAnswers, [currentQ]: justSelected }
      : quizAnswers
    if (!(currentQ in answers) && !justSelected) return
    const next = currentQ + 1
    if (next < QUIZ.length) {
      setQuizDir('fwd')
      setCurrentQ(next)
    } else {
      setScreen('info')
    }
  }

  function goBack() {
    if (currentQ > 0) {
      setQuizDir('back')
      setCurrentQ(q => q - 1)
    } else {
      setScreen('role')
    }
  }

  function goBackFromInfo() {
    setQuizDir('back')
    setCurrentQ(QUIZ.length - 1)
    setScreen('quiz')
  }

  function goBackFromSignup() {
    setScreen('info')
  }

  // ── VALIDATION ──
  function setErr(key: string, hasError: boolean) {
    setFieldErrors(prev => ({ ...prev, [key]: hasError }))
    return !hasError
  }

  function validateSøgende() {
    let ok = true
    ok = setErr('searchCity', !info.searchCity) && ok
    ok = setErr('budgetMax', !info.budgetMax || parseFloat(info.budgetMax) <= 0) && ok
    ok = setErr('name', !info.name.trim()) && ok
    ok = setErr('age', !info.age || parseInt(info.age) < 15) && ok
    if (ok) setScreen('signup')
  }

  function validateUdlejer() {
    let ok = true
    ok = setErr('city', !info.city) && ok
    ok = setErr('rent', !info.rent || parseFloat(info.rent) <= 0) && ok
    ok = setErr('sizeM2', !info.sizeM2 || parseFloat(info.sizeM2) <= 0) && ok
    ok = setErr('name', !info.name.trim()) && ok
    ok = setErr('age', !info.age || parseInt(info.age) < 15) && ok
    if (ok) setScreen('signup')
  }

  // ── SIGNUP ──
  function handleSignup() {
    let ok = true
    if (!email.trim() || !email.includes('@')) {
      setEmailError(true)
      ok = false
    } else {
      setEmailError(false)
    }
    if (!password || password.length < 6) {
      setPasswordError(true)
      ok = false
    } else {
      setPasswordError(false)
    }
    if (!ok || !role) return

    setServerError(null)
    const data = mapQuizToData(quizAnswers, role, info)
    localStorage.setItem('rumies_pending_quiz', JSON.stringify(data))

    startTransition(async () => {
      const result = await signUpFromQuiz(email, password)
      if ('error' in result) {
        setServerError(result.error)
      } else {
        router.push(result.needsConfirmation ? '/signup/bekraeft' : '/onboarding/complete')
      }
    })
  }

  // ── SUMMARY ──
  function getSummaryItems() {
    if (role === 'udlejer') {
      return [
        { label: 'Rolle', val: '🏠 Udlejer' },
        { label: 'By & bydel', val: [info.district, info.city].filter(Boolean).join(', ') || 'Ikke angivet' },
        { label: 'Vejnavn', val: info.street || 'Ikke angivet' },
        { label: 'Husleje', val: info.rent ? `${Number(info.rent).toLocaleString('da-DK')} kr/md` : 'Ikke angivet', primary: true },
        { label: 'Lejlighed', val: info.sizeM2 ? `${info.sizeM2} m²` : 'Ikke angivet' },
        { label: 'Værelse', val: info.sizeRoom ? `${info.sizeRoom} m²` : 'Ikke angivet' },
      ]
    }
    return [
      { label: 'Rolle', val: '🔍 Søgende' },
      { label: 'Søger i', val: [info.searchDistrict, info.searchCity].filter(Boolean).join(', ') || 'Ikke angivet' },
      { label: 'Budget', val: info.budgetMax ? `Op til ${Number(info.budgetMax).toLocaleString('da-DK')} kr/md` : 'Ikke angivet', primary: true },
      { label: 'Klar til flytning', val: info.moveDate || 'Ikke angivet' },
    ]
  }

  function getLifestyleTags() {
    return Object.values(quizAnswers).map(val => LABELS[val] || val)
  }

  const q = QUIZ[currentQ]

  // ── RENDER ──
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ob-root">

        {/* TOP NAV */}
        <nav className="topnav">
          <a className="logo" href="/">
            <svg viewBox="0 0 40 38" fill="none">
              <polygon points="20,2 38,17 2,17" fill="#D97757"/>
              <rect x="5" y="16" width="30" height="20" rx="2" fill="#D97757"/>
              <circle cx="15" cy="27" r="5.5" fill="#F7F4EF" opacity="0.92"/>
              <circle cx="25" cy="27" r="5.5" fill="#F7F4EF" opacity="0.60"/>
              <path d="M20,22 a5.5,5.5 0 0 1 0,10 a5.5,5.5 0 0 1 0,-10" fill="#F7F4EF" opacity="0.30"/>
            </svg>
            <span className="logo-text">Rumies</span>
          </a>
          <a className="nav-login" href="/login">Log ind</a>
        </nav>

        <div className="stage">
          <div style={{ width: '100%', maxWidth: 560 }}>

            {/* ── STEP 1: ROLLE ── */}
            {screen === 'role' && (
              <div className="screen" key="role">
                <div className="step-indicator">
                  {renderDots(0)}
                </div>
                <div className="screen-label">Kom i gang</div>
                <h1 className="screen-title">Hvem er du på<br /><em>Rumies?</em></h1>
                <p className="screen-sub">Vælg din rolle, så tilpasser vi oplevelsen til dig.</p>

                <div className="role-grid">
                  <div
                    className={'role-card' + (role === 'udlejer' ? ' selected' : '')}
                    onClick={() => selectRole('udlejer')}
                  >
                    <div className="role-check">
                      <span className="material-symbols-rounded">check</span>
                    </div>
                    <div className="role-icon">
                      <span className="material-symbols-rounded">home</span>
                    </div>
                    <div className="role-name">Jeg har en lejlighed</div>
                    <div className="role-desc">Du søger den rette roomie til dit hjem</div>
                  </div>
                  <div
                    className={'role-card' + (role === 'søgende' ? ' selected' : '')}
                    onClick={() => selectRole('søgende')}
                  >
                    <div className="role-check">
                      <span className="material-symbols-rounded">check</span>
                    </div>
                    <div className="role-icon">
                      <span className="material-symbols-rounded">search</span>
                    </div>
                    <div className="role-name">Jeg søger en plads</div>
                    <div className="role-desc">Du leder efter det perfekte sted at bo</div>
                  </div>
                </div>

                <button className="btn-primary" disabled={!role} onClick={goToQuiz}>
                  Fortsæt <span className="material-symbols-rounded">arrow_forward</span>
                </button>
                <div className="trust-line">
                  <span className="material-symbols-rounded">lock</span>
                  Dine oplysninger deles kun med verificerede matches
                </div>
              </div>
            )}

            {/* ── STEP 2: QUIZ ── */}
            {screen === 'quiz' && q && (
              <div className="screen" key="quiz">
                <button className="btn-back" onClick={goBack}>
                  <span className="material-symbols-rounded">arrow_back</span> Tilbage
                </button>

                <div className="progress-wrap">
                  <div className="progress-row">
                    <span>{q.cat}</span>
                    <span>Spørgsmål {currentQ + 1} af {QUIZ.length}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(currentQ / QUIZ.length) * 100}%` }}
                    />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink3)', marginTop: 5 }}>
                    Kategori {Math.floor(currentQ / 2) + 1} af 6
                  </div>
                </div>

                <div
                  key={`${currentQ}-${quizDir}`}
                  className={quizDir === 'fwd' ? 'quiz-animate-fwd' : 'quiz-animate-back'}
                >
                  <div className="quiz-category">
                    <span className="material-symbols-rounded">{q.catIcon}</span>
                    <span>{q.cat}</span>
                  </div>
                  <h2 className="screen-title">{q.q}</h2>
                  <p className="screen-sub">{q.sub}</p>

                  <div className="quiz-options">
                    {q.opts.map(opt => (
                      <button
                        key={opt.val}
                        className={'quiz-option' + (quizAnswers[currentQ] === opt.val ? ' selected' : '')}
                        onClick={() => selectQuizOption(opt.val)}
                      >
                        <div className="quiz-opt-icon">
                          <span className="material-symbols-rounded">{opt.icon}</span>
                        </div>
                        <div className="quiz-opt-text">
                          <div className="quiz-opt-title">{opt.title}</div>
                          <div className="quiz-opt-sub">{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                    <button
                      className={'quiz-option skip-opt' + (quizAnswers[currentQ] === 'skip' ? ' selected' : '')}
                      onClick={() => selectQuizOption('skip')}
                    >
                      <div className="quiz-opt-icon">
                        <span className="material-symbols-rounded">help_outline</span>
                      </div>
                      <div className="quiz-opt-text">
                        <div className="quiz-opt-title">Ved ikke</div>
                        <div className="quiz-opt-sub">Spring dette spørgsmål over</div>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  disabled={!(currentQ in quizAnswers)}
                  onClick={() => nextQuiz()}
                >
                  Næste <span className="material-symbols-rounded">arrow_forward</span>
                </button>
              </div>
            )}

            {/* ── STEP 3a: UDLEJER INFO ── */}
            {screen === 'info' && role === 'udlejer' && (
              <div className="screen" key="info-udlejer">
                <button className="btn-back" onClick={goBackFromInfo}>
                  <span className="material-symbols-rounded">arrow_back</span> Tilbage
                </button>

                <div className="screen-label">Om dig & din lejlighed</div>
                <h2 className="screen-title">Fortæl om dit <em>hjem</em></h2>
                <p className="screen-sub">Disse informationer vises på din profil og bruges til at matche den rigtige roomie.</p>

                <div className="form-grid">
                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label">Dit navn</label>
                      <input
                        className={'field-input' + (fieldErrors.name ? ' error' : '')}
                        type="text" placeholder="Fornavn"
                        value={info.name}
                        onChange={e => { setInfo(p => ({ ...p, name: e.target.value })); setErr('name', false) }}
                      />
                      {fieldErrors.name && <span className="error-msg">Udfyld dit navn</span>}
                    </div>
                    <div className="field-group">
                      <label className="field-label">Alder</label>
                      <input
                        className={'field-input' + (fieldErrors.age ? ' error' : '')}
                        type="number" placeholder="" min="15" max="99"
                        value={info.age}
                        onChange={e => { setInfo(p => ({ ...p, age: e.target.value })); setErr('age', false) }}
                      />
                      {fieldErrors.age && <span className="error-msg">Angiv alder</span>}
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label">By</label>
                    <select
                      className={'field-select' + (fieldErrors.city ? ' error' : '')}
                      value={info.city}
                      onChange={e => { setInfo(p => ({ ...p, city: e.target.value, district: '', street: '' })); setErr('city', false) }}
                    >
                      <option value="">Vælg by…</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {fieldErrors.city && <span className="error-msg">Vælg en by</span>}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Bydel</label>
                    <select
                      className="field-select"
                      value={info.district}
                      disabled={!info.city}
                      onChange={e => setInfo(p => ({ ...p, district: e.target.value }))}
                    >
                      <option value="">{info.city ? 'Vælg bydel…' : 'Vælg by først'}</option>
                      {info.city && DISTRICTS[info.city as City]?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Vejnavn <span style={{ fontWeight:400, color:'var(--ink3)', textTransform:'none', letterSpacing:0 }}>(valgfrit)</span></label>
                    <StreetAutocomplete
                      city={info.city}
                      value={info.street}
                      onChange={v => setInfo(p => ({ ...p, street: v }))}
                    />
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label">Husleje pr. måned</label>
                      <div className="field-prefix">
                        <span className="field-prefix-label">kr.</span>
                        <input
                          className={'field-input' + (fieldErrors.rent ? ' error' : '')}
                          type="number" placeholder="" min="1000"
                          value={info.rent}
                          onChange={e => { setInfo(p => ({ ...p, rent: e.target.value })); setErr('rent', false) }}
                        />
                      </div>
                      {fieldErrors.rent && <span className="error-msg">Angiv husleje (kun tal)</span>}
                    </div>
                    <div className="field-group">
                      <label className="field-label">Lejlighedens areal</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className={'field-input' + (fieldErrors.sizeM2 ? ' error' : '')}
                          type="number" placeholder="" min="10"
                          style={{ paddingRight: 44 }}
                          value={info.sizeM2}
                          onChange={e => { setInfo(p => ({ ...p, sizeM2: e.target.value })); setErr('sizeM2', false) }}
                        />
                        <span className="field-suffix-label">m²</span>
                      </div>
                      {fieldErrors.sizeM2 && <span className="error-msg">Angiv størrelse i m²</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label">Størrelse på værelse <span style={{ fontWeight:400, color:'var(--ink3)', textTransform:'none', letterSpacing:0 }}>(valgfrit)</span></label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="field-input"
                          type="number" placeholder="" min="5"
                          style={{ paddingRight: 44 }}
                          value={info.sizeRoom}
                          onChange={e => setInfo(p => ({ ...p, sizeRoom: e.target.value }))}
                        />
                        <span className="field-suffix-label">m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="btn-primary" onClick={validateUdlejer}>
                  Fortsæt <span className="material-symbols-rounded">arrow_forward</span>
                </button>
              </div>
            )}

            {/* ── STEP 3b: SØGENDE INFO ── */}
            {screen === 'info' && role === 'søgende' && (
              <div className="screen" key="info-søgende">
                <button className="btn-back" onClick={goBackFromInfo}>
                  <span className="material-symbols-rounded">arrow_back</span> Tilbage
                </button>

                <div className="screen-label">Dine præferencer</div>
                <h2 className="screen-title">Hvad leder du <em>efter?</em></h2>
                <p className="screen-sub">Vi bruger dette til at matche dig med lejligheder der passer til dit budget og ønskede by.</p>

                <div className="form-grid">
                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label">Dit navn</label>
                      <input
                        className={'field-input' + (fieldErrors.name ? ' error' : '')}
                        type="text" placeholder="Fornavn"
                        value={info.name}
                        onChange={e => { setInfo(p => ({ ...p, name: e.target.value })); setErr('name', false) }}
                      />
                      {fieldErrors.name && <span className="error-msg">Udfyld dit navn</span>}
                    </div>
                    <div className="field-group">
                      <label className="field-label">Alder</label>
                      <input
                        className={'field-input' + (fieldErrors.age ? ' error' : '')}
                        type="number" placeholder="" min="15" max="99"
                        value={info.age}
                        onChange={e => { setInfo(p => ({ ...p, age: e.target.value })); setErr('age', false) }}
                      />
                      {fieldErrors.age && <span className="error-msg">Angiv alder</span>}
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Hvilken by søger du i?</label>
                    <select
                      className={'field-select' + (fieldErrors.searchCity ? ' error' : '')}
                      value={info.searchCity}
                      onChange={e => { setInfo(p => ({ ...p, searchCity: e.target.value, searchDistrict: '' })); setErr('searchCity', false) }}
                    >
                      <option value="">Vælg by…</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {fieldErrors.searchCity && <span className="error-msg">Vælg en by</span>}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Foretrukket bydel <span style={{ fontWeight:400, color:'var(--ink3)', textTransform:'none', letterSpacing:0 }}>(valgfrit)</span></label>
                    <select
                      className="field-select"
                      value={info.searchDistrict}
                      disabled={!info.searchCity}
                      onChange={e => setInfo(p => ({ ...p, searchDistrict: e.target.value }))}
                    >
                      <option value="">{info.searchCity ? 'Alle bydele' : 'Vælg by først'}</option>
                      {info.searchCity && DISTRICTS[info.searchCity as City]?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Maks. budget pr. måned</label>
                    <div className="field-prefix">
                      <span className="field-prefix-label">kr.</span>
                      <input
                        className={'field-input' + (fieldErrors.budgetMax ? ' error' : '')}
                        type="number" placeholder=""
                        value={info.budgetMax}
                        onChange={e => { setInfo(p => ({ ...p, budgetMax: e.target.value })); setErr('budgetMax', false) }}
                      />
                    </div>
                    {fieldErrors.budgetMax && <span className="error-msg">Angiv dit budget (kun tal)</span>}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Hvornår er du klar til at flytte? <span style={{ fontWeight: 400, color: 'var(--ink3)', textTransform: 'none', letterSpacing: 0 }}>(valgfrit)</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="field-input"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={info.moveDate}
                        onChange={e => setInfo(p => ({ ...p, moveDate: e.target.value }))}
                        style={{ paddingLeft: 44, color: info.moveDate ? 'var(--ink)' : 'transparent' }}
                      />
                      <span className="material-symbols-rounded" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)', fontSize: 20, pointerEvents: 'none' }}>calendar_today</span>
                      {!info.moveDate && <span style={{ position: 'absolute', left: 44, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--ink3)', pointerEvents: 'none' }}>Vælg dato</span>}
                    </div>
                  </div>
                </div>

                <button className="btn-primary" onClick={validateSøgende}>
                  Fortsæt <span className="material-symbols-rounded">arrow_forward</span>
                </button>
              </div>
            )}

            {/* ── STEP 4: SIGNUP ── */}
            {screen === 'signup' && (
              <div className="screen" key="signup">
                <button className="btn-back" onClick={goBackFromSignup}>
                  <span className="material-symbols-rounded">arrow_back</span> Tilbage
                </button>

                <div className="card">
                  <div className="success-icon">
                    <span className="material-symbols-rounded">celebration</span>
                  </div>
                  <h2 className="screen-title" style={{ marginBottom: 8 }}>Din profil er klar! 🎉</h2>
                  <p className="screen-sub" style={{ marginBottom: 24 }}>Her er et overblik over hvad vi matcher dig ud fra:</p>

                  <div className="summary-grid">
                    {getSummaryItems().map((item, i) => (
                      <div key={i} className="summary-item">
                        <div className="summary-item-label">{item.label}</div>
                        <div className={'summary-item-val' + (item.primary ? ' primary' : '')}>{item.val}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)', marginBottom: 28, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink3)', marginBottom: 10 }}>Din livsstilsprofil</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {getLifestyleTags().map((tag, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>check_circle</span>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Opret konto for at se dine matches</h3>
                    <p style={{ fontSize: 14, color: 'var(--ink3)', marginBottom: 20 }}>Vi gemmer din quiz og viser dig de bedste matches med det samme.</p>

                    <div className="form-grid">
                      <div className="field-group">
                        <label className="field-label">E-mail</label>
                        <input
                          className={'field-input' + (emailError ? ' error' : '')}
                          type="email"
                          placeholder="din@email.dk"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setEmailError(false) }}
                          autoComplete="email"
                        />
                        {emailError && <span className="error-msg">Angiv en gyldig e-mailadresse</span>}
                      </div>
                      <div className="field-group">
                        <label className="field-label">Adgangskode</label>
                        <input
                          className={'field-input' + (passwordError ? ' error' : '')}
                          type="password"
                          placeholder="Mindst 6 tegn"
                          value={password}
                          onChange={e => { setPassword(e.target.value); setPasswordError(false) }}
                          autoComplete="new-password"
                        />
                        {passwordError && <span className="error-msg">Adgangskoden skal være mindst 6 tegn</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={handleSignup}
                    disabled={isPending}
                  >
                    {isPending ? 'Opretter konto...' : 'Opret konto og se mine matches'}
                    {!isPending && <span className="material-symbols-rounded">arrow_forward</span>}
                  </button>

                  {serverError && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginTop: 12, textAlign: 'left' }}>
                      <p style={{ color: '#E05252', fontSize: 13 }}>{serverError}</p>
                    </div>
                  )}

                  <div className="trust-line" style={{ marginTop: 16 }}>
                    <span className="material-symbols-rounded">shield</span>
                    Din profil er kun synlig for verificerede brugere
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
