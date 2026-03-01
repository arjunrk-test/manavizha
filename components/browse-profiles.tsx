"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Briefcase, User, GraduationCap, Calendar, Heart, ChevronLeft, ChevronRight, Star, Coffee, Filter, SlidersHorizontal } from "lucide-react"
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

    // State to track the currently viewed photo index for the modal
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0)

    // Function to handle opening modal and resetting the index
    const handleOpenProfile = (profile: any) => {
        setModalPhotoIndex(0)
        setSelectedProfile(profile)
    }

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
        }

        setActionLoadingId("")
    }

    const handleCustomerLike = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        if (parentViewer?.isParent) return

        setActionLoadingId(profileId)

        const { error } = await supabase
            .from("likes")
            .insert({
                user_id: userId,
                liked_user_id: profileId
            })

        if (error) {
            if (error.code === '23505') {
                toast.error(`You have already liked this profile.`)
            } else {
                toast.error(`Failed to like profile: ${error.message}`)
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

                if (!userData) {
                    setIsLoading(false)
                    return
                }

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

                // 3. Fetch auxiliary data & check likes if parent is viewer
                let childLikesData: any[] = []
                let childLikedByData: any[] = []

                if (parentViewer?.isParent) {
                    const [{ data: clData }, { data: clbData }] = await Promise.all([
                        supabase.from("likes").select("liked_user_id").eq("user_id", userId),
                        supabase.from("likes").select("user_id").in("liked_user_id", targetUserIds) // Note: user_id is target, liked_user_id is child? Wait. likes: user_id = liker, liked_user_id = liked
                    ])
                    childLikesData = clData || []

                    const { data: clbCorrectData } = await supabase.from("likes").select("user_id").eq("liked_user_id", userId).in("user_id", targetUserIds)
                    childLikedByData = clbCorrectData || []
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
                    supabase.from("contact_details").select("user_id, current_city, current_state").in("user_id", targetUserIds),
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
                    if (myContact && myContact.current_city) {
                        location = `${myContact.current_city}${myContact.current_state ? `, ${myContact.current_state}` : ''}`
                    }

                    // Mask location based on mutual like for Parents
                    if (parentViewer?.isParent) {
                        const childLikedThisProfile = childLikesData.some(l => l.liked_user_id === p.user_id)
                        const thisProfileLikedChild = childLikedByData.some(l => l.user_id === p.user_id)
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
                    }
                })

                let finalProfiles = combined

                if (preferences && applyPreferences) {
                    finalProfiles = combined.filter((profile: any) => {
                        // Age filtering
                        if (preferences.min_age != null || preferences.max_age != null) {
                            const profileAge = profile.age ? parseInt(profile.age.toString()) : null
                            if (profileAge === null) return false
                            if (preferences.min_age != null && profileAge < preferences.min_age) return false
                            if (preferences.max_age != null && profileAge > preferences.max_age) return false
                        }

                        // Height filtering
                        if (preferences.min_height != null || preferences.max_height != null) {
                            const profileHeight = profile.height ? parseInt(profile.height.toString()) : null
                            if (profileHeight === null) return false
                            if (preferences.min_height != null && profileHeight < preferences.min_height) return false
                            if (preferences.max_height != null && profileHeight > preferences.max_height) return false
                        }

                        if (preferences.marital_status && preferences.marital_status.length > 0) {
                            const isMatch = preferences.marital_status.some((m: string) =>
                                (profile.marital_status?.toLowerCase() || "").includes(m.toLowerCase())
                            )
                            if (!isMatch) return false
                        }

                        if (preferences.diet && preferences.diet.length > 0) {
                            const isMatch = preferences.diet.some((d: string) =>
                                (profile.food_preference?.toLowerCase() || "").includes(d.toLowerCase())
                            )
                            if (!isMatch) return false
                        }

                        if (preferences.location && preferences.location.length > 0) {
                            if (!profile.location) return false
                            const locMatches = preferences.location.some((loc: string) =>
                                profile.location.toLowerCase().includes(loc.toLowerCase())
                            )
                            if (!locMatches) return false
                        }

                        if (preferences.education && preferences.education.length > 0) {
                            if (!profile.education || profile.education.length === 0) return false
                            const eduMatches = profile.education.some((edu: any) =>
                                preferences.education.some((prefEdu: string) => (edu.education?.toLowerCase() || "").includes(prefEdu.toLowerCase()))
                            )
                            if (!eduMatches) return false
                        }

                        if (preferences.employment_type && preferences.employment_type.length > 0) {
                            if (!profile.professionType) return false
                            const empMatches = preferences.employment_type.some((emp: string) =>
                                profile.professionType.toLowerCase().includes(emp.toLowerCase())
                            )
                            if (!empMatches) return false
                        }

                        if (preferences.sector && preferences.sector.length > 0) {
                            if (!profile.professionDetails?.sector) return false
                            const sectorMatches = preferences.sector.some((sec: string) =>
                                (profile.professionDetails.sector.toLowerCase() || "").includes(sec.toLowerCase())
                            )
                            if (!sectorMatches) return false
                        }

                        if (preferences.smoking && preferences.smoking.length > 0) {
                            const isMatch = preferences.smoking.some((s: string) =>
                                (profile.socialHabits?.smoking?.toLowerCase() || "").includes(s.toLowerCase())
                            )
                            if (!isMatch) return false
                        }

                        if (preferences.drinking && preferences.drinking.length > 0) {
                            const isMatch = preferences.drinking.some((d: string) =>
                                (profile.socialHabits?.drinking?.toLowerCase() || "").includes(d.toLowerCase())
                            )
                            if (!isMatch) return false
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Heart className="h-8 w-8 text-[#FF1493]" />
                        {parentViewer?.isParent ? "Find Matches For Your Child" : "Discover Matches"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Here are some {targetGender.toLowerCase()} profiles tailored for {parentViewer?.isParent ? "your child" : "you"}
                    </p>
                    {hasPreferences && (
                        <p className="text-sm font-medium text-[#4B0082] mt-1 bg-[#4B0082]/10 inline-block px-3 py-1 rounded-full">
                            {applyPreferences ? "✨ Showing filtered matches based on your Partner Preferences" : "⚠️ Preferences are currently disabled"}
                        </p>
                    )}
                </div>

                {hasPreferences && (
                    <Button
                        variant={applyPreferences ? "destructive" : "default"}
                        onClick={() => setApplyPreferences(!applyPreferences)}
                        className={`flex items-center gap-2 ${!applyPreferences ? "bg-[#4B0082] hover:bg-[#3b0066]" : ""}`}
                    >
                        {applyPreferences ? (
                            <>
                                <SlidersHorizontal className="h-4 w-4" />
                                Remove Preferences
                            </>
                        ) : (
                            <>
                                <Filter className="h-4 w-4" />
                                Apply Preferences
                            </>
                        )}
                    </Button>
                )}
            </div>

            {profiles.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Profiles Found</h3>
                    <p className="text-gray-500 mt-2">Check back later for new matches!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {profiles.map((profile, index) => (
                        <ProfileCardWrapper key={profile.user_id} profile={profile} index={index} />
                    ))}
                </div>
            )}

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
                                        {/* About */}
                                        {selectedProfile.about && (
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

                                        {/* Education */}
                                        {selectedProfile.education && selectedProfile.education.length > 0 && (
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
                                    </div>
                                </div>

                                {/* Sticky Action Footer */}
                                <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                    {parentViewer?.isParent ? (
                                        <Button
                                            className="w-full bg-[#1F4068] hover:bg-[#162E4A] text-white py-6"
                                            onClick={(e) => handleParentSelect(e, selectedProfile.user_id)}
                                            disabled={actionLoadingId === selectedProfile.user_id}
                                        >
                                            <Heart className={`h-5 w-5 mr-2 ${actionLoadingId === selectedProfile.user_id ? "animate-pulse" : ""}`} />
                                            {actionLoadingId === selectedProfile.user_id ? "Selecting..." : "Select Profile for your child"}
                                        </Button>
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
