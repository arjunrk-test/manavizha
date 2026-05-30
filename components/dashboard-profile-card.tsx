"use client"

import { Crown, ChevronRight, User, Bookmark, Briefcase, MapPin, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardProfileCardProps {
    profile?: any
    onClick: () => void
    isViewAll?: boolean
    contextText?: string
    className?: string
    isShortlisted?: boolean
    onShortlist?: (e: React.MouseEvent) => void
    isLoadingShortlist?: boolean
    variant?: "default" | "recommendation"
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

export function DashboardProfileCard({
    profile,
    onClick,
    isViewAll = false,
    contextText,
    className,
    isShortlisted = false,
    onShortlist,
    isLoadingShortlist = false,
    variant = "default",
    showNewBadge = false,
}: DashboardProfileCardProps) {
    if (isViewAll) {
        return (
            <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className={cn("h-full cursor-pointer group", className)}
                onClick={onClick}
            >
                <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_16px_rgba(31,64,104,0.05)] overflow-hidden flex flex-col">
                    <div className="flex-1 relative overflow-hidden bg-[#faf8f4] flex items-center justify-center min-h-[200px]">
                        {profile?.photos?.[0] ? (
                            <div
                                className="absolute inset-0 bg-cover bg-center blur-md opacity-20"
                                style={{ backgroundImage: `url(${profile.photos[0]})` }}
                            />
                        ) : null}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-[#e87898] group-hover:text-white transition-colors border border-gray-100">
                                <ChevronRight className="h-5 w-5" />
                            </div>
                            <span className="text-[#1F4068] font-semibold text-sm">View all</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    const hasPhoto = profile?.photos && profile.photos.length > 0
    const photoUrl = hasPhoto ? profile.photos[0] : null
    const matchScore = getMatchScore(profile)
    const isRecommendation = variant === "recommendation"

    return (
        <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
            whileTap={{ scale: 0.98 }}
            className={cn("h-full cursor-pointer group", className)}
            onClick={onClick}
        >
            <div className={cn(
                "h-full flex flex-col overflow-hidden",
                isRecommendation
                    ? "bg-white rounded-2xl border border-gray-100 shadow-[0_4px_16px_rgba(31,64,104,0.06)]"
                    : "bg-transparent"
            )}>
                <div className={cn(
                    "relative overflow-hidden bg-gray-100",
                    isRecommendation ? "aspect-[4/5] m-3 mb-0 rounded-xl" : "aspect-[3/4] rounded-2xl shadow-[0_4px_16px_rgba(31,64,104,0.06)] mb-3 border border-gray-100"
                )}>
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={profile?.name || "Profile"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=400&background=fce8ef&color=e87898`
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#faf8f4] to-gray-100">
                            <User className="h-10 w-10 opacity-30 text-[#e87898]" />
                        </div>
                    )}

                    {onShortlist && (
                        <div className={cn("absolute z-20", isRecommendation ? "top-2.5 right-2.5" : "top-3 left-3")}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onShortlist(e); }}
                                disabled={isLoadingShortlist}
                                className={cn(
                                    "w-8 h-8 rounded-lg backdrop-blur-sm shadow-sm flex items-center justify-center transition-all border active:scale-90",
                                    isShortlisted
                                        ? "bg-[#e87898] text-white border-[#e87898]"
                                        : "bg-white/95 text-gray-500 hover:text-[#e87898] border-white/80"
                                )}
                            >
                                <Bookmark className={cn("h-4 w-4", isShortlisted && "fill-current")} />
                            </button>
                        </div>
                    )}

                    {profile?.isPremium && !isRecommendation && (
                        <div className="absolute top-3 right-3 z-20">
                            <div className="w-7 h-7 rounded-lg bg-[#c9a227] shadow-sm flex items-center justify-center border border-white/80">
                                <Crown className="h-3.5 w-3.5 text-white fill-current" />
                            </div>
                        </div>
                    )}
                </div>

                <div className={cn("flex flex-col flex-1", isRecommendation ? "p-3 pt-2.5" : "px-0.5")}>
                    <div className="flex items-center gap-2 mb-1.5 min-w-0">
                        <h3 className="font-semibold text-[#1F4068] truncate text-[15px]">
                            {profile?.name || "Unknown"}
                            {profile?.age ? `, ${profile.age}` : ""}
                        </h3>
                        {showNewBadge && (
                            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#3bb9ac]/10 text-[#3bb9ac]">
                                New
                            </span>
                        )}
                    </div>

                    {isRecommendation ? (
                        <>
                            {profile?.profession && (
                                <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 truncate">
                                    <Briefcase className="h-3 w-3 shrink-0 text-gray-400" />
                                    {profile.profession.split(" at ")[0]}
                                </p>
                            )}
                            {(profile?.location || contextText) && (
                                <p className="flex items-center gap-1.5 text-xs text-gray-500 truncate mb-2">
                                    <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                                    {profile?.location || contextText}
                                </p>
                            )}
                            {matchScore != null && matchScore > 0 && (
                                <div className="mt-auto pt-2 border-t border-gray-50 flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-[#e87898]" />
                                    <span className="text-sm font-semibold text-[#e87898]">{matchScore}% Match</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {!isRecommendation && profile?.age && (
                                <p className="text-sm text-gray-500">
                                    {profile.age} yrs{profile?.height ? ` · ${profile.height} cm` : ""}
                                </p>
                            )}
                            {contextText && (
                                <p className="text-xs text-[#3bb9ac] truncate">{contextText}</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
