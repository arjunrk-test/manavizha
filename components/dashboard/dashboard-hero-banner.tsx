"use client"

import { CheckCircle2, Crown, Gem } from "lucide-react"
import { KineticText } from "@/components/ui/kinetic-text"
import { DashboardHeroPatterns } from "./dashboard-hero-patterns"
import { DashboardHeroStaticPatterns } from "./dashboard-hero-static-patterns"

interface DashboardHeroBannerProps {
  displayName: string
  photoUrl?: string
  isPremium?: boolean
  premiumPlan?: string | null
  photoVerified?: boolean
  trustScore: number
  trustLabel: string
  premiumBadge?: React.ReactNode
}

export function DashboardHeroBanner({
  displayName,
  photoUrl,
  isPremium,
  photoVerified,
  trustScore,
  trustLabel,
  premiumBadge,
}: DashboardHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#eadfce] bg-gradient-to-br from-[#fffdf8] via-[#fef8ee] to-[#fdf3e4] shadow-[0_2px_16px_rgba(201,162,39,0.08)]">
      {/* Mandala background */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none z-0"
        style={{
          backgroundImage: "url(/images/dashboard-mandala.png)",
          backgroundSize: "420px auto",
          backgroundPosition: "right -20px top -30px",
          backgroundRepeat: "no-repeat",
        }}
      />

      <DashboardHeroStaticPatterns />
      <DashboardHeroPatterns />

      {/* Kumbam decoration — beside trust score */}
      <img
        src="/images/dashboard-kumbam-transparent.png"
        alt=""
        className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 w-[125px] sm:w-[148px] lg:w-[175px] h-auto object-contain pointer-events-none hidden sm:block z-[3] drop-shadow-[0_4px_12px_rgba(201,162,39,0.15)]"
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 px-5 pt-5 pb-3 md:px-6 md:pt-5 md:pb-3.5 md:pr-[160px] lg:pr-[190px]">
        {/* Avatar — left */}
        <div className="relative shrink-0 justify-self-start">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden bg-white ring-[3px] ring-white shadow-[0_4px_14px_rgba(31,64,104,0.12)]">
            <img
              src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=fce8ef&color=e87898&size=152`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {isPremium && (
            <div className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#c9a227] border-2 border-white flex items-center justify-center shadow-sm">
              <Crown className="w-3 h-3 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Welcome text */}
        <div className="flex flex-col items-start text-left min-w-0">
          <KineticText
            as="h1"
            text={`Welcome back, ${displayName}!`}
            className="text-[22px] md:text-[26px] font-semibold text-[#1F4068] leading-tight mb-1.5"
          />
          <p className="text-[13px] md:text-sm text-[#6b7280] mb-2">
            Discover meaningful connections curated just for you.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {photoVerified && (
              <span className="inline-flex items-center gap-1.5 bg-[#ecfdf5] text-[#059669] px-3 py-1 rounded-full text-xs font-medium border border-[#a7f3d0]/60">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
            {premiumBadge}
          </div>
        </div>

        {/* Trust score card — right */}
        <div className="shrink-0 bg-white rounded-[14px] border border-[#f0ebe3] shadow-[0_2px_8px_rgba(31,64,104,0.06)] px-4 py-2.5 min-w-[148px] text-center justify-self-end">
          <p className="text-[11px] text-[#9ca3af] mb-1.5 font-medium">Trust Score</p>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-[28px] font-semibold text-[#1F4068] leading-none">{trustScore}</span>
            <span className="text-sm font-medium text-[#e87898]">{trustLabel}</span>
          </div>
          <div className="h-[6px] bg-[#f3f4f6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e87898] rounded-full transition-all"
              style={{ width: `${Math.min(trustScore * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function EliteMemberBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#fce8ef] text-[#e87898] px-3 py-1 rounded-full text-xs font-medium border border-[#e87898]/20">
      <Gem className="h-3.5 w-3.5" />
      Elite Member
    </span>
  )
}
