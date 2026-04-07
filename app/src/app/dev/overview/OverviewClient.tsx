'use client'

import { useState, useRef } from 'react'

const PHONE_W = 390
const PHONE_H = 812
const SCALE = 0.46
const DISPLAY_W = Math.round(PHONE_W * SCALE)
const DISPLAY_H = Math.round(PHONE_H * SCALE)
const FRAME_GAP = 12   // gap mellem scroll-frames inden for samme side
const PAGE_GAP = 36    // gap mellem sider i samme gruppe

type Frame = { label: string; url: string; group: string }

function FrameCard({ url, scrollY, label }: { url: string; scrollY: number; label: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  return (
    <div style={{ flexShrink: 0 }}>
      <a href={url} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
        <div
          style={{
            width: DISPLAY_W, height: DISPLAY_H,
            borderRadius: 14, overflow: 'hidden',
            border: '1px solid #1e1e1e', background: '#111',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
        >
          <iframe
            ref={ref}
            src={url}
            onLoad={() => { try { ref.current?.contentWindow?.scrollTo(0, scrollY) } catch {} }}
            style={{
              width: PHONE_W, height: PHONE_H, border: 'none',
              transformOrigin: '0 0', transform: `scale(${SCALE})`,
              pointerEvents: 'none',
            }}
          />
        </div>
      </a>
      <div style={{ color: '#555', fontSize: 10, marginTop: 6, textAlign: 'center', maxWidth: DISPLAY_W }}>
        {label}
      </div>
    </div>
  )
}

function PageGroup({ frame }: { frame: Frame }) {
  const [positions, setPositions] = useState<number[] | null>(null)
  const probeRef = useRef<HTMLIFrameElement>(null)

  const onProbeLoad = () => {
    try {
      const totalH = probeRef.current?.contentDocument?.documentElement.scrollHeight ?? PHONE_H
      const n = Math.max(1, Math.ceil(totalH / PHONE_H))
      setPositions(Array.from({ length: n }, (_, i) => i * PHONE_H))
    } catch {
      setPositions([0])
    }
  }

  const resolved = positions ?? [0]

  return (
    <div style={{ display: 'flex', gap: FRAME_GAP, alignItems: 'flex-start', flexShrink: 0 }}>
      {/* Skjult probe-iframe til at måle fuld sidhøjde */}
      {positions === null && (
        <iframe
          ref={probeRef}
          src={frame.url}
          onLoad={onProbeLoad}
          aria-hidden
          style={{
            position: 'fixed', top: 0, left: -9999,
            width: PHONE_W, height: PHONE_H,
            opacity: 0, pointerEvents: 'none', zIndex: -999,
          }}
        />
      )}
      {resolved.map((scrollY, i) => (
        <FrameCard
          key={scrollY}
          url={frame.url}
          scrollY={scrollY}
          label={
            resolved.length === 1
              ? frame.label
              : i === 0
                ? frame.label
                : `${frame.label} ↓${i + 1}`
          }
        />
      ))}
    </div>
  )
}

export default function OverviewClient({ frames }: { frames: Frame[] }) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const groups = [...new Set(frames.map(f => f.group))]
  const visibleGroups = activeGroup ? [activeGroup] : groups

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'monospace' }}>

      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0a0a0a', borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 24px', flexWrap: 'wrap',
      }}>
        <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', marginRight: 8 }}>STORYBOARD</span>

        <button
          onClick={() => setActiveGroup(null)}
          style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${!activeGroup ? '#4ade80' : '#2a2a2a'}`, background: !activeGroup ? 'rgba(74,222,128,0.08)' : 'transparent', color: !activeGroup ? '#4ade80' : '#555', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace' }}
        >Alle ({frames.length})</button>

        {groups.map(g => {
          const count = frames.filter(f => f.group === g).length
          const active = activeGroup === g
          return (
            <button key={g}
              onClick={() => setActiveGroup(active ? null : g)}
              style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${active ? '#a78bfa' : '#2a2a2a'}`, background: active ? 'rgba(167,139,250,0.08)' : 'transparent', color: active ? '#a78bfa' : '#555', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace' }}
            >{g} ({count})</button>
          )
        })}

        <a href="/dev" style={{ marginLeft: 'auto', color: '#333', fontSize: 11, textDecoration: 'none' }}>← Dev</a>
      </div>

      {/* Frames */}
      <div style={{ padding: 24 }}>
        {visibleGroups.map(group => {
          const groupFrames = frames.filter(f => f.group === group)
          return (
            <div key={group} style={{ marginBottom: 48 }}>
              <div style={{ color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>
                {group}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: PAGE_GAP, rowGap: PAGE_GAP, alignItems: 'flex-start' }}>
                {groupFrames.map(frame => (
                  <PageGroup key={frame.url + frame.label} frame={frame} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
