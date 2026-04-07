export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className}>
      <polygon points="14,2 26,24 2,24" fill="#D97757" />
      <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
    </svg>
  )
}
