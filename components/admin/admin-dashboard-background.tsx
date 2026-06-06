"use client"

import { motion } from "framer-motion"
import { DashboardHeroPatterns } from "@/components/dashboard/dashboard-hero-patterns"

function AdminMandalaWatermark() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[28%] h-[min(110vw,680px)] w-[min(110vw,680px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
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
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.7"
              opacity="0.25"
            />
          )
        })}
        {[...Array(8)].map((_, i) => {
          const angle = (i * Math.PI) / 4
          const cx = 200 + Math.cos(angle) * 130
          const cy = 200 + Math.sin(angle) * 130
          return (
            <circle key={i} cx={cx} cy={cy} r="14" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
          )
        })}
        <circle cx="200" cy="200" r="22" fill="none" stroke="#e87898" strokeWidth="1" opacity="0.35" />
      </svg>
    </div>
  )
}

export function AdminDashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden admin-dashboard-surface" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,200,212,0.35),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(201,162,39,0.12),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_88%,rgba(59,185,172,0.14),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_78%,rgba(232,120,152,0.1),transparent_35%)]" />

      <AdminMandalaWatermark />

      <motion.div
        className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#ffc8d8]/30 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[45%] -left-32 h-72 w-72 rounded-full bg-[#3bb9ac]/15 blur-3xl"
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute bottom-0 right-[15%] h-64 w-64 rounded-full bg-[#f0d48a]/20 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <DashboardHeroPatterns />

      <div className="absolute inset-0 opacity-[0.035] bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath d%3D%22M30 5c4 9 11 14 20 16-9 2-16 7-20 16-4-9-11-14-20-16 9-2 16-7 20-16z%22 fill%3D%22%231F4068%22/%3E%3C/svg%3E')] bg-[length:60px_60px]" />
    </div>
  )
}
