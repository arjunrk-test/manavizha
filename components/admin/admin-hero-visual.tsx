"use client"

import { AdminDashboardPreview } from "@/components/admin/admin-dashboard-preview"

const petals = [
  { left: "18%", bottom: "6%", size: 10 },
  { left: "32%", bottom: "4%", size: 7 },
  { left: "48%", bottom: "8%", size: 9 },
  { left: "62%", bottom: "3%", size: 6 },
  { left: "74%", bottom: "7%", size: 8 },
]

export function AdminHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[720px] lg:max-w-none lg:mx-0">
      {/* Soft pink wave blobs */}
      <div
        className="pointer-events-none absolute -top-8 right-[-10%] h-56 w-56 rounded-full bg-[#ffc8d8]/35 blur-3xl sm:h-72 sm:w-72"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[18%] left-[-8%] h-48 w-48 rounded-full bg-[#ffe4ec]/50 blur-3xl"
        aria-hidden
      />

      {/* Mandala watermark — centered behind dashboard */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[min(92vw,520px)] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.11]"
        aria-hidden
      >
        <svg viewBox="0 0 400 400" className="h-full w-full text-[#c9a227]" fill="currentColor">
          <circle cx="200" cy="200" r="188" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
          <circle cx="200" cy="200" r="148" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <circle cx="200" cy="200" r="108" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI) / 6
            const x1 = 200 + Math.cos(angle) * 60
            const y1 = 200 + Math.sin(angle) * 60
            const x2 = 200 + Math.cos(angle) * 170
            const y2 = 200 + Math.sin(angle) * 170
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
          })}
          {[...Array(8)].map((_, i) => {
            const angle = (i * Math.PI) / 4
            const cx = 200 + Math.cos(angle) * 130
            const cy = 200 + Math.sin(angle) * 130
            return <circle key={i} cx={cx} cy={cy} r="14" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
          })}
          <circle cx="200" cy="200" r="22" fill="none" stroke="#e87898" strokeWidth="1" opacity="0.35" />
        </svg>
      </div>

      {/* Dashboard + overlapping decor — single scene */}
      <div className="relative z-10">
        <AdminDashboardPreview />

        {petals.map((petal, i) => (
          <span
            key={i}
            className="pointer-events-none absolute z-20 rounded-full bg-[#f4b8c8]/45"
            style={{
              left: petal.left,
              bottom: petal.bottom,
              width: petal.size,
              height: petal.size,
            }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}
