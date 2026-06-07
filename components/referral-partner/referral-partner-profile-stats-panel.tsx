"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, IndianRupee, User, Users } from "lucide-react"

type PartnerStats = {
  total: number
  men: number
  women: number
  earnings: number
}

const R = 46
const C = 2 * Math.PI * R

export function ReferralPartnerProfileStatsPanel({ stats }: { stats: PartnerStats }) {
  const menShare = stats.total > 0 ? stats.men / stats.total : 0
  const womenShare = stats.total > 0 ? stats.women / stats.total : 0
  const menLen = C * menShare
  const womenLen = C * womenShare

  return (
    <div className="relative w-full max-w-md lg:max-w-none lg:w-[min(100%,420px)] shrink-0 overflow-visible">
      <div className="relative overflow-visible rounded-[1.15rem] border border-white/90 bg-white/90 shadow-[0_16px_48px_rgba(31,64,104,0.1),0_4px_16px_rgba(232,120,152,0.06)] backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,200,212,0.2),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(59,185,172,0.08),transparent_50%)] pointer-events-none" />

        <div className="relative p-4 sm:p-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href="/referral-partner/profiles"
              className="group relative shrink-0"
              aria-label={`${stats.total} referred profiles`}
            >
              <div className="relative h-[132px] w-[132px] sm:h-[148px] sm:w-[148px]">
                <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden>
                  <circle cx="56" cy="56" r={R} fill="none" stroke="#f0ebe3" strokeWidth="10" />
                  {stats.total > 0 && (
                    <>
                      <motion.circle
                        cx="56"
                        cy="56"
                        r={R}
                        fill="none"
                        stroke="#1F4068"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${menLen} ${C}`}
                        initial={{ strokeDashoffset: C }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r={R}
                        fill="none"
                        stroke="#e87898"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${womenLen} ${C}`}
                        strokeDashoffset={-menLen}
                        initial={{ strokeDashoffset: C - menLen }}
                        animate={{ strokeDashoffset: -menLen }}
                        transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <motion.span
                    key={stats.total}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-display text-3xl sm:text-[2rem] font-bold text-[#1F4068] tabular-nums leading-none"
                  >
                    {stats.total}
                  </motion.span>
                  <span className="text-[10px] font-medium text-gray-500 mt-1">referrals</span>
                </div>
              </div>
            </Link>

            <div className="flex-1 min-w-0 space-y-2.5">
              <Link
                href="/referral-partner/profiles?gender=Male"
                className="group flex items-center gap-3 rounded-xl border border-[#1F4068]/10 bg-gradient-to-r from-[#1F4068]/5 to-white p-3 transition-all hover:border-[#1F4068]/20 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1F4068]/10">
                  <User className="h-4 w-4 text-[#1F4068]" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500">Men</p>
                  <p className="text-xl font-bold text-[#1F4068] tabular-nums leading-tight">{stats.men}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-[#1F4068] transition-colors shrink-0" />
              </Link>

              <Link
                href="/referral-partner/profiles?gender=Female"
                className="group flex items-center gap-3 rounded-xl border border-[#e87898]/15 bg-gradient-to-r from-[#fce8ef]/70 to-white p-3 transition-all hover:border-[#e87898]/30 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fce8ef]">
                  <User className="h-4 w-4 text-[#e87898]" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500">Women</p>
                  <p className="text-xl font-bold text-[#1F4068] tabular-nums leading-tight">{stats.women}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-[#e87898] transition-colors shrink-0" />
              </Link>

              <div className="flex items-center gap-3 rounded-xl border border-[#c9a227]/20 bg-gradient-to-r from-[#fdf6e3]/70 to-white p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c9a227]/15">
                  <IndianRupee className="h-4 w-4 text-[#c9a227]" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500">Estimated earnings</p>
                  <p className="text-xl font-bold text-[#1F4068] tabular-nums leading-tight">
                    ₹{stats.earnings.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1 pt-0.5">
                <Users className="h-3.5 w-3.5 text-[#3bb9ac]" strokeWidth={1.75} />
                <span className="text-[10px] text-gray-500">
                  {stats.total > 0
                    ? `${Math.round(menShare * 100)}% men · ${Math.round(womenShare * 100)}% women`
                    : "No referrals yet — share your partner ID"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
