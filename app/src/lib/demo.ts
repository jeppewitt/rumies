/**
 * Demo-tilstand: slår al Supabase-afhængighed fra, så onboarding-flowet
 * (rolle → quiz → info → success) kan vises uden database eller oprettelse.
 *
 * Slået TIL som standard, så demoen virker uden konfiguration i Netlify.
 * Sæt NEXT_PUBLIC_DEMO_MODE=0 for at få normal drift med login og database.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== '0'
