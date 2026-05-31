"use client"

import { ArrowUpRight, HeartHandshake, Send, UserRound } from "lucide-react"

interface StatItem {
  label: string
  description: string
  value: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  onClick: () => void
}

interface DashboardStatsRowProps {
  mutualCount: number
  iLikedCount: number
  likedMeCount: number
  onMutualMatches: () => void
  onInterestsSent: () => void
  onInterestsReceived: () => void
}

export function DashboardStatsRow({
  mutualCount,
  iLikedCount,
  likedMeCount,
  onMutualMatches,
  onInterestsSent,
  onInterestsReceived,
}: DashboardStatsRowProps) {
  const stats: StatItem[] = [
    {
      label: "Mutual Matches",
      description: "People who liked you back",
      value: mutualCount,
      icon: HeartHandshake,
      iconBg: "bg-[#e6f7f5]",
      iconColor: "text-[#3bb9ac]",
      onClick: onMutualMatches,
    },
    {
      label: "Interests Sent",
      description: "Profiles you've shown interest in",
      value: iLikedCount,
      icon: Send,
      iconBg: "bg-[#fce8ef]",
      iconColor: "text-[#e87898]",
      onClick: onInterestsSent,
    },
    {
      label: "Interests Received",
      description: "People who showed interest in you",
      value: likedMeCount,
      icon: UserRound,
      iconBg: "bg-[#fdf6e3]",
      iconColor: "text-[#c9a227]",
      onClick: onInterestsReceived,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map(({ label, description, value, icon: Icon, iconBg, iconColor, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="bg-white rounded-[14px] border border-[#f0f0f0] shadow-[0_2px_12px_rgba(31,64,104,0.04)] p-3.5 text-left hover:shadow-[0_4px_20px_rgba(232,120,152,0.1)] hover:border-[#fce8ef] transition-all group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 shrink-0 rounded-full ${iconBg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <p className="text-[13px] font-semibold text-[#1F4068] truncate">{label}</p>
            </div>
            <div className="w-7 h-7 shrink-0 rounded-full bg-[#faf8f4] flex items-center justify-center group-hover:bg-[#fce8ef] transition-colors">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#d1d5db] group-hover:text-[#e87898] transition-colors" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-[#1F4068] leading-none mb-1">{value}</p>
          <p className="text-[11px] text-[#9ca3af] leading-snug">{description}</p>
        </button>
      ))}
    </div>
  )
}
