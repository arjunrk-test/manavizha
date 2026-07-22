"use client"

import { useEffect, useState, useMemo } from "react"
import { Heart, User, MapPin, Briefcase, Sparkles, HeartHandshake, X, GraduationCap, Star, Phone, MessageCircle, Coffee, ChevronLeft, ChevronRight, Inbox, Send, Filter, CheckCircle2, XCircle, Clock, ArrowRight, Shield, Crown, Users2, Bookmark } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import { MessageDialog } from "@/components/message-dialog"
import { formatToDDMMYYYY, formatActivityTime } from "@/lib/utils/date-utils"
import { cn } from "@/lib/utils"
import { calculateTrustScore, getProfileSummaryStr, getRoleAndHeightStr } from "@/lib/utils/profile-utils"
import { MatchScoreBadge } from "@/components/match-score-badge"
import { Eye, MapPin as MapPinIcon, ShieldCheck, HeartHandshake as HeartHandshakeIcon, MessageCircle as MessageCircleIcon } from "lucide-react"
import { checkTamilPoruthamByGender } from "@/lib/astrology"
import { calculateLifestyleScore } from "@/lib/matching"

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
    height?: number
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
    interaction_date?: string
    viewed_me_date?: string
    shortlisted_me_date?: string
}

export function LikesView({ userId, onBack, initialTab }: LikesViewProps) {
    const router = useRouter()
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
        const tabMap: Record<Section, string> = {
            mutual: "mutual",
            received: "likedme",
            sent: "liked",
        }
        router.replace(`/dashboard/interests?tab=${tabMap[activeSection]}`, { scroll: false })
    }, [activeSection, router])

    useEffect(() => {
        fetchLikes()
        fetchStatus()
        fetchShortlists()
    }, [userId])

    const fetchShortlists = async () => {
        if (!userId) return
        const res = await authFetch(`/api/shortlists?userId=${userId}`)
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
            const res = await authFetch("/api/shortlists", {
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
            const [likeRes, viewRes, shortRes] = await Promise.all([
                authFetch(`/api/likes?userId=${userId}`),
                authFetch(`/api/views?userId=${userId}`),
                authFetch(`/api/shortlists?userId=${userId}`)
            ]);
            
            const data = await likeRes.json()
            if (!likeRes.ok) throw new Error(data.error)

            const viewData = viewRes.ok ? await viewRes.json() : { viewedMe: [] }
            const shortData = shortRes.ok ? await shortRes.json() : { shortlistedMe: [], shortlistedIds: [] }

            setShortlistedIds(shortData.shortlistedIds || [])

            const iLikeds: LikeData[] = data.iLiked || []
            const likedMes: LikeData[] = data.likedMe || []

            setILikedData(iLikeds)
            setLikedMeData(likedMes)

            const allIds = Array.from(new Set([...iLikeds.map(l => l.id), ...likedMes.map(l => l.id)]))
            if (allIds.length === 0) {
                setIsLoading(false)
                return
            }

            const idsToFetch = Array.from(new Set([...allIds, userId]))

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
                { data: eduData },
                { data: usersData }
            ] = await Promise.all([
                supabase.from("personal_details").select("*").in("user_id", idsToFetch),
                supabase.from("photos").select("*").in("user_id", idsToFetch),
                supabase.from("profession_employee").select("*").in("user_id", idsToFetch),
                supabase.from("profession_business").select("*").in("user_id", idsToFetch),
                supabase.from("contact_details").select("*").in("user_id", idsToFetch),
                supabase.from("user_settings").select("*").in("user_id", idsToFetch),
                supabase.from("horoscope_details").select("*").in("user_id", idsToFetch),
                supabase.from("social_habits").select("*").in("user_id", idsToFetch),
                supabase.from("interests").select("*").in("user_id", idsToFetch),
                supabase.from("education_details").select("*").in("user_id", idsToFetch),
                supabase.from("users").select("id, name").in("id", idsToFetch)
            ])

            // Construct viewer profile for scores
            const viewerPersonal = personalData?.find(p => p.user_id === userId)
            const viewerHoro = horoData?.find(p => p.user_id === userId)
            const viewerInterests = interestsData?.find(p => p.user_id === userId)
            const viewerSocial = socialHabitsData?.find(p => p.user_id === userId)
            const viewerEmp = empData?.find(p => p.user_id === userId)
            const viewerBus = busData?.find(p => p.user_id === userId)
            const viewerContact = contactData?.find(p => p.user_id === userId)

            const viewerFullProfile = viewerPersonal ? {
                ...viewerPersonal,
                ...(viewerContact || {}),
                interests: viewerInterests?.interests || [],
                hobbies: viewerInterests?.hobbies || [],
                smoking: viewerSocial?.smoking,
                drinking: viewerSocial?.drinking,
                foodPreference: viewerPersonal?.food_preference,
                workLocation: viewerEmp?.work_location || viewerBus?.business_location,
                sector: viewerEmp?.sector || viewerBus?.business_type,
                salary: viewerEmp?.salary || viewerBus?.annual_returns,
                horoscope: viewerHoro
            } : null

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

                const userRow = usersData?.find(u => u.id === uid)
                
                let lifestyleMatch
                let compatibility

                if (viewerFullProfile && viewerPersonal?.sex && uid !== userId) {
                    const targetProfile = {
                        ...personal,
                        foodPreference: personal?.food_preference,
                        hobbies: interests?.hobbies || [],
                        interests: interests?.interests || [],
                        smoking: social?.smoking,
                        drinking: social?.drinking,
                        workLocation: emp?.work_location || bus?.business_location,
                        sector: emp?.sector || bus?.business_type,
                        salary: emp?.salary || bus?.annual_returns
                    }

                    lifestyleMatch = calculateLifestyleScore(viewerFullProfile, targetProfile)

                    if (viewerHoro?.star && viewerHoro?.zodiac_sign && horo?.star && horo?.zodiac_sign) {
                        compatibility = checkTamilPoruthamByGender(
                            viewerHoro.star,
                            viewerHoro.zodiac_sign,
                            viewerPersonal.sex.toLowerCase() === "female",
                            horo.star,
                            horo.zodiac_sign
                        )
                    }
                }

                return {
                    user_id: uid,
                    name: personal?.name || userRow?.name || "Unknown",
                    age: personal?.age,
                    height: personal?.height,
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
                    lifestyleMatch,
                    compatibility,
                    interaction_status: "unknown",
                    interaction_date: iLikeds.find(l => l.id === uid)?.created_at || likedMes.find(l => l.id === uid)?.created_at,
                    viewed_me_date: viewData.viewedMe?.find((v: any) => v.viewer_user_id === uid)?.created_at,
                    shortlisted_me_date: shortData.shortlistedMe?.find((s: any) => s.user_id === uid)?.created_at
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
            const res = await authFetch("/api/likes", {
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
                await authFetch("/api/likes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, likedUserId: targetId, status: 'accepted' }),
                })
                const res = await authFetch(`/api/likes?userId=${userId}`)
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
            authFetch("/api/views", {
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
            list = iLikedData
                .filter(l => likedMeData.some(m => m.id === l.id))
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
            if (myLike && theirLike && myLike.status === 'accepted' && theirLike.status === 'accepted') {
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
                type="button"
                onClick={() => {
                    setActiveSection(section)
                    setActiveStatus(status)
                }}
                className={cn(
                    "w-full flex items-center gap-3 py-2.5 text-[13px] font-medium transition-colors text-left",
                    isActive
                        ? "bg-[#fce8ef] text-[#e87898] border-l-[3px] border-[#e87898] pl-[13px] pr-3 rounded-r-xl"
                        : "text-[#4b5563] hover:bg-[#faf8f4] px-4"
                )}
            >
                {Icon && (
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-[#e87898]" : "text-[#9ca3af]")} />
                )}
                <span className="flex-1 truncate">{label}</span>
                {count !== undefined && count > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#e87898] text-white text-[11px] font-semibold flex items-center justify-center">
                        {count}
                    </span>
                )}
            </button>
        )
    }

    const sectionTitle =
        activeSection === "mutual"
            ? "Mutual Interest"
            : activeSection === "received"
              ? `Received — ${activeStatus === "all" ? "All" : activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)}`
              : `Sent — ${activeStatus === "all" ? "All" : activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)}`

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#1F4068]">Interests & Matches</h1>
                    <p className="text-sm text-[#6b7280] mt-1">
                        Mutual connections and interest requests in one place
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/dashboard/browse")}
                    className="h-10 px-5 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium shadow-sm gap-2"
                >
                    <Sparkles className="h-4 w-4" />
                    Browse Profiles
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24 bg-white rounded-[18px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] p-3 space-y-4">
                    <div>
                        <NavItem
                            label="Mutual Interest"
                            count={counts.mutual}
                            section="mutual"
                            icon={HeartHandshake}
                        />
                    </div>

                    <div className="space-y-0.5">
                        <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] flex items-center gap-2">
                            <Inbox className="h-3.5 w-3.5" />
                            Received
                        </p>
                        <NavItem label="All" count={counts.received.all} section="received" status="all" />
                        <NavItem label="Pending" count={counts.received.pending} section="received" status="pending" />
                        <NavItem label="Accepted" count={counts.received.accepted} section="received" status="accepted" />
                        <NavItem label="Declined" count={counts.received.declined} section="received" status="declined" />
                    </div>

                    <div className="space-y-0.5">
                        <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] flex items-center gap-2">
                            <Send className="h-3.5 w-3.5" />
                            Sent
                        </p>
                        <NavItem label="All" count={counts.sent.all} section="sent" status="all" />
                        <NavItem label="Pending" count={counts.sent.pending} section="sent" status="pending" />
                        <NavItem label="Accepted" count={counts.sent.accepted} section="sent" status="accepted" />
                        <NavItem label="Declined" count={counts.sent.declined} section="sent" status="declined" />
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-base font-semibold text-[#1F4068]">{sectionTitle}</h2>
                        <span className="text-xs font-medium text-[#6b7280] bg-[#faf8f4] px-3 py-1 rounded-full border border-[#f0ebe3]">
                            {filteredProfiles.length} {filteredProfiles.length === 1 ? "profile" : "profiles"}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f0ebe3] border-t-[#e87898]" />
                        </div>
                    ) : filteredProfiles.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white rounded-[18px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]"
                        >
                            <div className="mx-auto w-16 h-16 bg-[#fce8ef] rounded-full flex items-center justify-center mb-4">
                                <Inbox className="h-8 w-8 text-[#e87898]/60" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1F4068] mb-2">No profiles yet</h3>
                            <p className="text-[#6b7280] text-sm max-w-sm mx-auto mb-6">
                                {activeSection === "mutual"
                                    ? "When you and someone both show interest, they will appear here."
                                    : "Try another filter or browse profiles to send new interests."}
                            </p>
                            <Button
                                onClick={() => router.push("/dashboard/browse")}
                                variant="outline"
                                className="h-10 px-5 rounded-xl border-[#f0ebe3] text-[#e87898] hover:bg-[#fce8ef] text-sm font-medium"
                            >
                                <Users2 className="h-4 w-4 mr-2" />
                                Browse Profiles
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredProfiles.map((profile, idx) => (
                                    <div key={profile.user_id}>
                                         <LikesHorizontalCard 
                                            profile={profile} 
                                            section={activeSection}
                                            onAction={handleUpdateStatus}
                                            onView={(p) => {
                                                const sequenceIds = filteredProfiles.map(profile => profile.user_id);
                                                sessionStorage.setItem('manavizha_browse_sequence', JSON.stringify(sequenceIds));
                                                router.push(`/dashboard/profile/${p.user_id}`);
                                            }}
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
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border border-[#f0ebe3] rounded-[18px]">
                    <DialogTitle className="sr-only">Profile Details</DialogTitle>
                    {selectedProfile && (
                        <div className="flex flex-col md:flex-row h-[85vh] md:h-[35rem]">
                            <div className="md:w-2/5 bg-[#faf8f4] relative group shrink-0">
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
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white">
                                <div className="flex items-center justify-between mb-6 gap-3">
                                    <h2 className="text-2xl font-semibold text-[#1F4068]">
                                        {selectedProfile.name}{selectedProfile.age && `, ${selectedProfile.age}`}
                                    </h2>
                                    {selectedProfile.interaction_status === "accepted" && (
                                        <div className="bg-[#fce8ef] text-[#e87898] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#f0ebe3] flex items-center gap-1.5 shrink-0">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                                        </div>
                                    )}
                                </div>
                                {isFetchingFull ? (
                                    <div className="flex items-center gap-2 text-[#e87898] text-sm animate-pulse">
                                        <Clock className="h-4 w-4 animate-spin" /> Loading profile…
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] mb-3">Profile details</h3>
                                            <div className="grid grid-cols-2 gap-4 bg-[#faf8f4] p-4 rounded-[14px] border border-[#f0ebe3]">
                                                <div><span className="text-[11px] text-[#9ca3af] block mb-0.5">Height</span><span className="text-sm font-medium text-[#1F4068]">{mutualFullData?.personal?.height}cm</span></div>
                                                <div><span className="text-[11px] text-[#9ca3af] block mb-0.5">Location</span><span className="text-sm font-medium text-[#1F4068]">{selectedProfile.location}</span></div>
                                                <div><span className="text-[11px] text-[#9ca3af] block mb-0.5">Profession</span><span className="text-sm font-medium text-[#1F4068]">{selectedProfile.profession}</span></div>
                                                <div><span className="text-[11px] text-[#9ca3af] block mb-0.5">Caste / Star</span><span className="text-sm font-medium text-[#1F4068]">{mutualFullData?.personal?.caste} • {mutualFullData?.horo?.star || "N/A"}</span></div>
                                            </div>
                                        </section>
                                        
                                        {selectedProfile.interaction_status === "accepted" && (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => {
                                                        setMessageTarget({ id: selectedProfile.user_id, name: selectedProfile.name })
                                                        setIsMessageDialogOpen(true)
                                                    }}
                                                    className="flex-1 h-11 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium"
                                                >
                                                    Send Message
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "h-11 w-11 rounded-xl border-[#f0ebe3] flex items-center justify-center",
                                                        shortlistedIds.includes(selectedProfile.user_id)
                                                            ? "text-[#e87898] bg-[#fce8ef] border-[#e87898]"
                                                            : "text-[#9ca3af] hover:text-[#e87898] hover:bg-[#fce8ef]"
                                                    )}
                                                    onClick={(e) => handleShortlist(e, selectedProfile.user_id)}
                                                    disabled={shortlistLoadingId === selectedProfile.user_id}
                                                >
                                                    <Bookmark className={cn("h-5 w-5", shortlistedIds.includes(selectedProfile.user_id) && "fill-current")} />
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

export function LikesHorizontalCard({ profile, section, onAction, onView, onMessage, actionLoading, index, shortlistedIds, onShortlist }: LikesHorizontalCardProps) {
    const [cardPhotoIndex, setCardPhotoIndex] = useState(0)
    const hasMultiplePhotos = profile.photos && profile.photos.length > 1
    const pronoun = profile.sex?.toLowerCase() === 'female' ? 'She' : 'He'

    const handleContactClick = (type: string) => {
        toast.info(`${type.toUpperCase()} contact feature available for mutual matches.`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="w-full"
        >
            <div
                className="bg-white rounded-[18px] overflow-hidden hover:shadow-[0_6px_20px_rgba(31,64,104,0.1)] transition-shadow cursor-pointer group flex flex-col md:flex-row h-auto md:min-h-[220px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]"
                onClick={() => onView(profile)}
            >
                <div className="w-full md:w-44 h-56 md:h-auto relative overflow-hidden bg-[#faf8f4] shrink-0 md:rounded-l-[18px]">
                    {profile.photos && profile.photos.length > 0 ? (
                        <>
                            <img
                                src={profile.photos[cardPhotoIndex]}
                                alt={profile.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {hasMultiplePhotos && (
                                <div className="absolute bottom-3 right-3 text-[10px] px-2 py-1 rounded-full z-10 font-medium text-[#1F4068] bg-white/95 shadow-sm border border-[#f0ebe3]">
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
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#e87898]/20 bg-[#fce8ef]/30">
                            <User className="h-16 w-16 opacity-40" />
                            <span className="text-[11px] mt-2 text-[#9ca3af]">No photo</span>
                        </div>
                    )}
                    
                    {profile.photo_verified && (
                        <div className="absolute bottom-3 left-3 bg-[#1F4068] text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Verified
                        </div>
                    )}

                    {profile.isPremium && (
                        <div className="absolute top-3 left-3 z-30">
                            <div className="bg-amber-500 text-white p-1 rounded-lg shadow-sm">
                                <Crown className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col relative min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-lg font-semibold text-[#1F4068] truncate group-hover:text-[#e87898] transition-colors">
                                    {profile.name}
                                    {profile.age ? `, ${profile.age}` : ""}
                                </h3>
                                {profile.isPremium && (
                                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Premium</span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#6b7280]">
                                <span className="flex items-center gap-1 truncate">
                                    <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
                                    {profile.location.split(",")[0]}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-[#9ca3af]" />
                                    Trust {calculateTrustScore(
                                        !!profile.photo_verified,
                                        profile.completion_percentage || 80,
                                        profile.photos?.length || 0
                                    )}%
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <MatchScoreBadge
                                lifestyleScore={profile.lifestyleMatch?.totalScore || 0}
                                poruthamScore={profile.compatibility?.score || 0}
                                isPremium={true}
                                onClick={(e) => { e.stopPropagation(); onView(profile) }}
                            />
                            <button
                                type="button"
                                onClick={(e) => onShortlist(e, profile.user_id)}
                                disabled={actionLoading}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
                                    shortlistedIds.includes(profile.user_id)
                                        ? "bg-[#e87898] border-[#e87898] text-white"
                                        : "bg-white border-[#f0ebe3] text-[#9ca3af] hover:text-[#e87898] hover:border-[#e87898]"
                                )}
                            >
                                <Bookmark className={cn("h-4 w-4", shortlistedIds.includes(profile.user_id) && "fill-current")} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {getRoleAndHeightStr(profile).split(" • ").filter(Boolean).map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-[#faf8f4] text-[#4b5563] text-[11px] font-medium border border-[#f0ebe3]">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {(profile.last_active_at || profile.viewed_me_date) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {profile.last_active_at && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#6b7280] bg-[#faf8f4] px-2 py-0.5 rounded-full border border-[#f0ebe3]">
                                    <span className={cn("w-1.5 h-1.5 rounded-full bg-[#22c55e]", formatActivityTime(profile.last_active_at) === "Online" && "animate-pulse")} />
                                    {formatActivityTime(profile.last_active_at)}
                                </span>
                            )}
                            {profile.viewed_me_date && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#e87898] bg-[#fce8ef] px-2 py-0.5 rounded-full">
                                    <Eye className="h-3 w-3" />
                                    Viewed you {formatToDDMMYYYY(profile.viewed_me_date)}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-[#f0ebe3]">
                        <div className="flex flex-col gap-1.5 mb-3">
                            {profile.shortlisted_me_date && (
                                <p className="flex items-center gap-1.5 text-[12px] text-[#e87898]">
                                    <Bookmark className="h-3.5 w-3.5" />
                                    {pronoun} shortlisted you on {formatToDDMMYYYY(profile.shortlisted_me_date)}
                                </p>
                            )}

                            {section === "sent" && (
                                <p className="flex items-center gap-1.5 text-[12px] text-[#4b5563]">
                                    <Heart className="h-3.5 w-3.5 text-[#e87898]" />
                                    {profile.interaction_status === "accepted" ? (
                                        <>{pronoun} accepted your interest{profile.interaction_date ? ` on ${formatToDDMMYYYY(profile.interaction_date)}` : ""}</>
                                    ) : profile.interaction_status === "declined" ? (
                                        <>{pronoun} declined your interest{profile.interaction_date ? ` on ${formatToDDMMYYYY(profile.interaction_date)}` : ""}</>
                                    ) : (
                                        <>Interest sent{profile.interaction_date ? ` on ${formatToDDMMYYYY(profile.interaction_date)}` : ""} — <span className="text-amber-600 font-medium">Pending</span></>
                                    )}
                                </p>
                            )}

                            {section === "received" && (
                                <p className="flex items-center gap-1.5 text-[12px] text-[#4b5563]">
                                    <Heart className="h-3.5 w-3.5 text-[#e87898]" />
                                    {profile.interaction_status === "accepted" ? (
                                        <>You accepted {pronoun.toLowerCase()}&apos;s interest{profile.interaction_date ? ` on ${formatToDDMMYYYY(profile.interaction_date)}` : ""}</>
                                    ) : profile.interaction_status === "declined" ? (
                                        <>You declined {pronoun.toLowerCase()}&apos;s interest{profile.interaction_date ? ` on ${formatToDDMMYYYY(profile.interaction_date)}` : ""}</>
                                    ) : (
                                        <>{pronoun} showed interest{profile.interaction_date ? ` on ${formatToDDMMYYYY(profile.interaction_date)}` : ""}</>
                                    )}
                                </p>
                            )}

                            {section === "mutual" && (
                                <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#e87898]">
                                    <Star className="h-3.5 w-3.5 fill-[#e87898]" />
                                    Mutual interest — you can message each other
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                {section === "received" && profile.interaction_status === "pending" ? (
                                    <>
                                        <Button
                                            onClick={(e) => { e.stopPropagation(); onAction(profile.user_id, "accepted", true) }}
                                            disabled={actionLoading}
                                            className="h-9 px-4 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium border-none"
                                        >
                                            <HeartHandshakeIcon className="h-4 w-4 mr-1.5" />
                                            Accept
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => { e.stopPropagation(); onAction(profile.user_id, "declined", true) }}
                                            disabled={actionLoading}
                                            className="h-9 px-4 rounded-xl border-[#f0ebe3] text-[#6b7280] hover:bg-[#faf8f4] text-sm"
                                        >
                                            Decline
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (section === "mutual" || profile.interaction_status === "accepted") {
                                                onMessage(profile)
                                            } else {
                                                toast.info(`Status: ${profile.interaction_status}`)
                                            }
                                        }}
                                        disabled={!(section === "mutual" || profile.interaction_status === "accepted")}
                                        className={cn(
                                            "h-9 px-4 rounded-xl text-sm font-medium border-none",
                                            section === "mutual" || profile.interaction_status === "accepted"
                                                ? "bg-[#e87898] hover:bg-[#d66686] text-white"
                                                : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                                        )}
                                    >
                                        <MessageCircleIcon className="h-4 w-4 mr-1.5" />
                                        {section === "mutual" || profile.interaction_status === "accepted" ? "Message" : profile.interaction_status}
                                    </Button>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                className="h-9 px-3 rounded-xl text-sm text-[#6b7280] hover:text-[#e87898] hover:bg-[#fce8ef]"
                                onClick={(e) => { e.stopPropagation(); onView(profile) }}
                            >
                                View profile
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
