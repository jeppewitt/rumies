export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 38" fill="none" className={className}>
      <polygon points="20,2 38,17 2,17" fill="#D97757" />
      <rect x="5" y="16" width="30" height="20" rx="2" fill="#D97757" />
      <circle cx="15" cy="27" r="5.5" fill="#F7F4EF" opacity="0.92" />
      <circle cx="25" cy="27" r="5.5" fill="#F7F4EF" opacity="0.60" />
      <path d="M20,22 a5.5,5.5 0 0 1 0,10 a5.5,5.5 0 0 1 0,-10" fill="#F7F4EF" opacity="0.30" />
    </svg>
  )
}
