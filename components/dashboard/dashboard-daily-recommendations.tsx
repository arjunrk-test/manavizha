"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DashboardRecommendationCard } from "./dashboard-recommendation-card"

interface DashboardDailyRecommendationsProps {
  profiles: any[]
  onProfileClick: (profile: any) => void
  onViewAll?: () => void
  isLoading?: boolean
  shortlistedIds?: string[]
  onShortlist?: (profileId: string) => void
  shortlistLoadingId?: string | null
}

export function DashboardDailyRecommendations({
  profiles,
  onProfileClick,
  onViewAll,
  isLoading,
  shortlistedIds = [],
  onShortlist,
  shortlistLoadingId,
}: DashboardDailyRecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const displayed = profiles.slice(0, 10)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    const t = setTimeout(checkScroll, 100)
    window.addEventListener("resize", checkScroll)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", checkScroll)
    }
  }, [profiles, isLoading])

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] border border-[#f0f0f0] shadow-[0_2px_12px_rgba(31,64,104,0.04)] p-5 h-full flex flex-col min-w-0 overflow-hidden">
        <div className="h-6 w-48 bg-gray-100 animate-pulse rounded mb-2" />
        <div className="h-4 w-56 bg-gray-100 animate-pulse rounded mb-5" />
        <div className="flex gap-3 overflow-hidden flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[168px] shrink-0 h-full min-h-[280px] bg-gray-100 animate-pulse rounded-[18px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[20px] border border-[#f0f0f0] shadow-[0_2px_12px_rgba(31,64,104,0.04)] p-5 h-full flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
        <div>
          <h2 className="text-base font-semibold text-[#1F4068]">
            Daily Recommendations
            {profiles.length > 0 && (
              <span className="text-[#9ca3af] font-normal ml-1">({profiles.length})</span>
            )}
          </h2>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Handpicked profiles for you today</p>
        </div>
        {onViewAll && profiles.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm font-medium text-[#e87898] hover:text-[#d66686] flex items-center gap-0.5 transition-colors shrink-0 pt-0.5"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Carousel */}
      <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-[42%] -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-[0_2px_12px_rgba(31,64,104,0.15)] border border-[#f0f0f0] flex items-center justify-center text-[#6b7280] hover:text-[#e87898] hidden md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-1 top-[42%] -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-[0_2px_12px_rgba(31,64,104,0.15)] border border-[#f0f0f0] flex items-center justify-center text-[#6b7280] hover:text-[#e87898] hidden md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto overflow-y-hidden w-full min-w-0 pb-1 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayed.length === 0 ? (
            <div className="w-full py-10 text-center text-sm text-[#9ca3af]">
              No recommendations yet. Check back tomorrow!
            </div>
          ) : (
            displayed.map((profile) => (
              <DashboardRecommendationCard
                key={profile.user_id}
                profile={profile}
                onClick={() => onProfileClick(profile)}
                showNewBadge={profile.created_at && new Date(profile.created_at).getTime() > thirtyDaysAgo}
                isShortlisted={shortlistedIds.includes(profile.user_id)}
                onShortlist={onShortlist ? () => onShortlist(profile.user_id) : undefined}
                isLoadingShortlist={shortlistLoadingId === profile.user_id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
