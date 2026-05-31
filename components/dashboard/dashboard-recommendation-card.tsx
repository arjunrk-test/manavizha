"use client"

import { Bookmark, MapPin, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardRecommendationCardProps {
  profile: any
  onClick: () => void
  isShortlisted?: boolean
  onShortlist?: () => void
  isLoadingShortlist?: boolean
  showNewBadge?: boolean
}

function getMatchScore(profile: any): number | null {
  if (profile?.lifestyleScore != null && profile?.poruthamScore != null) {
    return Math.round((profile.lifestyleScore + profile.poruthamScore) / 2)
  }
  if (profile?.lifestyleScore != null) return Math.round(profile.lifestyleScore)
  if (profile?.poruthamScore != null) return Math.round(profile.poruthamScore)
  return null
}

export function DashboardRecommendationCard({
  profile,
  onClick,
  isShortlisted = false,
  onShortlist,
  isLoadingShortlist = false,
  showNewBadge = false,
}: DashboardRecommendationCardProps) {
  const photoUrl = profile?.photos?.[0]
  const matchScore = getMatchScore(profile)
  const profession = profile?.profession?.split(" at ")[0] || profile?.profession
  const location = profile?.location

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className="w-[168px] shrink-0 snap-start text-left bg-white rounded-[18px] border border-[#f0f0f0] shadow-[0_2px_12px_rgba(31,64,104,0.05)] overflow-hidden hover:shadow-[0_6px_20px_rgba(31,64,104,0.1)] transition-shadow flex flex-col cursor-pointer"
    >
      {/* Photo */}
      <div className="p-2.5 pb-0">
        <div className="relative aspect-[4/5] rounded-[14px] overflow-hidden bg-[#f3f4f6]">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={profile?.name || "Profile"}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "User")}&size=400&background=fce8ef&color=e87898`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-10 w-10 text-[#e87898]/30" />
            </div>
          )}

          {onShortlist && (
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                disabled={isLoadingShortlist}
                onClick={(e) => {
                  e.stopPropagation()
                  onShortlist()
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-colors disabled:opacity-50",
                  isShortlisted
                    ? "bg-[#e87898] border-[#e87898] text-white"
                    : "bg-white/95 border-white/80 text-[#9ca3af] hover:text-[#e87898]"
                )}
                aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
              >
                <Bookmark className={cn("h-4 w-4", isShortlisted && "fill-current")} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pt-2.5 pb-0 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1 min-w-0">
          <span className="font-semibold text-[#1F4068] text-[14px] truncate">
            {profile?.name || "Unknown"}
            {profile?.age ? `, ${profile.age}` : ""}
          </span>
          {showNewBadge && (
            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#e6f7f5] text-[#3bb9ac]">
              New
            </span>
          )}
        </div>

        {profession && (
          <p className="text-[11px] text-[#6b7280] truncate mb-0.5">{profession}</p>
        )}

        {location && (
          <p className="flex items-center gap-1 text-[11px] text-[#9ca3af] truncate mb-2">
            <MapPin className="h-3 w-3 shrink-0" />
            {location}
          </p>
        )}
      </div>

      {/* Match footer bar */}
      {matchScore != null && matchScore > 0 && (
        <div className="mt-auto mx-2.5 mb-2.5 rounded-[10px] bg-[#fce8ef] px-3 py-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#e87898]" />
          <span className="text-[13px] font-semibold text-[#e87898]">{matchScore}% Match</span>
        </div>
      )}
    </div>
  )
}
