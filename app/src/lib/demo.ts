/**
 * Demo-tilstand: slår al Supabase-afhængighed fra, så onboarding-flowet
 * (rolle → quiz → info → success) kan vises uden database eller oprettelse.
 * Slås til med NEXT_PUBLIC_DEMO_MODE=1 — sæt til 0 for normal drift.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === '1'
