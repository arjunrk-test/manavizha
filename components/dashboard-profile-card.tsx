"use client"

import { Crown, ChevronRight, User, Bookmark } from "lucide-react"
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
}

export function DashboardProfileCard({
    profile,
    onClick,
    isViewAll = false,
    contextText,
    className,
    isShortlisted = false,
    onShortlist,
    isLoadingShortlist = false
}: DashboardProfileCardProps) {
    if (isViewAll) {
        return (
            <motion.div
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.98 }}
                className={cn("h-full cursor-pointer group", className)}
                onClick={onClick}
            >
                <Card className="overflow-hidden h-full w-full border-none bg-transparent shadow-none flex flex-col pt-2">
                    {/* Blurred Background Image Container */}
                    <div className="aspect-[3/4] relative overflow-hidden rounded-[2.5rem] bg-indigo-50 flex items-center justify-center">
                        {profile?.photos?.[0] ? (
                            <div 
                                className="absolute inset-0 bg-cover bg-center blur-md opacity-30 brightness-75 transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${profile.photos[0]})` }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-white opacity-50" />
                        )}
                        
                        {/* View All Content */}
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center group-hover:bg-[#4B0082] group-hover:text-white transition-all duration-300">
                                <ChevronRight className="h-8 w-8" />
                            </div>
                            <span className="text-[#4B0082] font-black text-[13px] uppercase tracking-widest">
                                View all
                            </span>
                        </div>
                    </div>
                    {/* Empty spacer for alignment with other cards info section */}
                    <div className="mt-4 px-1" />
                </Card>
            </motion.div>
        )
    }

    const hasPhoto = profile?.photos && profile.photos.length > 0
    const photoUrl = hasPhoto ? profile.photos[0] : null

    return (
        <motion.div
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            whileTap={{ scale: 0.98 }}
            className={cn("h-full cursor-pointer group", className)}
            onClick={onClick}
        >
            <Card className="overflow-hidden h-full w-full border-none bg-transparent shadow-none flex flex-col pt-2">
                {/* Image Section */}
                <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 rounded-[2.5rem] shadow-sm mb-4">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={profile?.name || "Profile"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=400&background=random`
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-indigo-50 to-white">
                            <User className="h-12 w-12 opacity-20 text-[#4B0082]" />
                        </div>
                    )}

                    {onShortlist && (
                        <div className="absolute top-4 left-4 z-20">
                            <button
                                onClick={(e) => { e.stopPropagation(); onShortlist(e); }}
                                disabled={isLoadingShortlist}
                                className={cn(
                                    "w-8 h-8 rounded-xl backdrop-blur-md shadow-lg flex items-center justify-center transition-all duration-300 border border-white/40 active:scale-90",
                                    isShortlisted 
                                        ? "bg-[#FF1493] text-white border-none shadow-[#FF1493]/30" 
                                        : "bg-white/70 text-indigo-400 hover:bg-white hover:text-[#4B0082]"
                                )}
                            >
                                <Bookmark className={cn("h-4 w-4", isShortlisted && "fill-current")} />
                            </button>
                        </div>
                    )}

                    {/* Premium Gold Crown Badge */}
                    {profile?.isPremium && (
                        <div className="absolute top-4 right-4 z-20">
                            <div className="w-8 h-8 rounded-full bg-[#FFA500] shadow-lg flex items-center justify-center border-2 border-white">
                                <Crown className="h-4 w-4 text-white fill-current" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Section - BELOW IMAGE */}
                <div className="px-1 flex flex-col gap-0.5">
                    <h3 className="font-bold text-[15px] sm:text-[16px] text-gray-900 leading-tight truncate">
                        {profile?.name || "Unknown"}
                    </h3>
                    <p className="text-[12px] sm:text-[13px] font-medium text-gray-500">
                        {profile?.age ? `${profile.age} Yrs` : ""}{profile?.height ? `, ${profile.height}m` : ""}
                    </p>
                    {contextText && (
                        <p className="text-[11px] font-medium text-gray-800 mt-0.5 flex items-center gap-1">
                            {contextText}
                        </p>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}
