export default function DashboardLoading() {
  return (
    <div style={{
      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
      background: '#F7F4EF',
      minHeight: '100vh',
      paddingBottom: 80,
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Nav */}
      <div style={{
        height: 64, background: 'rgba(247,244,239,0.95)', borderBottom: '1px solid #E8E0D8',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8E0D8' }} />
        <div style={{ width: 70, height: 20, borderRadius: 6, background: '#E8E0D8' }} />
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24, animation: 'pulse 1.6s ease-in-out infinite' }}>
          <div style={{ width: 200, height: 30, borderRadius: 8, background: '#E8E0D8', marginBottom: 8 }} />
          <div style={{ width: 140, height: 16, borderRadius: 6, background: '#EDE7DF' }} />
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20,
          animation: 'pulse 1.6s ease-in-out infinite',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #E8E0D8',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8E0D8', marginBottom: 10 }} />
              <div style={{ width: '50%', height: 22, borderRadius: 6, background: '#E8E0D8', marginBottom: 6 }} />
              <div style={{ width: '80%', height: 12, borderRadius: 4, background: '#EDE7DF' }} />
            </div>
          ))}
        </div>

        {/* Main card */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 24, marginBottom: 20,
          animation: 'pulse 1.6s ease-in-out infinite',
        }}>
          <div style={{ width: 160, height: 20, borderRadius: 6, background: '#E8E0D8', marginBottom: 16 }} />
          {[100, 140, 80].map((w, i) => (
            <div key={i} style={{ width: w, height: 14, borderRadius: 5, background: '#EDE7DF', marginBottom: 10 }} />
          ))}
          <div style={{ width: '100%', height: 44, borderRadius: 12, background: '#E8E0D8', marginTop: 16 }} />
        </div>

        {/* Top matches */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 24,
          animation: 'pulse 1.6s ease-in-out infinite',
        }}>
          <div style={{ width: 120, height: 18, borderRadius: 6, background: '#E8E0D8', marginBottom: 16 }} />
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: '#E8E0D8', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '60%', height: 14, borderRadius: 5, background: '#E8E0D8', marginBottom: 6 }} />
                <div style={{ width: '40%', height: 12, borderRadius: 4, background: '#EDE7DF' }} />
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 8, background: '#EDE7DF' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
