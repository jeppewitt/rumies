export default function MatchesLoading() {
  return (
    <div style={{
      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
      background: '#F7F4EF',
      minHeight: '100vh',
      paddingBottom: 80,
    }}>
      {/* Nav */}
      <div style={{
        height: 64, background: 'rgba(247,244,239,0.95)', borderBottom: '1px solid #E8E0D8',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8E0D8' }} />
        <div style={{ width: 70, height: 20, borderRadius: 6, background: '#E8E0D8' }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 180, height: 28, borderRadius: 8, background: '#E8E0D8', marginBottom: 10 }} />
          <div style={{ width: 120, height: 16, borderRadius: 6, background: '#EDE7DF' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #E8E0D8', marginBottom: 20, gap: 8 }}>
          <div style={{ width: 80, height: 40, borderRadius: 8, background: '#E8E0D8' }} />
          <div style={{ width: 100, height: 40, borderRadius: 8, background: '#EDE7DF' }} />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[80, 110, 95].map((w, i) => (
            <div key={i} style={{ width: w, height: 34, borderRadius: 20, background: '#E8E0D8' }} />
          ))}
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      border: '1px solid #E8E0D8',
      animation: 'pulse 1.6s ease-in-out infinite',
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      {/* Image */}
      <div style={{ height: 200, background: '#E8E0D8' }} />
      {/* Body */}
      <div style={{ padding: '16px 16px 20px' }}>
        <div style={{ width: '60%', height: 20, borderRadius: 6, background: '#E8E0D8', marginBottom: 10 }} />
        <div style={{ width: '40%', height: 14, borderRadius: 6, background: '#EDE7DF', marginBottom: 8 }} />
        <div style={{ width: '80%', height: 14, borderRadius: 6, background: '#EDE7DF', marginBottom: 16 }} />
        <div style={{ width: '100%', height: 40, borderRadius: 10, background: '#E8E0D8' }} />
      </div>
    </div>
  )
}
