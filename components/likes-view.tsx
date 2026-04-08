"use client"

import { useEffect, useState, useMemo } from "react"
import { Heart, User, MapPin, Briefcase, Sparkles, HeartHandshake, X, GraduationCap, Star, Phone, MessageCircle, Coffee, ChevronLeft, ChevronRight, Inbox, Send, Filter, CheckCircle2, XCircle, Clock, ArrowRight, Shield, Crown, Users2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { MessageDialog } from "@/components/message-dialog"
import { formatToDDMMYYYY } from "@/lib/utils/date-utils"
import { cn } from "@/lib/utils"

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
    }, [userId])

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
                { data: settingsData }
            ] = await Promise.all([
                supabase.from("personal_details").select("user_id, name, age, sex").in("user_id", allIds),
                supabase.from("photos").select("user_id, user_photos").in("user_id", allIds),
                supabase.from("profession_employee").select("user_id, designation, company").in("user_id", allIds),
                supabase.from("profession_business").select("user_id, designation, business_name").in("user_id", allIds),
                supabase.from("contact_details").select("user_id, current_district, current_state").in("user_id", allIds),
                supabase.from("user_settings").select("user_id, is_premium").in("user_id", allIds)
            ])

            const buildCard = (uid: string): ProfileCard => {
                const personal = personalData?.find(p => p.user_id === uid)
                const photos = photosData?.find(p => p.user_id === uid)
                const emp = empData?.find(p => p.user_id === uid)
                const bus = busData?.find(p => p.user_id === uid)
                const contact = contactData?.find(p => p.user_id === uid)
                const settings = settingsData?.find(p => p.user_id === uid)

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
                    iLiked: iLikeds.some(l => l.id === uid),
                    isPremium: !!settings?.is_premium,
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
                    body: JSON.stringify({ userId, likedUserId: targetId }),
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
            const iLikedOk = iLikedData.filter(l => l.status === "accepted").map(l => l.id)
            const likedMeOk = likedMeData.filter(l => l.status === "accepted").map(l => l.id)
            list = iLikedOk.filter(id => likedMeOk.includes(id)).map(id => ({ id, status: "accepted" }))
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
            return { ...p, interaction_status: item.status }
        }).filter(Boolean) as ProfileCard[]
    }, [activeSection, activeStatus, iLikedData, likedMeData, profiles])

    const counts = useMemo(() => {
        return {
            mutual: iLikedData.filter(l => l.status === "accepted" && likedMeData.some(m => m.id === l.id && m.status === "accepted")).length,
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
                                            onAction={(status) => handleUpdateStatus(profile.user_id, status, activeSection === 'received')}
                                            onView={() => handleOpenProfile(profile)}
                                            onMessage={() => {
                                                setMessageTarget({ id: profile.user_id, name: profile.name })
                                                setIsMessageDialogOpen(true)
                                            }}
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
                                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-indigo-100 flex items-center justify-center text-indigo-600">
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
    onAction: (status: string) => void
    onView: () => void
    onMessage: () => void
    actionLoading: boolean
    index: number
}

function LikesHorizontalCard({ profile, section, onAction, onView, onMessage, actionLoading, index }: LikesHorizontalCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full sds-glass rounded-[2rem] overflow-hidden group border border-indigo-100/20 hover:border-[#4B0082]/30 hover:shadow-[0_40px_80px_-20px_rgba(75,0,130,0.15)] transition-all duration-500 flex flex-col md:flex-row"
        >
            {/* Left Image */}
            <div className="relative w-full md:w-56 h-auto min-h-[220px] bg-gray-50 shrink-0 overflow-hidden cursor-pointer" onClick={onView}>
                {profile.photo ? (
                    <img
                        src={profile.photo}
                        alt={profile.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-indigo-100" />
                    </div>
                )}
                
                <div className="absolute top-4 left-4 z-10">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border",
                        profile.interaction_status === "accepted" ? "bg-emerald-500/90 text-white border-emerald-400" :
                        profile.interaction_status === "declined" ? "bg-rose-500/90 text-white border-rose-400" :
                        "bg-white/90 text-indigo-900 border-indigo-100/50"
                    )}>
                        {profile.interaction_status}
                    </span>
                </div>
            </div>

            {/* Right profile Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white/60 relative">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-2xl font-light text-gray-900 tracking-tighter group-hover:text-[#4B0082] transition-colors" onClick={onView}>
                                {profile.name}{profile.age && <span className="font-bold text-[#4B0082]/20 ml-1">, {profile.age}</span>}
                             </h3>
                             {profile.isPremium && <Crown className="h-4 w-4 text-amber-400" />}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-indigo-900/40">
                            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-indigo-300" /> {profile.location}</div>
                            <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-indigo-300" /> {profile.profession}</div>
                        </div>
                    </div>

                    {/* Header Action Area */}
                    <div className="flex items-center gap-3">
                        {section === "received" && profile.interaction_status === "pending" ? (
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => onAction("declined")}
                                    disabled={actionLoading}
                                    variant="ghost"
                                    className="h-10 px-4 rounded-xl text-rose-500 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Decline
                                </Button>
                                <Button 
                                    onClick={() => onAction("accepted")}
                                    disabled={actionLoading}
                                    className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200"
                                >
                                    Accept Interest
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                onClick={onView}
                                variant="ghost" 
                                className="h-10 px-6 rounded-xl border-indigo-100 text-[#4B0082] hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest border"
                            >
                                Details Matrix <ArrowRight className="h-3.5 w-3.5 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/[0.04] flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                            <Shield className="h-3 w-3" /> Identity Verified
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                            <Sparkles className="h-3 w-3" /> 88% Match Score
                        </div>
                    </div>
                    {profile.interaction_status === 'accepted' && (
                        <div className="flex gap-2">
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-indigo-600 hover:bg-indigo-50"><Phone className="h-4 w-4" /></Button>
                            <Button 
                                onClick={onMessage}
                                variant="ghost" 
                                className="h-10 w-10 p-0 rounded-xl text-indigo-600 hover:bg-indigo-50"
                            >
                                <MessageCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}