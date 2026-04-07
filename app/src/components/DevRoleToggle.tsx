'use client'

import { useTransition } from 'react'
import { setDevRole } from '@/app/actions/dev'

export default function DevRoleToggle({ currentRole }: { currentRole: 'seeker' | 'landlord' }) {
  const [pending, startTransition] = useTransition()
  const other = currentRole === 'seeker' ? 'landlord' : 'seeker'
  const label = currentRole === 'seeker' ? 'Søgende' : 'Udlejer'
  const otherLabel = other === 'seeker' ? 'Søgende' : 'Udlejer'

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 16, zIndex: 9999,
      background: '#1a1a1a', borderRadius: 12, padding: '8px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      fontFamily: 'monospace', fontSize: 12,
      border: '1px solid #333',
    }}>
      <span style={{ color: '#888', fontWeight: 700, letterSpacing: '0.08em' }}>DEV</span>
      <span style={{ color: '#4ade80', fontWeight: 700 }}>{label}</span>
      <button
        onClick={() => startTransition(() => setDevRole(other))}
        disabled={pending}
        style={{
          background: '#2a2a2a', border: '1px solid #444', borderRadius: 8,
          color: '#ccc', padding: '4px 10px', cursor: 'pointer',
          fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
          transition: 'all 0.15s', opacity: pending ? 0.5 : 1,
        }}
      >
        {pending ? '...' : `→ ${otherLabel}`}
      </button>
    </div>
  )
}
