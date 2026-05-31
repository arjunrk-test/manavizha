"use client"

import {
  LayoutDashboard,
  HeartHandshake,
  Send,
  Sparkles,
  SlidersHorizontal,
  Users,
  Star,
  Heart,
  UserCircle2,
  Bookmark,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  mutualCount: number
  iLikedCount: number
  likedMeCount: number
  isCoreProfileComplete: boolean
  completionPercentage: number
  onDashboard: () => void
  onMutualMatches: () => void
  onInterestsSent: () => void
  onInterestsReceived: () => void
  onPreferences: () => void
  onBrowse: () => void
  onHoroscope: () => void
  onSelections: () => void
  onParents: () => void
  onShortlisted: () => void
  onImproveProfile: () => void
}

function NavItem({
  icon: Icon,
  label,
  count,
  badge,
  active,
  disabled,
  onClick,
}: {
  icon: React.ElementType
  label: string
  count?: number
  badge?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 py-2.5 text-[13px] font-medium transition-colors text-left",
        active
          ? "bg-[#fce8ef] text-[#e87898] border-l-[3px] border-[#e87898] pl-[13px] pr-3 -ml-0 rounded-r-xl"
          : "text-[#4b5563] hover:bg-[#faf8f4] px-4",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-[#e87898]" : "text-[#9ca3af]")} />
      <span className="flex-1 truncate">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#e87898] text-white text-[11px] font-semibold flex items-center justify-center">
          {count}
        </span>
      )}
      {badge && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fce8ef] text-[#e87898]">
          {badge}
        </span>
      )}
    </button>
  )
}

export function DashboardSidebar({
  mutualCount,
  iLikedCount,
  likedMeCount,
  isCoreProfileComplete,
  completionPercentage,
  onDashboard,
  onMutualMatches,
  onInterestsSent,
  onInterestsReceived,
  onPreferences,
  onBrowse,
  onHoroscope,
  onSelections,
  onParents,
  onShortlisted,
  onImproveProfile,
}: DashboardSidebarProps) {
  const locked = !isCoreProfileComplete

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-0.5">
        <p className="px-4 pb-2 pt-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-[0.12em]">
          Main Menu
        </p>

        <NavItem icon={LayoutDashboard} label="Dashboard" active onClick={onDashboard} />
        <NavItem icon={HeartHandshake} label="Mutual Matches" count={mutualCount} disabled={locked} onClick={onMutualMatches} />
        <NavItem icon={Send} label="Interests Sent" count={iLikedCount} disabled={locked} onClick={onInterestsSent} />
        <NavItem icon={Sparkles} label="Interests Received" count={likedMeCount} disabled={locked} onClick={onInterestsReceived} />
        <NavItem icon={SlidersHorizontal} label="Partner Preferences" disabled={locked} onClick={onPreferences} />
        <NavItem icon={Users} label="Browse Profiles" disabled={locked} onClick={onBrowse} />
        <NavItem icon={Star} label="Generate Horoscope" onClick={onHoroscope} />

        <p className="px-4 pt-6 pb-2 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-[0.12em]">
          Family
        </p>
        <NavItem icon={Heart} label="Parent Selections" badge="New" disabled={locked} onClick={onSelections} />
        <NavItem icon={UserCircle2} label="Manage Parents" disabled={locked} onClick={onParents} />
        <NavItem icon={Bookmark} label="Shortlisted Profiles" disabled={locked} onClick={onShortlisted} />
      </nav>

      {completionPercentage < 100 && (
        <div className="mt-6 mx-1 rounded-[18px] bg-gradient-to-br from-[#e87898] to-[#d45a7a] p-5 text-white relative overflow-hidden shadow-[0_8px_24px_rgba(232,120,152,0.35)]">
          <img
            src="/images/dashboard-sidebar-deco.png"
            alt=""
            className="absolute right-0 bottom-0 w-[90px] h-auto object-contain opacity-90 pointer-events-none"
          />
          <p className="text-[15px] font-semibold leading-snug mb-1 relative z-10 pr-16">Complete your profile</p>
          <p className="text-[12px] text-white/80 mb-4 relative z-10">Unlock better matches</p>
          <Button
            onClick={onImproveProfile}
            className="relative z-10 h-9 w-full rounded-[10px] bg-white text-[#e87898] hover:bg-white/95 text-[13px] font-semibold shadow-none"
          >
            Improve Profile
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
