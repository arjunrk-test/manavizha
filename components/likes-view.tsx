"use client"

import { useEffect, useState, useMemo } from "react"
import { Heart, User, MapPin, Briefcase, Sparkles, HeartHandshake, X, GraduationCap, Star, Phone, MessageCircle, Coffee, ChevronLeft, ChevronRight, Inbox, Send, Filter, CheckCircle2, XCircle, Clock, ArrowRight, Shield, Crown, Users2, Bookmark } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { MessageDialog } from "@/components/message-dialog"
import { formatToDDMMYYYY, formatActivityTime } from "@/lib/utils/date-utils"
import { cn } from "@/lib/utils"
import { calculateTrustScore, getProfileSummaryStr } from "@/lib/utils/profile-utils"
import { MatchScoreBadge } from "@/components/match-score-badge"
import { Eye, MapPin as MapPinIcon, ShieldCheck, HeartHandshake as HeartHandshakeIcon, MessageCircle as MessageCircleIcon } from "lucide-react"

interface LikesViewProps {
    userId: string
    onBack?: () => void
    initialTab?: string
}

type Section = "mutual" | "received" | "sent"
type StatusFilter = "all" | "pending" | "accepted" | "declined"

interface LikeData {
    id: string
    created_at: string
    is_read: boolean
    status: string
}

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
    isPremium: boolean
    interaction_status: string
    photo_verified?: boolean
    completion_percentage?: number
    caste?: string
    education?: any[]
    professionType?: string
    professionDetails?: any
    last_active_at?: string
    horoscope?: {
        zodiac_sign?: string
        star?: string
    }
    compatibility?: {
        score: number
    }
    lifestyleMatch?: {
        totalScore: number
    }
}

export function LikesView({ userId, onBack, initialTab }: LikesViewProps) {
    const [activeSection, setActiveSection] = useState<Section>(
        initialTab === "mutual" ? "mutual" : 
        initialTab === "liked" ? "sent" : 
        "received"
    )
    const [activeStatus, setActiveStatus] = useState<StatusFilter>("all")
    const [isLoading, setIsLoading] = useState(true)
    const [isPremium, setIsPremium] = useState(false)
    
    const [iLikedData, setILikedData] = useState<LikeData[]>([])
    const [likedMeData, setLikedMeData] = useState<LikeData[]>([])
    
    const [profiles, setProfiles] = useState<Record<string, ProfileCard>>({})
    const [selectedProfile, setSelectedProfile] = useState<ProfileCard | null>(null)
    const [actionLoadingId, setActionLoadingId] = useState("")
    const [shortlistedIds, setShortlistedIds] = useState<string[]>([])
    const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null)

    // Messaging & Detailed Data States
    const [mutualFullData, setMutualFullData] = useState<any>(null)
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0)
    const [isFetchingFull, setIsFetchingFull] = useState(false)
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
    const [messageTarget, setMessageTarget] = useState<{ id: string, name: string } | null>(null)

    useEffect(() => {
        if (initialTab) {
            if (initialTab === "mutual") setActiveSection("mutual")
            else if (initialTab === "liked") setActiveSection("sent")
            else if (initialTab === "likedme") setActiveSection("received")
            setActiveStatus("all")
        }
    }, [initialTab])

    useEffect(() => {
        fetchLikes()
        fetchStatus()
        fetchShortlists()
    }, [userId])

    const fetchShortlists = async () => {
        if (!userId) return
        const res = await fetch(`/api/shortlists?userId=${userId}`)
        if (res.ok) {
            const data = await res.json()
            setShortlistedIds(data.shortlistedIds || [])
        }
    }

    const handleShortlist = async (e: React.MouseEvent, targetId: string) => {
        e.stopPropagation()
        if (shortlistLoadingId) return
        setShortlistLoadingId(targetId)

        const isCurrentlyShortlisted = shortlistedIds.includes(targetId)
        const method = isCurrentlyShortlisted ? "DELETE" : "POST"

        try {
            const res = await fetch("/api/shortlists", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, targetUserId: targetId }),
            })

            if (res.ok) {
                if (isCurrentlyShortlisted) {
                    setShortlistedIds(prev => prev.filter(id => id !== targetId))
                    toast.success("Removed from shortlist")
                } else {
                    setShortlistedIds(prev => [...prev, targetId])
                    toast.success("Added to shortlist")
                }
            }
        } catch (err) {
            toast.error("Operation failed")
        } finally {
            setShortlistLoadingId(null)
        }
    }

    const fetchStatus = async () => {
        const { data } = await supabase.from('user_settings').select('is_premium').eq('user_id', userId).maybeSingle()
        if (data) setIsPremium(!!data.is_premium)
    }

    const fetchLikes = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/likes?userId=${userId}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            const iLikeds: LikeData[] = data.iLiked || []
            const likedMes: LikeData[] = data.likedMe || []

            setILikedData(iLikeds)
            setLikedMeData(likedMes)

            const allIds = Array.from(new Set([...iLikeds.map(l => l.id), ...likedMes.map(l => l.id)]))
            if (allIds.length === 0) {
                setIsLoading(false)
                return
            }

            // Fetch profile data
            const [
                { data: personalData },
                { data: photosData },
                { data: empData },
                { data: busData },
                { data: contactData },
                { data: settingsData },
                { data: horoData },
                { data: socialHabitsData },
                { data: interestsData },
                { data: eduData }
            ] = await Promise.all([
                supabase.from("personal_details").select("user_id, name, age, sex, caste, completion_percentage").in("user_id", allIds),
                supabase.from("photos").select("user_id, user_photos, photo_verified").in("user_id", allIds),
                supabase.from("profession_employee").select("user_id, designation, company, sector, salary, work_location").in("user_id", allIds),
                supabase.from("profession_business").select("user_id, designation, business_name, business_type, annual_returns, business_location").in("user_id", allIds),
                supabase.from("contact_details").select("user_id, current_district, current_state").in("user_id", allIds),
                supabase.from("user_settings").select("user_id, is_premium, last_active_at").in("user_id", allIds),
                supabase.from("horoscope_details").select("user_id, zodiac_sign, star").in("user_id", allIds),
                supabase.from("social_habits").select("user_id, smoking, drinking").in("user_id", allIds),
                supabase.from("interests").select("user_id, interests, hobbies").in("user_id", allIds),
                supabase.from("education_details").select("user_id, education, degree").in("user_id", allIds)
            ])

            const buildCard = (uid: string): ProfileCard => {
                const personal = personalData?.find(p => p.user_id === uid)
                const photos = photosData?.find(p => p.user_id === uid)
                const emp = empData?.find(p => p.user_id === uid)
                const bus = busData?.find(p => p.user_id === uid)
                const contact = contactData?.find(p => p.user_id === uid)
                const settings = settingsData?.find(p => p.user_id === uid)

                const horo = horoData?.find(p => p.user_id === uid)
                const social = socialHabitsData?.find(p => p.user_id === uid)
                const interests = interestsData?.find(p => p.user_id === uid)
                const edu = eduData?.filter(p => p.user_id === uid)

                let profession = "Not specified"
                let professionType = ""
                let professionDetails = {}

                if (emp?.designation) {
                    profession = emp.company ? `${emp.designation} at ${emp.company}` : emp.designation
                    professionType = "employee"
                    professionDetails = emp
                } else if (bus?.designation) {
                    profession = bus.business_name ? `${bus.designation} at ${bus.business_name}` : bus.designation
                    professionType = "business"
                    professionDetails = bus
                }

                let location = "Location not specified"
                if (contact?.current_district) {
                    location = `${contact.current_district}${contact.current_state ? `, ${contact.current_state}` : ""}`
                }

                return {
                    user_id: uid,
                    name: personal?.name || "Unknown",
                    age: personal?.age,
                    sex: personal?.sex || "Not specified",
                    caste: personal?.caste,
                    completion_percentage: personal?.completion_percentage || 70,
                    profession,
                    professionType,
                    professionDetails,
                    location,
                    photo: photos?.user_photos?.[0] || null,
                    photos: photos?.user_photos || [],
                    photo_verified: !!photos?.photo_verified,
                    iLiked: iLikeds.some(l => l.id === uid),
                    isPremium: !!settings?.is_premium,
                    last_active_at: settings?.last_active_at,
                    horoscope: horo,
                    education: edu,
                    interaction_status: "unknown" // Updated during filtering
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

    const handleUpdateStatus = async (targetId: string, status: string, isReceived: boolean) => {
        setActionLoadingId(targetId)
        try {
            const res = await fetch("/api/likes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    userId: isReceived ? targetId : userId, 
                    likedUserId: isReceived ? userId : targetId,
                    status 
                }),
            })
            if (!res.ok) throw new Error("Failed to update")
            
            toast.success(`Interest ${status === 'accepted' ? 'accepted' : 'declined'}`)
            
            // Refresh local state
            if (isReceived) {
                setLikedMeData(prev => prev.map(l => l.id === targetId ? { ...l, status } : l))
            } else {
                setILikedData(prev => prev.map(l => l.id === targetId ? { ...l, status } : l))
            }

            // Reciprocal like for mutual logic
            if (isReceived && status === 'accepted') {
                await fetch("/api/likes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, likedUserId: targetId, status: 'accepted' }),
                })
                const res = await fetch(`/api/likes?userId=${userId}`)
                const data = await res.json()
                if (res.ok) setILikedData(data.iLiked || [])
            }
        } catch (e) {
            toast.error("Action failed")
        } finally {
            setActionLoadingId("")
        }
    }

    const handleOpenProfile = async (profile: ProfileCard) => {
        // Record the view
        if (userId && profile.user_id && userId !== profile.user_id) {
            fetch("/api/views", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ viewerId: userId, viewedUserId: profile.user_id })
            }).catch(e => console.error("Error logging view", e))
        }
        
        setModalPhotoIndex(0)
        setSelectedProfile(profile)
    }

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
    }, [selectedProfile?.user_id])

    const filteredProfiles = useMemo(() => {
        let list: { id: string, status: string }[] = []
        
        if (activeSection === "mutual") {
            const iLikedOk = iLikedData.map(l => l.id)
            const likedMeOk = likedMeData.map(l => l.id)
            
            // Mutual = both have liked each other
            list = iLikedData
                .filter(l => 
                    likedMeData.some(m => m.id === l.id)
                )
                .map(l => ({ id: l.id, status: "accepted" }))
        } else if (activeSection === "received") {
            list = likedMeData.map(l => ({ id: l.id, status: l.status }))
            if (activeStatus !== "all") {
                list = list.filter(l => l.status === activeStatus)
            }
        } else if (activeSection === "sent") {
            list = iLikedData.map(l => ({ id: l.id, status: l.status }))
            if (activeStatus !== "all") {
                list = list.filter(l => l.status === activeStatus)
            }
        }

        return list.map(item => {
            const p = profiles[item.id]
            if (!p) return null
            
            // Smarter status: if we both liked each other, it's accepted (Mutual)
            const myLike = iLikedData.find(l => l.id === item.id)
            const theirLike = likedMeData.find(l => l.id === item.id)
            
            let effectiveStatus = item.status
            if (myLike && theirLike) {
                effectiveStatus = 'accepted'
            }

            return { ...p, interaction_status: effectiveStatus }
        }).filter(Boolean) as ProfileCard[]
    }, [activeSection, activeStatus, iLikedData, likedMeData, profiles])

    const counts = useMemo(() => {
        return {
            mutual: iLikedData.filter(l => 
                likedMeData.some(m => m.id === l.id)
            ).length,
            received: {
                all: likedMeData.length,
                pending: likedMeData.filter(l => l.status === "pending").length,
                accepted: likedMeData.filter(l => l.status === "accepted").length,
                declined: likedMeData.filter(l => l.status === "declined").length,
            },
            sent: {
                all: iLikedData.length,
                pending: iLikedData.filter(l => l.status === "pending").length,
                accepted: iLikedData.filter(l => l.status === "accepted").length,
                declined: iLikedData.filter(l => l.status === "declined").length,
            }
        }
    }, [iLikedData, likedMeData])

    interface NavItemProps {
        label: string
        count?: number
        section: Section
        status?: StatusFilter
        icon?: any
    }

    const NavItem = ({ label, count, section, status = "all", icon: Icon }: NavItemProps) => {
        const isActive = activeSection === section && activeStatus === status
        
        return (
            <button
                onClick={() => {
                    setActiveSection(section)
                    setActiveStatus(status)
                }}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                    isActive 
                        ? "bg-[#4B0082] text-white shadow-lg shadow-indigo-200" 
                        : "text-gray-500 hover:bg-indigo-50/50 hover:text-[#4B0082]"
                )}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-400")} />}
                    <span className={cn("text-[13px] font-bold tracking-tight", isActive ? "text-white" : "text-gray-700")}>
                        {label}
                    </span>
                </div>
                {count !== undefined && (
                    <span className={cn(
                        "text-[11px] font-black px-2 py-0.5 rounded-full",
                        isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                        ({count})
                    </span>
                )}
            </button>
        )
    }

    return (
        <div className="w-full px-6 md:px-10 py-12">
            {/* Page Header */}
            <div className="mb-12 border-b border-black/5 pb-8 flex items-end justify-between">
                <div className="flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B0082]/40 mb-2">Connection Matrix</h4>
                    <h2 className="text-5xl font-light text-gray-900 tracking-tight flex items-center gap-4">
                        Interests <span className="text-[#4B0082] font-black">&</span> Matches
                    </h2>
                </div>
                <div className="flex items-center gap-6 text-right">
                    <div className="hidden xl:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Platform Analytics</p>
                        <p className="text-xs font-bold text-[#4B0082]">Real-time match scoring active</p>
                    </div>
                    <Button 
                        onClick={() => window.location.href = "/dashboard/browse"}
                        className="h-14 px-8 rounded-2xl bg-[#4B0082] hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 group flex items-center gap-3 transition-all active:scale-95"
                    >
                        <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Find New Interests
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Vertical Navigation Sidebar */}
                <aside className="w-full lg:w-[17rem] flex-shrink-0 sds-glass rounded-[2rem] p-4 space-y-6 lg:sticky lg:top-24">
                    <div>
                        <NavItem 
                            label="Mutual Interest" 
                            count={counts.mutual} 
                            section="mutual" 
                            icon={HeartHandshake}
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Inbox className="h-3 w-3" /> Interests Received
                             </h4>
                        </div>
                        <NavItem label="All" count={counts.received.all} section="received" status="all" />
                        <NavItem label="Pending" count={counts.received.pending} section="received" status="pending" />
                        <NavItem label="Accepted/Replied" count={counts.received.accepted} section="received" status="accepted" />
                        <NavItem label="Declined" count={counts.received.declined} section="received" status="declined" />
                    </div>

                    <div className="space-y-1">
                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Send className="h-3 w-3" /> Interests Sent
                             </h4>
                        </div>
                        <NavItem label="All" count={counts.sent.all} section="sent" status="all" />
                        <NavItem label="Pending" count={counts.sent.pending} section="sent" status="pending" />
                        <NavItem label="Accepted/Replied" count={counts.sent.accepted} section="sent" status="accepted" />
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#4B0082]">
                            {activeSection === 'mutual' ? 'Mutual Connections' : 
                             activeSection === 'received' ? `Received Interests > ${activeStatus}` : 
                             `Sent Interests > ${activeStatus}`}
                        </h3>
                        <div className="h-px bg-indigo-100 flex-1 mx-6" />
                        <span className="text-[11px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            {filteredProfiles.length} Profiles Found
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20" >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
                        </div>
                    ) : filteredProfiles.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-32 sds-glass rounded-3xl border border-gray-100"
                        >
                            <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                <Inbox className="h-10 w-10 text-indigo-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No profiles to display
                            </h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
                                Try adjusting your filters or explore more profiles to see matches here.
                            </p>
                            <Button 
                                onClick={() => window.location.href = "/dashboard/browse"}
                                variant="outline"
                                className="h-12 px-8 rounded-xl border-indigo-100 text-[#4B0082] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50"
                            >
                                <Users2 className="h-4 w-4 mr-2" /> Browse Profiles
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {filteredProfiles.map((profile, idx) => (
                                    <div key={profile.user_id}>
                                         <LikesHorizontalCard 
                                            profile={profile} 
                                            section={activeSection}
                                            onAction={handleUpdateStatus}
                                            onView={handleOpenProfile}
                                            onMessage={(p) => {
                                                setMessageTarget({ id: p.user_id, name: p.name })
                                                setIsMessageDialogOpen(true)
                                            }}
                                            onShortlist={handleShortlist}
                                            shortlistedIds={shortlistedIds}
                                            actionLoading={actionLoadingId === profile.user_id}
                                            index={idx}
                                         />
                                    </div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Detail Modal */}
            <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-gray-900 border-none rounded-2xl">
                    <DialogTitle className="sr-only">Profile Details</DialogTitle>
                    {selectedProfile && (
                        <div className="flex flex-col md:flex-row h-[85vh] md:h-[35rem]">
                            <div className="md:w-2/5 bg-gray-100 relative group shrink-0">
                                {(() => {
                                    const photoArr: string[] = mutualFullData?.photos || selectedProfile.photos || [selectedProfile.photo].filter(Boolean) as string[]
                                    return photoArr.length > 0 ? (
                                        <>
                                            <img
                                                src={photoArr[modalPhotoIndex]}
                                                alt={selectedProfile.name}
                                                className="w-full h-full object-cover transition-opacity duration-300"
                                            />
                                            {photoArr.length > 1 && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); setModalPhotoIndex(prev => (prev - 1 + photoArr.length) % photoArr.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"><ChevronLeft /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setModalPhotoIndex(prev => (prev + 1) % photoArr.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"><ChevronRight /></button>
                                                </>
                                            )}
                                        </>
                                    ) : <div className="flex items-center justify-center h-full"><User className="h-20 w-20 opacity-20" /></div>
                                })()}
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 bg-white/40 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-4xl font-light text-gray-900 tracking-tight">
                                        {selectedProfile.name}{selectedProfile.age && `, ${selectedProfile.age}`}
                                    </h2>
                                    {selectedProfile.interaction_status === 'accepted' && (
                                        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Connected
                                        </div>
                                    )}
                                </div>
                                {isFetchingFull ? <div className="flex items-center gap-3 text-indigo-400 font-bold animate-pulse"><Clock className="h-5 w-5 animate-spin" /> Verifying profile intel...</div> : (
                                    <div className="space-y-10">
                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-900/40 mb-4">Identity Information</h3>
                                            <div className="grid grid-cols-2 gap-6 bg-white/50 p-6 rounded-[2rem] border border-indigo-50/50">
                                                <div><span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Height</span><span className="text-sm font-bold">{mutualFullData?.personal?.height}cm</span></div>
                                                <div><span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Location</span><span className="text-sm font-bold">{selectedProfile.location}</span></div>
                                                <div><span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Vocation</span><span className="text-sm font-bold">{selectedProfile.profession}</span></div>
                                                <div><span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Caste/Nakshatra</span><span className="text-sm font-bold">{mutualFullData?.personal?.caste} • {mutualFullData?.horo?.star || 'N/A'}</span></div>
                                            </div>
                                        </section>
                                        
                                        {selectedProfile.interaction_status === 'accepted' && (
                                            <div className="flex gap-4">
                                                <Button 
                                                    onClick={() => {
                                                        setMessageTarget({ id: selectedProfile.user_id, name: selectedProfile.name })
                                                        setIsMessageDialogOpen(true)
                                                    }}
                                                    className="flex-1 h-14 rounded-2xl bg-[#4B0082] hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-200"
                                                >
                                                    Open Communications
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    className={cn(
                                                        "h-14 w-14 rounded-2xl border-indigo-100 flex items-center justify-center transition-all",
                                                        shortlistedIds.includes(selectedProfile.user_id) ? "text-[#FF1493] bg-pink-50 border-pink-100 shadow-sm" : "text-gray-300 border-gray-100 hover:text-[#4B0082] hover:bg-indigo-50"
                                                    )}
                                                    onClick={(e) => handleShortlist(e, selectedProfile.user_id)}
                                                    disabled={shortlistLoadingId === selectedProfile.user_id}
                                                >
                                                    <Bookmark className={cn("h-6 w-6", shortlistedIds.includes(selectedProfile.user_id) && "fill-current")} />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    className="h-14 w-14 rounded-2xl border-indigo-100 flex items-center justify-center text-indigo-600"
                                                >
                                                    <Phone className="h-6 w-6" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            
            <MessageDialog
                isOpen={isMessageDialogOpen}
                onOpenChange={setIsMessageDialogOpen}
                receiverId={messageTarget?.id || ""}
                receiverName={messageTarget?.name || ""}
                senderId={userId}
                isPremium={isPremium}
            />
        </div>
    )
}

interface LikesHorizontalCardProps {
    profile: ProfileCard
    section: Section
    onAction: (targetId: string, status: string, isReceived: boolean) => void
    onView: (profile: ProfileCard) => void
    onMessage: (profile: ProfileCard) => void
    actionLoading: boolean
    index: number
    shortlistedIds: string[]
    onShortlist: (e: React.MouseEvent, targetId: string) => void
}

function LikesHorizontalCard({ profile, section, onAction, onView, onMessage, actionLoading, index, shortlistedIds, onShortlist }: LikesHorizontalCardProps) {
    const [cardPhotoIndex, setCardPhotoIndex] = useState(0)
    const hasMultiplePhotos = profile.photos && profile.photos.length > 1

    const handleContactClick = (type: string) => {
        toast.info(`${type.toUpperCase()} contact feature available for mutual matches.`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
                duration: 0.8, 
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1]
            }}
            className="w-full"
        >
            <div
                className="sds-glass rounded-3xl overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(75,0,130,0.15)] transition-all duration-700 cursor-pointer group flex flex-col md:flex-row h-auto md:h-[260px] border-2 border-indigo-100/20 hover:border-[#4B0082]/30 active:scale-[0.99] bg-white/95"
                onClick={() => onView(profile)}
            >
                {/* Left: Image Section */}
                <div className="w-full md:w-56 h-72 md:h-full relative overflow-hidden bg-gray-100/50 shrink-0">
                    {profile.photos && profile.photos.length > 0 ? (
                        <>
                            <img
                                src={profile.photos[cardPhotoIndex]}
                                alt={profile.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)]"
                            />
                            {hasMultiplePhotos && (
                                <div className="absolute bottom-4 right-4 sds-glass text-[9px] px-3 py-1.5 rounded-full z-10 font-black tracking-[0.2em] text-[#4B0082] bg-white/90 shadow-xl border-indigo-50/50">
                                    {cardPhotoIndex + 1} / {profile.photos.length}
                                </div>
                            )}
                            
                            {/* Photo Progress Bars */}
                            {hasMultiplePhotos && (
                                <div className="absolute top-6 inset-x-6 flex gap-1.5 z-10">
                                    {profile.photos.map((_: any, i: number) => (
                                        <div 
                                            key={i} 
                                            className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${i === cardPhotoIndex ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`} 
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-indigo-900/10 bg-indigo-50/30">
                            <User className="h-24 w-24 opacity-50" />
                            <span className="text-[9px] mt-4 font-black uppercase tracking-[0.4em] opacity-40">No Image</span>
                        </div>
                    )}
                    
                    {profile.photo_verified && (
                        <div className="absolute bottom-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[8px] font-black flex items-center gap-1.5 shadow-2xl shadow-emerald-500/40 uppercase tracking-[0.2em] backdrop-blur-xl border border-emerald-400/30">
                            <Shield className="h-3 w-3 shadow-sm" /> Verified
                        </div>
                    )}

                    {profile.isPremium && (
                        <div className="absolute top-4 left-4 z-30">
                            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white p-1 rounded-xl shadow-2xl shadow-amber-500/40 border border-white/20">
                                <Crown className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Content Section */}
                <div className="p-6 md:p-8 flex-1 flex flex-col relative bg-gradient-to-br from-white/60 via-white/40 to-transparent">
                    {/* Compatibility Score & Interaction Badges */}
                    <div className="absolute top-6 right-8 z-20 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-6">
                            <MatchScoreBadge 
                                lifestyleScore={profile.lifestyleMatch?.totalScore || 0}
                                poruthamScore={profile.compatibility?.score || 0}
                                isPremium={true}
                                onClick={(e) => { e.stopPropagation(); onView(profile); }}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => onShortlist(e, profile.user_id)}
                                disabled={actionLoading}
                                className={cn(
                                    "p-0 h-auto hover:bg-transparent transition-all hover:scale-110 flex items-start -mt-2",
                                    shortlistedIds.includes(profile.user_id) ? "text-[#FF1493]" : "text-gray-300 hover:text-[#4B0082]"
                                )}
                            >
                                <Bookmark className={cn("h-[64px] w-[32px]", shortlistedIds.includes(profile.user_id) && "fill-current")} />
                            </Button>
                        </div>
                         
                        {profile.last_active_at && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100/50">
                                <span className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500", formatActivityTime(profile.last_active_at) === "Online" && "animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]")} />
                                {formatActivityTime(profile.last_active_at)}
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-light text-gray-900 tracking-tighter leading-none group-hover:text-[#4B0082] transition-colors duration-500">
                                {profile.name}
                            </h3>
                            <span className="text-lg font-black text-[#4B0082]/20 tracking-tighter">{profile.age && `${profile.age}`}</span>
                            {profile.isPremium && (
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100/50">Elite</span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-900/60">
                                <MapPinIcon className="h-3 w-3 text-indigo-500/40" />
                                {profile.location.split(',')[0]}
                            </div>
                            <div className="h-1 w-1 bg-indigo-100 rounded-full" />
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">
                                <Shield className="h-3 w-3 opacity-60" />
                                Trust Vector {calculateTrustScore(
                                    !!profile.photo_verified, 
                                    profile.completion_percentage || 80, 
                                    profile.photos?.length || 0
                                )}% Approved
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {getProfileSummaryStr(profile).split(" • ").map((tag, i) => (
                            <span key={i} className="px-3.5 py-1.5 rounded-full bg-indigo-50/30 text-indigo-900/70 text-[8px] font-bold tracking-widest uppercase border border-indigo-100/30 group-hover:bg-white group-hover:border-indigo-200 transition-all">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleContactClick('whatsapp'); }}
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-2xl border-none bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
                            >
                                <MessageCircleIcon className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleContactClick('call'); }}
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-2xl border-none bg-indigo-50 text-[#4B0082] hover:bg-[#4B0082] hover:text-white transition-all duration-300 shadow-sm"
                            >
                                <Phone className="h-5 w-5" />
                            </Button>

                            {section === "received" && profile.interaction_status === "pending" ? (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); onAction(profile.user_id, "accepted", true); }}
                                        disabled={actionLoading}
                                        className="h-12 px-8 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 border-none"
                                    >
                                        <HeartHandshakeIcon className="h-4 w-4 mr-2" />
                                        Accept Interest
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); onAction(profile.user_id, "declined", true); }}
                                        disabled={actionLoading}
                                        className="h-12 px-6 rounded-2xl border-none bg-rose-50 text-rose-600 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                                    >
                                        Decline
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (section === "mutual" || profile.interaction_status === 'accepted') {
                                            onMessage(profile);
                                        } else {
                                            toast.info(`Current status: ${profile.interaction_status.toUpperCase()}`);
                                        }
                                    }}
                                    className={cn(
                                        "h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-xl border-none",
                                        (section === "mutual" || profile.interaction_status === 'accepted') 
                                            ? "bg-[#FF4500] text-white hover:bg-[#FF6347]" 
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {(section === "mutual" || profile.interaction_status === 'accepted') ? (
                                        <span className="flex items-center gap-2">
                                            <MessageCircleIcon className="h-4 w-4" />
                                            Send Message
                                        </span>
                                    ) : (
                                        <span className="capitalize">{profile.interaction_status}</span>
                                    )}
                                </Button>
                            )}
                        </div>
                        
                        <Button 
                            variant="ghost"
                            className="h-12 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#4B0082] hover:bg-indigo-50/50 transition-all"
                            onClick={() => onView(profile)}
                        >
                            Full Profile
                            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
