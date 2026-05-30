"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardProfileCard } from "./dashboard-profile-card"
import { formatToDDMMYYYY } from "@/lib/utils/date-utils"
import { cn } from "@/lib/utils"

interface ProfileCarouselProps {
    title: string
    subtitle?: string
    profiles: any[]
    onProfileClick: (profile: any) => void
    onViewAll?: () => void
    isLoading?: boolean
    emptyMessage?: string
    icon?: React.ReactNode
    shortlistedIds?: string[]
    onShortlist?: (profileId: string) => void
    shortlistLoadingId?: string | null
    variant?: "default" | "recommendation"
    embedded?: boolean
}

export function ProfileCarousel({
    title,
    subtitle,
    profiles,
    onProfileClick,
    onViewAll,
    isLoading,
    emptyMessage = "No matches found yet.",
    icon,
    shortlistedIds = [],
    onShortlist,
    shortlistLoadingId,
    variant = "default",
    embedded = false,
}: ProfileCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    // Limit to 10 profiles for dashboard sections
    const displayedProfiles = profiles.slice(0, 10)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
        }
    }

    useEffect(() => {
        checkScroll()
        const timer = setTimeout(checkScroll, 100) // Double check after render
        window.addEventListener("resize", checkScroll)
        return () => {
            window.removeEventListener("resize", checkScroll)
            clearTimeout(timer)
        }
    }, [profiles, isLoading])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current
            const scrollTo = direction === "left"
                ? scrollRef.current.scrollLeft - clientWidth * 0.8
                : scrollRef.current.scrollLeft + clientWidth * 0.8

            scrollRef.current.scrollTo({
                left: scrollTo,
                behavior: "smooth"
            })
        }
    }

    if (isLoading) {
        return (
            <div className="py-8">
                <div className="flex items-center justify-between mb-6 px-4">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                </div>
                <div className="flex gap-6 px-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="min-w-[12rem] sm:min-w-[14.5rem] aspect-[3/4.8] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            </div>
        )
    }

    const isRecommendation = variant === "recommendation"
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    return (
        <section className={cn("relative group/carousel", embedded ? "py-0" : "py-4")}>
            <div className={cn(
                "overflow-hidden",
                embedded
                    ? "bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(31,64,104,0.04)] p-5"
                    : "bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(31,64,104,0.04)]"
            )}>
                <div className={cn("flex items-end justify-between gap-4", embedded ? "mb-4" : "px-5 pt-5 pb-4 border-b border-gray-50")}>
                    <div>
                        <h2 className="text-base font-semibold text-[#1F4068]">
                            {title}
                            {profiles.length > 0 && (
                                <span className="ml-1.5 text-gray-400 font-normal">
                                  ({profiles.length})
                                </span>
                            )}
                        </h2>
                        {subtitle && !isRecommendation && (
                            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>

                    {onViewAll && profiles.length > 0 && (
                        <button
                            onClick={onViewAll}
                            className="flex items-center gap-0.5 text-[#e87898] font-medium text-sm hover:text-[#d66686] transition-colors group shrink-0"
                        >
                            View all
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    )}
                </div>

                <div className={cn("relative", embedded ? "" : "px-5 pb-5 pt-4")}>
                    {/* Navigation Buttons */}
                    {canScrollLeft && (
                        <button
                            className="absolute left-3 top-[38%] -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3bb9ac] hover:text-white hover:border-[#3bb9ac] transition-all hidden md:flex"
                            onClick={() => scroll("left")}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            className="absolute -right-1 top-[42%] -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#e87898] hover:text-white hover:border-[#e87898] transition-all hidden md:flex"
                            onClick={() => scroll("right")}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}

                    {/* Scrollable Area */}
                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide no-scrollbar snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {displayedProfiles.length === 0 ? (
                            <div className="w-full py-12 text-center bg-[#faf8f4] rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400">{emptyMessage}</p>
                            </div>
                        ) : (
                            <>
                                {displayedProfiles.map((profile, index) => {
                                    if (!profile) return null;
                                    return (
                                        <div
                                            key={profile.user_id || index}
                                            className={cn(
                                                "flex-none snap-start",
                                                isRecommendation ? "w-[11.5rem] sm:w-[13rem]" : "w-[12rem] sm:w-[14.5rem]"
                                            )}
                                        >
                                            <DashboardProfileCard
                                                profile={profile}
                                                onClick={() => onProfileClick(profile)}
                                                contextText={profile.location}
                                                variant={variant}
                                                showNewBadge={isRecommendation && profile.created_at && new Date(profile.created_at).getTime() > thirtyDaysAgo}
                                                isShortlisted={shortlistedIds.includes(profile.user_id)}
                                                onShortlist={onShortlist ? () => onShortlist(profile.user_id) : undefined}
                                                isLoadingShortlist={shortlistLoadingId === profile.user_id}
                                            />
                                        </div>
                                    );
                                })}
                                
                                {/* Final "View all" card if we have more than 1 profiles */}
                                {onViewAll && profiles.length > 0 && displayedProfiles[0] && (
                                    <div className="w-[12rem] sm:w-[14.5rem] flex-none snap-start">
                                        <DashboardProfileCard
                                            isViewAll
                                            profile={displayedProfiles[0]}
                                            onClick={onViewAll}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <div className="min-w-[12px] shrink-0" />
                    </div>
                </div>
            </div>
        </section>
    )
}
