"use client"

import { useId } from "react"

type PatternTint = "rose" | "blush" | "gold" | "teal"

type PatternConfig = {
  type: "petal" | "ring" | "lotus" | "mandala" | "bindi"
  top: string
  left: string
  size: number
  blur: number
  opacity: number
  rotate: number
  floatDuration: number
  floatDelay: number
  floatAmp: number
  tint: PatternTint
}

const PATTERNS: PatternConfig[] = [
  { type: "petal", top: "-8%", left: "6%", size: 38, blur: 6, opacity: 0.42, rotate: 22, floatDuration: 5.2, floatDelay: 0, floatAmp: 0.7, tint: "rose" },
  { type: "ring", top: "55%", left: "12%", size: 30, blur: 5, opacity: 0.38, rotate: -18, floatDuration: 4.8, floatDelay: 0.8, floatAmp: 0.65, tint: "gold" },
  { type: "lotus", top: "10%", left: "28%", size: 34, blur: 4, opacity: 0.4, rotate: 35, floatDuration: 5.6, floatDelay: 1.2, floatAmp: 0.75, tint: "blush" },
  { type: "mandala", top: "62%", left: "38%", size: 36, blur: 7, opacity: 0.32, rotate: 0, floatDuration: 6.0, floatDelay: 0.4, floatAmp: 0.6, tint: "gold" },
  { type: "petal", top: "-12%", left: "52%", size: 44, blur: 8, opacity: 0.36, rotate: -28, floatDuration: 5.4, floatDelay: 1.6, floatAmp: 0.8, tint: "blush" },
  { type: "bindi", top: "48%", left: "58%", size: 22, blur: 3, opacity: 0.45, rotate: 12, floatDuration: 4.5, floatDelay: 2.0, floatAmp: 0.55, tint: "rose" },
  { type: "ring", top: "8%", left: "72%", size: 26, blur: 4, opacity: 0.35, rotate: 40, floatDuration: 5.0, floatDelay: 0.6, floatAmp: 0.7, tint: "gold" },
  { type: "lotus", top: "58%", left: "82%", size: 32, blur: 6, opacity: 0.38, rotate: -42, floatDuration: 5.8, floatDelay: 1.4, floatAmp: 0.72, tint: "teal" },
  { type: "petal", top: "20%", left: "90%", size: 40, blur: 9, opacity: 0.3, rotate: 55, floatDuration: 6.2, floatDelay: 0.2, floatAmp: 0.85, tint: "rose" },
  { type: "mandala", top: "-5%", left: "18%", size: 28, blur: 5, opacity: 0.34, rotate: 15, floatDuration: 4.6, floatDelay: 2.4, floatAmp: 0.6, tint: "gold" },
]

const TINTS: Record<PatternTint, [string, string, string]> = {
  rose: ["#f4a4b8", "#e87898", "#d4567a"],
  blush: ["#ffc8d4", "#ffb3c6", "#ff9eb8"],
  gold: ["#f0d48a", "#e8c060", "#c9a227"],
  teal: ["#8fd9cf", "#3bb9ac", "#2a9d8f"],
}

function PatternShape({ type, tint }: { type: PatternConfig["type"]; tint: PatternTint }) {
  const id = useId()
  const [c1, c2, c3] = TINTS[tint]

  if (type === "petal") {
    return (
      <svg viewBox="0 0 48 64" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} stopOpacity="0.95" />
            <stop offset="55%" stopColor={c2} stopOpacity="0.85" />
            <stop offset="100%" stopColor={c3} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path
          d="M24 2 C24 2 46 18 44 36 C42 50 24 62 24 62 C24 62 6 50 4 36 C2 18 24 2 24 2 Z"
          fill={`url(#${id})`}
        />
      </svg>
    )
  }

  if (type === "ring") {
    return (
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        </defs>
        <circle cx="18" cy="24" r="11" fill="none" stroke={`url(#${id})`} strokeWidth="3.5" opacity="0.9" />
        <circle cx="30" cy="24" r="11" fill="none" stroke={`url(#${id})`} strokeWidth="3.5" opacity="0.75" />
        <path d="M24 14 L24 10" stroke={c2} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  }

  if (type === "lotus") {
    return (
      <svg viewBox="0 0 56 48" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={id} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor={c3} stopOpacity="0.8" />
            <stop offset="100%" stopColor={c1} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path d="M28 44 C28 44 8 28 10 16 C12 6 28 2 28 2 C28 2 44 6 46 16 C48 28 28 44 28 44 Z" fill={`url(#${id})`} />
        <path d="M28 38 C28 38 14 26 16 18 C17 12 28 8 28 8 C28 8 39 12 40 18 C42 26 28 38 28 38 Z" fill="white" fillOpacity="0.18" />
      </svg>
    )
  }

  if (type === "bindi") {
    return (
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={id} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c3} />
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="10" fill={`url(#${id})`} opacity="0.85" />
        <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.35" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c3} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" opacity="0.7" />
      <circle cx="24" cy="24" r="12" fill="none" stroke={`url(#${id})`} strokeWidth="1" opacity="0.55" />
      <circle cx="24" cy="24" r="6" fill="none" stroke={`url(#${id})`} strokeWidth="1" opacity="0.45" />
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1="24"
          y1="6"
          x2="24"
          y2="12"
          stroke={c2}
          strokeWidth="1"
          opacity="0.4"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
    </svg>
  )
}

function FloatingPattern({ config }: { config: PatternConfig }) {
  const aspect = config.type === "petal" ? 1.33 : config.type === "lotus" ? 0.86 : 1

  return (
    <div
      className="hero-petal-3d absolute pointer-events-none"
      style={{
        top: config.top,
        left: config.left,
        width: config.size,
        height: config.size * aspect,
        rotate: `${config.rotate}deg`,
        opacity: config.opacity,
        filter: `blur(${config.blur}px)`,
        zIndex: 0,
      }}
    >
      <div
        className="hero-petal-float h-full w-full"
        style={
          {
            "--float-duration": `${config.floatDuration}s`,
            "--float-delay": `${config.floatDelay}s`,
            "--float-amp": config.floatAmp,
          } as React.CSSProperties
        }
      >
        <PatternShape type={config.type} tint={config.tint} />
      </div>
    </div>
  )
}

export function DashboardHeroPatterns() {
  return (
    <div className="hero-petals-layer absolute inset-0 overflow-hidden pointer-events-none z-[2]" aria-hidden>
      {PATTERNS.map((pattern, index) => (
        <FloatingPattern key={index} config={pattern} />
      ))}
    </div>
  )
}
