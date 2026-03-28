"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Briefcase, User, GraduationCap, Calendar, Heart, ChevronLeft, ChevronRight, Star, Coffee, Filter, SlidersHorizontal, CheckCircle2, Phone, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

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
    const [hasPreferences, setHasPreferences] = useState(false)
    const [applyPreferences, setApplyPreferences] = useState(true)
    const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(new Set())
    const [shortlistedIds, setShortlistedIds] = useState<string[]>([])
    const [mutualFullData, setMutualFullData] = useState<any>(null)
    const [isFetchingFull, setIsFetchingFull] = useState(false)

    // State to track the active sidebar category
    const [activeCategory, setActiveCategory] = useState<string>("all-matches")
    const [searchTerm, setSearchTerm] = useState("")
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false)

    // State to track the currently viewed photo index for the modal
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0)

    const router = useRouter()

    // Function to handle navigating to profile page
    const handleOpenProfile = async (profile: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (!profile.user_id) return
        
        // Record the view
        console.log("Navigating to profile:", profile.user_id)

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
                    </CardContent>
                </Card>
            </motion.div>
        )
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

        setActionLoadingId(profileId)
        const isCurrentlyShortlisted = shortlistedIds.includes(profileId)
        const method = isCurrentlyShortlisted ? "DELETE" : "POST"

        const res = await fetch("/api/shortlists", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetUserId: profileId }),
        })

        if (!res.ok) {
            toast.error(`Failed to update shortlist.`)
        } else {
            if (isCurrentlyShortlisted) {
                setShortlistedIds(prev => prev.filter(id => id !== profileId))
                toast.success(`Removed from shortlist`)
            } else {
                setShortlistedIds(prev => [...prev, profileId])
                toast.success(`Profile shortlisted!`)
            }
        }
        setActionLoadingId("")
    }

    const handleCustomerLike = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        if (parentViewer?.isParent) return

        setActionLoadingId(profileId)

        const res = await fetch("/api/likes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, likedUserId: profileId }),
        })
        const data = await res.json()

        if (!res.ok) {
            if (data.error === "already_liked") {
                toast.error(`You have already liked this profile.`)
            } else {
                toast.error(`Failed to like profile: ${data.error}`)
            }
        } else {
            toast.success(`Profile liked! We'll notify them.`)
        }

        setActionLoadingId("")
    }


    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                // 1. Get current user gender
                const { data: userData } = await supabase
                    .from("personal_details")
                    .select("sex")
                    .eq("user_id", userId)
                    .maybeSingle()

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

                // Filter out married locally to avoid case mismatch issues
                const unmarriedProfiles = targetProfiles.filter(p => p.marital_status?.toLowerCase() !== "married")
                const targetUserIds = unmarriedProfiles.map(p => p.user_id)

                if (targetUserIds.length === 0) {
                    setIsLoading(false)
                    return
                }

                // 3. Fetch auxiliary data & check likes/selections if parent is viewer
                let childLikedIds: string[] = []  // profiles child has liked
                let likedChildIds: string[] = []  // profiles that liked the child
                let selectedIds = new Set<string>()

                if (parentViewer?.isParent) {
                    try {
                        const likeRes = await fetch(`/api/likes?userId=${userId}`)
                        if (likeRes.ok) {
                            const likeData = await likeRes.json()
                            childLikedIds = likeData.iLikedIds || []
                            likedChildIds = likeData.likedMeIds || []
                        }
                    } catch { }

                    try {
                        const shortRes = await fetch(`/api/shortlists?userId=${userId}`)
                        if (shortRes.ok) {
                            const shortData = await shortRes.json()
                            setShortlistedIds(shortData.shortlistedIds || [])
                        }
                    } catch { }

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
                    { data: eduData },
                    { data: interestsData },
                    { data: socialHabitsData },
                    { data: horoscopeData },
                ] = await Promise.all([
                    supabase.from("photos").select("user_id, user_photos").in("user_id", targetUserIds),
                    supabase.from("contact_details").select("user_id, current_district, current_state, phone, whatsapp_number").in("user_id", targetUserIds),
                    supabase.from("profession_employee").select("user_id, designation, company, sector, employment_type, annual_income").in("user_id", targetUserIds),
                    supabase.from("profession_business").select("user_id, designation, business_name, business_type, annual_income").in("user_id", targetUserIds),
                    supabase.from("education_details").select("user_id, education, institution").in("user_id", targetUserIds),
                    supabase.from("interests").select("*").in("user_id", targetUserIds),
                    supabase.from("social_habits").select("*").in("user_id", targetUserIds),
                    supabase.from("horoscope_details").select("user_id, zodiac_sign, star, lagnam, dhosham, time_of_birth, place_of_birth").in("user_id", targetUserIds),
                ])

                const combined = unmarriedProfiles.map(p => {
                    const myPhotos = photosData?.find(x => x.user_id === p.user_id)
                    const myContact = contactData?.find(x => x.user_id === p.user_id)
                    const myEmp = empData?.find(x => x.user_id === p.user_id)
                    const myBus = busData?.find(x => x.user_id === p.user_id)
                    const myEdu = eduData?.filter(x => x.user_id === p.user_id)
                    const myInterests = interestsData?.find(x => x.user_id === p.user_id)
                    const mySocial = socialHabitsData?.find(x => x.user_id === p.user_id)
                    const myHoro = horoscopeData?.find(x => x.user_id === p.user_id)

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
                            location = "Location hidden (Requires mutual match)"
                        }
                    }

                    return {
                        ...p,
                        photos: myPhotos?.user_photos || [],
                        location,
                        profession,
                        professionDetails: myEmp || myBus || null,
                        professionType: myEmp ? "employee" : myBus ? "business" : null,
                        education: myEdu || [],
                        interests: myInterests || null,
                        socialHabits: mySocial || null,
                        horoscope: myHoro || null,
                        isSelected: selectedIds.has(p.user_id),
                        childLiked: childLikedIds.includes(p.user_id),
                        profileLikedChild: likedChildIds.includes(p.user_id),
                        phone: myContact?.phone || null,
                        whatsapp: myContact?.whatsapp_number || null,
                    }
                })

                let finalProfiles = combined

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
                            if (profile.location && profile.location !== "Location not specified" && profile.location !== "Location hidden (Requires mutual match)") {
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
            case "viewed-by-you":
                // This would need a 'viewed_by_me' flag or similar
                return profiles
            case "nearby-matches":
                // This would need the current user's location
                return profiles
            case "star-matches":
                return profiles.filter(p => p.horoscope?.star)
            case "all-matches":
            default:
                return profiles
        }
    }, [profiles, activeCategory, shortlistedIds])

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
        if (profile.location && profile.location !== "Location not specified" && profile.location !== "Location hidden (Requires mutual match)") {
            const city = profile.location.split(',')[0]
            parts.push(city)
        }
        return parts.join(" • ")
    }

    const HorizontalProfileCard = ({ profile, index }: { profile: any, index: number }) => {
        const [cardPhotoIndex, setCardPhotoIndex] = useState(0)
        const hasMultiplePhotos = profile.photos && profile.photos.length > 1
        // Mock subscription check - default to false per user's request for "Paid members"
        const isPaidMember = false 

        const handleContactClick = (type: string) => {
            if (!isPaidMember) {
                toast.info(`Upgrade to Premium to view ${type} details`, {
                    description: "Connect with matches instantly with our premium plans."
                })
                return
            }
            // Logic for paid members would go here (e.g., opening WhatsApp or Dialer)
            toast.success(`Redirecting to ${type}...`)
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full"
            >
                <Card
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 flex flex-col md:flex-row h-auto md:min-h-[180px]"
                    onClick={(e) => handleOpenProfile(profile, e)}
                >
                    {/* Left: Image Section */}
                    <div className="w-full md:w-52 h-64 md:h-auto relative overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                        {profile.photos && profile.photos.length > 0 ? (
                            <>
                                <img
                                    src={profile.photos[cardPhotoIndex]}
                                    alt={profile.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {hasMultiplePhotos && (
                                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm z-10 font-bold">
                                        {cardPhotoIndex + 1} / {profile.photos.length}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <User className="h-12 w-12 opacity-30" />
                                <span className="text-xs mt-2 font-medium">No Photo</span>
                            </div>
                        )}
                        {profile.photo_verified && (
                            <div className="absolute bottom-3 left-3 bg-blue-600/90 text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                                <CheckCircle2 className="h-3 w-3" /> VERIFIED
                            </div>
                        )}
                    </div>

                    {/* Right: Content Section */}
                    <CardContent className="p-5 flex-1 flex flex-col relative">
                        {/* Top Badge & Icons */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1 text-blue-600 font-bold text-xs uppercase tracking-tight">
                                <CheckCircle2 className="h-4 w-4 fill-blue-600 text-white" />
                                <span>ID verified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleContactClick("Phone"); }}
                                    className="p-2 rounded-full border border-orange-100 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                >
                                    <Phone className="h-5 w-5" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleContactClick("WhatsApp"); }}
                                    className="p-2 rounded-full border border-green-100 bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Name & Status */}
                        <div className="mb-3">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                {profile.name || "Unknown"}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">
                                Last seen an hour ago
                            </p>
                        </div>

                        {/* Bulleted Details */}
                        <p className="text-[15px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-4">
                            {getAgeHeightCasteEducationProfessionCityStr(profile)}
                        </p>

                        {/* Bottom Actions */}
                        <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full h-9 px-4 font-bold text-xs"
                                    onClick={(e) => handleCustomerLike(e, profile.user_id)}
                                >
                                    <Heart className="h-3.5 w-3.5 mr-1.5" /> Interested
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-9 w-9 p-0 rounded-full transition-colors ${shortlistedIds.includes(profile.user_id) ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-gray-400 hover:text-blue-600'}`}
                                    onClick={(e) => handleShortlist(e, profile.user_id)}
                                >
                                    <Star className={`h-4 w-4 ${shortlistedIds.includes(profile.user_id) ? 'fill-amber-500' : ''}`} />
                                </Button>
                            </div>
                            
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#4B0082] hover:bg-[#4B0082]/5 font-bold text-sm tracking-tight px-0 hover:px-2 transition-all"
                                onClick={(e) => handleOpenProfile(profile, e)}
                            >
                                View Profile →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
            </div>
        )
    }

    const menuGroups = [
        {
            title: "All Matches",
            items: [
                { id: "all-matches", label: "Your Matches", description: "View all profiles that match your preferences", icon: User },
            ]
        },
        {
            title: "Based on activity",
            items: [
                { id: "shortlisted-by-you", label: "Shortlisted by you", description: "Matches you have shortlisted", icon: Star },
                { id: "viewed-you", label: "Viewed you", description: "Matches who have viewed your profile", icon: Filter },
                { id: "shortlisted-you", label: "Shortlisted you", description: "Matches who have shortlisted your profile", icon: User },
                { id: "viewed-by-you", label: "Viewed by you", description: "Matches you have viewed", icon: Filter },
            ]
        },
        {
            title: "Recently joined & nearby matches",
            items: [
                { id: "newly-joined", label: "Newly Joined", description: "Matches who joined within the last 30 days", icon: User },
                { id: "nearby-matches", label: "Nearby matches", description: "Matches near your location", icon: MapPin },
            ]
        },
        {
            title: "Based on profile details",
            items: [
                { id: "matches-with-photos", label: "Matches with photos", description: "Matches that have added photos", icon: User },
                { id: "matches-with-horoscope", label: "Matches with horoscope", description: "Matches that have added horoscope", icon: Star },
            ]
        },
        {
            title: "Based on astrological compatibility",
            items: [
                { id: "star-matches", label: "Star matches", description: "Matches with compatible star sign", icon: Star },
                { id: "horoscope-matches", label: "Horoscope matches", description: "Matches with horoscope matching yours", icon: Star },
            ]
        }
    ]

    return (
        <div className="w-full min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-6">
                        <Card className="border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                            <div className="p-4 bg-white dark:bg-gray-800 space-y-6">
                                {menuGroups.map((group) => (
                                    <div key={group.title} className="space-y-2">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2">{group.title}</h4>
                                        <div className="space-y-1">
                                            {group.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveCategory(item.id)}
                                                    className={`w-full group text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                                        activeCategory === item.id ? "bg-[#4B0082]/5 dark:bg-[#4B0082]/10 border-l-4 border-[#4B0082]" : "border-l-4 border-transparent"
                                                    }`}
                                                >
                                                    <item.icon className={`h-4 w-4 mt-0.5 ${activeCategory === item.id ? "text-[#4B0082]" : "text-gray-400"}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-xs font-bold truncate ${activeCategory === item.id ? "text-[#4B0082]" : "text-gray-700 dark:text-gray-300"}`}>
                                                            {item.label}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {menuGroups.flatMap(g => g.items).find(i => i.id === activeCategory)?.label || "Discover Matches"}
                            </h2>
                            {hasPreferences && (
                                <Button
                                    variant={applyPreferences ? "destructive" : "default"}
                                    onClick={() => setApplyPreferences(!applyPreferences)}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    {applyPreferences ? <SlidersHorizontal className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                                    {applyPreferences ? "Clear Preferences" : "Applied Preferences"}
                                </Button>
                            )}
                        </div>                        {isProfileIncomplete ? (
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

                const FullProfileCard = ({ profile }: { profile: any }) => (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-amber-300 dark:border-amber-600 overflow-hidden shadow-md">
                        {/* Mutual badge */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Mutual Match — Your child and this profile liked each other!</span>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Photo */}
                            <div className="md:w-48 h-56 md:h-auto bg-gray-100 dark:bg-gray-700 shrink-0 relative">
                                {profile.photos?.[0] ? (
                                    <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=random` }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><User className="h-16 w-16 text-gray-400" /></div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px]">
                                {/* Name */}
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}{profile.age && `, ${profile.age}`}</h4>
                                    {profile.marital_status && <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded-full">{profile.marital_status}</span>}
                                </div>

                                {/* Basic info grid */}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {profile.profession !== "Not specified" && <div><span className="text-gray-500">Profession</span><p className="font-medium text-gray-900 dark:text-white truncate">{profile.profession}</p></div>}
                                    {profile.location && <div><span className="text-gray-500">Location</span><p className="font-medium text-gray-900 dark:text-white">{profile.location}</p></div>}
                                    {profile.religion && <div><span className="text-gray-500">Religion</span><p className="font-medium text-gray-900 dark:text-white">{profile.religion}</p></div>}
                                    {profile.caste && <div><span className="text-gray-500">Caste</span><p className="font-medium text-gray-900 dark:text-white">{profile.caste}</p></div>}
                                    {profile.height && <div><span className="text-gray-500">Height</span><p className="font-medium text-gray-900 dark:text-white">{profile.height}</p></div>}
                                </div>


                                {/* Education */}
                                {profile.education?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />Education</p>
                                        {profile.education.map((edu: any, i: number) => (
                                            <p key={i} className="text-sm text-gray-800 dark:text-gray-200">{edu.education}{edu.institution && ` — ${edu.institution}`}</p>
                                        ))}
                                    </div>
                                )}

                                {/* Profession Details */}
                                {profile.professionDetails && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />Professional</p>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                            {profile.professionDetails.designation && <div><span className="text-gray-400">Role</span><p className="font-medium text-gray-900 dark:text-white">{profile.professionDetails.designation}</p></div>}
                                            {(profile.professionDetails.company || profile.professionDetails.business_name) && <div><span className="text-gray-400">Company</span><p className="font-medium text-gray-900 dark:text-white">{profile.professionDetails.company || profile.professionDetails.business_name}</p></div>}
                                            {profile.professionDetails.annual_income && <div><span className="text-gray-400">Income</span><p className="font-medium text-gray-900 dark:text-white">{profile.professionDetails.annual_income}</p></div>}
                                        </div>
                                    </div>
                                )}

                                {/* Horoscope */}
                                {profile.horoscope && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Horoscope</p>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                            {profile.horoscope.zodiac_sign && <div><span className="text-gray-400">Zodiac</span><p className="font-medium text-gray-900 dark:text-white">{profile.horoscope.zodiac_sign}</p></div>}
                                            {profile.horoscope.star && <div><span className="text-gray-400">Star</span><p className="font-medium text-gray-900 dark:text-white">{profile.horoscope.star}</p></div>}
                                            {profile.horoscope.dhosham && <div><span className="text-gray-400">Dhosham</span><p className="font-medium text-gray-900 dark:text-white">{profile.horoscope.dhosham}</p></div>}
                                        </div>
                                    </div>
                                )}

                                {/* Interests */}
                                {profile.interests?.hobbies?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Interests</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {profile.interests.hobbies.map((h: string, i: number) => <span key={i} className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded-full">{h}</span>)}
                                        </div>
                                    </div>
                                )}

                                {/* Contact */}
                                <ContactRow profile={profile} />

                                {/* View Full Modal button */}
                                <button onClick={() => setSelectedProfile(profile)} className="w-full mt-2 text-sm font-semibold text-[#4B0082] border border-[#4B0082]/30 rounded-xl py-2 hover:bg-[#4B0082]/10 transition">
                                    View Full Profile →
                                </button>
                            </div>
                        </div>
                    </div>
                )

                return (
                    <div className="space-y-12">
                        {/* Section 1: Find Matches (unselected only) */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-[#FF1493]" /> Find Matches
                                <span className="text-sm font-normal text-gray-500">({unselected.length})</span>
                            </h3>
                            {unselected.length === 0 ? (
                                <div className="text-center py-10 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                                    <p className="text-gray-500 text-sm">All available profiles have been selected for your child.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {unselected.map((profile, index) => <HorizontalProfileCard key={profile.user_id} profile={profile} index={index} />)}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Selected Profiles (child hasn't liked yet) */}
                        {onlySelected.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" /> Selected Profiles
                                    <span className="text-sm font-normal text-gray-500">({onlySelected.length})</span>
                                </h3>
                                <div className="space-y-6">
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
                                    <Star className="h-5 w-5 text-amber-500" /> Mutual Matches 🎉
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
                                                className="w-full bg-[#1F4068] hover:bg-[#162E4A] text-white py-6"
                                                onClick={(e) => handleParentSelect(e, selectedProfile.user_id)}
                                                disabled={actionLoadingId === selectedProfile.user_id}
                                            >
                                                <Heart className={`h-5 w-5 mr-2 ${actionLoadingId === selectedProfile.user_id ? "animate-pulse" : ""}`} />
                                                {actionLoadingId === selectedProfile.user_id ? "Selecting..." : "Select Profile for your child"}
                                            </Button>
                                        )
                                    ) : (
                                        <Button
                                            className="w-full bg-[#FF1493] hover:bg-[#E01183] text-white py-6"
                                            onClick={(e) => handleCustomerLike(e, selectedProfile.user_id)}
                                            disabled={actionLoadingId === selectedProfile.user_id}
                                        >
                                            <Heart className={`h-5 w-5 mr-2 ${actionLoadingId === selectedProfile.user_id ? "animate-pulse" : ""}`} />
                                            {actionLoadingId === selectedProfile.user_id ? "Liking..." : "Like & Express Interest"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
