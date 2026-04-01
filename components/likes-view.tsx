"use client"

import { useEffect, useState } from "react"
import { Heart, User, MapPin, Briefcase, Sparkles, HeartHandshake, X, GraduationCap, Star, Phone, MessageCircle, Coffee, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { MessageDialog } from "@/components/message-dialog"

interface LikesViewProps {
    userId: string
    onBack?: () => void
    initialTab?: Tab
}

type Tab = "liked" | "mutual" | "likedme"

interface ProfileCard {
    user_id: string
    name: string
    age?: number
    profession: string
    location: string
    sex?: string
    photo: string | null
    photos: string[]
    iLiked: boolean
}

export function LikesView({ userId, onBack, initialTab }: LikesViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab || "mutual")
    const [isLoading, setIsLoading] = useState(true)
    const [iLikedIds, setILikedIds] = useState<string[]>([])
    const [likedMeIds, setLikedMeIds] = useState<string[]>([])
    const [profiles, setProfiles] = useState<Record<string, ProfileCard>>({})
    const [selectedProfile, setSelectedProfile] = useState<ProfileCard | null>(null)
    const [actionLoadingId, setActionLoadingId] = useState("")

    // Mutual Full Data States
    const [mutualFullData, setMutualFullData] = useState<any>(null)
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0)
    const [isFetchingFull, setIsFetchingFull] = useState(false)
    const [isPremium, setIsPremium] = useState(false)

    // Messaging states
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
    const [messageTarget, setMessageTarget] = useState<{ id: string, name: string } | null>(null)

    const nextModalPhoto = (e: React.MouseEvent, maxPhotos: number) => {
        e.stopPropagation()
        setModalPhotoIndex(prev => (prev + 1) % maxPhotos)
    }

    const prevModalPhoto = (e: React.MouseEvent, maxPhotos: number) => {
        e.stopPropagation()
        setModalPhotoIndex(prev => (prev - 1 + maxPhotos) % maxPhotos)
    }

    // Reset photo index when opening a profile
    const handleOpenProfile = async (profile: ProfileCard) => {
        setModalPhotoIndex(0)
        setSelectedProfile(profile)

        // Record the view
        if (userId && profile.user_id) {
            try {
                fetch('/api/views', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ viewerId: userId, viewedUserId: profile.user_id })
                })
            } catch (e) {
                console.error("Failed to record view:", e)
            }
        }
    }


    useEffect(() => {
        fetchLikes()
        if (initialTab) {
            setActiveTab(initialTab)
        }
    }, [userId, initialTab])

    // Fetch Full Profile Details when a profile is clicked
    useEffect(() => {
        if (!selectedProfile) {
            setMutualFullData(null)
            return
        }

        const fetchFull = async () => {
            setIsFetchingFull(true)
            const uid = selectedProfile.user_id
            const [
                { data: personal },
                { data: family },
                { data: fullContact },
                { data: fullEdu },
                { data: fullEmp },
                { data: fullBus },
                { data: fullStu },
                { data: horo },
                { data: interests },
                { data: socialHabits },
                { data: photosRow }
            ] = await Promise.all([
                supabase.from("personal_details").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("family_details").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("contact_details").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("education_details").select("*").eq("user_id", uid),
                supabase.from("profession_employee").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("profession_business").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("profession_student").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("horoscope_details").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("interests").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("social_habits").select("*").eq("user_id", uid).maybeSingle(),
                supabase.from("photos").select("user_id, user_photos").eq("user_id", uid).maybeSingle()
            ])
            const fetchedPhotos: string[] = photosRow?.user_photos || []
            setMutualFullData({ personal, family, fullContact, fullEdu, fullEmp, fullBus, fullStu, horo, interests, socialHabits, photos: fetchedPhotos })
            setIsFetchingFull(false)
        }
        fetchFull()
    }, [selectedProfile?.user_id, iLikedIds, likedMeIds])

    const fetchLikes = async () => {
        setIsLoading(true)
        try {
            // Fetch likes via API (bypasses RLS)
            const res = await fetch(`/api/likes?userId=${userId}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            const myLikedIds: string[] = data.iLikedIds || []
            const theyLikedIds: string[] = data.likedMeIds || []

            setILikedIds(myLikedIds)
            setLikedMeIds(theyLikedIds)

            // Fetch premium status
            const settingsRes = await fetch(`/api/settings?userId=${userId}`)
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json()
                setIsPremium(settingsData.is_premium || true) // ALLOW FOR NOW
            }

            const allIds = Array.from(new Set([...myLikedIds, ...theyLikedIds]))
            if (allIds.length === 0) {
                setIsLoading(false)
                return
            }

            // Fetch profile data for all users
            const [
                { data: personalData },
                { data: photosData },
                { data: empData },
                { data: busData },
                { data: contactData },
            ] = await Promise.all([
                supabase.from("personal_details").select("user_id, name, age, sex").in("user_id", allIds),
                supabase.from("photos").select("user_id, user_photos").in("user_id", allIds),
                supabase.from("profession_employee").select("user_id, designation, company").in("user_id", allIds),
                supabase.from("profession_business").select("user_id, designation, business_name").in("user_id", allIds),
                supabase.from("contact_details").select("user_id, current_district, current_state").in("user_id", allIds),
            ])

            const buildCard = (uid: string): ProfileCard => {
                const personal = personalData?.find(p => p.user_id === uid)
                const photos = photosData?.find(p => p.user_id === uid)
                const emp = empData?.find(p => p.user_id === uid)
                const bus = busData?.find(p => p.user_id === uid)
                const contact = contactData?.find(p => p.user_id === uid)

                let profession = "Not specified"
                if (emp?.designation && emp?.company) profession = `${emp.designation} at ${emp.company}`
                else if (emp?.designation) profession = emp.designation
                else if (bus?.designation && bus?.business_name) profession = `${bus.designation} at ${bus.business_name}`
                else if (bus?.designation) profession = bus.designation

                let location = "Location not specified"
                if (contact?.current_district) {
                    location = `${contact.current_district}${contact.current_state ? `, ${contact.current_state}` : ""}`
                }

                return {
                    user_id: uid,
                    name: personal?.name || "Unknown",
                    age: personal?.age,
                    sex: personal?.sex || "Not specified",
                    profession,
                    location,
                    photo: photos?.user_photos?.[0] || null,
                    photos: photos?.user_photos || [],
                    iLiked: myLikedIds.includes(uid),
                }
            }

            const profileMap: Record<string, ProfileCard> = {}
            allIds.forEach(id => { profileMap[id] = buildCard(id) })
            setProfiles(profileMap)
        } catch (err: any) {
            toast.error("Failed to load likes.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnlike = async (profileId: string) => {
        setActionLoadingId(profileId)
        const res = await fetch("/api/likes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, likedUserId: profileId }),
        })
        const data = await res.json()
        if (!res.ok) {
            toast.error("Failed to unlike profile.")
        } else {
            toast.success("Profile unliked.")
            setILikedIds(prev => prev.filter(id => id !== profileId))
            setProfiles(prev => ({
                ...prev,
                [profileId]: { ...prev[profileId], iLiked: false }
            }))
            if (selectedProfile?.user_id === profileId) {
                setSelectedProfile(prev => prev ? { ...prev, iLiked: false } : prev)
            }
        }
        setActionLoadingId("")
    }

    const handleLike = async (profileId: string) => {
        setActionLoadingId(profileId)
        const res = await fetch("/api/likes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, likedUserId: profileId }),
        })
        const data = await res.json()
        if (!res.ok) {
            if (data.error === "already_liked") toast.error("You have already liked this profile.")
            else toast.error("Failed to like profile.")
        } else {
            toast.success("Profile liked! 💜")
            setILikedIds(prev => prev.includes(profileId) ? prev : [...prev, profileId])
            setProfiles(prev => ({
                ...prev,
                [profileId]: { ...prev[profileId], iLiked: true }
            }))
            if (selectedProfile?.user_id === profileId) {
                setSelectedProfile(prev => prev ? { ...prev, iLiked: true } : prev)
            }
        }
        setActionLoadingId("")
    }

    const handleRemoveMatch = async (profileId: string) => {
        setActionLoadingId(profileId)
        // Remove both sides of the mutual like
        await Promise.all([
            fetch("/api/likes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, likedUserId: profileId }),
            }),
            fetch("/api/likes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: profileId, likedUserId: userId }),
            })
        ])
        toast.success("Match removed.")
        setILikedIds(prev => prev.filter(id => id !== profileId))
        setLikedMeIds(prev => prev.filter(id => id !== profileId))
        setSelectedProfile(null)
        setActionLoadingId("")
    }

    // Derive lists from state
    const mutualIds = iLikedIds.filter(id => likedMeIds.includes(id))
    // "Liked Me" shows only profiles that liked me but I haven't liked back
    const onlyLikedMeIds = likedMeIds.filter(id => !iLikedIds.includes(id))
    // "I Liked" shows only profiles that I liked but haven't liked me back
    const onlyILikedIds = iLikedIds.filter(id => !likedMeIds.includes(id))

    const getProfileList = (ids: string[]) =>
        ids.map(id => profiles[id]).filter(Boolean)

    const tabs: { key: Tab; label: string; icon: React.ReactNode; ids: string[] }[] = [
        { key: "mutual", label: "Mutual Matches", icon: <HeartHandshake className="h-4 w-4" />, ids: mutualIds },
        { key: "liked", label: "I Liked", icon: <Heart className="h-4 w-4" />, ids: onlyILikedIds },
        { key: "likedme", label: "Liked Me", icon: <Sparkles className="h-4 w-4" />, ids: onlyLikedMeIds },
    ]

    const currentTab = tabs.find(t => t.key === activeTab)!
    const currentProfiles = getProfileList(currentTab.ids)    const ProfileCard = ({ profile }: { profile: any }) => {
        const isMutual = iLikedIds.includes(profile.user_id) && likedMeIds.includes(profile.user_id)
        const genderColor = profile.sex?.toLowerCase() === 'female' 
            ? 'border-pink-100/50 hover:border-pink-200 shadow-[0_8px_30px_rgb(255,182,193,0.1)]' 
            : 'border-blue-100/50 hover:border-blue-200 shadow-[0_8px_30px_rgb(173,216,230,0.1)]'

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full"
            >
                <div
                    className={`sds-glass rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(75,0,130,0.1)] transition-all duration-500 cursor-pointer group flex flex-col h-full border-2 ${genderColor}`}
                    onClick={() => handleOpenProfile(profile)}
                >
                    <div className="aspect-[4/5] relative overflow-hidden bg-gray-50/30">
                        {profile.photo ? (
                            <img
                                src={profile.photo}
                                alt={profile.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=random`
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                <User className="h-20 w-20 opacity-10" />
                                <span className="text-[10px] mt-2 font-black uppercase tracking-[0.3em] opacity-30">No Image Intel</span>
                            </div>
                        )}
                        {isMutual && (
                            <div className="absolute top-4 left-4 bg-[#FEF9C3]/90 text-[#854d0e] text-[8px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-yellow-200 tracking-[0.2em] uppercase backdrop-blur-md z-10">
                                <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Mutual Match
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 pt-24">
                            <h3 className="text-white text-3xl font-light tracking-tight drop-shadow-lg">
                                {profile.name} <span className="font-bold text-rose-300/80 ml-1">{profile.age && `, ${profile.age}`}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white/40 to-transparent">
                        <div className="space-y-3">
                            <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">
                                <Briefcase className="h-3.5 w-3.5 mr-3 text-indigo-400/50" />
                                <span className="truncate">{profile.profession === "Not specified" ? "Vocation Undisclosed" : profile.profession}</span>
                            </div>
                            <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <MapPin className="h-3.5 w-3.5 mr-3 text-indigo-400/50" />
                                <span className="truncate">{profile.location.split(',')[0]}</span>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-black/[0.03]" onClick={e => e.stopPropagation()}>
                            {isMutual ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); handleOpenProfile(profile) }}
                                        className="h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-50/80 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm border-none backdrop-blur-sm"
                                    >
                                        View Profile
                                    </Button>
                                    <Button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setMessageTarget({ id: profile.user_id, name: profile.name });
                                            setIsMessageDialogOpen(true);
                                        }}
                                        className="h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-50/80 text-indigo-700 hover:bg-[#4B0082] hover:text-white transition-all duration-300 shadow-sm border-none backdrop-blur-sm"
                                    >
                                        Comms
                                    </Button>
                                </div>
                            ) : profile.iLiked ? (
                                <Button
                                    onClick={() => handleUnlike(profile.user_id)}
                                    disabled={actionLoadingId === profile.user_id}
                                    className="w-full h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50/80 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 disabled:opacity-50 shadow-sm border-none"
                                >
                                    {actionLoadingId === profile.user_id ? "Processing..." : "Retract Interest"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleLike(profile.user_id)}
                                    disabled={actionLoadingId === profile.user_id}
                                    className="w-full h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 shadow-xl shadow-indigo-900/20"
                                >
                                    {actionLoadingId === profile.user_id ? "Processing..." : "Send Interest Back"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="mb-12 border-b border-black/5 pb-8 flex items-end justify-between">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B0082]/40 mb-2">Connection Matrix</h4>
                    <h2 className="text-5xl font-light text-gray-900 tracking-tight flex items-center gap-4">
                        Likes <span className="text-[#4B0082] font-black">&</span> Matches
                    </h2>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Platform Analytics</p>
                    <p className="text-xs font-bold text-[#4B0082]">Real-time match scoring active</p>
                </div>
            </div>

            {/* Tabs Redesign */}
            <div className="sds-glass rounded-[2rem] p-2 mb-16 flex gap-1 border-2 border-indigo-50/50 max-w-2xl shadow-[0_20px_50px_rgba(75,0,130,0.05)]">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] transition-all duration-500 relative overflow-hidden ${activeTab === tab.key
                            ? "bg-[#4B0082] text-white shadow-xl shadow-indigo-900/30 scale-[1.02] z-10"
                            : "text-gray-400 hover:bg-indigo-50/50 hover:text-[#4B0082]"
                            }`}
                    >
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${activeTab === tab.key ? "text-white" : "group-hover:text-[#4B0082]"}`}>
                            {tab.label}
                        </span>
                        {tab.ids.length > 0 && (
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black transition-all duration-500 ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100/80 text-gray-400"}`}>
                                {tab.ids.length}
                            </span>
                        )}
                        {activeTab === tab.key && (
                            <motion.div layoutId="tab-pill" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-300/40" />
                        )}
                    </button>
                ))
                }
            </div >

            {
                isLoading ? (
                    <div className="flex justify-center items-center py-20" >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
                    </div>
                ) : currentProfiles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700"
                    >
                        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            {activeTab === "mutual" ? <HeartHandshake className="h-8 w-8 text-gray-400" /> :
                                activeTab === "liked" ? <Heart className="h-8 w-8 text-gray-400" /> :
                                    <Sparkles className="h-8 w-8 text-gray-400" />}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                            {activeTab === "mutual" ? "No mutual matches yet" :
                                activeTab === "liked" ? "You haven't liked anyone yet" :
                                    "No one has liked you yet"}
                        </h3>
                        <p className="text-gray-500 mt-2 text-sm">
                            {activeTab === "mutual" ? "Like profiles to get mutual matches!" :
                                activeTab === "liked" ? "Browse profiles and express interest!" :
                                    "Complete your profile to attract more matches."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {currentProfiles.map(profile => (
                                <ProfileCard key={profile.user_id} profile={profile} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

            {/* Profile Quick-View Modal */}
            <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>

                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-gray-900 border-none rounded-2xl">
                    <DialogTitle className="sr-only">Profile Details</DialogTitle>
                    {selectedProfile && (() => {
                        const isMutual = iLikedIds.includes(selectedProfile.user_id) && likedMeIds.includes(selectedProfile.user_id);

                        return (
                            <div className="flex flex-col md:flex-row h-[85vh] md:h-[35rem]">
                                {/* Left side: Photo Gallery */}
                                <div className="md:w-2/5 bg-gray-100 dark:bg-gray-800 relative group">
                                    {(() => {
                                        // Build photos array: prefer mutualFullData photos, then selectedProfile.photos, then single photo fallback
                                        const photoArr: string[] = (
                                            (mutualFullData?.photos && mutualFullData.photos.length > 0)
                                                ? mutualFullData.photos
                                                : (selectedProfile.photos && selectedProfile.photos.length > 0)
                                                    ? selectedProfile.photos
                                                    : selectedProfile.photo
                                                        ? [selectedProfile.photo]
                                                        : []
                                        )
                                        return photoArr.length > 0 ? (
                                            <>
                                                <img
                                                    src={photoArr[modalPhotoIndex] || photoArr[0]}
                                                    alt={selectedProfile.name}
                                                    className="w-full h-full object-cover transition-opacity duration-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedProfile.name || 'User') + '&size=400&background=random'
                                                    }}
                                                />
                                                {photoArr.length > 1 ? (
                                                    <>
                                                        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => prevModalPhoto(e, photoArr.length)}
                                                                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                                                            >
                                                                <ChevronLeft className="h-6 w-6" />
                                                            </button>
                                                        </div>
                                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => nextModalPhoto(e, photoArr.length)}
                                                                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                                                            >
                                                                <ChevronRight className="h-6 w-6" />
                                                            </button>
                                                        </div>
                                                        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm z-10 shadow-sm">
                                                            {modalPhotoIndex + 1} / {photoArr.length}
                                                        </div>

                                                        {/* Dots indicator at bottom */}
                                                        <div className="absolute bottom-6 left-0 right-0 justify-center gap-1.5 z-10 hidden md:flex">
                                                            {photoArr.map((_: any, idx: number) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`w-2 h-2 rounded-full transition-all ${idx === modalPhotoIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : null}
                                            </>
                                        ) : (

                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8">
                                                <User className="h-24 w-24 mb-4 opacity-50" />
                                                <span className="text-center font-medium">No Photo</span>
                                            </div>
                                        )
                                    })()}
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
                                                {isMutual && (
                                                    <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 align-middle -translate-y-1">
                                                        <HeartHandshake className="h-3.5 w-3.5" /> Mutual Match
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="text-[#4B0082] font-medium text-lg">{selectedProfile.profession === "Not specified" ? "Profession not specified" : selectedProfile.profession}</p>
                                        </div>

                                        {isFetchingFull ? (
                                            <div className="flex items-center justify-center py-6 gap-3 text-gray-400">
                                                <div className="animate-spin h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full" />
                                                <span className="text-sm">Loading full profile details…</span>
                                            </div>
                                        ) : mutualFullData && (
                                            <div className="space-y-8">

                                                {/* 1. About Me — always shown */}
                                                {mutualFullData.personal?.about && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                                            <User className="h-5 w-5 mr-2 text-pink-500" /> About Me
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl text-sm">
                                                            {mutualFullData.personal.about}
                                                        </p>
                                                    </section>
                                                )}

                                                {/* 2. Personal Details — always shown */}
                                                {mutualFullData.personal && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Heart className="h-5 w-5 mr-2 text-red-500" /> Personal Details
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-pink-50 dark:bg-pink-900/10 p-4 rounded-xl">
                                                            {mutualFullData.personal.date_of_birth && <div><span className="block text-gray-500 mb-1">Date of Birth</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.date_of_birth}</span></div>}
                                                            {mutualFullData.personal.age && <div><span className="block text-gray-500 mb-1">Age</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.age}</span></div>}
                                                            {mutualFullData.personal.sex && <div><span className="block text-gray-500 mb-1">Gender</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.sex}</span></div>}
                                                            {mutualFullData.personal.height && <div><span className="block text-gray-500 mb-1">Height (cm)</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.height}</span></div>}
                                                            {mutualFullData.personal.weight && <div><span className="block text-gray-500 mb-1">Weight (kg)</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.weight}</span></div>}
                                                            {mutualFullData.personal.skin_color && <div><span className="block text-gray-500 mb-1">Skin Color</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.skin_color}</span></div>}
                                                            {mutualFullData.personal.marital_status && <div><span className="block text-gray-500 mb-1">Marital Status</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.marital_status}</span></div>}
                                                            {mutualFullData.personal.mother_tongue && <div><span className="block text-gray-500 mb-1">Mother Tongue</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.mother_tongue}</span></div>}
                                                            {mutualFullData.personal.religion && <div><span className="block text-gray-500 mb-1">Religion</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.religion}</span></div>}
                                                            {mutualFullData.personal.caste && <div><span className="block text-gray-500 mb-1">Caste</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.caste}</span></div>}
                                                            {mutualFullData.personal.food_preference && <div><span className="block text-gray-500 mb-1">Diet</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.food_preference}</span></div>}
                                                            {mutualFullData.personal.languages && Array.isArray(mutualFullData.personal.languages) && mutualFullData.personal.languages.length > 0 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Languages Known</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.personal.languages.join(', ')}</span></div>}
                                                        </div>
                                                    </section>
                                                )}

                                                {/* 3. Contact Details — MUTUAL ONLY */}
                                                {isMutual && mutualFullData.fullContact && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Phone className="h-5 w-5 mr-2 text-[#4B0082]" /> Contact Details
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl mb-4">
                                                            {mutualFullData.fullContact.phone && <div><span className="block text-gray-500 mb-1">Phone</span><a href={`tel:${mutualFullData.fullContact.phone}`} className="font-semibold text-[#4B0082] hover:underline">{mutualFullData.fullContact.phone}</a></div>}
                                                            {mutualFullData.fullContact.whatsapp_number && <div><span className="block text-gray-500 mb-1">WhatsApp</span><a href={`https://wa.me/${mutualFullData.fullContact.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-semibold text-green-600 hover:underline flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {mutualFullData.fullContact.whatsapp_number}</a></div>}
                                                        </div>
                                                        {mutualFullData.fullContact.current_district && (
                                                            <div className="mb-4">
                                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Address</h4>
                                                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                    {mutualFullData.fullContact.current_address_line1 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Address</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_address_line1}</span></div>}
                                                                    {mutualFullData.fullContact.current_area && <div><span className="block text-gray-500 mb-1">Area</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_area}</span></div>}
                                                                    {mutualFullData.fullContact.current_district && <div><span className="block text-gray-500 mb-1">District</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_district}</span></div>}
                                                                    {mutualFullData.fullContact.current_state && <div><span className="block text-gray-500 mb-1">State</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_state}</span></div>}
                                                                    {mutualFullData.fullContact.current_pincode && <div><span className="block text-gray-500 mb-1">Pincode</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.current_pincode}</span></div>}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {mutualFullData.fullContact.permanent_district && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Permanent Address</h4>
                                                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                    {mutualFullData.fullContact.permanent_address_line1 && <div className="col-span-2"><span className="block text-gray-500 mb-1">Address</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_address_line1}</span></div>}
                                                                    {mutualFullData.fullContact.permanent_area && <div><span className="block text-gray-500 mb-1">Area</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_area}</span></div>}
                                                                    {mutualFullData.fullContact.permanent_district && <div><span className="block text-gray-500 mb-1">District</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_district}</span></div>}
                                                                    {mutualFullData.fullContact.permanent_state && <div><span className="block text-gray-500 mb-1">State</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_state}</span></div>}
                                                                    {mutualFullData.fullContact.permanent_pincode && <div><span className="block text-gray-500 mb-1">Pincode</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullContact.permanent_pincode}</span></div>}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </section>
                                                )}

                                                {/* 4. Educational Details — always shown */}
                                                {mutualFullData.fullEdu && mutualFullData.fullEdu.length > 0 && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <GraduationCap className="h-5 w-5 mr-2 text-indigo-500" /> Educational Details
                                                        </h3>
                                                        <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                                            {mutualFullData.fullEdu.map((edu: any, i: number) => (
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

                                                {/* 5. Professional Details — always shown */}
                                                {(mutualFullData.fullEmp || mutualFullData.fullBus || mutualFullData.fullStu) && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Briefcase className="h-5 w-5 mr-2 text-blue-500" /> Professional Details
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                                                            {mutualFullData.fullEmp?.designation && <div><span className="block text-gray-500 mb-1">Designation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.designation}</span></div>}
                                                            {mutualFullData.fullEmp?.company && <div><span className="block text-gray-500 mb-1">Company</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.company}</span></div>}
                                                            {mutualFullData.fullEmp?.sector && <div><span className="block text-gray-500 mb-1">Sector</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.sector}</span></div>}
                                                            {mutualFullData.fullEmp?.employment_type && <div><span className="block text-gray-500 mb-1">Employment Type</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.employment_type}</span></div>}
                                                            {mutualFullData.fullEmp?.annual_income && <div><span className="block text-gray-500 mb-1">Annual Income</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullEmp.annual_income}</span></div>}
                                                            {mutualFullData.fullBus?.designation && <div><span className="block text-gray-500 mb-1">Designation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullBus.designation}</span></div>}
                                                            {mutualFullData.fullBus?.business_name && <div><span className="block text-gray-500 mb-1">Business Name</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullBus.business_name}</span></div>}
                                                            {mutualFullData.fullBus?.business_type && <div><span className="block text-gray-500 mb-1">Business Type</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullBus.business_type}</span></div>}
                                                            {mutualFullData.fullBus?.annual_income && <div><span className="block text-gray-500 mb-1">Annual Income</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullBus.annual_income}</span></div>}
                                                            {mutualFullData.fullStu?.institution && <div><span className="block text-gray-500 mb-1">Institution</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullStu.institution}</span></div>}
                                                            {mutualFullData.fullStu?.course && <div><span className="block text-gray-500 mb-1">Course</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.fullStu.course}</span></div>}
                                                        </div>
                                                    </section>
                                                )}

                                                {/* 6. Family Details — MUTUAL ONLY */}
                                                {isMutual && mutualFullData.family && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <User className="h-5 w-5 mr-2 text-teal-500" /> Family Details
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-teal-50 dark:bg-teal-900/10 p-4 rounded-xl">
                                                            {mutualFullData.family.father_name && <div><span className="block text-gray-500 mb-1">Father's Name</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.father_name}</span></div>}
                                                            {mutualFullData.family.father_occupation && <div><span className="block text-gray-500 mb-1">Father's Occupation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.father_occupation}</span></div>}
                                                            {mutualFullData.family.mother_name && <div><span className="block text-gray-500 mb-1">Mother's Name</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.mother_name}</span></div>}
                                                            {mutualFullData.family.mother_occupation && <div><span className="block text-gray-500 mb-1">Mother's Occupation</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.mother_occupation}</span></div>}
                                                            {mutualFullData.family.family_type && <div><span className="block text-gray-500 mb-1">Family Type</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.family_type}</span></div>}
                                                            {mutualFullData.family.family_status && <div><span className="block text-gray-500 mb-1">Family Status</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.family_status}</span></div>}
                                                            {mutualFullData.family.family_values && <div><span className="block text-gray-500 mb-1">Family Values</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.family_values}</span></div>}
                                                            {mutualFullData.family.brothers_count !== null && mutualFullData.family.brothers_count !== undefined && <div><span className="block text-gray-500 mb-1">Brothers</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.brothers_count}</span></div>}
                                                            {mutualFullData.family.sisters_count !== null && mutualFullData.family.sisters_count !== undefined && <div><span className="block text-gray-500 mb-1">Sisters</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.family.sisters_count}</span></div>}
                                                        </div>
                                                    </section>
                                                )}

                                                {/* 7. Horoscope Details — always shown */}
                                                {mutualFullData.horo && (mutualFullData.horo.zodiac_sign || mutualFullData.horo.star) && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Star className="h-5 w-5 mr-2 text-amber-500" /> Horoscope Details
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl">
                                                            {mutualFullData.horo.zodiac_sign && <div><span className="block text-gray-500 mb-1">Zodiac Sign</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.horo.zodiac_sign}</span></div>}
                                                            {mutualFullData.horo.star && <div><span className="block text-gray-500 mb-1">Star (Nakshatra)</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.horo.star}</span></div>}
                                                            {mutualFullData.horo.lagnam && <div><span className="block text-gray-500 mb-1">Lagnam</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.horo.lagnam}</span></div>}
                                                            {mutualFullData.horo.dhosham && <div><span className="block text-gray-500 mb-1">Dhosham</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.horo.dhosham}</span></div>}
                                                            {mutualFullData.horo.time_of_birth && <div><span className="block text-gray-500 mb-1">Time of Birth</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.horo.time_of_birth}</span></div>}
                                                            {mutualFullData.horo.place_of_birth && <div><span className="block text-gray-500 mb-1">Place of Birth</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.horo.place_of_birth}</span></div>}
                                                        </div>
                                                    </section>
                                                )}

                                                {/* 8. Interests & Hobbies — always shown */}
                                                {mutualFullData.interests?.hobbies && mutualFullData.interests.hobbies.length > 0 && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" /> Interests & Hobbies
                                                        </h3>
                                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                                            <div className="flex flex-wrap gap-2">
                                                                {mutualFullData.interests.hobbies.map((hobby: string, i: number) => (
                                                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                                        {hobby}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </section>
                                                )}

                                                {/* 9. Social Habits — MUTUAL ONLY */}
                                                {isMutual && mutualFullData.socialHabits && (
                                                    <section>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                            <Coffee className="h-5 w-5 mr-2 text-orange-500" /> Social Habits
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl">
                                                            {mutualFullData.socialHabits.smoking !== undefined && mutualFullData.socialHabits.smoking !== null && <div><span className="block text-gray-500 mb-1">Smoking</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.socialHabits.smoking ? 'Yes' : 'No'}</span></div>}
                                                            {mutualFullData.socialHabits.drinking !== undefined && mutualFullData.socialHabits.drinking !== null && <div><span className="block text-gray-500 mb-1">Drinking</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.socialHabits.drinking ? 'Yes' : 'No'}</span></div>}
                                                            {mutualFullData.socialHabits.exercise && <div><span className="block text-gray-500 mb-1">Exercise</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.socialHabits.exercise}</span></div>}
                                                            {mutualFullData.socialHabits.diet && <div><span className="block text-gray-500 mb-1">Diet</span><span className="font-medium text-gray-900 dark:text-white">{mutualFullData.socialHabits.diet}</span></div>}
                                                        </div>
                                                    </section>
                                                )}

                                            </div>
                                        )}

                                    </div>{/* end p-6 overflow-y-auto */}

                                    {/* Actions Footer */}
                                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                        {isMutual ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
                                                    onClick={() => handleRemoveMatch(selectedProfile.user_id)}
                                                    disabled={actionLoadingId === selectedProfile.user_id}
                                                >
                                                    {actionLoadingId === selectedProfile.user_id ? "Removing..." : "Remove Match"}
                                                </Button>
                                                <Button
                                                    className="w-full bg-[#FF1493] hover:bg-[#FF1493]/90 text-white"
                                                    onClick={() => {
                                                        const p = mutualFullData?.fullContact?.phone || mutualFullData?.fullContact?.whatsapp_number
                                                        if (p) window.open(`tel:${p}`)
                                                    }}
                                                >
                                                    <Phone className="h-4 w-4 mr-2" /> Contact Now
                                                </Button>
                                            </div>
                                        ) : selectedProfile.iLiked ? (
                                            <Button
                                                variant="outline"
                                                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
                                                onClick={() => handleUnlike(selectedProfile.user_id)}
                                                disabled={actionLoadingId === selectedProfile.user_id}
                                            >
                                                {actionLoadingId === selectedProfile.user_id ? "Unliking..." : "Unlike Profile"}
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-[#FF1493] hover:bg-[#FF1493]/90 text-white"
                                                onClick={() => handleLike(selectedProfile.user_id)}
                                                disabled={actionLoadingId === selectedProfile.user_id}
                                            >
                                                <Heart className="h-4 w-4 mr-2" />
                                                {actionLoadingId === selectedProfile.user_id ? "Expressing Interest..." : "Like & Express Interest"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </DialogContent>
            </Dialog>

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
        </div >
    )
}