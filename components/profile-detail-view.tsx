"use client"

import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import React, { useEffect, useState } from "react"
import {
    User, GraduationCap, Heart, CheckCircle2, Phone, MessageCircle, Lock,
    Eye, Info, Users, Sparkles, Target, HeartHandshake, MoreVertical, UserX, UserMinus, Crown, Gem, Bookmark, ShieldCheck,
    ChevronLeft, ChevronRight, Flag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { MessageDialog } from "@/components/message-dialog"
import { ReportProfileDialog } from "@/components/report-profile-dialog"
import { formatToDDMMYYYY, formatActivityTime } from "@/lib/utils/date-utils"
import { Badge } from "@/components/ui/badge"
import { ProfileEducationCareerSection } from "@/components/profile/profile-education-career-section"
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
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
    const [contactUnlocked, setContactUnlocked] = useState(false)
    const [canViewPhotos, setCanViewPhotos] = useState(true)
    const [photoRequestStatus, setPhotoRequestStatus] = useState<string | null>(null)
    const [photoRequesting, setPhotoRequesting] = useState(false)

    // Interaction dates
    const [iLikedDate, setILikedDate] = useState<string | null>(null)
    const [likedMeDate, setLikedMeDate] = useState<string | null>(null)
    const [likedMeStatus, setLikedMeStatus] = useState<string | null>(null)
    const [iLikedStatus, setILikedStatus] = useState<string | null>(null)
    const [shortlistedDate, setShortlistedDate] = useState<string | null>(null)
    const [shortlistedMeDate, setShortlistedMeDate] = useState<string | null>(null)
    const [lastViewedMeDate, setLastViewedMeDate] = useState<string | null>(null)
    const [acceptedDate, setAcceptedDate] = useState<string | null>(null)

    useEffect(() => {
        if (!targetUserId) return

        const fetchProfile = async () => {
            setIsLoading(true)
            try {
                // Record the view on load (if not viewing own profile)
                if (currentUserId && targetUserId && currentUserId !== targetUserId) {
                    authFetch("/api/views", {
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
                    authFetch(`/api/premium-status?userIds=${targetUserId}`).then(r => r.ok ? r.json() : []).catch(() => []),
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
                        authFetch(`/api/likes?userId=${currentUserId}`),
                        authFetch(`/api/shortlists?userId=${currentUserId}`),
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
                        setAcceptedDate(myLike?.accepted_at || likeMe?.accepted_at || null)
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
                    
                    const viewsRes = await authFetch(`/api/views?userId=${currentUserId}`)
                    if (viewsRes.ok) {
                        const viewsData = await viewsRes.json()
                        const viewMe = (viewsData.viewedMe || []).find((v: any) => v.viewer_user_id === targetUserId)
                        setLastViewedMeDate(viewMe?.created_at || null)
                    }

                    // Photo privacy check
                    const paRes = await authFetch(`/api/photo-access?targetUserId=${targetUserId}`).catch(() => null)
                    if (paRes?.ok) {
                        const pa = await paRes.json()
                        setCanViewPhotos(pa.canView !== false)
                        setPhotoRequestStatus(pa.requestStatus || null)
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
            const res = await authFetch("/api/likes", {
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
            const res = await authFetch("/api/shortlists", {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, targetUserId }),
            })
            if (res.ok) { setIsShortlisted(!isShortlisted); toast.success(!isShortlisted ? "Shortlisted!" : "Removed.") }
        } catch (e) { toast.error("Action failed") } finally { setIsShortlistProcessing(false) }
    }

    const handleSendMessage = () => setIsMessageDialogOpen(true)

    const requestPhotos = async () => {
        if (!currentUserId) return
        setPhotoRequesting(true)
        try {
            const res = await authFetch("/api/photo-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ownerId: targetUserId }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                setPhotoRequestStatus("pending")
                toast.success("Photo request sent")
            } else {
                toast.error(data.error || "Failed to send request")
            }
        } catch {
            toast.error("Network error. Please try again.")
        } finally {
            setPhotoRequesting(false)
        }
    }

    // Gates the first contact reveal against the viewer's tier limit. Once a
    // profile is unlocked, all its contact fields reveal together and re-views
    // are free (deduplicated server-side).
    const unlockContact = async (): Promise<boolean> => {
        if (contactUnlocked) return true
        try {
            const res = await authFetch("/api/contact-view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ viewedUserId: targetUserId }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok && data.allowed) {
                setContactUnlocked(true)
                if (typeof data.remaining === "number" && !data.alreadyViewed) {
                    toast.success(`Contact unlocked · ${data.remaining} view${data.remaining !== 1 ? "s" : ""} left this plan`)
                }
                return true
            }
            toast.error(data.error || "Unable to view contact details")
            return false
        } catch {
            toast.error("Network error. Please try again.")
            return false
        }
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f0ebe3] border-t-[#e87898]" />
            </div>
        )
    }

    if (!profile) {
        return <div className="p-8 text-center text-sm text-[#6b7280]">Profile not found</div>
    }

    const detailedAge = calculateDetailedAge(profile.date_of_birth, profile.age);
    const detailedHeight = convertToFtIn(profile.height);
    const formatSiblings = () => {
        const count = profile.family?.siblings; const details = profile.family?.sibling_details;
        if (!details || !Array.isArray(details) || details.length === 0) return count ? `${count} Sibling${count > 1 ? 's' : ''}` : "None";
        return `${count || details.length} Siblings`;
    };

    const isMale = profile.sex?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "male"

    return (
        <div className="relative min-h-0 pb-6 bg-[#faf8f4]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, #eadfce 1px, transparent 0)",
                        backgroundSize: "22px 22px",
                    }}
                />
                <div className="absolute -top-16 right-0 w-48 h-48 rounded-full bg-[#fce8ef]/50 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#fdf6e3]/60 blur-3xl" />
            </div>

            <div className="relative z-10 px-4 sm:px-5 pt-4 pb-2">
                <div className="grid grid-cols-1 xl:grid-cols-[1fr,auto] items-start gap-4">
                    <div className="space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            {profile.last_active && (
                                <Badge
                                    className={cn(
                                        "border px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5",
                                        formatActivityTime(profile.last_active) === "Online"
                                            ? "bg-[#ecfdf5] border-[#bbf7d0] text-[#16a34a]"
                                            : "bg-white border-[#f0ebe3] text-[#6b7280]"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            formatActivityTime(profile.last_active) === "Online"
                                                ? "bg-[#22c55e] animate-pulse"
                                                : "bg-[#9ca3af]"
                                        )}
                                    />
                                    {formatActivityTime(profile.last_active) === "Online"
                                        ? "Online"
                                        : formatActivityTime(profile.last_active)}
                                </Badge>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fce8ef] text-[#e87898] text-[11px] font-medium border border-[#f0ebe3]">
                                <ShieldCheck className="h-3 w-3" /> Verified
                            </span>
                            {profile.profile_code && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#6b7280] text-[11px] font-medium border border-[#f0ebe3]">
                                    ID: {profile.profile_code}
                                </span>
                            )}
                            {profile.id_verified && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e6f7f5] text-[#3bb9ac] text-[11px] font-medium border border-[#3bb9ac]/20">
                                    <ShieldCheck className="h-3 w-3" /> ID Verified
                                </span>
                            )}
                            {profile.isPremium && (
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-[11px] font-medium",
                                        profile.premiumPlan === "prime_gold" ? "bg-amber-500" : "bg-[#1F4068]"
                                    )}
                                >
                                    <Gem className="h-3 w-3" />
                                    {profile.premiumPlan?.replace(/_/g, " ") || "Premium"}
                                </span>
                            )}
                        </div>

                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-[#1F4068] leading-tight break-words">
                                {profile.name || profile.userName || "Unknown"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs sm:text-sm text-[#6b7280]">
                                <span>{detailedAge}</span>
                                <span className="text-[#e87898]">·</span>
                                <span>{detailedHeight}</span>
                                <span className="text-[#e87898]">·</span>
                                <span>{profile.marital_status}</span>
                                <span className="text-[#e87898]">·</span>
                                <span>Created by {profile.created_by || "Self"}</span>
                            </div>
                        </div>
                    </div>

                    {!isOwnProfile && (
                        <div className="flex flex-col items-stretch xl:items-end gap-3">
                            <div className="space-y-1 xl:text-right text-xs text-[#6b7280]">
                                {shortlistedMeDate && (
                                    <p className="flex items-center xl:justify-end gap-1.5 text-[#e87898]">
                                        <HeartHandshake className="h-3.5 w-3.5" />
                                        {isMale ? "He" : "She"} shortlisted you on {formatToDDMMYYYY(shortlistedMeDate)}
                                    </p>
                                )}
                                {(isMutual || iLikedStatus === "accepted" || likedMeStatus === "accepted") ? (
                                    <p className="flex items-center xl:justify-end gap-1.5 text-[#e87898] font-medium">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Accepted interest on {formatToDDMMYYYY(acceptedDate || iLikedDate || likedMeDate || "")}
                                    </p>
                                ) : iLikedStatus === "declined" ? (
                                    <p className="flex items-center xl:justify-end gap-1.5 text-[#9ca3af]">
                                        <Heart className="h-3.5 w-3.5 text-[#9ca3af]" />
                                        {isMale ? "He" : "She"} declined your interest
                                    </p>
                                ) : iLikedDate ? (
                                    <p className="flex items-center xl:justify-end gap-1.5">
                                        <Heart className="h-3.5 w-3.5 text-[#e87898]" />
                                        You sent interest on {formatToDDMMYYYY(iLikedDate)}
                                    </p>
                                ) : null}
                                {lastViewedMeDate && (
                                    <p className="flex items-center xl:justify-end gap-1.5">
                                        <Eye className="h-3.5 w-3.5 text-[#9ca3af]" />
                                        {isMale ? "He" : "She"} viewed you on {formatToDDMMYYYY(lastViewedMeDate)}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                                <Button
                                    onClick={handleShortlist}
                                    disabled={isShortlistProcessing}
                                    variant="outline"
                                    className={cn(
                                        "h-9 px-3.5 rounded-xl text-xs font-medium border-[#f0ebe3]",
                                        isShortlisted
                                            ? "bg-[#fce8ef] text-[#e87898] border-[#e87898]"
                                            : "bg-white text-[#6b7280] hover:bg-[#faf8f4]"
                                    )}
                                >
                                    <Bookmark className={cn("h-3.5 w-3.5 mr-1.5", isShortlisted && "fill-current")} />
                                    {isShortlisted ? "Shortlisted" : "Shortlist"}
                                </Button>
                                {iLikedStatus === "declined" || likedMeStatus === "declined" ? (
                                    <Button disabled className="h-9 px-4 rounded-xl bg-[#f3f4f6] text-[#9ca3af] text-xs cursor-not-allowed">
                                        Declined
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() =>
                                            isLiked || iLikedStatus === "accepted" || isMutual
                                                ? handleSendMessage()
                                                : handleLike()
                                        }
                                        disabled={isLikeProcessing}
                                        className="h-9 px-4 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-xs font-medium"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                        {isLiked || iLikedStatus === "accepted" || isMutual ? "Message" : "Send interest"}
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-xl border-[#f0ebe3] bg-white text-[#6b7280] hover:bg-[#faf8f4]"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 border-[#f0ebe3]">
                                        <DropdownMenuItem className="rounded-lg text-xs text-[#4b5563] cursor-pointer">
                                            <UserMinus className="h-3.5 w-3.5 mr-2" /> Skip profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg text-xs text-red-600 cursor-pointer">
                                            <UserX className="h-3.5 w-3.5 mr-2" /> Block member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setIsReportDialogOpen(true)}
                                            className="rounded-lg text-xs text-red-600 cursor-pointer"
                                        >
                                            <Flag className="h-3.5 w-3.5 mr-2" /> Report profile
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-10 px-4 sm:px-5 pb-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="w-full lg:w-[240px] xl:w-[260px] shrink-0 lg:sticky lg:top-2">
                        <div className="bg-white rounded-[16px] p-2.5 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] overflow-hidden space-y-2.5">
                            <div className="relative aspect-[4/5] rounded-[12px] overflow-hidden bg-[#faf8f4] group">
                                <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20">
                                    {photos.map((_, i) => (
                                        <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full bg-white transition-all duration-300",
                                                    i === currentPhotoIndex ? "w-full" : "w-0"
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {photos.length > 0 ? (
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={currentPhotoIndex}
                                            src={photos[currentPhotoIndex]}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={cn("w-full h-full object-cover", !canViewPhotos && "blur-xl scale-110")}
                                        />
                                    </AnimatePresence>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#fce8ef]/30">
                                        <User className="h-12 w-12 text-[#e87898]/30" />
                                    </div>
                                )}
                                {!canViewPhotos && photos.length > 0 && (
                                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 bg-black/30 backdrop-blur-sm px-4 text-center">
                                        <Lock className="h-6 w-6 text-white" />
                                        <p className="text-xs text-white/90 font-medium">Photos are private</p>
                                        {photoRequestStatus === "pending" ? (
                                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#1F4068]">
                                                Request pending
                                            </span>
                                        ) : photoRequestStatus === "declined" ? (
                                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-red-500">
                                                Request declined
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={requestPhotos}
                                                disabled={photoRequesting}
                                                className="rounded-full bg-[#e87898] px-3.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#d66686] disabled:opacity-60"
                                            >
                                                {photoRequesting ? "Sending..." : "Request photos"}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {photos.length > 1 && (
                                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between z-30 pointer-events-none">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPhotoIndex((p) => (p - 1 + photos.length) % photos.length)
                                            }
                                            className="h-8 w-8 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-white flex items-center justify-center hover:bg-white/60 transition-all pointer-events-auto"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPhotoIndex((p) => (p + 1) % photos.length)}
                                            className="h-8 w-8 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-white flex items-center justify-center hover:bg-white/60 transition-all pointer-events-auto"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {photos.length > 1 && (
                                <div className="flex gap-2 px-1 pb-1 overflow-x-auto no-scrollbar">
                                    {photos.map((p, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setCurrentPhotoIndex(i)}
                                            className={cn(
                                                "w-11 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                                                i === currentPhotoIndex
                                                    ? "border-[#e87898] scale-105"
                                                    : "border-transparent opacity-50 hover:opacity-100"
                                            )}
                                        >
                                            <img src={p} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3 pb-4">
                        <ProfileCard title="Personal Profile" icon={<User className="h-4 w-4" />} iconTint="pink">
                            <DetailRow label="Date of Birth" value={formatToDDMMYYYY(profile.date_of_birth)} />
                            <DetailRow label="Marital Status" value={profile.marital_status} />
                            <DetailRow label="Mother Tongue" value={profile.languages?.[0] || profile.mother_tongue} />
                            <DetailRow label="Height" value={detailedHeight || profile.height} />
                            <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                            <DetailRow label="Physical Status" value={profile.physical_status || "Normal"} />
                            <DetailRow label="Complexion" value={profile.skin_color} />
                            <DetailRow label="Build" value={profile.body_type} />
                            <DetailRow label="Food Preference" value={profile.food_preference} />
                        </ProfileCard>

                        <ProfileCard title="Family Details" icon={<Users className="h-4 w-4" />} iconTint="navy">
                            <DetailRow label="Religion" value={profile.religion || "Hindu"} />
                            <DetailRow label="Caste" value={profile.caste} />
                            <DetailRow label="Subcaste" value={profile.family?.subcaste} />
                            <DetailRow label="Kilai / Kulam" value={`${profile.family?.kilai || profile.family?.kulam || "None"}`} />
                            <DetailRow label="Gotram" value={profile.family?.gotram} />
                            <DetailRow label="Family Status" value={profile.family_status} />
                            <DetailRow label="Family Type" value={profile.family_type} />
                            <DetailRow label="Ancestral Origin" value={profile.family?.ancestral_origin} />
                            <DetailRow label="Father Occupation" value={profile.family?.father_occupation} />
                            <DetailRow label="Mother Occupation" value={profile.family?.mother_occupation} />
                            <DetailRow label="Siblings Info" value={formatSiblings()} />
                        </ProfileCard>

                        {profile.about && (
                            <div className="bg-white rounded-[16px] p-4 sm:p-5 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]">
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-[#fce8ef] flex items-center justify-center text-[#e87898]">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-[#1F4068]">About Myself</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-[#4b5563] border-l-2 border-[#e87898] pl-3">
                                    {profile.about}
                                </p>
                            </div>
                        )}
                        {profile.family?.family_description && (
                            <div className="bg-white rounded-[16px] p-4 sm:p-5 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]">
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-[#faf8f4] flex items-center justify-center text-[#1F4068]">
                                        <Users className="h-3.5 w-3.5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-[#1F4068]">About My Family</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-[#4b5563] border-l-2 border-[#f0ebe3] pl-3">
                                    {profile.family.family_description}
                                </p>
                            </div>
                        )}

                        <ProfileEducationCareerSection
                            education={profile.education}
                            profession={profile.profession}
                            professionType={profile.professionType}
                            isPremiumViewer={isViewerPremium}
                            compact
                            className="shadow-none"
                        />

                        <ProfileCard title="Horoscope & Astrology" icon={<Sparkles className="h-4 w-4" />} iconTint="amber">
                            <DetailRow label="Star" value={profile.horoscope?.star} isLocked isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Raasi" value={profile.horoscope?.zodiac_sign} isLocked isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Lagnam" value={profile.horoscope?.lagnam} isLocked isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Dosha(m)" value={profile.horoscope?.dhosham || "No Dosham"} isLocked isPremiumViewer={isViewerPremium} />
                            {profile.horoscope?.jaadhagam_url && (
                                <DetailRow
                                    label="Horoscope Chart (Jaadhagam)"
                                    value={
                                        <a href={profile.horoscope.jaadhagam_url} target="_blank" rel="noopener noreferrer" className="text-[#e87898] hover:underline">
                                            View Chart
                                        </a>
                                    }
                                    isLocked
                                    isPremiumViewer={isViewerPremium}
                                />
                            )}
                            <DetailRow label="Place of Birth" value={profile.horoscope?.place_of_birth} isLocked isPremiumViewer={isViewerPremium} />
                            <DetailRow label="Time of Birth" value={profile.horoscope?.time_of_birth} isLocked isPremiumViewer={isViewerPremium} />
                        </ProfileCard>

                        <ProfileCard title="Lifestyle & Habits" icon={<HeartHandshake className="h-4 w-4" />} iconTint="pink">
                            <DetailRow label="Diet" value={profile.social?.diet || profile.food_preference} />
                            <DetailRow label="Smoking" value={profile.social?.smoking || "No"} />
                            <DetailRow label="Drinking" value={profile.social?.drinking || "No"} />
                            <DetailRow label="Parties" value={profile.social?.parties} />
                            <DetailRow label="Pubs" value={profile.social?.pubs} />
                            <div className="py-3 px-1">
                                <p className="text-xs font-medium text-[#9ca3af] mb-2">Interests</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.isArray(profile.interests?.interests) && profile.interests.interests.length > 0 ? (
                                        profile.interests.interests.map((int: string, i: number) => (
                                            <span key={i} className="px-2.5 py-1 bg-[#faf8f4] text-[#4b5563] rounded-md text-[11px] font-medium border border-[#f0ebe3]">
                                                {int}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-[#9ca3af] text-sm italic">No interests shared</p>
                                    )}
                                </div>
                            </div>
                        </ProfileCard>

                        <ProfileCard title="Contact & Location" icon={<Phone className="h-4 w-4" />} iconTint="navy">
                            <DetailRow label="Phone Number" value={profile.contact?.phone || profile.phone} isLocked isPremiumViewer={isViewerPremium} forceRevealed={contactUnlocked} onReveal={unlockContact} />
                            <DetailRow label="WhatsApp" value={profile.contact?.whatsapp_number || profile.phone} isLocked isPremiumViewer={isViewerPremium} forceRevealed={contactUnlocked} onReveal={unlockContact} />
                            <DetailRow
                                label="Address"
                                value={[
                                    profile.contact?.current_address_line1,
                                    profile.contact?.current_address_line2,
                                    profile.contact?.current_area,
                                    profile.contact?.current_district,
                                    profile.contact?.current_state,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                                isLocked
                                isPremiumViewer={isViewerPremium}
                                forceRevealed={contactUnlocked}
                                onReveal={unlockContact}
                            />
                        </ProfileCard>

                        {profile.partner_preferences && (
                            <div className="bg-white rounded-[16px] p-4 sm:p-5 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-[#fce8ef] flex items-center justify-center text-[#e87898]">
                                            <Target className="h-3.5 w-3.5" />
                                        </div>
                                        <h2 className="text-sm font-semibold text-[#1F4068]">Partner Preferences</h2>
                                    </div>
                                    {!isOwnProfile && (
                                        <div className="flex items-center gap-2.5 bg-[#fce8ef] px-3 py-1.5 rounded-xl border border-[#f0ebe3]">
                                            <div className="text-right">
                                                <p className="text-[10px] font-medium text-[#9ca3af]">Match score</p>
                                                <p className="text-base font-semibold text-[#1F4068]">
                                                    {matchScore.matches}
                                                    <span className="text-[#d1d5db]">/</span>
                                                    {matchScore.total}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-[#e87898] flex items-center justify-center">
                                                <Heart className="h-3.5 w-3.5 fill-current text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <PrefRow label="Preferred Age" value={`${profile.partner_preferences.preferred_age_min || 18} to ${profile.partner_preferences.preferred_age_max || 70} years`} isMatch={matchResults.age} />
                                    <PrefRow label="Preferred Height" value={`${profile.partner_preferences.preferred_height_min ? Math.floor(parseInt(profile.partner_preferences.preferred_height_min)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_min)/2.54)%12)+"\"" : "Any"} - ${profile.partner_preferences.preferred_height_max ? Math.floor(parseInt(profile.partner_preferences.preferred_height_max)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_max)/2.54)%12)+"\"" : "Any"}`} isMatch={matchResults.height} />
                                    <PrefRow label="Marital Status" value={profile.partner_preferences.preferred_marital_status || "Any"} isMatch={matchResults.marital} />
                                    <PrefRow label="Religion / Caste" value={profile.partner_preferences.preferred_religion === "Any" || !profile.partner_preferences.preferred_religion ? "Open / Any" : `${profile.partner_preferences.preferred_religion} / ${profile.partner_preferences.preferred_caste || "Any"}`} isMatch={matchResults.religion} />
                                    <PrefRow label="Education" value={Array.isArray(profile.partner_preferences.preferred_education) ? profile.partner_preferences.preferred_education.join(", ") : (profile.partner_preferences.preferred_education || "Any")} isMatch={matchResults.education} />
                                    <PrefRow label="Occupation" value={Array.isArray(profile.partner_preferences.preferred_occupation) ? profile.partner_preferences.preferred_occupation.join(", ") : (profile.partner_preferences.preferred_occupation || "Any")} isMatch={matchResults.occupation} />
                                    <PrefRow label="Location" value={profile.partner_preferences.preferred_location || "Any Location"} isMatch={matchResults.location} />
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
            <ReportProfileDialog
                open={isReportDialogOpen}
                onOpenChange={setIsReportDialogOpen}
                reportedUserId={targetUserId}
                reportedName={profile.name}
            />
        </div>
    )
}

function ProfileCard({
    title,
    icon,
    iconTint,
    children,
}: {
    title: string
    icon: React.ReactNode
    iconTint: "pink" | "navy" | "amber"
    children: React.ReactNode
}) {
    const iconStyles =
        iconTint === "pink"
            ? "bg-[#fce8ef] text-[#e87898]"
            : iconTint === "amber"
              ? "bg-amber-50 text-amber-600"
              : "bg-[#faf8f4] text-[#1F4068]"

    return (
        <div className="bg-white rounded-[16px] p-4 sm:p-5 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-3">
            <div className="flex items-center gap-2.5">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconStyles)}>{icon}</div>
                <h2 className="text-sm font-semibold text-[#1F4068]">{title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-0.5">{children}</div>
        </div>
    )
}

function DetailRow({
    label,
    value,
    isLocked,
    isPremiumViewer,
    forceRevealed,
    onReveal,
}: {
    label: string
    value?: React.ReactNode
    isLocked?: boolean
    isPremiumViewer?: boolean
    forceRevealed?: boolean          // reveal driven by a shared (per-profile) unlock
    onReveal?: () => Promise<boolean> // gate the reveal (e.g. contact-view limit)
}) {
    const [revealed, setRevealed] = useState(false)
    const [checking, setChecking] = useState(false)
    const isRevealed = revealed || !!forceRevealed

    const handleReveal = async () => {
        if (onReveal) {
            setChecking(true)
            const ok = await onReveal()
            setChecking(false)
            if (ok) setRevealed(true)
        } else {
            setRevealed(true)
        }
    }

    const renderValue = () => {
        if (!value) return <span className="text-[#9ca3af] italic text-sm">Not specified</span>

        if (isLocked) {
            if (isPremiumViewer && isRevealed) {
                return (
                    <span className="text-sm font-medium text-[#1F4068] break-words flex items-center gap-2 justify-end">
                        {value}
                        {!forceRevealed && (
                            <button onClick={() => setRevealed(false)} className="text-xs text-[#e87898] hover:underline font-medium">
                                Hide
                            </button>
                        )}
                    </span>
                )
            }
            if (isPremiumViewer && !isRevealed) {
                return (
                    <button
                        onClick={handleReveal}
                        disabled={checking}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fce8ef] rounded-lg border border-[#f0ebe3] text-[#e87898] text-xs font-medium hover:bg-[#f0ebe3] transition-colors disabled:opacity-60"
                    >
                        <Crown className="h-3 w-3" />
                        {checking ? "Checking..." : "Reveal"}
                    </button>
                )
            }
            return (
                <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs font-medium justify-end">
                    <Lock className="h-3 w-3" /> Locked
                </div>
            )
        }

        return <span className="text-sm font-medium text-[#1F4068] whitespace-normal break-words">{value}</span>
    }

    return (
        <div className="flex items-center justify-between py-2 border-b border-[#f0ebe3] last:border-0 gap-4">
            <span className="text-xs text-[#9ca3af] shrink-0">{label}</span>
            <div className="text-right min-w-0">{renderValue()}</div>
        </div>
    )
}

function PrefRow({ label, value, isMatch }: { label: string; value?: string | number | null; isMatch?: boolean }) {
    const isUnspecified =
        !value ||
        value === "Open / Any" ||
        value === "Any" ||
        value === "Any / Any" ||
        value === "Any, Any" ||
        value.toString().includes("Any") ||
        value.toString().includes("Open")

    return (
        <div className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-[#faf8f4] transition-colors gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
                <div
                    className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        isUnspecified ? "bg-[#f3f4f6] text-[#9ca3af]" : isMatch ? "bg-[#e87898] text-white" : "bg-[#1F4068] text-white"
                    )}
                >
                    {isUnspecified ? <Info className="h-3 w-3" /> : isMatch ? <CheckCircle2 className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                </div>
                <span className="text-xs text-[#9ca3af]">{label}</span>
            </div>
            <span className="text-sm font-medium text-[#1F4068] text-right ml-2 truncate">{value || "Open / Any"}</span>
        </div>
    )
}
