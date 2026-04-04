"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, MapPin, Briefcase, User, GraduationCap, Calendar, Heart, ChevronLeft, ChevronRight, Star, Coffee, Filter, SlidersHorizontal, CheckCircle2, Phone, MessageCircle, MoreVertical, UserX, UserMinus, Crown, Gem, Shield, X } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { calculateTrustScore } from "@/lib/utils/profile-utils"
import { toast } from "sonner"
import { checkTamilPorutham } from "@/lib/astrology"
import { getDistanceInKm, getCoordinatesForCity } from "@/lib/locations"
import { Badge } from "@/components/ui/badge"
import { Sparkles as SparklesIcon, Info } from "lucide-react"
import { MatchBreakdownDialog } from "@/components/match-breakdown-dialog"
import { MessageDialog } from "@/components/message-dialog"
import { calculateLifestyleScore } from "@/lib/matching"
import { CompatibilitySheet } from "./compatibility-sheet"
import { MatchScoreBadge } from "@/components/match-score-badge"

interface BrowseProfilesProps {
    userId: string
    onBack?: () => void
    parentViewer?: {
        isParent: boolean
        parentId: string
        parentRole: string
    }
}

export function BrowseProfiles({ userId, onBack, parentViewer }: BrowseProfilesProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [profiles, setProfiles] = useState<any[]>([])
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
    const [targetGender, setTargetGender] = useState<string>("")
    const [actionLoadingId, setActionLoadingId] = useState<string>("")
    const [shortlistLoadingId, setShortlistLoadingId] = useState<string>("")
    const [hasPreferences, setHasPreferences] = useState(false)
    const [applyPreferences, setApplyPreferences] = useState(true)
    const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(new Set())
    const [shortlistedIds, setShortlistedIds] = useState<string[]>([])
    const [likedIds, setLikedIds] = useState<string[]>([])
    const [mutualFullData, setMutualFullData] = useState<any>(null)
    const [isFetchingFull, setIsFetchingFull] = useState(false)
    const [userHoroscope, setUserHoroscope] = useState<any>(null)
    const [showBreakdown, setShowBreakdown] = useState(false)
    const [activeBreakdown, setActiveBreakdown] = useState<any>(null)
    const [breakdownName, setBreakdownName] = useState("")

    // State to track the active sidebar category
    const [activeCategory, setActiveCategory] = useState<string>("all-matches")
    const [searchTerm, setSearchTerm] = useState("")
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false)
    const [iViewedIds, setIViewedIds] = useState<string[]>([])
    const [viewedMeIds, setViewedMeIds] = useState<string[]>([])
    const [currentUserLocation, setCurrentUserLocation] = useState<string>("")

    // State to track the currently viewed photo index for the modal
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0)
    const [viewerFullProfile, setViewerFullProfile] = useState<any>(null)

    // Messaging states
    const [isPremium, setIsPremium] = useState(false)
    const [likedMeIds, setLikedMeIds] = useState<string[]>([])
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
    const [messageTarget, setMessageTarget] = useState<{ id: string, name: string } | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const router = useRouter()

    // Function to handle navigating to profile page
    const handleOpenProfile = async (profile: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (!profile.user_id) return
        
        // Record the view
        console.log("Navigating to profile:", profile.user_id)
        if (!parentViewer?.isParent) {
            fetch("/api/views", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ viewerId: userId, viewedUserId: profile.user_id })
            }).catch(e => console.error("Error logging view", e))
        }

        // Navigate to the dedicated profile page using window.location for reliability
        if (profile.user_id) {
            window.location.href = `/dashboard/profile/${profile.user_id}`
        } else {
            console.error("Missing profile.user_id:", profile)
            toast.error("Profile ID missing")
        }
    }

    // Fetch full profile data when a mutual match modal opens
    useEffect(() => {
        const isMutual = selectedProfile?.isSelected && selectedProfile?.childLiked && selectedProfile?.profileLikedChild
        if (!isMutual) { setMutualFullData(null); return }
        const uid = selectedProfile.user_id
        setIsFetchingFull(true)
        const fetchFull = async () => {
            const [
                { data: family },
                { data: fullContact },
                { data: fullEdu },
                { data: fullEmp },
                { data: fullBus },
                { data: fullStu },
            ] = await Promise.all([
                supabase.from("family_details").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("contact_details").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("education_details").select("*").eq("user_id", uid),
                supabase.from("profession_employee").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("profession_business").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("profession_student").select("*").eq("user_id", uid).maybeSingle(),
            ])
            setMutualFullData({ family, fullContact, fullEdu, fullEmp, fullBus, fullStu })
            setIsFetchingFull(false)
        }
        fetchFull()
    }, [selectedProfile?.user_id, selectedProfile?.childLiked, selectedProfile?.profileLikedChild])

    // Handlers for modal photo navigation
    const nextModalPhoto = (e: React.MouseEvent, maxPhotos: number) => {
        e.stopPropagation()
        setModalPhotoIndex(prev => (prev + 1) % maxPhotos)
    }

    const prevModalPhoto = (e: React.MouseEvent, maxPhotos: number) => {
        e.stopPropagation()
        setModalPhotoIndex(prev => (prev - 1 + maxPhotos) % maxPhotos)
    }

    // Component for a Profile Card with its own local photo index state
    const ProfileCardWrapper = ({ profile, index }: { profile: any, index: number }) => {
        const [cardPhotoIndex, setCardPhotoIndex] = useState(0)
        const hasMultiplePhotos = profile.photos && profile.photos.length > 1

        const nextCardPhoto = (e: React.MouseEvent) => {
            e.stopPropagation()
            setCardPhotoIndex(prev => (prev + 1) % profile.photos.length)
        }

        const prevCardPhoto = (e: React.MouseEvent) => {
            e.stopPropagation()
            setCardPhotoIndex(prev => (prev - 1 + profile.photos.length) % profile.photos.length)
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <Card
                    className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm relative"
                    onClick={() => handleOpenProfile(profile)}
                >
                    <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {profile.photos && profile.photos.length > 0 ? (
                            <>
                                <img
                                    src={profile.photos[cardPhotoIndex]}
                                    alt={profile.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name || 'User') + '&size=400&background=random'
                                    }}
                                />
                                {hasMultiplePhotos && (
                                    <>
                                        <div className="absolute top-1/2 left-2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={prevCardPhoto}
                                                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="absolute top-1/2 right-2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={nextCardPhoto}
                                                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-10">
                                            {cardPhotoIndex + 1} / {profile.photos.length}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <User className="h-16 w-16 mb-2 opacity-50" />
                                <span className="text-sm">No Photo</span>
                            </div>
                        )}
                        
                        {/* Premium Badge strictly as requested */}
                        {profile.isPremium && (
                            <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 pointer-events-none">
                                {profile.premiumPlan === 'till_you_marry' && (
                                    <span className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-pink-500/30">
                                        <Crown className="h-2.5 w-2.5" /> Lifetime
                                    </span>
                                )}
                                {profile.premiumPlan === 'elite' && (
                                    <span className="bg-gradient-to-r from-[#4B0082] to-[#8A2BE2] text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-purple-500/30">
                                        <Gem className="h-2.5 w-2.5" /> Elite
                                    </span>
                                )}
                                {profile.premiumPlan === 'prime_gold' && (
                                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/30">
                                        <Star className="h-2.5 w-2.5" /> Gold
                                    </span>
                                )}
                                {(profile.premiumPlan === 'prime' || profile.premiumPlan === '3_months') && (
                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/30">
                                        <Shield className="h-2.5 w-2.5" /> Prime
                                    </span>
                                )}
                            </div>
                        )}

                        {profile.isSelected && (
                            <div className="absolute top-3 left-3 z-20 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                                <CheckCircle2 className="h-3 w-3" /> Selected
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4">
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">
                                {profile.name || "Unknown"}
                                {profile.age && `, ${profile.age}`}
                            </h3>
                            <div className="flex items-center text-white/90 text-sm mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {profile.location}
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                            <Briefcase className="h-4 w-4 mr-2 shrink-0" />
                            <span className="truncate">{profile.profession}</span>
                        </div>
                        {profile.education && profile.education.length > 0 && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                <GraduationCap className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">{profile.education[0]?.education || "Not specified"}</span>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => handleIgnore(e, profile.user_id)} 
                                className="h-7 text-[10px] uppercase font-bold tracking-wider text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                Ignore
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => handleBlock(e, profile.user_id)} 
                                className="h-7 text-[10px] uppercase font-bold tracking-wider text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                                Block
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    const handleIgnore = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        const res = await fetch("/api/ignores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetUserId: profileId }),
        })
        if (res.ok) {
            setProfiles(prev => prev.filter(p => p.user_id !== profileId))
            toast.success("Profile ignored and removed from your feed.")
        } else {
            toast.error("Failed to ignore profile.")
        }
    }

    const handleBlock = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        const res = await fetch("/api/blocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetUserId: profileId }),
        })
        if (res.ok) {
            setProfiles(prev => prev.filter(p => p.user_id !== profileId))
            toast.success("Profile permanently blocked.")
        } else {
            toast.error("Failed to block profile.")
        }
    }

    const handleParentSelect = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        if (!parentViewer?.isParent) return

        setActionLoadingId(profileId)

        const { error } = await supabase
            .from("parent_selections")
            .insert({
                parent_id: parentViewer.parentId,
                child_user_id: userId,
                selected_profile_id: profileId
            })

        if (error) {
            if (error.code === '23505') {
                toast.error(`You already selected this profile for your child.`)
            } else {
                toast.error(`Failed to select profile: ${error.message}`)
            }
        } else {
            toast.success(`Profile selected! Your child will be able to review it.`)
            setSelectedProfileIds(prev => new Set([...prev, profileId]))
            setProfiles(prev => prev.map(p => p.user_id === profileId ? { ...p, isSelected: true } : p))
            if (selectedProfile?.user_id === profileId) {
                setSelectedProfile((prev: any) => prev ? { ...prev, isSelected: true } : prev)
            }
        }

        setActionLoadingId("")
    }
    const handleShortlist = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        if (parentViewer?.isParent) return

        setShortlistLoadingId(profileId)
        const isCurrentlyShortlisted = shortlistedIds.includes(profileId)
        const method = isCurrentlyShortlisted ? "DELETE" : "POST"

        const res = await fetch("/api/shortlists", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetUserId: profileId }),
        })

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}))
            toast.error(`Shortlist failed: ${errData.error || 'Unknown error'}`)
        } else {
            if (isCurrentlyShortlisted) {
                setShortlistedIds(prev => prev.filter(id => id !== profileId))
                toast.success(`Removed from shortlist`)
            } else {
                setShortlistedIds(prev => [...prev, profileId])
                toast.success(`Profile shortlisted!`)
            }
        }
        setShortlistLoadingId("")
    }

    const handleCustomerLike = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        if (parentViewer?.isParent) return

        setActionLoadingId(profileId)

        const isCurrentlyLiked = likedIds.includes(profileId)
        const method = isCurrentlyLiked ? "DELETE" : "POST"

        const res = await fetch("/api/likes", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, likedUserId: profileId }),
        })

        if (!res.ok) {
            const data = await res.json()
            toast.error(`Failed to update interest: ${data.error}`)
        } else {
            if (isCurrentlyLiked) {
                setLikedIds(prev => prev.filter(id => id !== profileId))
                toast.success(`Interest removed`)
            } else {
                setLikedIds(prev => [...prev, profileId])
                toast.success(`Interest sent! We'll notify them.`)
            }
        }

        setActionLoadingId("")
    }


    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                // 1. Get current user gender
                const { data: userData } = await supabase
                    .from("personal_details")
                    .select("sex, food_preference")
                    .eq("user_id", userId)
                    .maybeSingle()

                // Get user's location for nearby matching
                const { data: myContact } = await supabase
                    .from("contact_details")
                    .select("current_district, current_state")
                    .eq("user_id", userId)
                    .maybeSingle()
                
                if (myContact && myContact.current_district) {
                    setCurrentUserLocation(`${myContact.current_district}${myContact.current_state ? `, ${myContact.current_state}` : ''}`)
                }

                if (!userData || !userData.sex) {
                    setIsProfileIncomplete(true)
                    setIsLoading(false)
                    return
                }

                setIsProfileIncomplete(false)
                const myGender = userData.sex?.toLowerCase() || ""
                const tg = myGender === "male" ? "Female" : "Male"
                setTargetGender(tg)

                // Fetch partner_preferences
                const { data: preferences } = await supabase
                    .from("partner_preferences")
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle()

                if (preferences) {
                    setHasPreferences(true)
                }

                // Fetch current user horoscope for matching
                const [
                    { data: myHoro },
                    { data: myInterests },
                    { data: mySocial },
                    { data: myEmp },
                    { data: myBus }
                ] = await Promise.all([
                    supabase.from("horoscope_details").select("*").eq("user_id", userId).maybeSingle(),
                    supabase.from("interests").select("*").eq("user_id", userId).maybeSingle(),
                    supabase.from("social_habits").select("*").eq("user_id", userId).maybeSingle(),
                    supabase.from("profession_employee").select("*").eq("user_id", userId).maybeSingle(),
                    supabase.from("profession_business").select("*").eq("user_id", userId).maybeSingle()
                ])
                
                setUserHoroscope(myHoro)
                setViewerFullProfile({
                    ...userData,
                    ...(myContact || {}),
                    interests: myInterests?.interests || [],
                    hobbies: myInterests?.hobbies || [],
                    smoking: mySocial?.smoking,
                    drinking: mySocial?.drinking,
                    foodPreference: userData?.food_preference,
                    workLocation: myEmp?.work_location || myBus?.business_location,
                    sector: myEmp?.sector || myBus?.business_type,
                    salary: myEmp?.salary || myBus?.annual_returns
                })

                // 2. Fetch target profiles
                let query = supabase
                    .from("personal_details")
                    .select("*")
                    .ilike("sex", tg)
                    .neq("user_id", userId)

                const { data: targetProfiles } = await query

                if (!targetProfiles || targetProfiles.length === 0) {
                    setIsLoading(false)
                    return
                }

                // 3. Fetch auxiliary data, blocks, ignores & check likes/selections if parent is viewer
                let childLikedIds: string[] = []  
                let likedChildIds: string[] = []  
                let selectedIds = new Set<string>()
                let hiddenProfileIds: string[] = []

                try {
                    const [likeRes, shortRes, viewsRes, blockRes, ignoreRes] = await Promise.all([
                        fetch(`/api/likes?userId=${userId}`),
                        fetch(`/api/shortlists?userId=${userId}`),
                        fetch(`/api/views?userId=${userId}`),
                        fetch(`/api/blocks?userId=${userId}`),
                        fetch(`/api/ignores?userId=${userId}`)
                    ])
                    
                    if (likeRes.ok) {
                        const likeData = await likeRes.json()
                        setLikedIds(likeData.iLikedIds || [])
                        setLikedMeIds(likeData.likedMeIds || [])
                    }
                    
                    // Fetch premium status
                    const settingsRes = await fetch(`/api/settings?userId=${userId}`)
                    if (settingsRes.ok) {
                        const settingsData = await settingsRes.json()
                        // ALLOW FOR NOW: Bypass check if requested
                        setIsPremium(settingsData.is_premium || true)
                    }
                    
                    if (shortRes.ok) {
                        const shortData = await shortRes.json()
                        setShortlistedIds(shortData.shortlistedIds || [])
                    }

                    if (viewsRes.ok) {
                        const viewsData = await viewsRes.json()
                        setIViewedIds((viewsData.iViewed || []).map((v: any) => v.viewed_user_id))
                        setViewedMeIds((viewsData.viewedMe || []).map((v: any) => v.viewer_user_id))
                    }

                    if (blockRes.ok) {
                        const blockData = await blockRes.json()
                        hiddenProfileIds.push(...(blockData.blockedIds || []))
                    }

                    if (ignoreRes.ok) {
                        const ignoreData = await ignoreRes.json()
                        hiddenProfileIds.push(...(ignoreData.ignoredIds || []))
                    }

                } catch { }

                // Filter out married locally and any blocked/ignored profiles
                const unmarriedProfiles = targetProfiles.filter(p => 
                    p.marital_status?.toLowerCase() !== "married" && 
                    !hiddenProfileIds.includes(p.user_id)
                )

                // Filter out deactivated profiles
                let deactivatedUserIds: string[] = []
                try {
                    const { data: deactivatedSettings } = await supabase
                        .from('user_settings')
                        .select('user_id, is_deactivated, deactivated_until')
                        .in('user_id', unmarriedProfiles.map((p: any) => p.user_id))
                        .eq('is_deactivated', true)
                    deactivatedUserIds = (deactivatedSettings || []).filter((s: any) =>
                        s.deactivated_until && new Date(s.deactivated_until) > new Date()
                    ).map((s: any) => s.user_id)
                } catch { }

                const activeProfiles = unmarriedProfiles.filter((p: any) => !deactivatedUserIds.includes(p.user_id))
                const targetUserIds = activeProfiles.map((p: any) => p.user_id)

                if (targetUserIds.length === 0) {
                    setIsLoading(false)
                    return
                }



                if (parentViewer?.isParent) {
                    const { data: selectionsData } = await supabase
                        .from("parent_selections")
                        .select("selected_profile_id")
                        .eq("parent_id", parentViewer.parentId)
                        .eq("child_user_id", userId)
                    selectedIds = new Set((selectionsData || []).map((s: any) => s.selected_profile_id))
                    setSelectedProfileIds(selectedIds)
                }

                const [
                    { data: photosData },
                    { data: contactData },
                    { data: empData },
                    { data: busData },
                    { data: stuData },
                    { data: eduData },
                    { data: interestsData },
                    { data: socialHabitsData },
                    { data: horoscopeData },
                    settingsApiRes,
                ] = await Promise.all([
                    supabase.from("photos").select("user_id, user_photos, family_photo").in("user_id", targetUserIds),
                    supabase.from("contact_details").select("user_id, current_district, current_state, phone, whatsapp_number").in("user_id", targetUserIds),
                    supabase.from("profession_employee").select("user_id, designation, company, sector, salary").in("user_id", targetUserIds),
                    supabase.from("profession_business").select("user_id, designation, business_name, business_type, annual_returns").in("user_id", targetUserIds),
                    supabase.from("profession_student").select("user_id, course, institution").in("user_id", targetUserIds),
                    supabase.from("education_details").select("user_id, education, institution").in("user_id", targetUserIds),
                    supabase.from("interests").select("*").in("user_id", targetUserIds),
                    supabase.from("social_habits").select("*").in("user_id", targetUserIds),
                    supabase.from("horoscope_details").select("user_id, zodiac_sign, star, lagnam, dhosham, time_of_birth, place_of_birth").in("user_id", targetUserIds),
                    // Use server API to bypass RLS on user_settings
                    fetch(`/api/premium-status?userIds=${targetUserIds.join(",")}`).then(r => r.ok ? r.json() : []).catch(() => []),
                ])

                const settingsData: any[] = Array.isArray(settingsApiRes) ? settingsApiRes : []

                const combined = activeProfiles.map((p: any) => {
                    const myPhotos = photosData?.find(x => x.user_id === p.user_id)
                    const myContact = contactData?.find(x => x.user_id === p.user_id)
                    const myEmp = empData?.find(x => x.user_id === p.user_id)
                    const myBus = busData?.find(x => x.user_id === p.user_id)
                    const myEdu = eduData?.filter(x => x.user_id === p.user_id)
                    const myInterests = interestsData?.find(x => x.user_id === p.user_id)
                    const mySocial = socialHabitsData?.find(x => x.user_id === p.user_id)
                    const myHoro = horoscopeData?.find(x => x.user_id === p.user_id)
                    const mySettings = settingsData?.find(x => x.user_id === p.user_id)

                    let profession = "Not specified"
                    if (myEmp && myEmp.designation && myEmp.company) profession = `${myEmp.designation} at ${myEmp.company}`
                    else if (myEmp && myEmp.designation) profession = myEmp.designation
                    else if (myBus && myBus.designation && myBus.business_name) profession = `${myBus.designation} at ${myBus.business_name}`

                    let location = "Location not specified"
                    if (myContact && myContact.current_district) {
                        location = `${myContact.current_district}${myContact.current_state ? `, ${myContact.current_state}` : ''}`
                    }

                    // Mask location based on mutual like for Parents
                    if (parentViewer?.isParent) {
                        const childLikedThisProfile = childLikedIds.includes(p.user_id)
                        const thisProfileLikedChild = likedChildIds.includes(p.user_id)
                        const isMutual = childLikedThisProfile && thisProfileLikedChild

                        if (!isMutual) {
                            location = "Location hidden (Requires mutual interest)"
                        }
                    }

                    return {
                        ...p,
                        photos: myPhotos?.user_photos || [],
                        family_photo: myPhotos?.family_photo,
                        location,
                        profession,
                        professionDetails: myEmp || myBus || null,
                        professionType: myEmp ? "employee" : myBus ? "business" : null,
                        education: myEdu || [],
                        interests: myInterests || null,
                        socialHabits: mySocial || null,
                        horoscope: myHoro || null,
                        compatibility: (userHoroscope?.star && myHoro?.star) 
                            ? checkTamilPorutham(userHoroscope.star, userHoroscope.zodiac_sign || "", myHoro.star, myHoro.zodiac_sign || "") 
                            : { score: 0, status: 'Athamam', breakdown: {} },
                        lifestyleMatch: viewerFullProfile ? calculateLifestyleScore(viewerFullProfile, {
                            ...p,
                            foodPreference: p.food_preference,
                            hobbies: myInterests?.hobbies || [],
                            interests: myInterests?.interests || [],
                            smoking: mySocial?.smoking,
                            drinking: mySocial?.drinking,
                            workLocation: myEmp?.work_location || myBus?.business_location,
                            sector: myEmp?.sector || myBus?.business_type,
                            salary: myEmp?.salary || myBus?.annual_returns
                        }) : null,
                        isSelected: selectedIds.has(p.user_id),
                        childLiked: childLikedIds.includes(p.user_id),
                        profileLikedChild: likedChildIds.includes(p.user_id),
                        phone: myContact?.phone || null,
                        whatsapp: myContact?.whatsapp_number || null,
                        isPremium: mySettings?.is_premium || false,
                        premiumPlan: mySettings?.premium_plan || null,
                        premiumExpiresAt: mySettings?.premium_expires_at || null,
                    }
                })

                let finalProfiles = combined

                // Apply Sorting by Lifestyle Compatibility as priority
                if (isPremium) {
                    finalProfiles = [...combined].sort((a, b) => {
                        const scoreA = a.lifestyleMatch?.totalScore || 0
                        const scoreB = b.lifestyleMatch?.totalScore || 0
                        return scoreB - scoreA
                    })
                }

                if (preferences && applyPreferences) {
                    finalProfiles = combined.filter((profile: any) => {
                        // Age filtering
                        if (preferences.min_age != null || preferences.max_age != null) {
                            const profileAge = profile.age ? parseInt(profile.age.toString()) : null
                            if (profileAge !== null) {
                                if (preferences.min_age != null && profileAge < preferences.min_age) return false
                                if (preferences.max_age != null && profileAge > preferences.max_age) return false
                            }
                        }

                        // Height filtering
                        if (preferences.min_height != null || preferences.max_height != null) {
                            const profileHeight = profile.height ? parseInt(profile.height.toString()) : null
                            if (profileHeight !== null) {
                                if (preferences.min_height != null && profileHeight < preferences.min_height) return false
                                if (preferences.max_height != null && profileHeight > preferences.max_height) return false
                            }
                        }

                        if (preferences.marital_status && preferences.marital_status.length > 0) {
                            if (profile.marital_status) {
                                const isMatch = preferences.marital_status.some((m: string) =>
                                    (profile.marital_status?.toLowerCase() || "").includes(m.toLowerCase())
                                )
                                if (!isMatch) return false
                            }
                        }

                        if (preferences.diet && preferences.diet.length > 0) {
                            if (profile.food_preference) {
                                const isMatch = preferences.diet.some((d: string) =>
                                    (profile.food_preference?.toLowerCase() || "").includes(d.toLowerCase())
                                )
                                if (!isMatch) return false
                            }
                        }

                        if (preferences.location && preferences.location.length > 0) {
                            if (profile.location && profile.location !== "Location not specified" && profile.location !== "Location hidden (Requires mutual interest)") {
                                const locMatches = preferences.location.some((loc: string) =>
                                    profile.location.toLowerCase().includes(loc.toLowerCase())
                                )
                                if (!locMatches) return false
                            }
                        }

                        if (preferences.education && preferences.education.length > 0) {
                            if (profile.education && profile.education.length > 0) {
                                const eduMatches = profile.education.some((edu: any) =>
                                    preferences.education.some((prefEdu: string) => (edu.education?.toLowerCase() || "").includes(prefEdu.toLowerCase()))
                                )
                                if (!eduMatches) return false
                            }
                        }

                        if (preferences.employment_type && preferences.employment_type.length > 0) {
                            if (profile.professionType) {
                                const empMatches = preferences.employment_type.some((emp: string) =>
                                    profile.professionType.toLowerCase().includes(emp.toLowerCase())
                                )
                                if (!empMatches) return false
                            }
                        }

                        if (preferences.sector && preferences.sector.length > 0) {
                            if (profile.professionDetails?.sector) {
                                const sectorMatches = preferences.sector.some((sec: string) =>
                                    (profile.professionDetails.sector.toLowerCase() || "").includes(sec.toLowerCase())
                                )
                                if (!sectorMatches) return false
                            }
                        }

                        if (preferences.smoking && preferences.smoking.length > 0) {
                            if (profile.socialHabits?.smoking) {
                                const isMatch = preferences.smoking.some((s: string) =>
                                    (profile.socialHabits?.smoking?.toLowerCase() || "").includes(s.toLowerCase())
                                )
                                if (!isMatch) return false
                            }
                        }

                        if (preferences.drinking && preferences.drinking.length > 0) {
                            if (profile.socialHabits?.drinking) {
                                const isMatch = preferences.drinking.some((d: string) =>
                                    (profile.socialHabits?.drinking?.toLowerCase() || "").includes(d.toLowerCase())
                                )
                                if (!isMatch) return false
                            }
                        }

                        return true
                    })
                }

                setProfiles(finalProfiles)
            } catch (error) {
                console.error("Error fetching profiles:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfiles()
    }, [userId, applyPreferences])

    // Filter profiles based on selected sidebar category
    const filteredProfiles = useMemo(() => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        switch (activeCategory) {
            case "newly-joined":
                return profiles.filter(p => new Date(p.created_at) > thirtyDaysAgo)
            case "matches-with-photos":
                return profiles.filter(p => p.photos && p.photos.length > 0)
            case "matches-with-horoscope":
                return profiles.filter(p => p.horoscope && (p.horoscope.zodiac_sign || p.horoscope.star))
            case "shortlisted-by-you":
                return profiles.filter(p => shortlistedIds.includes(p.user_id))
            case "shortlisted-you":
                return profiles.filter(p => p.profileLikedChild)
            case "viewed-you":
                return profiles.filter(p => viewedMeIds.includes(p.user_id))
            case "viewed-by-you":
                return profiles.filter(p => iViewedIds.includes(p.user_id))
            case "nearby-matches":
                if (!currentUserLocation) return profiles
                const myCity = currentUserLocation.split(',')[0].trim().toLowerCase()
                const myCoords = getCoordinatesForCity(myCity)
                
                return profiles.filter(p => {
                    const profileCity = (p.location || "").split(',')[0].trim().toLowerCase()
                    if (myCity === profileCity) return true // Exact text match
                    if (!myCoords) return profileCity.includes(myCity) || myCity.includes(profileCity) // String fallback if no coords
                    
                    const profileCoords = getCoordinatesForCity(profileCity)
                    if (profileCoords) {
                        const distance = getDistanceInKm(myCoords.lat, myCoords.lng, profileCoords.lat, profileCoords.lng)
                        return distance <= 100
                    }
                    
                    // Fallback to substring matching if profile isn't natively mapped
                    return profileCity.includes(myCity) || myCity.includes(profileCity)
                })
            case "star-matches":
                return profiles.filter(p => p.horoscope?.star)
            case "horoscope-matches":
                return profiles.filter(p => p.compatibility && p.compatibility.score >= 6)
            case "all-matches":
            default:
                return profiles
        }
    }, [profiles, activeCategory, shortlistedIds, viewedMeIds, iViewedIds, currentUserLocation])

    const getAgeHeightCasteEducationProfessionCityStr = (profile: any) => {
        const parts = []
        if (profile.age) parts.push(`${profile.age} yrs`)
        if (profile.height) parts.push(profile.height)
        if (profile.caste) parts.push(profile.caste)
        if (profile.education && profile.education.length > 0) {
            const edu = profile.education[0].education || profile.education[0]
            parts.push(typeof edu === 'string' ? edu : edu.education)
        }
        if (profile.profession && profile.profession !== "Not specified") parts.push(profile.profession)
        if (profile.location && profile.location !== "Location not specified" && profile.location !== "Location hidden (Requires mutual interest)") {
            const city = profile.location.split(',')[0]
            parts.push(city)
        }
        return parts.join(" • ")
    }

    const HorizontalProfileCard = ({ profile, index }: { profile: any, index: number }) => {
        const [cardPhotoIndex, setCardPhotoIndex] = useState(0)
        const hasMultiplePhotos = profile.photos && profile.photos.length > 1
        const genderColor = profile.sex?.toLowerCase() === 'female' ? 'border-pink-200' : 'border-blue-200'

        const handleContactClick = (type: string) => {
            if (!isPremium) {
                toast.info(`Upgrade to Premium to view ${type} details`, {
                    description: "Connect with matches instantly with our premium plans."
                })
                return
            }
            toast.success(`Redirecting to ${type}...`)
        }

        const openBreakdown = (e: React.MouseEvent) => {
            e.stopPropagation()
            setActiveBreakdown({
                lifestyle: profile.lifestyleMatch,
                horoscope: profile.compatibility
            })
            setBreakdownName(profile.name || "Unknown")
            setShowBreakdown(true)
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full"
            >
                <div
                    className={`sds-glass rounded-[3rem] overflow-hidden hover:shadow-[0_40px_80px_rgba(75,0,130,0.15)] transition-all duration-700 cursor-pointer group flex flex-col md:flex-row h-auto md:min-h-[260px] border-2 border-indigo-100/30 hover:border-indigo-400 group-hover:bg-white/95`}
                    onClick={(e) => handleOpenProfile(profile, e)}
                >
                    {/* Left: Image Section */}
                    <div className="w-full md:w-56 h-72 md:h-auto relative overflow-hidden bg-gray-50/30 shrink-0">
                        {profile.photos && profile.photos.length > 0 ? (
                            <>
                                <img
                                    src={profile.photos[cardPhotoIndex]}
                                    alt={profile.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                                {hasMultiplePhotos && (
                                    <div className="absolute bottom-4 right-4 sds-glass text-[10px] px-4 py-2 rounded-full z-10 font-black tracking-[0.2em] text-[#4B0082] bg-white/80 shadow-md">
                                        {cardPhotoIndex + 1} / {profile.photos.length}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                <User className="h-16 w-16 opacity-10" />
                                <span className="text-[10px] mt-2 font-black uppercase tracking-[0.3em] opacity-30">No Photo Uploaded</span>
                            </div>
                        )}
                        
                        {profile.photo_verified && (
                            <div className="absolute bottom-4 left-4 bg-emerald-500/90 text-white px-3 py-1.5 rounded-full text-[8px] font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 uppercase tracking-[0.2em] backdrop-blur-md">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                            </div>
                        )}

                        {profile.isPremium && (
                            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                                <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white text-[8px] uppercase font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl shadow-indigo-500/30 tracking-[0.2em] backdrop-blur-md">
                                    <Crown className="h-3 w-3" /> Premium
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right: Content Section */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col relative bg-gradient-to-br from-white/40 to-transparent">
                        {/* Compatibility Score - DUAL CORE */}
                        <div className="absolute top-6 right-6 z-20">
                            <MatchScoreBadge 
                                lifestyleScore={profile.lifestyleMatch?.totalScore || 0}
                                poruthamScore={profile.compatibility?.score || 0}
                                isPremium={isPremium}
                                onClick={openBreakdown}
                            />
                        </div>

                        <div className="mb-4">
                            <h3 className="text-2xl font-light text-gray-900 tracking-tight leading-none mb-2 group-hover:text-[#4B0082] transition-colors duration-300">
                                {profile.name || "Unknown"}<span className="font-bold text-[#4B0082]/30 ml-2">{profile.age && `, ${profile.age}`}</span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                                    {profile.location.split(',')[0]}
                                </div>
                                <div className="w-1.5 h-1.5 bg-indigo-100 rounded-full" />
                                <div className="flex items-center gap-1.5 text-emerald-600/60 transition-opacity group-hover:opacity-100">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Trust Score {calculateTrustScore(
                                        profile.photo_verified, 
                                        profile.completion_percentage || 80, 
                                        profile.photos?.length || 0,
                                        !!profile.family_photo
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-500/80 text-sm font-medium leading-relaxed mb-6 max-w-2xl line-clamp-2 italic">
                            "{getAgeHeightCasteEducationProfessionCityStr(profile)}"
                        </p>

                        <div className="mt-auto flex flex-wrap items-center justify-between pt-8 border-t border-black/[0.03]">
                            <div className="flex items-center gap-4">
                                <Button
                                    size="sm"
                                    className={`h-12 px-10 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all duration-500 ${
                                        likedIds.includes(profile.user_id)
                                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/30 ring-4 ring-rose-500/10'
                                        : 'bg-[#4B0082] text-white hover:bg-indigo-700 shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/30'
                                    }`}
                                    onClick={(e) => handleCustomerLike(e, profile.user_id)}
                                    disabled={actionLoadingId === profile.user_id}
                                >
                                    {likedIds.includes(profile.user_id) ? 'Interest Sent' : 'Send Interest'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-12 w-12 p-0 rounded-2xl transition-all duration-300 ${shortlistedIds.includes(profile.user_id) ? 'text-amber-500 hover:text-amber-600 bg-amber-50/50 shadow-inner' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50/30'}`}
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShortlist(e, profile.user_id); }}
                                    disabled={shortlistLoadingId === profile.user_id}
                                >
                                    <Star className={`h-5 w-5 ${shortlistedIds.includes(profile.user_id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost"
                                    className="h-12 px-6 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-300"
                                    onClick={(e) => handleOpenProfile(profile, e)}
                                >
                                    View Profile
                                    <ArrowRight className="h-3.5 w-3.5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-12 w-12 rounded-2xl text-gray-300 hover:text-gray-900 border border-black/[0.03] hover:bg-white/50 transition-all">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 sds-glass rounded-3xl p-2 z-50 overflow-hidden border-indigo-50/30 shadow-2xl backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                const isMutual = likedIds.includes(profile.user_id) && likedMeIds.includes(profile.user_id);
                                                if (isPremium || isMutual) {
                                                    setMessageTarget({ id: profile.user_id, name: profile.name });
                                                    setIsMessageDialogOpen(true);
                                                } else {
                                                    toast.error('Premium Required', { 
                                                        description: 'Upgrade to Premium for direct messaging, or wait for mutual interest.' 
                                                    });
                                                }
                                            }}
                                            className="gap-4 cursor-pointer rounded-2xl p-5 focus:bg-[#4B0082] focus:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
                                        >
                                            <MessageCircle className="h-5 w-5 opacity-60" /> Send Message
                                            {!isPremium && <Crown className="h-3.5 w-3.5 ml-auto text-amber-500/80" />}
                                        </DropdownMenuItem>
                                        <div className="h-px bg-black/[0.03] my-1" />
                                        <DropdownMenuItem
                                            onClick={(e) => { e.stopPropagation(); handleIgnore(e, profile.user_id); }}
                                            className="gap-4 cursor-pointer rounded-2xl p-5 focus:bg-gray-50/80 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                                        >
                                            <UserMinus className="h-5 w-5 opacity-40" /> Skip for Now
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => { e.stopPropagation(); handleBlock(e, profile.user_id); }}
                                            className="gap-4 cursor-pointer rounded-2xl p-5 focus:bg-rose-50/80 focus:text-rose-600 text-rose-400/60 font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                                        >
                                            <UserX className="h-5 w-5 opacity-40" /> Block Profile
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-[#4B0082]/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#4B0082] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B0082]/40">Finding Matches</p>
            </div>
        )
    }

    const menuGroups = [
        {
            title: "Matches",
            items: [
                { id: "all-matches", label: "All Matches", description: "View all profiles that match your preferences", icon: User },
            ]
        },
        {
            title: "Activity",
            items: [
                { id: "shortlisted-by-you", label: "Shortlisted", description: "Matches you have shortlisted", icon: Star },
                { id: "viewed-you", label: "Who viewed me", description: "Matches who have viewed your profile", icon: Filter },
                { id: "shortlisted-you", label: "Who shortlisted me", description: "Matches who have shortlisted your profile", icon: User },
                { id: "viewed-by-you", label: "Profiles I viewed", description: "Matches you have viewed", icon: Filter },
            ]
        },
        {
            title: "Local",
            items: [
                { id: "newly-joined", label: "New Members", description: "Matches who joined within the last 30 days", icon: User },
                { id: "nearby-matches", label: "Matches near me", description: "Matches near your location", icon: MapPin },
            ]
        },
        {
            title: "Profile Details",
            items: [
                { id: "matches-with-photos", label: "With Photos", description: "Matches that have added photos", icon: User },
            ]
        }
    ]
    
    // Add Parent Selections group if parent viewer
    if (parentViewer?.isParent) {
        menuGroups.unshift({
            title: "Parent Choice",
            items: [
                { id: "parent-selections", label: "Selection for Child", description: "Manage profiles you've selected for your child", icon: Shield },
            ]
        })
    }

    return (
        <div className="w-full min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <div className="max-w-[100rem] mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-[18rem] shrink-0 space-y-6 lg:sticky lg:top-24">
                        <div className="sds-glass rounded-[3rem] overflow-hidden p-4 border-2 border-indigo-100/50 shadow-[0_32px_64px_-12px_rgba(75,0,130,0.12)]">
                            <div className="p-4 border-b border-black/[0.03] mb-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#4B0082]">Filter Matches</h4>
                            </div>
                            <div className="space-y-4 p-2">
                                {menuGroups.map((group) => (
                                    <div key={group.title} className="space-y-3 mb-10 last:mb-0">
                                        <div className="px-4 py-1 text-[11px] font-black uppercase tracking-[0.4em] text-indigo-900/40 font-josefin">{group.title}</div>
                                        <div className="space-y-2">
                                            {group.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveCategory(item.id)}
                                                    className={`w-full group text-left px-6 py-5 rounded-[2rem] transition-all duration-500 flex items-center gap-4 relative overflow-hidden ${
                                                        activeCategory === item.id 
                                                        ? "bg-[#4B0082] text-white shadow-2xl shadow-indigo-900/40 scale-[1.05] z-10 font-black" 
                                                        : "hover:bg-indigo-50 text-indigo-900/80 hover:text-[#4B0082] font-bold"
                                                    }`}
                                                >
                                                    <item.icon className={`h-5 w-5 transition-transform duration-500 ${activeCategory === item.id ? "text-white scale-110" : "text-indigo-900/20 group-hover:text-[#4B0082] group-hover:scale-110"}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-[12px] font-black uppercase tracking-[0.16em] truncate transition-colors duration-300 ${activeCategory === item.id ? "text-white" : "group-hover:text-[#4B0082]"}`}>
                                                            {item.label}
                                                        </div>
                                                    </div>
                                                    {isMounted && activeCategory === item.id && (
                                                        <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-indigo-300 rounded-r-full" />
                                                    )}
                                                    {activeCategory === item.id && <ArrowRight className="h-3.5 w-3.5 text-white/40" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>


                    {/* Main Content */}
                    <div className="flex-1 space-y-10">
                        <div className="flex items-end justify-between pb-10 border-b border-black/[0.04]">
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#4B0082]/40 mb-3">Discovery</h4>
                                <h2 className="text-6xl font-light text-gray-900 tracking-tighter">
                                    {menuGroups.flatMap(g => g.items).find(i => i.id === activeCategory)?.label || "Discover Matches"}
                                </h2>
                            </div>
                            {hasPreferences && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setApplyPreferences(!applyPreferences)}
                                    className={`h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                        applyPreferences 
                                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                    }`}
                                >
                                    {applyPreferences ? <X className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                                    {applyPreferences ? "Clear Filters" : "Apply Filters"}
                                </Button>
                            )}
                        </div>
                        {isProfileIncomplete ? (
                            <Card className="border-dashed border-2 p-12 text-center bg-white dark:bg-gray-800">
                                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <User className="h-10 w-10 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h3>
                                <p className="text-gray-500 mt-2 max-w-md mx-auto">To find matches, we need to know your gender and basic details. Please complete your personal information first.</p>
                                <Button 
                                    onClick={() => window.location.href = '/dashboard/profile/edit'} 
                                    className="mt-8 bg-[#4B0082] hover:bg-[#380062] rounded-xl px-8"
                                >
                                    Update Profile
                                </Button>
                            </Card>
                        ) : filteredProfiles.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <User className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Profiles Found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters or checking back later!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredProfiles.map((profile, index) => (
                                    <HorizontalProfileCard key={profile.user_id} profile={profile} index={index} />
                                ))}
                            </div>
                        )}

                        {/* Special sectioned view for Parents */}
                        {parentViewer?.isParent && !isProfileIncomplete && filteredProfiles.length > 0 && (() => {
                const unselected = profiles.filter(p => !p.isSelected)
                // Selected but child hasn't liked yet
                const onlySelected = profiles.filter(p => p.isSelected && !p.childLiked)
                // Child liked but NOT mutual yet
                const childLikedOnly = profiles.filter(p => p.isSelected && p.childLiked && !p.profileLikedChild)
                // Both liked each other
                const mutualSection = profiles.filter(p => p.isSelected && p.childLiked && p.profileLikedChild)

                const ContactRow = ({ profile }: { profile: any }) => (
                    <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {profile.phone ? (
                            <a href={`tel:${profile.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-sm text-[#4B0082] font-semibold hover:underline">
                                <Phone className="h-4 w-4" />{profile.phone}
                            </a>
                        ) : <span className="text-xs text-gray-400">No phone on file</span>}
                        {profile.whatsapp && (
                            <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-sm text-green-600 font-semibold hover:underline">
                                <MessageCircle className="h-4 w-4" />WhatsApp
                            </a>
                        )}
                    </div>
                )

                const FullProfileCard = ({ profile }: { profile: any }) => {
                    const genderColor = profile.sex?.toLowerCase() === 'female' ? 'border-pink-200' : 'border-blue-200'
                    return (
                        <div className={`sds-glass rounded-[2.5rem] overflow-hidden border-2 shadow-2xl ${genderColor}`}>
                            {/* Mutual match header */}
                            <div className="bg-amber-50/50 px-6 py-4 flex items-center gap-3 border-b border-amber-100">
                                <SparklesIcon className="h-5 w-5 text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Mutual Interest Found</span>
                            </div>

                            <div className="flex flex-col md:flex-row">
                                {/* Photo Container */}
                                <div className="md:w-64 h-72 md:h-auto bg-gray-50 shrink-0 relative overflow-hidden">
                                    {profile.photos?.[0] ? (
                                        <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=random` }} />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><User className="h-20 w-20 text-[#4B0082]" /></div>
                                    )}

                                    {profile.isPremium && (
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-[#4B0082] text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">Premium Active</span>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Details */}
                                <div className="flex-1 p-8 space-y-8 max-h-[600px] overflow-y-auto">
                                    <div>
                                        <h4 className="text-4xl font-light text-gray-900 tracking-tight leading-none mb-3">
                                            {profile.name}<span className="font-black text-[#4B0082]">{profile.age && `, ${profile.age}`}</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.marital_status && <span className="text-[9px] font-black uppercase tracking-widest bg-black/5 text-gray-500 px-3 py-1.5 rounded-full">{profile.marital_status}</span>}
                                            {profile.photo_verified && <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">Photo Verified</span>}
                                        </div>
                                    </div>

                                    {/* Data Points */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {[
                                            { icon: Briefcase, label: "Profession", value: profile.profession },
                                            { icon: MapPin, label: "Area", value: profile.location.split(',')[0] },
                                            { icon: GraduationCap, label: "Education", value: profile.education?.[0]?.education || "None" },
                                            { icon: Heart, label: "Caste", value: profile.caste || profile.religion },
                                            { icon: Star, label: "Horoscope", value: profile.horoscope?.star || "Unknown" }
                                        ].map((point, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[#4B0082]/40">
                                                    <point.icon className="h-3 w-3" />
                                                    {point.label}
                                                </div>
                                                <p className="text-xs font-bold text-gray-800 tracking-tight truncate">{point.value || "Not Disclosed"}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action */}
                                    <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#4B0082]">Status</p>
                                            <p className="text-xs text-gray-400">Mutual interest significantly increases outcome success.</p>
                                        </div>
                                        <Button
                                            onClick={() => setSelectedProfile(profile)}
                                            className="h-12 px-8 rounded-2xl bg-[#4B0082] text-white font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
                                        >
                                            View Full Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                return (
                    <div className="space-y-12">
                        {/* Section 1: Find Matches (unselected only) */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-[#4B0082] flex items-center justify-center shadow-lg shadow-indigo-900/20">
                                        <User className="text-white h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-light text-gray-900 tracking-tight leading-none mb-1">
                                            Find your partner
                                        </h1>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/40">Browse Profiles</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#4B0082] bg-indigo-50 px-4 py-2 rounded-full">
                                    {unselected.length} AVAILABLE
                                </div>
                            </div>
                            
                            {unselected.length === 0 ? (
                                <div className="p-20 sds-glass rounded-[3rem] text-center border-dashed border-2 border-indigo-100 mb-10">
                                    <SparklesIcon className="h-10 w-10 text-indigo-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 max-w-xs mx-auto">No unselected profiles matching criteria at this vector.</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {unselected.map((profile, index) => <HorizontalProfileCard key={profile.user_id} profile={profile} index={index} />)}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Selected Profiles (child hasn't liked yet) */}
                        {onlySelected.length > 0 && (
                            <div className="space-y-8 pt-10 border-t border-black/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sds-glass rounded-2xl flex items-center justify-center text-emerald-500 border-emerald-50">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-light text-gray-900 tracking-tight">Shortlisted Profiles</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profiles you have saved</p>
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    {onlySelected.map((profile, index) => <HorizontalProfileCard key={profile.user_id} profile={profile} index={index} />)}
                                </div>
                            </div>
                        )}

                        {/* Section 3: Child Showed Interest (selected + child liked, not mutual) — show full card + contact */}
                        {childLikedOnly.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-rose-500" /> Your Child Showed Interest
                                    <span className="text-sm font-normal text-gray-500">({childLikedOnly.length})</span>
                                </h3>
                                <div className="space-y-6">
                                    {childLikedOnly.map((profile, index) => (
                                        <div key={profile.user_id} className="flex flex-col rounded-2xl overflow-hidden border border-rose-200 dark:border-rose-800 shadow-sm bg-white dark:bg-gray-800">
                                            <div className="relative">
                                                <HorizontalProfileCard profile={profile} index={index} />
                                            </div>
                                            <div className="px-4 pb-4">
                                                <ContactRow profile={profile} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 4: Mutual Matches — full profile details + contact */}
                        {mutualSection.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500" /> Mutual Interest 🎉
                                    <span className="text-sm font-normal text-gray-500">({mutualSection.length})</span>
                                </h3>
                                <div className="space-y-6">
                                    {mutualSection.map(profile => <FullProfileCard key={profile.user_id} profile={profile} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )
                        })()}
                    </div>
                </div>
            </div>


            {/* Profile Detail Dialog */}
            <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-gray-900 border-none rounded-2xl">
                    <DialogTitle className="sr-only">Profile Details</DialogTitle>
                    {selectedProfile && (
                        <div className="flex flex-col md:flex-row h-[85vh] md:h-[600px]">
                            {/* Left side: Photo Gallery */}
                            <div className="md:w-2/5 bg-gray-100 dark:bg-gray-800 relative group">
                                {selectedProfile.photos && selectedProfile.photos.length > 0 ? (
                                    <>
                                        <img
                                            src={selectedProfile.photos[modalPhotoIndex]}
                                            alt={selectedProfile.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedProfile.name || 'User') + '&size=400&background=random'
                                            }}
                                        />
                                        {selectedProfile.photos.length > 1 && (
                                            <>
                                                <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => prevModalPhoto(e, selectedProfile.photos.length)}
                                                        className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                                                    >
                                                        <ChevronLeft className="h-6 w-6" />
                                                    </button>
                                                </div>
                                                <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => nextModalPhoto(e, selectedProfile.photos.length)}
                                                        className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                                                    >
                                                        <ChevronRight className="h-6 w-6" />
                                                    </button>
                                                </div>
                                                <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm z-10 shadow-sm">
                                                    {modalPhotoIndex + 1} / {selectedProfile.photos.length}
                                                </div>

                                                {/* Dots indicator at bottom */}
                                                <div className="absolute bottom-20 md:bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                                                    {selectedProfile.photos.map((_: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-2 h-2 rounded-full transition-all ${idx === modalPhotoIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <User className="h-24 w-24 mb-4 opacity-50" />
                                        <span>No Photos Uploaded</span>
                                    </div>
                                )}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white md:hidden">
                                    <h2 className="text-2xl font-bold">{selectedProfile.name}{selectedProfile.age && `, ${selectedProfile.age}`}</h2>
                                </div>
                            </div>

                            {/* Right side: Details */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                                    <div className="hidden md:block mb-6">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {selectedProfile.name}{selectedProfile.age && <span className="text-gray-500 font-normal">, {selectedProfile.age}</span>}
                                        </h2>
                                        <p className="text-[#4B0082] font-medium text-lg">{selectedProfile.profession}</p>
                                    </div>

                                    <div className="space-y-8">
                                        {/* About - Hidden if Mutual Match (Full version in Personal Details) */}
                                        {!(selectedProfile.isSelected && selectedProfile.childLiked && selectedProfile.profileLikedChild) && selectedProfile.about && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                                    <User className="h-5 w-5 mr-2 text-pink-500" /> About Me
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl">
                                                    {selectedProfile.about}
                                                </p>
                                            </section>
                                        )}

                                        {/* Quick Info Grid */}
                                        <section>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <Heart className="h-5 w-5 mr-2 text-red-500" /> Basic Details
                                            </h3>
                                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                                <div>
                                                    <span className="block text-gray-500 mb-1">Location</span>
                                                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                                                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                        {selectedProfile.location}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-500 mb-1">Height</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {selectedProfile.height || "Not specified"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-500 mb-1">Mother Tongue</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {selectedProfile.mother_tongue || "Not specified"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-500 mb-1">Diet</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {selectedProfile.food_preference || "Not specified"}
                                                    </span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Professional Details */}
                                        {!(selectedProfile.isSelected && selectedProfile.childLiked && selectedProfile.profileLikedChild) && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                    <Briefcase className="h-5 w-5 mr-2 text-blue-500" /> Professional Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                                    <div>
                                                        <span className="block text-gray-500 mb-1">Designation</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.professionDetails?.designation || "Not specified"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-gray-500 mb-1">{selectedProfile.professionType === "business" ? "Business" : "Company"}</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.professionDetails?.company || selectedProfile.professionDetails?.business_name || "Not specified"}</span>
                                                    </div>
                                                    {selectedProfile.professionType === "employee" && selectedProfile.professionDetails?.sector && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Sector</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.professionDetails.sector}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.professionType === "employee" && selectedProfile.professionDetails?.employment_type && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Employment Type</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.professionDetails.employment_type}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.professionType === "business" && selectedProfile.professionDetails?.business_type && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Business Type</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.professionDetails.business_type}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.professionDetails?.annual_income && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Annual Income</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.professionDetails.annual_income}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>

                                        )}

                                        {/* Education */}
                                        {!(selectedProfile.isSelected && selectedProfile.childLiked && selectedProfile.profileLikedChild) && selectedProfile.education && selectedProfile.education.length > 0 && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                    <GraduationCap className="h-5 w-5 mr-2 text-indigo-500" /> Education
                                                </h3>
                                                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                                    {selectedProfile.education.map((edu: any, i: number) => (
                                                        <div key={i} className={`flex gap-3 ${i > 0 ? 'pt-3 border-t border-gray-200 dark:border-gray-700' : ''}`}>
                                                            <GraduationCap className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{edu.education}</p>
                                                                {edu.institution && <p className="text-sm text-gray-500">{edu.institution}</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* Horoscope Details */}
                                        {selectedProfile.horoscope && (selectedProfile.horoscope.zodiac_sign || selectedProfile.horoscope.star) && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                    <Star className="h-5 w-5 mr-2 text-amber-500" /> Horoscope Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl">
                                                    {selectedProfile.horoscope.zodiac_sign && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Zodiac Sign</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.horoscope.zodiac_sign}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.horoscope.star && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Star (Nakshatra)</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.horoscope.star}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.horoscope.lagnam && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Lagnam</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.horoscope.lagnam}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.horoscope.dhosham && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Dhosham</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.horoscope.dhosham}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.horoscope.time_of_birth && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Time of Birth</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.horoscope.time_of_birth}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.horoscope.place_of_birth && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Place of Birth</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.horoscope.place_of_birth}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        )}

                                        {/* Interests & Hobbies */}
                                        {selectedProfile.interests && (selectedProfile.interests.hobbies?.length > 0 || selectedProfile.interests.sports?.length > 0 || selectedProfile.interests.music?.length > 0) && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                    <Star className="h-5 w-5 mr-2 text-yellow-500" /> Interests & Hobbies
                                                </h3>
                                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-4">
                                                    {selectedProfile.interests.hobbies && selectedProfile.interests.hobbies.length > 0 && (
                                                        <div>
                                                            <span className="block text-sm text-gray-500 mb-1.5">Hobbies</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedProfile.interests.hobbies.map((hobby: string, i: number) => (
                                                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                                        {hobby}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedProfile.interests.sports && selectedProfile.interests.sports.length > 0 && (
                                                        <div>
                                                            <span className="block text-sm text-gray-500 mb-1.5">Sports & Fitness</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedProfile.interests.sports.map((sport: string, i: number) => (
                                                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                        {sport}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedProfile.interests.music && selectedProfile.interests.music.length > 0 && (
                                                        <div>
                                                            <span className="block text-sm text-gray-500 mb-1.5">Music Preferences</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedProfile.interests.music.map((music: string, i: number) => (
                                                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                                                                        {music}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        )}

                                        {/* Social Habits */}
                                        {selectedProfile.socialHabits && (selectedProfile.socialHabits.smoking || selectedProfile.socialHabits.drinking || selectedProfile.socialHabits.parties) && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                    <Coffee className="h-5 w-5 mr-2 text-orange-500" /> Social Habits
                                                </h3>
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                                    {selectedProfile.socialHabits.smoking && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Smoking</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.socialHabits.smoking}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.socialHabits.drinking && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Drinking</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.socialHabits.drinking}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.socialHabits.parties && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Parties</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.socialHabits.parties}</span>
                                                        </div>
                                                    )}
                                                    {selectedProfile.socialHabits.pubs && (
                                                        <div>
                                                            <span className="block text-gray-500 mb-1">Pubs / Clubs</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{selectedProfile.socialHabits.pubs}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        )}

                                        {/* ── MUTUAL MATCH: Full Detail Sections ── */}
                                        {selectedProfile.isSelected && selectedProfile.childLiked && selectedProfile.profileLikedChild && (
                                            isFetchingFull ? (
                                                <div className="flex items-center justify-center py-6 gap-3 text-gray-400">
                                                    <div className="animate-spin h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full" />
                                                    <span className="text-sm">Loading full profile details…</span>
                                                </div>
                                            ) : mutualFullData && (
                                                <>
                                                    {/* Personal Details (Full) */}
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Heart className="h-5 w-5 mr-2 text-pink-500" /> Personal Details
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-pink-50 dark:bg-pink-900/10 p-4 rounded-xl">
                                                            {selectedProfile.date_of_birth && <div><span className="block text-gray-500 mb-1">Date of Birth</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.date_of_birth}</span></div>}
                                                            {selectedProfile.sex && <div><span className="block text-gray-500 mb-1">Gender</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.sex}</span></div>}
                                                            {selectedProfile.height && <div><span className="block text-gray-500 mb-1">Height (cm)</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.height}</span></div>}
                                                            {selectedProfile.weight && <div><span className="block text-gray-500 mb-1">Weight (kg)</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.weight}</span></div>}
                                                            {selectedProfile.skin_color && <div><span className="block text-gray-500 mb-1">Skin Color</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.skin_color}</span></div>}
                                                            {selectedProfile.body_type && <div><span className="block text-gray-500 mb-1">Body Type</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.body_type}</span></div>}
                                                            {selectedProfile.marital_status && <div><span className="block text-gray-500 mb-1">Marital Status</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.marital_status}</span></div>}
                                                            {selectedProfile.food_preference && <div><span className="block text-gray-500 mb-1">Food Preference</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.food_preference}</span></div>}
                                                            {selectedProfile.languages && Array.isArray(selectedProfile.languages) && selectedProfile.languages.length > 0 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Languages</span><span className="font-medium text-gray-900 dark:text-white">{selectedProfile.languages.join(', ')}</span></div>}
                                                            {selectedProfile.about && <div className="col-span-2"><span className="block text-gray-500 mb-1">About</span><p className="font-medium text-gray-900 dark:text-white leading-relaxed">{selectedProfile.about}</p></div>}
                                                        </div>
                                                    </section>

                                                    {/* Contact Details */}
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Phone className="h-5 w-5 mr-2 text-[#4B0082]" /> Contact Details
                                                        </h3>

                                                        {/* Phone & WhatsApp */}
                                                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl mb-4">
                                                            {mutualFullData.fullContact?.phone && <div><span className="block text-gray-500 mb-1">Phone</span><a href={`tel:${mutualFullData.fullContact.phone}`} className="font-semibold text-[#4B0082] hover:underline">{mutualFullData.fullContact.phone}</a></div>}
                                                            {mutualFullData.fullContact?.whatsapp_number && <div><span className="block text-gray-500 mb-1">WhatsApp</span><a href={`https://wa.me/${mutualFullData.fullContact.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-semibold text-green-600 hover:underline flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {mutualFullData.fullContact.whatsapp_number}</a></div>}
                                                        </div>

                                                        {/* Current Address */}
                                                        <div className="mb-4">
                                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Address</h4>
                                                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                {mutualFullData.fullContact?.current_address_line1 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Address Line 1</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_address_line1}</span></div>}
                                                                {mutualFullData.fullContact?.current_address_line2 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Address Line 2</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_address_line2}</span></div>}
                                                                {mutualFullData.fullContact?.current_landmark && <div className="col-span-2"><span className="block text-gray-500 mb-1">Landmark</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_landmark}</span></div>}
                                                                {mutualFullData.fullContact?.current_area && <div><span className="block text-gray-500 mb-1">Area</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_area}</span></div>}
                                                                {mutualFullData.fullContact?.current_taluk && <div><span className="block text-gray-500 mb-1">Taluk</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_taluk}</span></div>}
                                                                {mutualFullData.fullContact?.current_district && <div><span className="block text-gray-500 mb-1">District</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_district}</span></div>}
                                                                {mutualFullData.fullContact?.current_division && <div><span className="block text-gray-500 mb-1">Division</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_division}</span></div>}
                                                                {mutualFullData.fullContact?.current_region && <div><span className="block text-gray-500 mb-1">Region</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_region}</span></div>}
                                                                {mutualFullData.fullContact?.current_state && <div><span className="block text-gray-500 mb-1">State</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_state}</span></div>}
                                                                {mutualFullData.fullContact?.current_country && <div><span className="block text-gray-500 mb-1">Country</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_country}</span></div>}
                                                                {mutualFullData.fullContact?.current_pincode && <div><span className="block text-gray-500 mb-1">Pincode</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_pincode}</span></div>}
                                                            </div>
                                                        </div>

                                                        {/* Permanent Address */}
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Permanent Address</h4>
                                                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                {mutualFullData.fullContact?.permanent_address_line1 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Address Line 1</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_address_line1}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_address_line2 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Address Line 2</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_address_line2}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_landmark && <div className="col-span-2"><span className="block text-gray-500 mb-1">Landmark</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_landmark}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_area && <div><span className="block text-gray-500 mb-1">Area</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_area}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_taluk && <div><span className="block text-gray-500 mb-1">Taluk</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_taluk}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_district && <div><span className="block text-gray-500 mb-1">District</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_district}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_division && <div><span className="block text-gray-500 mb-1">Division</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_division}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_region && <div><span className="block text-gray-500 mb-1">Region</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_region}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_state && <div><span className="block text-gray-500 mb-1">State</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_state}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_country && <div><span className="block text-gray-500 mb-1">Country</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_country}</span></div>}
                                                                {mutualFullData.fullContact?.permanent_pincode && <div><span className="block text-gray-500 mb-1">Pincode</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_pincode}</span></div>}
                                                            </div>
                                                        </div>
                                                    </section>

                                                    {/* Full Education */}
                                                    {mutualFullData.fullEdu && mutualFullData.fullEdu.length > 0 && (
                                                        <section>
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                                <GraduationCap className="h-5 w-5 mr-2 text-blue-500" /> Educational Details
                                                            </h3>
                                                            <div className="space-y-3">
                                                                {mutualFullData.fullEdu.map((edu: any, i: number) => (
                                                                    <div key={i} className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                                                                        {edu.education && <div><span className="block text-gray-500 mb-1">Level</span><span className="font-medium text-gray-900 dark:text-white">{edu.education === 'Other' ? edu.education_other : edu.education}</span></div>}
                                                                        {edu.degree && <div><span className="block text-gray-500 mb-1">Degree</span><span className="font-medium text-gray-900 dark:text-white">{edu.degree === 'Other' ? edu.degree_other : edu.degree}</span></div>}
                                                                        {edu.branch && <div><span className="block text-gray-500 mb-1">Branch</span><span className="font-medium text-gray-900 dark:text-white">{edu.branch}</span></div>}
                                                                        {edu.institution && <div><span className="block text-gray-500 mb-1">Institution</span><span className="font-medium text-gray-900 dark:text-white">{edu.institution}</span></div>}
                                                                        {edu.year_of_graduation && <div><span className="block text-gray-500 mb-1">Graduation Year</span><span className="font-medium text-gray-900 dark:text-white">{edu.year_of_graduation}</span></div>}
                                                                        {edu.status && <div><span className="block text-gray-500 mb-1">Status</span><span className="font-medium text-gray-900 dark:text-white">{edu.status}</span></div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </section>
                                                    )}

                                                    {/* Professional Details */}
                                                    {(mutualFullData.fullEmp || mutualFullData.fullBus || mutualFullData.fullStu) && (
                                                        <section>
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                                <Briefcase className="h-5 w-5 mr-2 text-indigo-500" /> Professional Details
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl">
                                                                {mutualFullData.fullEmp && (<><div><span className="block text-gray-500 mb-1">Type</span><span className="font-medium text-gray-900 dark:text-white">Employee</span></div>{mutualFullData.fullEmp.company && <div><span className="block text-gray-500 mb-1">Company</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.company}</span></div>}{mutualFullData.fullEmp.designation && <div><span className="block text-gray-500 mb-1">Designation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.designation}</span></div>}{mutualFullData.fullEmp.salary && <div><span className="block text-gray-500 mb-1">Salary</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.salary}</span></div>}{mutualFullData.fullEmp.work_location && <div><span className="block text-gray-500 mb-1">Work Location</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.work_location}</span></div>}</>)}
                                                                {mutualFullData.fullBus && (<><div><span className="block text-gray-500 mb-1">Type</span><span className="font-medium text-gray-900 dark:text-white">Business</span></div>{mutualFullData.fullBus.business_name && <div><span className="block text-gray-500 mb-1">Business</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullBus.business_name}</span></div>}{mutualFullData.fullBus.designation && <div><span className="block text-gray-500 mb-1">Designation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullBus.designation}</span></div>}{mutualFullData.fullBus.annual_returns && <div><span className="block text-gray-500 mb-1">Annual Returns</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullBus.annual_returns}</span></div>}</>)}
                                                                {mutualFullData.fullStu && (<><div><span className="block text-gray-500 mb-1">Type</span><span className="font-medium text-gray-900 dark:text-white">Student</span></div>{mutualFullData.fullStu.institution && <div><span className="block text-gray-500 mb-1">Institution</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullStu.institution}</span></div>}{mutualFullData.fullStu.course && <div><span className="block text-gray-500 mb-1">Course</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullStu.course}</span></div>}</>)}
                                                            </div>
                                                        </section>
                                                    )}

                                                    {/* Family Details */}
                                                    {mutualFullData.family && (
                                                        <section>
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                                <User className="h-5 w-5 mr-2 text-rose-500" /> Family Details
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl">
                                                                {mutualFullData.family.father_name && <div><span className="block text-gray-500 mb-1">Father's Name</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.father_name}</span></div>}
                                                                {mutualFullData.family.father_occupation && <div><span className="block text-gray-500 mb-1">Father's Occupation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.father_occupation}</span></div>}
                                                                {mutualFullData.family.mother_name && <div><span className="block text-gray-500 mb-1">Mother's Name</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.mother_name}</span></div>}
                                                                {mutualFullData.family.mother_occupation && <div><span className="block text-gray-500 mb-1">Mother's Occupation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.mother_occupation}</span></div>}
                                                                {mutualFullData.family.siblings && <div><span className="block text-gray-500 mb-1">Siblings</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.siblings}</span></div>}
                                                                {mutualFullData.family.caste && <div><span className="block text-gray-500 mb-1">Caste</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.caste}</span></div>}
                                                                {mutualFullData.family.subcaste && <div><span className="block text-gray-500 mb-1">Subcaste</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.subcaste}</span></div>}
                                                                {mutualFullData.family.kulam && <div><span className="block text-gray-500 mb-1">Kulam</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.kulam}</span></div>}
                                                                {mutualFullData.family.gotram && <div><span className="block text-gray-500 mb-1">Gotram</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.gotram}</span></div>}
                                                                {mutualFullData.family.family_type && <div><span className="block text-gray-500 mb-1">Family Type</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.family_type}</span></div>}
                                                                {mutualFullData.family.family_status && <div><span className="block text-gray-500 mb-1">Family Status</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.family_status}</span></div>}
                                                            </div>
                                                        </section>
                                                    )}
                                                </>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Sticky Action Footer */}
                                <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                    {parentViewer?.isParent ? (
                                        selectedProfile.isSelected ? (
                                            <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span className="font-semibold">Selected for your child</span>
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full bg-[#4B0082] hover:bg-indigo-700 text-white py-6 rounded-[1.5rem] font-bold tracking-widest text-[11px] uppercase shadow-lg shadow-indigo-500/20"
                                                onClick={(e) => handleParentSelect(e, selectedProfile.user_id)}
                                                disabled={actionLoadingId === selectedProfile.user_id}
                                            >
                                                <Heart className={`h-5 w-5 mr-3 ${actionLoadingId === selectedProfile.user_id ? "animate-pulse" : ""}`} />
                                                {actionLoadingId === selectedProfile.user_id ? "Selecting..." : "Select Profile for child"}
                                            </Button>
                                        )
                                    ) : (
                                        <Button
                                            className="w-full bg-[#4B0082] hover:bg-indigo-700 text-white py-6 rounded-[1.5rem] font-bold tracking-widest text-[11px] uppercase shadow-lg shadow-indigo-500/20"
                                            onClick={(e) => handleCustomerLike(e, selectedProfile.user_id)}
                                            disabled={actionLoadingId === selectedProfile.user_id}
                                        >
                                            <Heart className={`h-5 w-5 mr-3 ${actionLoadingId === selectedProfile.user_id ? "animate-pulse" : ""}`} />
                                            {actionLoadingId === selectedProfile.user_id ? "Liking..." : "Send Interest"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Message Dialog */}
            {messageTarget && (
                <MessageDialog
                    isOpen={isMessageDialogOpen}
                    onOpenChange={setIsMessageDialogOpen}
                    receiverId={messageTarget.id}
                    receiverName={messageTarget.name}
                    senderId={userId}
                    isPremium={isPremium}
                />
            )}
            {/* Compatibility Sheet - Detailed Breakdown */}
            <CompatibilitySheet 
                isOpen={showBreakdown}
                onClose={() => setShowBreakdown(false)}
                userName={breakdownName}
                lifestyleScore={activeBreakdown?.lifestyle?.totalScore || 0}
                poruthamScore={activeBreakdown?.horoscope?.score || 0}
                breakdown={activeBreakdown?.lifestyle?.breakdown || []}
                poruthamDetails={activeBreakdown?.horoscope?.breakdown}
            />
        </div>
    )
}
