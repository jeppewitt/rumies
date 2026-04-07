'use client'

import { useState } from 'react'

export default function SeedButton() {
  const [log, setLog] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setLog(null)
    try {
      const res = await fetch('/dev/seed')
      const json = await res.json()
      setLog(json.log ?? [json.error ?? 'Ukendt fejl'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={loading}
        style={{
          width: '100%', padding: '13px 0', borderRadius: 10,
          border: '1.5px solid #a78bfa', background: 'transparent',
          color: '#a78bfa', fontSize: 14, fontWeight: 700,
          fontFamily: 'monospace', cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.6 : 1, marginBottom: 14,
        }}
      >
        {loading ? '⏳ Opretter...' : '🌱 Opret test-konti'}
      </button>
      {log && (
        <div style={{
          textAlign: 'left', background: '#111', borderRadius: 8,
          padding: 14, fontSize: 12, color: '#4ade80', lineHeight: 1.9,
        }}>
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}
