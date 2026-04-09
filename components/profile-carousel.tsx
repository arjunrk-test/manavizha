"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardProfileCard } from "./dashboard-profile-card"
import { formatToDDMMYYYY } from "@/lib/utils/date-utils"

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
    shortlistLoadingId
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

    return (
        <section className="py-6 relative group/carousel">
            <div className="w-full">
                {/* Header */}
                <div className="px-4 mb-6 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                {title}
                                {profiles.length > 0 && (
                                    <span className="ml-2 text-gray-400 font-bold">
                                        ({profiles.length})
                                    </span>
                                )}
                            </h2>
                        </div>
                        {subtitle && (
                            <p className="text-[14px] text-gray-500 font-medium whitespace-pre-line">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {onViewAll && profiles.length > 0 && (
                        <button
                            onClick={onViewAll}
                            className="flex items-center gap-1 text-[#4B0082] font-black text-[13px] uppercase tracking-widest hover:text-[#FF1493] transition-colors group px-2"
                        >
                            View all
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>

                {/* Carousel Container */}
                <div className="relative px-4">
                    {/* Navigation Buttons */}
                    {canScrollLeft && (
                        <button
                            className="absolute left-6 top-[40%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#4B0082] hover:text-white transition-all duration-300 hidden md:flex"
                            onClick={() => scroll("left")}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            className="absolute right-6 top-[40%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#4B0082] hover:text-white transition-all duration-300 hidden md:flex"
                            onClick={() => scroll("right")}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}

                    {/* Scrollable Area */}
                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide no-scrollbar snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {displayedProfiles.length === 0 ? (
                            <div className="w-full py-16 text-center bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{emptyMessage}</p>
                            </div>
                        ) : (
                            <>
                                {displayedProfiles.map((profile, index) => {
                                    if (!profile) return null;
                                    return (
                                        <div
                                            key={profile.user_id || index}
                                            className="w-[12rem] sm:w-[14.5rem] flex-none snap-start"
                                        >
                                            <DashboardProfileCard
                                                profile={profile}
                                                onClick={() => onProfileClick(profile)}
                                                contextText={profile.interaction_at ? `Profile viewed you on ${formatToDDMMYYYY(profile.interaction_at)}` : profile.location}
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
                        <div className="min-w-[20px] shrink-0" />
                    </div>
                </div>
            </div>
        </section>
    )
}
