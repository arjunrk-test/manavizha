"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { fetchDailyRecommendations } from "@/lib/utils/match-utils"
import { ProfileDetailView } from "@/components/profile-detail-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Briefcase, GraduationCap, ChevronRight, Star, Heart, ShieldCheck, Gem, Crown, Sparkles } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function DailyRecommendationsPage() {
    const searchParams = useSearchParams()
    const urlId = searchParams.get("id")
    
    const [userId, setUserId] = useState<string | null>(null)
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session?.user?.id) {
                setUserId(data.session.user.id)
                const recs = await fetchDailyRecommendations(data.session.user.id)
                setRecommendations(recs)
                
                // Priority: 1. URL ID, 2. First Rec in list
                if (urlId) {
                    setSelectedId(urlId)
                } else if (recs.length > 0) {
                    setSelectedId(recs[0].user_id)
                }
            }
            setIsLoading(false)
        }
        getSession()
    }, [urlId])

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#4B0082]" />
                <p className="text-gray-400 font-medium animate-pulse">Personalizing your daily matches...</p>
            </div>
        )
    }

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="min-h-screen p-8 max-w-2xl mx-auto text-center space-y-6 flex flex-col items-center justify-center">
                <div className="h-20 w-20 bg-indigo-50 flex items-center justify-center rounded-3xl text-[#4B0082]">
                    <Sparkles className="h-10 w-10" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">No more suggestions today!</h1>
                <p className="text-gray-500">We've shown you all the top matches for now. Check back tomorrow for a fresh batch of 10 recommendations.</p>
                <Button onClick={() => router.push("/dashboard")} variant="outline" className="rounded-full px-8">Back to Dashboard</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[#FAFAFA] overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full lg:w-[260px] bg-white/90 backdrop-blur-xl border-r border-gray-100 flex flex-col shrink-0 h-full shadow-2xl z-20">
                <div className="p-6 border-b border-gray-50 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.back()}
                            className="p-0 hover:bg-transparent -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                        </Button>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black text-[9px] uppercase px-3 py-1">Daily Top 10</Badge>
                    </div>
                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tighter">Daily Picks</h1>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                    {recommendations.map((rec, index) => (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={rec.user_id}
                            onClick={() => setSelectedId(rec.user_id)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative overflow-hidden group",
                                selectedId === rec.user_id 
                                    ? "bg-[#4B0082] text-white shadow-lg shadow-[#4B0082]/20" 
                                    : "hover:bg-gray-50 text-gray-900"
                            )}
                        >
                            <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 bg-gray-100 border-2 border-white/20">
                                <img 
                                    src={rec.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.name || 'User')}&background=random`} 
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h3 className="font-bold text-[11px] truncate leading-tight">{rec.name || "Unknown Member"}</h3>
                                <div className={cn(
                                    "flex items-center gap-1.5 mt-0.5 text-[9px] font-medium transition-colors",
                                    selectedId === rec.user_id ? "text-white/70" : "text-gray-400"
                                )}>
                                    <span>{rec.age} Yrs</span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-current opacity-30" />
                                    <span className="truncate">{rec.location?.split(',')[0]}</span>
                                </div>
                            </div>
                            {selectedId === rec.user_id && (
                                <motion.div layoutId="active-indicator" className="h-2 w-2 rounded-full bg-white mr-2" />
                            )}
                            {rec.isPremium && (
                                <div className="absolute top-2 right-4">
                                    <Crown className={cn("h-3 w-3", selectedId === rec.user_id ? "text-amber-300" : "text-amber-500")} />
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
                
                <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
                        These picks refresh every 24 hours
                    </p>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative overflow-hidden bg-white">
                <AnimatePresence mode="wait">
                    {selectedId ? (
                        <motion.div
                            key={selectedId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <ProfileDetailView 
                                targetUserId={selectedId} 
                                currentUserId={userId}
                                isModal={false}
                            />
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-20 text-center">
                            <div className="space-y-4">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <Heart className="h-8 w-8" />
                                </div>
                                <p className="text-gray-400 font-medium">Select a profile to view details</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold", className)}>
            {children}
        </span>
    )
}
