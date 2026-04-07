import { notFound, redirect } from 'next/navigation'
import { setDevRole } from '@/app/actions/dev'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import SeedButton from './SeedButton'

async function loginAs(email: string, dest: string) {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signInWithPassword({ email, password: 'test1234' })
  revalidatePath('/', 'layout')
  redirect(dest)
}

const card: React.CSSProperties = {
  background: '#1a1a1a', border: '1px solid #333', borderRadius: 16,
  padding: '40px 48px', textAlign: 'center', maxWidth: 480, width: '100%',
}
const label = (color: string): React.CSSProperties => ({
  color, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: 14, display: 'block',
})
const divider: React.CSSProperties = { borderTop: '1px solid #333', margin: '28px 0' }
const row: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }
const nameStyle: React.CSSProperties = { color: '#ccc', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', width: 120, textAlign: 'left' }

function QuickBtn({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <button type="submit" style={{
      padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${color}`,
      background: 'transparent', color, fontSize: 12, fontWeight: 700,
      fontFamily: 'monospace', cursor: 'pointer',
    }}>{children}</button>
  )
}

export default function DevPage() {
  if (process.env.NODE_ENV !== 'development') notFound()

  const seekerColor = '#4ade80'
  const landlordColor = '#f97316'

  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: 20 }}>
      <div style={card}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em' }}>DEV TOOLS</span>
          <a href="/dev/overview" style={{ color: '#555', fontSize: 11, textDecoration: 'none', border: '1px solid #333', borderRadius: 6, padding: '4px 10px' }}>Overview →</a>
        </div>

        {/* ── Quick Login ── */}
        <span style={label('#fff')}>Quick Login</span>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 18 }}>Logger ind og sender dig direkte til siden</div>

        {/* Emma */}
        <div style={row}>
          <span style={nameStyle}>👤 Emma</span>
          {(['dashboard', 'matches', 'chat'] as const).map(dest => (
            <form key={dest} action={loginAs.bind(null, 'sogende@test.dk', `/${dest}`)}>
              <QuickBtn color={seekerColor}>{dest}</QuickBtn>
            </form>
          ))}
        </div>

        {/* Mikkel */}
        <div style={row}>
          <span style={nameStyle}>🏠 Mikkel</span>
          {(['dashboard', 'matches'] as const).map(dest => (
            <form key={dest} action={loginAs.bind(null, 'udlejer@test.dk', `/${dest}`)}>
              <QuickBtn color={landlordColor}>{dest}</QuickBtn>
            </form>
          ))}
        </div>

        <div style={divider} />

        {/* ── Onboarding preview ── */}
        <span style={label('#a78bfa')}>Onboarding preview</span>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 16 }}>Logger ind og viser onboarding — selv om profil allerede findes</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <form action={loginAs.bind(null, 'sogende@test.dk', '/onboarding?preview=1')} style={{ flex: 1 }}>
            <button type="submit" style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1.5px solid #a78bfa', background: 'transparent', color: '#a78bfa', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}>👤 Som søgende</button>
          </form>
          <form action={loginAs.bind(null, 'udlejer@test.dk', '/onboarding?preview=1')} style={{ flex: 1 }}>
            <button type="submit" style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1.5px solid #a78bfa', background: 'transparent', color: '#a78bfa', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}>🏠 Som udlejer</button>
          </form>
        </div>

        <div style={divider} />

        {/* ── Rolle-toggle ── */}
        <span style={label('#888')}>Rolle-toggle (uden login)</span>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <form action={async () => { 'use server'; await setDevRole('seeker'); redirect('/dashboard') }} style={{ flex: 1 }}>
            <button type="submit" style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: `1.5px solid ${seekerColor}`, background: 'transparent', color: seekerColor, fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}>👤 Søgende</button>
          </form>
          <form action={async () => { 'use server'; await setDevRole('landlord'); redirect('/dashboard') }} style={{ flex: 1 }}>
            <button type="submit" style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: `1.5px solid ${landlordColor}`, background: 'transparent', color: landlordColor, fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}>🏠 Udlejer</button>
          </form>
        </div>

        <div style={divider} />

        {/* ── Seed ── */}
        <span style={label('#888')}>Seed test-data</span>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 16 }}>
          sogende@test.dk · udlejer@test.dk · password: test1234
        </div>
        <SeedButton />

      </div>
    </div>
  )
}
