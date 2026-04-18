"use client"

import { supabase } from "@/lib/supabase"
import React, { useEffect, useState } from "react"
import { 
    MapPin, Briefcase, User, GraduationCap,
    Heart, CheckCircle2, Phone, MessageCircle, Lock,
    Calendar, Coffee, Eye, Info, Users, Shield, Sparkles, XCircle,
    Target, Award, HeartHandshake, MoreVertical, UserX, UserMinus, Crown, Gem, Bookmark, ShieldCheck,
    ChevronLeft, ChevronRight, Bookmark as BookmarkIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { MessageDialog } from "@/components/message-dialog"
import { formatToDDMMYYYY, formatActivityTime } from "@/lib/utils/date-utils"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProfileDetailViewProps {
    targetUserId: string
    currentUserId: string | null
    onClose?: () => void
    isModal?: boolean
}

export function ProfileDetailView({ targetUserId, currentUserId, onClose, isModal }: ProfileDetailViewProps) {
    const isOwnProfile = currentUserId === targetUserId;

    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [photos, setPhotos] = useState<string[]>([])
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    
    // Interaction & Viewer states
    const [isLiked, setIsLiked] = useState(false)
    const [isShortlisted, setIsShortlisted] = useState(false)
    const [isLikeProcessing, setIsLikeProcessing] = useState(false)
    const [isShortlistProcessing, setIsShortlistProcessing] = useState(false)
    const [viewerProfile, setViewerProfile] = useState<any>(null)
    const [matchScore, setMatchScore] = useState<{ matches: number, total: number }>({ matches: 0, total: 21 })
    const [matchResults, setMatchResults] = useState<Record<string, boolean>>({})
    
    // Premium & Messaging states
    const [isViewerPremium, setIsViewerPremium] = useState(false)
    const [isMutual, setIsMutual] = useState(false)
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
    
    // Interaction dates
    const [iLikedDate, setILikedDate] = useState<string | null>(null)
    const [likedMeDate, setLikedMeDate] = useState<string | null>(null)
    const [likedMeStatus, setLikedMeStatus] = useState<string | null>(null)
    const [iLikedStatus, setILikedStatus] = useState<string | null>(null)
    const [shortlistedDate, setShortlistedDate] = useState<string | null>(null)
    const [shortlistedMeDate, setShortlistedMeDate] = useState<string | null>(null)
    const [lastViewedMeDate, setLastViewedMeDate] = useState<string | null>(null)

    useEffect(() => {
        if (!targetUserId) return

        const fetchProfile = async () => {
            setIsLoading(true)
            try {
                // Record the view on load (if not viewing own profile)
                if (currentUserId && targetUserId && currentUserId !== targetUserId) {
                    fetch("/api/views", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ viewerId: currentUserId, viewedUserId: targetUserId })
                    }).catch(e => console.error("Error logging view", e))
                }

                const [
                    { data: personal },
                    { data: contact },
                    { data: edu },
                    { data: emp },
                    { data: bus },
                    { data: stu },
                    { data: fam },
                    { data: horo },
                    { data: int },
                    { data: soc },
                    { data: prefs },
                    { data: photosRow },
                    { data: userRow },
                    settingsApiResult,
                ] = await Promise.all([
                    supabase.from("personal_details").select("*").eq("user_id", targetUserId).single(),
                    supabase.from("contact_details").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("education_details").select("*").eq("user_id", targetUserId),
                    supabase.from("profession_employee").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("profession_business").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("profession_student").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("family_details").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("horoscope_details").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("interests").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("social_habits").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("partner_preferences").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("photos").select("*").eq("user_id", targetUserId).maybeSingle(),
                    supabase.from("users").select("*, name, email, phone, updated_at, is_premium, last_active_at").eq("id", targetUserId).single(),
                    fetch(`/api/premium-status?userIds=${targetUserId}`).then(r => r.ok ? r.json() : []).catch(() => []),
                ])

                if (!personal) {
                    toast.error("Profile not found")
                    return
                }

                let allPhotos: string[] = []
                if (photosRow?.user_photos) {
                    allPhotos = photosRow.user_photos
                }

                const settingsRow = Array.isArray(settingsApiResult) 
                    ? settingsApiResult.find((s: any) => s.user_id === targetUserId) 
                    : null

                setProfile({
                    ...personal,
                    userName: userRow?.name,
                    contact: contact || {},
                    education: edu || [],
                    profession: emp || bus || stu || null,
                    professionType: emp ? "employee" : bus ? "business" : stu ? "student" : null,
                    family: fam || {},
                    horoscope: horo || {},
                    interests: int || {},
                    social: soc || {},
                    sex: personal.sex || userRow?.sex || personal.gender || null,
                    partner_preferences: prefs || null,
                    isPremium: settingsRow?.is_premium || userRow?.is_premium || personal.is_premium || false,
                    premiumPlan: settingsRow?.premium_plan || userRow?.premium_plan || personal.premium_plan || null,
                    last_active: settingsRow?.last_active_at || userRow?.last_active_at || personal.last_active_at || personal.updated_at || userRow?.updated_at || personal.created_at,
                    created_by: personal.created_by || "Self",
                    family_status: personal.family_status,
                    family_type: personal.family_type,
                })
                setPhotos(allPhotos)
                setCurrentPhotoIndex(0)

                if (currentUserId) {
                    const [likesRes, shortRes, viewerRes, settingsRes] = await Promise.all([
                        fetch(`/api/likes?userId=${currentUserId}`),
                        fetch(`/api/shortlists?userId=${currentUserId}`),
                        supabase.from("personal_details").select("*").eq("user_id", currentUserId).maybeSingle(),
                        supabase.from("user_settings").select("is_premium, premium_plan").eq("user_id", currentUserId).maybeSingle()
                    ])
                    
                    if (likesRes.ok) {
                        const likesData = await likesRes.json()
                        const myLike = (likesData.iLiked || []).find((l: any) => l.id === targetUserId)
                        const likeMe = (likesData.likedMe || []).find((l: any) => l.id === targetUserId)
                        setIsLiked(!!myLike)
                        setIsMutual(!!myLike && !!likeMe)
                        setILikedDate(myLike?.created_at || null)
                        setILikedStatus(myLike?.status || null)
                        setLikedMeDate(likeMe?.created_at || null)
                        setLikedMeStatus(likeMe?.status || null)
                    }
                    if (shortRes.ok) {
                        const shortData = await shortRes.json()
                        const myShort = (shortData.shortlisted || []).find((s: any) => s.id === targetUserId)
                        const shortMe = (shortData.shortlistedMe || []).find((s: any) => s.id === targetUserId)
                        setIsShortlisted(!!myShort)
                        setShortlistedDate(myShort?.created_at || null)
                        setShortlistedMeDate(shortMe?.created_at || null)
                    }
                    if (settingsRes.data) setIsViewerPremium(settingsRes.data.is_premium)
                    
                    const viewsRes = await fetch(`/api/views?userId=${currentUserId}`)
                    if (viewsRes.ok) {
                        const viewsData = await viewsRes.json()
                        const viewMe = (viewsData.viewedMe || []).find((v: any) => v.viewer_user_id === targetUserId)
                        setLastViewedMeDate(viewMe?.created_at || null)
                    }

                    if (viewerRes.data) {
                        setViewerProfile(viewerRes.data)
                        if (prefs) {
                            let matches = 0; const total = 21; const v = viewerRes.data;
                            const pr = prefs;
                            const pEdu = Array.isArray(edu) ? edu : [];
                            
                            if (v.age >= (pr.preferred_age_min || 18) && v.age <= (pr.preferred_age_max || 70)) matches++
                            if (v.height >= (pr.preferred_height_min || 120) && v.height <= (pr.preferred_height_max || 220)) matches++
                            if (pr.preferred_marital_status === "Any" || v.marital_status === pr.preferred_marital_status) matches++
                            if (!pr.preferred_mother_tongue || v.mother_tongue === pr.preferred_mother_tongue) matches++
                            if (pr.preferred_religion === 'Any' || v.religion === pr.preferred_religion) matches++
                            if (pr.preferred_caste === 'Any' || !pr.preferred_caste || v.caste === pr.preferred_caste) matches++
                            if (pr.preferred_education === 'Any' || !pr.preferred_education || pEdu.some(e => e.education === pr.preferred_education)) matches++
                            
                            setMatchScore({ matches, total })
                            setMatchResults({
                                age: !!(v.age >= (pr.preferred_age_min || 18) && v.age <= (pr.preferred_age_max || 70)),
                                height: !!(v.height >= (pr.preferred_height_min || 120) && v.height <= (pr.preferred_height_max || 220)),
                                marital: !!(pr.preferred_marital_status === "Any" || v.marital_status === pr.preferred_marital_status),
                                religion: !!(pr.preferred_religion === 'Any' || v.religion === pr.preferred_religion),
                                caste: !!(pr.preferred_caste === 'Any' || !pr.preferred_caste || v.caste === pr.preferred_caste),
                                education: !!(pr.preferred_education === 'Any' || !pr.preferred_education || pEdu.some(e => e.education === pr.preferred_education)),
                            })
                        }
                    }
                }
            } catch (error) { console.error(error) } finally { setIsLoading(false) }
        }
        fetchProfile()
    }, [targetUserId, currentUserId])

    const handleLike = async () => {
        if (!currentUserId || isLikeProcessing) return
        setIsLikeProcessing(true)
        try {
            const method = isLiked ? "DELETE" : "POST"
            const status = (!isLiked && likedMeDate) ? 'accepted' : undefined
            const res = await fetch("/api/likes", {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, likedUserId: targetUserId, status }),
            })
            if (res.ok) {
                const newState = !isLiked
                setIsLiked(newState); setILikedDate(newState ? new Date().toISOString() : null)
                setILikedStatus(newState ? (status || 'pending') : null)
                if (newState && (status === 'accepted' || likedMeStatus === 'accepted')) setIsMutual(true)
                else if (!newState) setIsMutual(false)
                toast.success(newState ? "Interest sent!" : "Withdrawn.")
            }
        } catch (e) { toast.error("Action failed") } finally { setIsLikeProcessing(false) }
    }

    const handleShortlist = async () => {
        if (!currentUserId || isShortlistProcessing) return
        setIsShortlistProcessing(true)
        try {
            const method = isShortlisted ? "DELETE" : "POST"
            const res = await fetch("/api/shortlists", {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, targetUserId }),
            })
            if (res.ok) { setIsShortlisted(!isShortlisted); toast.success(!isShortlisted ? "Shortlisted!" : "Removed.") }
        } catch (e) { toast.error("Action failed") } finally { setIsShortlistProcessing(false) }
    }

    const calculateDetailedAge = (dobString: string, currentAge: number) => {
        if (!dobString) return `${currentAge} Years`;
        const dob = new Date(dobString); const now = new Date();
        let yrs = now.getFullYear() - dob.getFullYear(); let mos = now.getMonth() - dob.getMonth();
        if (mos < 0) { yrs--; mos += 12; }
        return `${yrs} Years and ${mos} months`;
    };

    const convertToFtIn = (cm: number) => {
        if (!cm) return null;
        const totalInches = cm / 2.54; const feet = Math.floor(totalInches / 12); const inches = Math.round(totalInches % 12);
        return `${cm} cm (${feet}'${inches}")`;
    };

    if (isLoading) return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#4B0082]" />
            <p className="text-gray-400 text-sm font-medium animate-pulse">Loading Profile...</p>
        </div>
    )

    if (!profile) return <div className="p-10 text-center text-gray-400">Profile not found</div>

    const detailedAge = calculateDetailedAge(profile.date_of_birth, profile.age);
    const detailedHeight = convertToFtIn(profile.height);
    const formatSiblings = () => {
        const count = profile.family?.siblings; const details = profile.family?.sibling_details;
        if (!details || !Array.isArray(details) || details.length === 0) return count ? `${count} Sibling${count > 1 ? 's' : ''}` : "None";
        return `${count || details.length} Siblings`;
    };

    const isMale = profile.sex?.toLowerCase() === 'male' || profile.gender?.toLowerCase() === 'male';

    return (
        <div className="min-h-screen pb-24 relative w-full h-full overflow-y-auto no-scrollbar">
            {/* Background Orbs */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A3060]/40 via-[#4B0082]/40 via-[#FF1493]/40 to-[#FFA500]/40 bg-[length:200%_auto] animate-gradient" />
                <div className="absolute inset-0 bg-[#FAFAFA]/40" />
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#4B0082]/20 rounded-full blur-[140px] animate-float" />
                <div className="absolute top-1/2 -right-32 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: '-10s' }} />
                <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px]" />
            </div>

            {/* Header: Identity & Interaction Labels */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] items-end gap-16">
                    <div className="space-y-6 min-w-0">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                {profile.last_active && (
                                    <Badge className={cn(
                                        "backdrop-blur-xl border px-5 py-2 rounded-full text-[11px] font-black tracking-[0.15em] uppercase shadow-2xl flex items-center gap-2.5 transition-all duration-700", 
                                        formatActivityTime(profile.last_active) === "Online" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20 ring-1 ring-emerald-500/20" : "bg-black/20 border-white/10 text-white/70"
                                    )}>
                                        <div className="relative flex h-2.5 w-2.5">
                                            {formatActivityTime(profile.last_active) === "Online" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", formatActivityTime(profile.last_active) === "Online" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]" : "bg-white/30")}></span>
                                        </div>
                                        {formatActivityTime(profile.last_active) === "Online" ? "Online Now" : formatActivityTime(profile.last_active)}
                                    </Badge>
                                )}
                                <div className="h-7 px-3 rounded-full bg-[#F3F4FF] text-[#4B0082] text-[9px] font-black flex items-center tracking-widest uppercase border border-[#E0E2FF]">
                                    <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Verified
                                </div>
                                {profile.isPremium && (
                                    <div className={cn("h-7 px-3 rounded-full text-white text-[9px] font-black flex items-center tracking-widest uppercase shadow-md", profile.premiumPlan === 'elite' ? 'bg-[#4B0082]' : profile.premiumPlan === 'prime_gold' ? 'bg-amber-500' : 'bg-pink-500')}>
                                        <Gem className="h-3.5 w-3.5 mr-2" /> {profile.premiumPlan?.replace(/_/g, ' ')}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-[4.2rem] font-black text-[#1A1A1A] tracking-tighter leading-[0.9] break-words">
                                    {profile.name || profile.userName || "Unknown"}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-900/40 text-lg font-bold tracking-tight">
                                    <span className="text-gray-900">{detailedAge}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4B0082]/10" />
                                    <span className="text-gray-900">{detailedHeight}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4B0082]/10" />
                                    <span className="text-gray-900">{profile.marital_status}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4B0082]/10" />
                                    <span className="text-gray-900 lowercase font-medium">Created by <span className="text-indigo-900 font-black uppercase text-xs tracking-widest">{profile.created_by}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-10">
                        <div className="space-y-4 text-right">
                            {shortlistedMeDate && <div className="flex items-center justify-end gap-3 text-[10.5px] font-bold uppercase tracking-widest text-indigo-600"><HeartHandshake className="h-4 w-4 shadow-sm" /> <span>{profile.sex?.toLowerCase() === 'male' ? 'He' : 'She'} shortlisted you on {formatToDDMMYYYY(shortlistedMeDate).replace(/-/g, '.')}</span></div>}
                            {iLikedDate && iLikedStatus !== 'accepted' && likedMeStatus !== 'accepted' && !isMutual && <div className="flex items-center justify-end gap-3 text-[10.5px] font-bold uppercase tracking-widest text-rose-500"><Heart className="h-4 w-4" /> <span>You sent {isMale ? 'him' : 'her'} an interest — {formatToDDMMYYYY(iLikedDate).replace(/-/g, '.')}</span></div>}
                            {(isMutual || iLikedStatus === 'accepted' || likedMeStatus === 'accepted') && <div className="flex items-center justify-end gap-3 text-[10.5px] font-black uppercase tracking-widest text-emerald-600"><CheckCircle2 className="h-4 w-4" /> <span>{isMale ? 'He' : 'She'} accepted your interest on {formatToDDMMYYYY(likedMeDate || iLikedDate).replace(/-/g, '.')}</span></div>}
                            {lastViewedMeDate && <div className="flex items-center justify-end gap-3 text-[10.5px] font-bold uppercase tracking-widest text-sky-600"><Eye className="h-4 w-4" /> <span>{isMale ? 'He' : 'She'} viewed your profile {formatToDDMMYYYY(lastViewedMeDate).replace(/-/g, '.')}</span></div>}
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={handleShortlist} className={cn("h-[3.5rem] px-8 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all group", isShortlisted ? 'bg-[#4B0082] text-white hover:bg-[#3B0062] shadow-[#4B0082]/20' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50')}>
                                <BookmarkIcon className={cn("h-4 w-4 mr-2 transition-transform group-hover:scale-110", isShortlisted && "fill-current")} />
                                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                            </Button>
                            <Button onClick={() => (isLiked || iLikedStatus === 'accepted' || isMutual) ? setIsMessageDialogOpen(true) : handleLike()} className="h-[3.5rem] px-10 rounded-full bg-[#FF4500] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all">
                                <MessageCircle className="h-4 w-4 mr-3" /> {(isLiked || iLikedStatus === 'accepted' || isMutual) ? 'Send Message' : 'Send Interest'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-[3.5rem] w-[3.5rem] rounded-full bg-white border-gray-100 shadow-lg hover:bg-gray-50 transition-all text-gray-900"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 z-50 shadow-2xl bg-white border border-gray-100 overflow-hidden">
                                    <DropdownMenuItem className="rounded-2xl p-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-gray-50 transition-colors"><UserMinus className="h-5 w-5 mr-3" /> Skip Profile</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-2xl p-4 text-rose-500 font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-rose-50 transition-colors"><UserX className="h-5 w-5 mr-3" /> Block Member</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12 items-start shrink-0">
                    {/* Photo Sidebar */}
                    <div className="w-full lg:w-[380px] space-y-10 shrink-0 lg:sticky lg:top-24">
                        <div className="bg-white rounded-[3.5rem] p-4 shadow-2xl border border-gray-100 overflow-hidden space-y-6">
                            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-100 group">
                                <div className="absolute top-6 inset-x-8 flex gap-2 z-20">
                                    {photos.map((_, i) => <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"><div className={cn("h-full bg-white transition-all duration-300", i === currentPhotoIndex ? 'w-full' : 'w-0')} /></div>)}
                                </div>
                                {photos.length > 0 ? (
                                    <motion.img key={currentPhotoIndex} src={photos[currentPhotoIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50"><User className="h-20 w-20 text-gray-200" /></div>
                                )}
                                {photos.length > 1 && (
                                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-between z-30 pointer-events-none">
                                        <button onClick={() => setCurrentPhotoIndex(p => (p - 1 + photos.length) % photos.length)} className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 text-white flex items-center justify-center hover:bg-white/50 transition-all pointer-events-auto shadow-lg"><ChevronLeft className="h-6 w-6" /></button>
                                        <button onClick={() => setCurrentPhotoIndex(p => (p + 1) % photos.length)} className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 text-white flex items-center justify-center hover:bg-white/50 transition-all pointer-events-auto shadow-lg"><ChevronRight className="h-6 w-6" /></button>
                                    </div>
                                )}
                            </div>
                            {photos.length > 1 && (
                                <div className="flex gap-4 px-2 pb-2 overflow-x-auto no-scrollbar">
                                    {photos.map((p, i) => (
                                        <button key={i} onClick={() => setCurrentPhotoIndex(i)} className={cn("w-16 h-16 rounded-2xl overflow-hidden border-[3px] shrink-0 transition-all", i === currentPhotoIndex ? "border-[#4B0082] scale-105 shadow-md" : "border-transparent opacity-50 hover:opacity-100")}>
                                            <img src={p} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Columns */}
                    <div className="flex-1 min-w-0 space-y-12 pb-24 shrink-0">
                        <Section title="Personal Profile" icon={<User className="h-5 w-5" />} theme="indigo">
                            <DetailRow label="Date of Birth" value={formatToDDMMYYYY(profile.date_of_birth)} />
                            <DetailRow label="Marital Status" value={profile.marital_status} />
                            <DetailRow label="Mother Tongue" value={profile.languages?.[0] || profile.mother_tongue} />
                            <DetailRow label="Height" value={detailedHeight || profile.height} />
                            <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                            <DetailRow label="Physical Status" value={profile.physical_status || "Normal"} />
                            <DetailRow label="Complexion" value={profile.skin_color} />
                            <DetailRow label="Build" value={profile.body_type} />
                            <DetailRow label="Food Preference" value={profile.food_preference} />
                        </Section>

                        <Section title="Family Details" icon={<Users className="h-5 w-5" />} theme="amber">
                            <DetailRow label="Religion" value={profile.religion || "Hindu"} />
                            <DetailRow label="Caste" value={profile.caste} />
                            <DetailRow label="Subcaste" value={profile.family?.subcaste} />
                            <DetailRow label="Kilai / Kulam" value={`${profile.family?.kilai || profile.family?.kulam || 'None'}`} />
                            <DetailRow label="Gotram" value={profile.family?.gotram} />
                            <DetailRow label="Family Status" value={profile.family_status} />
                            <DetailRow label="Family Type" value={profile.family_type} />
                            <DetailRow label="Ancestral Origin" value={profile.family?.ancestral_origin} />
                            <DetailRow label="Father Occupation" value={profile.family?.father_occupation} />
                            <DetailRow label="Mother Occupation" value={profile.family?.mother_occupation} />
                            <DetailRow label="Siblings Info" value={formatSiblings()} />
                        </Section>

                        <div className="space-y-12">
                            {profile.about && (
                                <div className="bg-white rounded-[3rem] p-8 space-y-4 border border-gray-50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600"><User className="h-5 w-5" /></div>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">About Myself</h3>
                                    </div>
                                    <p className="text-lg font-light leading-relaxed text-gray-900 italic border-l-4 border-indigo-50 pl-6">"{profile.about}"</p>
                                </div>
                            )}
                            {profile.family?.family_description && (
                                <div className="bg-white rounded-[3rem] p-8 space-y-4 border border-gray-50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-2xl" />
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><Users className="h-5 w-5" /></div>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">About My Family</h3>
                                    </div>
                                    <p className="text-lg font-light leading-relaxed text-gray-900 border-l-4 border-amber-50 pl-6">{profile.family.family_description}</p>
                                </div>
                            )}
                        </div>

                        <Section title="Education & Career" icon={<GraduationCap className="h-5 w-5" />} theme="emerald">
                            {profile.education?.map((e: any, i: number) => <DetailRow key={i} label={`Education ${i + 1}`} value={`${e.education}${e.institution ? ` at ${e.institution}` : ''}`} />)}
                            <DetailRow label="Current Occupation" value={profile.profession?.designation || profile.professionType} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label={profile.professionType === 'employee' ? "Sector" : "Business Type"} value={profile.profession?.sector || profile.profession?.business_type} />
                            <DetailRow label={profile.professionType === 'business' ? "Business Name" : "Company Name"} value={profile.profession?.business_name || profile.profession?.company} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label={profile.professionType === 'business' ? "Annual Revenue" : "Annual Salary"} value={profile.profession?.revenue_range || profile.profession?.salary_range || profile.profession?.annual_returns || profile.profession?.salary} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Work Location" value={profile.profession?.work_location || profile.profession?.business_location} />
                        </Section>

                        <Section title="Horoscope & Astrology" icon={<Sparkles className="h-5 w-5" />} theme="amber">
                            <DetailRow label="Star" value={profile.horoscope?.star} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Raasi" value={profile.horoscope?.zodiac_sign} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Lagnam" value={profile.horoscope?.lagnam} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Dosha(m)" value={profile.horoscope?.dhosham || "No Dosham"} isLocked={true} isPremiumViewer={isViewerPremium} />
                            {profile.horoscope?.jaadhagam_url && <DetailRow label="Horoscope Chart (Jaadhagam)" value={<a href={profile.horoscope.jaadhagam_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Chart</a>} isLocked={true} isPremiumViewer={isViewerPremium} />}
                            <DetailRow label="Place of Birth" value={profile.horoscope?.place_of_birth} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Time of Birth" value={profile.horoscope?.time_of_birth} isLocked={true} isPremiumViewer={isViewerPremium} />
                        </Section>

                        <Section title="Lifestyle & Habits" icon={<HeartHandshake className="h-5 w-5" />} theme="rose">
                            <DetailRow label="Diet" value={profile.social?.diet || profile.food_preference} />
                            <DetailRow label="Smoking" value={profile.social?.smoking || "No"} />
                            <DetailRow label="Drinking" value={profile.social?.drinking || "No"} />
                            <DetailRow label="Parties" value={profile.social?.parties} />
                            <DetailRow label="Pubs" value={profile.social?.pubs} />
                            <div className="py-8 px-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Interests</p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(profile.interests?.interests) && profile.interests.interests.length > 0 ? (
                                        profile.interests.interests.map((int: string, i: number) => (
                                            <span key={i} className="px-5 py-2.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">{int}</span>
                                        ))
                                    ) : <p className="text-gray-300 text-[10px] font-bold uppercase italic">No interests shared</p>}
                                </div>
                            </div>
                        </Section>

                        <Section title="Contact & Location" icon={<Phone className="h-5 w-5" />} theme="sky">
                            <DetailRow label="Phone Number" value={profile.contact?.phone || profile.phone} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow label="WhatsApp" value={profile.contact?.whatsapp_number || profile.phone} isLocked={true} isPremiumViewer={isViewerPremium} />
                            <DetailRow 
                                label="Address" 
                                value={[
                                    profile.contact?.current_address_line1, 
                                    profile.contact?.current_address_line2,
                                    profile.contact?.current_area, 
                                    profile.contact?.current_district, 
                                    profile.contact?.current_state
                                ].filter(Boolean).join(", ")} 
                                isLocked={true} 
                                isPremiumViewer={isViewerPremium} 
                            />
                        </Section>

                        {profile.partner_preferences && (
                            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 relative overflow-hidden group space-y-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-50/20 transition-all duration-1000" />
                                <div className="relative z-10 space-y-10">
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Target className="h-5 w-5" /></div>
                                            <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Partner Preferences</h2>
                                        </div>
                                        {!isOwnProfile && (
                                            <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 opacity-60">Match Score</p>
                                                    <p className="text-2xl font-black text-gray-900">{matchScore.matches}<span className="text-gray-200">/</span>{matchScore.total}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"><Heart className="h-5 w-5 fill-current text-white" /></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <PrefRow label="Preferred Age" value={`${profile.partner_preferences.preferred_age_min || 18} to ${profile.partner_preferences.preferred_age_max || 70} years`} isMatch={matchResults.age} />
                                        <PrefRow label="Preferred Height" value={`${profile.partner_preferences.preferred_height_min ? Math.floor(parseInt(profile.partner_preferences.preferred_height_min)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_min)/2.54)%12)+"\"" : 'Any'} - ${profile.partner_preferences.preferred_height_max ? Math.floor(parseInt(profile.partner_preferences.preferred_height_max)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_max)/2.54)%12)+"\"" : 'Any'}`} isMatch={matchResults.height} />
                                        <PrefRow label="Marital Status" value={profile.partner_preferences.preferred_marital_status || 'Any'} isMatch={matchResults.marital} />
                                        <PrefRow label="Religion / Caste" value={profile.partner_preferences.preferred_religion === 'Any' || !profile.partner_preferences.preferred_religion ? 'Open / Any' : `${profile.partner_preferences.preferred_religion} / ${profile.partner_preferences.preferred_caste || 'Any'}`} isMatch={matchResults.religion} />
                                        <PrefRow label="Education" value={Array.isArray(profile.partner_preferences.preferred_education) ? profile.partner_preferences.preferred_education.join(", ") : (profile.partner_preferences.preferred_education || "Any")} isMatch={matchResults.education} />
                                        <PrefRow label="Occupation" value={Array.isArray(profile.partner_preferences.preferred_occupation) ? profile.partner_preferences.preferred_occupation.join(", ") : (profile.partner_preferences.preferred_occupation || "Any")} isMatch={matchResults.occupation} />
                                        <PrefRow label="Location" value={profile.partner_preferences.preferred_location || "Any Location"} isMatch={matchResults.location} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMessageDialogOpen && (
                    <MessageDialog isOpen={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen} receiverId={targetUserId} receiverName={profile.name || "this member"} senderId={currentUserId || ""} isPremium={isViewerPremium} />
                )}
            </AnimatePresence>
        </div>
    )
}

function Section({ title, icon, theme, children }: { title: string, icon: React.ReactNode, theme: string, children: React.ReactNode }) {
    const bgColor = theme === 'indigo' ? 'bg-indigo-50' : theme === 'amber' ? 'bg-amber-50' : theme === 'emerald' ? 'bg-emerald-50' : theme === 'rose' ? 'bg-rose-50' : 'bg-sky-50';
    const textColor = theme === 'indigo' ? 'text-indigo-600' : theme === 'amber' ? 'text-amber-600' : theme === 'emerald' ? 'text-emerald-600' : theme === 'rose' ? 'text-rose-600' : 'text-sky-600';
    
    return (
        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 space-y-10">
            <div className="flex items-center gap-6">
                <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", bgColor, textColor)}>{icon}</div>
                <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">{title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-1">{children}</div>
        </div>
    )
}

function DetailRow({ label, value, isLocked, isPremiumViewer }: { label: string, value?: any, isLocked?: boolean, isPremiumViewer?: boolean }) {
    const [revealed, setRevealed] = useState(false)
    
    const renderValue = () => {
        if (!value) return <span className="text-gray-300 italic font-medium">Not specified</span>
        if (isLocked) {
            if (isPremiumViewer && revealed) return (
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="text-sm font-bold text-[#1A1A1A] break-words">{value}</span>
                    <button onClick={() => setRevealed(false)} className="shrink-0 text-[11px] text-[#4B0082] hover:underline uppercase tracking-widest font-black bg-indigo-50 px-2 py-0.5 rounded">Hide</button>
                </div>
            )
            if (isPremiumViewer && !revealed) return <button onClick={() => setRevealed(true)} className="flex items-center gap-2 px-3 py-1 bg-[#F3F4FF] rounded-lg border border-[#E0E2FF] text-[#4B0082] text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-[#E0E2FF] transition-all"><Crown className="h-3 w-3" /> Reveal</button>
            return <div className="flex items-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-widest"><Lock className="h-3 w-3" /> Locked</div>
        }
        return <span className="text-sm font-bold text-[#1A1A1A] tracking-tight">{value}</span>
    }

    return (
        <div className="flex items-start justify-between py-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors px-1 -mx-1 rounded-lg group/item">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shrink-0 pt-1 w-24">{label}</span>
            <div className="flex-1 min-w-0 text-right pl-4">{renderValue()}</div>
        </div>
    )
}

function PrefRow({ label, value, isMatch }: { label: string, value?: string, isMatch?: boolean }) {
    const isUnspecified = !value || value === "Open / Any" || value === "Any" || value.includes("Any") || value.includes("Open");
    return (
        <div className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors group/row">
            <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isUnspecified ? 'bg-gray-100 text-gray-300' : isMatch ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20')}>
                    {isUnspecified ? <Info className="h-4 w-4" /> : isMatch ? <CheckCircle2 className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hoverRow:text-gray-900 transition-colors">{label}</span>
            </div>
            <span className="text-[13px] font-bold text-gray-900 ml-4 text-right">{value || "Open / Any"}</span>
        </div>
    )
}
