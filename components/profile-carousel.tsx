"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfilePreviewCard } from "./profile-preview-card"

interface ProfileCarouselProps {
    title: string
    subtitle?: string
    profiles: any[]
    onProfileClick: (profile: any) => void
    onViewAll?: () => void
    isLoading?: boolean
    emptyMessage?: string
    icon?: React.ReactNode
}

export function ProfileCarousel({
    title,
    subtitle,
    profiles,
    onProfileClick,
    onViewAll,
    isLoading,
    emptyMessage = "No matches found yet.",
    icon
}: ProfileCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
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
                <div className="flex gap-4 px-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[11rem] sm:min-w-[13.5rem] aspect-[3/4] bg-gray-100 dark:bg-gray-700 animate-pulse rounded-[2rem]" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <section className="py-4 relative group/carousel">
            <div className="w-full px-4">
                {/* Header */}
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {icon && <span className="text-[#4B0082]">{icon}</span>}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                {title}
                                {profiles.length > 0 && (
                                    <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full align-middle">
                                        {profiles.length}
                                    </span>
                                )}
                            </h2>
                        </div>
                        {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {onViewAll && profiles.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onViewAll}
                            className="text-[#4B0082] hover:text-[#FF1493] font-bold text-sm flex items-center gap-1 group/btn transition-all px-2"
                        >
                            View all
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    )}
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Navigation Buttons - Desktop Only */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 hidden md:block">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-10 w-10 rounded-full shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-[#4B0082] hover:scale-110 transition-transform"
                                onClick={() => scroll("left")}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        </div>
                    )}
                    {canScrollRight && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 hidden md:block">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-10 w-10 rounded-full shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-[#4B0082] hover:scale-110 transition-transform"
                                onClick={() => scroll("right")}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    )}

                    {/* Scrollable Area */}
                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 items-start justify-start"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {profiles.length === 0 ? (
                            <div className="w-full py-12 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{emptyMessage}</p>
                            </div>
                        ) : (
                            profiles.map((profile, index) => (
                                <div
                                    key={profile.user_id || index}
                                    className="w-[11rem] sm:w-[13.5rem] flex-none snap-start"
                                >
                                    <ProfilePreviewCard
                                        profile={profile}
                                        onClick={() => onProfileClick(profile)}
                                        priority={index < 4}
                                    />
                                </div>
                            ))
                        )}
                        {/* Final spacer for padding */}
                        <div className="min-w-[20px] shrink-0 pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    )
}
