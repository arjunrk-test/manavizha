"use client"

import { MapPin, Briefcase, User, GraduationCap, Heart, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface ProfilePreviewCardProps {
    profile: any
    onClick: () => void
    priority?: boolean
}

export function ProfilePreviewCard({ profile, onClick, priority }: ProfilePreviewCardProps) {
    const hasPhoto = profile.photos && profile.photos.length > 0
    const photoUrl = hasPhoto ? profile.photos[0] : null

    return (
        <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
        >
            <Card
                className="overflow-hidden h-fit max-w-[160px] sm:max-w-[200px] hover:shadow-2xl transition-all cursor-pointer group border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative flex flex-col rounded-xl shadow-md"
                onClick={onClick}
            >
                {/* Image Section */}
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={profile.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading={priority ? "eager" : "lazy"}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&size=400&background=random`
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <User className="h-12 w-12 mb-2 opacity-30" />
                            <span className="text-xs font-medium opacity-50">No Photo</span>
                        </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                        {profile.isNew && (
                            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-md">
                                NEW
                            </span>
                        )}
                        {profile.isMutual && (
                            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1">
                                <Heart className="h-2.5 w-2.5 fill-current" /> MATCH
                            </span>
                        )}
                    </div>

                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm truncate drop-shadow-lg leading-tight">
                                {profile.name}{profile.age ? `, ${profile.age}` : ""}
                            </h3>
                            {profile.isVerified && (
                                <CheckCircle2 className="h-3 w-3 text-blue-400" />
                            )}
                        </div>
                        <div className="flex items-center text-[10px] text-white/80 mt-0.5 font-medium leading-none">
                            <MapPin className="h-2.5 w-2.5 mr-1 shrink-0" />
                            <span className="truncate">{profile.location || "Location hidden"}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-2.5 flex-1 flex flex-col justify-start gap-1.5 bg-white dark:bg-gray-800">
                    <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-tight">
                        <Briefcase className="h-3 w-3 mt-0.5 text-[#4B0082] shrink-0" />
                        <span className="line-clamp-1">{profile.profession || "Not specified"}</span>
                    </div>
                    {profile.education && (
                        <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-tight">
                            <GraduationCap className="h-3 w-3 mt-0.5 text-[#4B0082] shrink-0" />
                            <span className="line-clamp-1">{profile.education}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
