"use client"

import { IndianRupee, Users } from "lucide-react"

const stats = [
  { label: "Total referrals", value: "128", accent: "text-[#3bb9ac]" },
  { label: "Men", value: "54", accent: "text-[#1F4068]" },
  { label: "Women", value: "74", accent: "text-[#e87898]" },
]

export function ReferralPartnerHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[720px] lg:max-w-none lg:mx-0">
      <div
        className="pointer-events-none absolute -top-8 right-[-10%] h-56 w-56 rounded-full bg-[#ffc8d8]/35 blur-3xl sm:h-72 sm:w-72"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[18%] left-[-8%] h-48 w-48 rounded-full bg-[#ffe4ec]/50 blur-3xl"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[min(92vw,520px)] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.11]"
        aria-hidden
      >
        <svg viewBox="0 0 400 400" className="h-full w-full text-[#c9a227]" fill="currentColor">
          <circle cx="200" cy="200" r="188" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
          <circle cx="200" cy="200" r="148" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <circle cx="200" cy="200" r="108" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </div>

      <div className="relative z-10 rounded-2xl border border-gray-100/90 bg-white/95 shadow-[0_24px_64px_rgba(31,64,104,0.12)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#faf8f4]/80 px-5 py-3.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
              Partner dashboard
            </p>
            <p className="text-sm font-semibold text-[#1F4068]">Referral overview</p>
          </div>
          <span className="rounded-full bg-[#3bb9ac]/10 px-3 py-1 text-xs font-medium text-[#3bb9ac]">
            Partner ID · MV-4821
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-100 bg-[#faf8f4] px-3 py-3 text-center"
              >
                <p className={`text-xl sm:text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#c9a227]/20 bg-gradient-to-br from-[#faf8f4] to-white p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a227]/15">
                <IndianRupee className="h-5 w-5 text-[#c9a227]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Estimated earnings</p>
                <p className="text-lg font-semibold text-[#1F4068]">₹24,600</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Share rate</p>
              <p className="text-sm font-semibold text-[#3bb9ac]">10%</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-[#3bb9ac]" strokeWidth={1.75} />
              <p className="text-sm font-semibold text-[#1F4068]">Recent referrals</p>
            </div>
            <div className="space-y-2.5">
              {["Profile joined · Chennai", "Membership upgraded · Coimbatore", "New signup · Madurai"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg bg-[#faf8f4] px-3 py-2 text-xs text-gray-600"
                  >
                    <span>{item}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3bb9ac]" aria-hidden />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
