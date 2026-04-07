"use client"

import { MapPin, Briefcase, User, GraduationCap, Heart, CheckCircle2, Crown, Gem, Star, Shield, Sparkles } from "lucide-react"
import { MatchScoreBadge } from "./match-score-badge"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface ProfilePreviewCardProps {
    profile: any
    onClick: () => void
    priority?: boolean
    lifestyleScore?: number
    poruthamScore?: number
    viewerIsPremium?: boolean
    onScoreClick?: (e: React.MouseEvent) => void
}

export function ProfilePreviewCard({ 
    profile, 
    onClick, 
    priority,
    lifestyleScore = 0,
    poruthamScore = 0,
    viewerIsPremium = false,
    onScoreClick
}: ProfilePreviewCardProps) {
    const hasPhoto = profile.photos && profile.photos.length > 0
    const photoUrl = hasPhoto ? profile.photos[0] : null

    return (
        <motion.div
            whileHover={{ y: -12, transition: { duration: 0.4, ease: "easeOut" } }}
            whileTap={{ scale: 0.97 }}
            className="h-full"
        >
            <Card
                className="overflow-hidden h-full w-full hover:shadow-[0_30px_60px_-15px_rgba(75,0,130,0.3)] transition-all duration-500 cursor-pointer group border-white/60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl relative flex flex-col rounded-[2rem] shadow-2xl"
                onClick={onClick}
            >
                {/* Image Section */}
                <div className="aspect-[3/4.4] relative overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={profile.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            loading={priority ? "eager" : "lazy"}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&size=400&background=random`
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-indigo-50 to-white">
                            <User className="h-10 w-10 mb-2 opacity-20 text-[#4B0082]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 text-[#4B0082]">No Photo</span>
                        </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                        {profile.isNew && (
                            <span className="bg-[#4B0082] text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-xl shadow-indigo-500/20 backdrop-blur-md border border-white/20">
                                NEW
                            </span>
                        )}
                        {profile.isMutual && (
                            <span className="bg-rose-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-xl shadow-rose-500/20 backdrop-blur-md border border-white/20 flex items-center gap-1.5 animate-pulse">
                                <Heart className="h-2.5 w-2.5 fill-current" /> MATCH
                            </span>
                        )}
                        {/* Premium Badge Overlay */}
                        {profile.isPremium && (
                            <div className="flex flex-col gap-1.5">
                                {profile.premiumPlan === 'till_you_marry' && (
                                    <span className="bg-gradient-to-r from-[#4B0082] to-[#6A0DAD] text-white text-[7px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-xl shadow-indigo-500/30 flex items-center gap-1 border border-white/20">
                                        <Crown className="h-2.5 w-2.5" /> LIFETIME
                                    </span>
                                )}
                                {profile.premiumPlan === 'elite' && (
                                    <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4B0082] text-[7px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-xl shadow-amber-500/30 flex items-center gap-1 border border-white/20">
                                        <Gem className="h-2.5 w-2.5" /> ELITE
                                    </span>
                                )}
                                {profile.premiumPlan === 'prime_gold' && (
                                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[7px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-xl shadow-orange-500/30 flex items-center gap-1 border border-white/20">
                                        <Star className="h-2.5 w-2.5" /> GOLD
                                    </span>
                                )}
                                {(profile.premiumPlan === 'prime' || profile.premiumPlan === '3_months') && (
                                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[7px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-xl shadow-blue-500/30 flex items-center gap-1 border border-white/20">
                                        <Shield className="h-2.5 w-2.5" /> PRIME
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Premium Gradient Overlay - More intense for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080b16] via-[#080b16]/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 transition-transform duration-500 group-hover:translate-y-[-2px]">
                        <div className="flex items-center justify-between gap-1 mb-1">
                            <h3 className="font-bold text-[12px] sm:text-[14px] truncate drop-shadow-2xl leading-none tracking-tight">
                                {profile.name}{profile.age ? `, ${profile.age}` : ""}
                            </h3>
                            {profile.isVerified && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 drop-shadow-lg shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center text-[9px] font-black uppercase tracking-[0.15em] text-white/80 leading-none">
                            <MapPin className="h-3 w-3 mr-1 shrink-0 text-indigo-400" />
                            <span className="truncate">{profile.location || "Location hidden"}</span>
                        </div>

                        {/* Compatibility Score - DUAL CORE */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                            <MatchScoreBadge 
                                lifestyleScore={lifestyleScore}
                                poruthamScore={poruthamScore}
                                isPremium={viewerIsPremium}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onScoreClick?.(e)
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-3 flex-1 flex flex-col justify-start gap-2 bg-white dark:bg-gray-800 group-hover:bg-indigo-50/10 transition-colors duration-500">
                    <div className="flex items-start gap-2 text-[9px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        <Briefcase className="h-3.5 w-3.5 text-[#4B0082]/60 shrink-0" />
                        <span className="line-clamp-1">{profile.profession || "Not specified"}</span>
                    </div>
                    {profile.education && (
                        <div className="flex items-start gap-2 text-[9px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            <GraduationCap className="h-3.5 w-3.5 text-[#4B0082]/60 shrink-0" />
                            <span className="line-clamp-1">{profile.education}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
