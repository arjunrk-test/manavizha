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

function MandalaRing() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden fill="none">
      <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="1.1" opacity="0.42" />
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="0.9" opacity="0.34" />
      <circle cx="60" cy="60" r="24" stroke="currentColor" strokeWidth="0.9" opacity="0.28" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="60"
          y1="8"
          x2="60"
          y2="20"
          stroke="currentColor"
          strokeWidth="0.85"
          opacity="0.26"
          transform={`rotate(${angle} 60 60)`}
        />
      ))}
    </svg>
  )
}

export function DashboardJourneyPatterns() {
  return (
    <div className="dashboard-journey-pattern-layer" aria-hidden>
      <div className="dashboard-journey-glow w-28 h-28 bg-[#fce8ef] -top-9 -right-7 opacity-55" />
      <div className="dashboard-journey-glow w-24 h-24 bg-[#fdf6e3] bottom-7 -left-9 opacity-60" />
      <div className="dashboard-journey-glow w-20 h-20 bg-[#e6f7f5] top-1/2 -right-3 opacity-50" />

      <div className="dashboard-journey-static-grid absolute inset-0 opacity-70" />
      <div className="dashboard-journey-static-dots absolute inset-0 opacity-65" />
      <div className="dashboard-journey-static-diagonal absolute inset-0 opacity-60" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-36 h-36 text-[#e87898] opacity-[0.12]">
        <MandalaRing />
      </div>

      <div className="dashboard-journey-static-corner dashboard-journey-static-corner--tl">
        <CornerOrnament />
      </div>
      <div className="dashboard-journey-static-corner dashboard-journey-static-corner--tr">
        <CornerOrnament />
      </div>
      <div className="dashboard-journey-static-corner dashboard-journey-static-corner--bl">
        <CornerOrnament />
      </div>
      <div className="dashboard-journey-static-corner dashboard-journey-static-corner--br">
        <CornerOrnament />
      </div>
    </div>
  )
}
