function CornerOrnament() {
  return (
    <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden fill="none">
      <path
        d="M4 4 H28 M4 4 V28 M4 4 C4 4 18 8 28 18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="32" cy="8" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="8" cy="32" r="2.5" fill="currentColor" opacity="0.7" />
      <path
        d="M12 12 C16 10 20 12 22 16"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.55"
      />
    </svg>
  )
}

export function DashboardHeroStaticPatterns() {
  return (
    <div className="dashboard-hero-static-layer" aria-hidden>
      <div className="dashboard-hero-static-grid absolute inset-0 opacity-50" />
      <div className="dashboard-hero-static-dots absolute inset-0 opacity-60" />
      <div className="dashboard-hero-static-diagonal absolute inset-0 opacity-70" />

      <div className="dashboard-hero-static-corner dashboard-hero-static-corner--tl">
        <CornerOrnament />
      </div>
      <div className="dashboard-hero-static-corner dashboard-hero-static-corner--br">
        <CornerOrnament />
      </div>
    </div>
  )
}
