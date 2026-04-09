"use client"

import { supabase } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { 
    ArrowLeft, MapPin, Briefcase, User, GraduationCap, ArrowRight,
    Heart, Star, CheckCircle2, Phone, MessageCircle, Lock,
    Calendar, Coffee, Eye, Info, Users, Shield, Sparkles, XCircle, Home,
    Search, Target, Award, HeartHandshake, MoreVertical, UserX, UserMinus, Crown, Gem, Bookmark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { MessageDialog } from "@/components/message-dialog"
import { formatToDDMMYYYY } from "@/lib/utils/date-utils"

export default function ProfileViewPage() {
    const router = useRouter()
    const params = useParams()
    const targetUserId = params.id as string
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
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
    const [isProcessing, setIsProcessing] = useState(false)
    
    // Interaction dates
    const [iLikedDate, setILikedDate] = useState<string | null>(null)
    const [likedMeDate, setLikedMeDate] = useState<string | null>(null)
    const [likedMeStatus, setLikedMeStatus] = useState<string | null>(null)
    const [iLikedStatus, setILikedStatus] = useState<string | null>(null)
    const [shortlistedDate, setShortlistedDate] = useState<string | null>(null)
    const [shortlistedMeDate, setShortlistedMeDate] = useState<string | null>(null)
    const [lastViewedMeDate, setLastViewedMeDate] = useState<string | null>(null)

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            setCurrentUserId(data.session?.user?.id || null)
        }
        getSession()
    }, [])

    useEffect(() => {
        if (!targetUserId) return

        const fetchProfile = async () => {
            try {
                // Record the view on page load (if not viewing own profile)
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
                    supabase.from("users").select("name, email, phone").eq("id", targetUserId).single(),
                    // Use server API to bypass RLS - target user's settings not readable by anon
                    fetch(`/api/premium-status?userIds=${targetUserId}`).then(r => r.ok ? r.json() : []).catch(() => []),
                ])

                if (!personal) {
                    toast.error("Profile not found")
                    router.push("/dashboard/browse")
                    return
                }

                // Process Photos
                let allPhotos: string[] = []
                if (photosRow?.user_photos) {
                    allPhotos = photosRow.user_photos
                }

                // Derive settingsRow from API result (array of 0 or 1 items)
                const settingsRow = Array.isArray(settingsApiResult) ? settingsApiResult[0] : null

                // Build combined profile object
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
                    partner_preferences: prefs || null,
                    isPremium: settingsRow?.is_premium || false,
                    premiumPlan: settingsRow?.premium_plan || null,
                })
                setPhotos(allPhotos)

                // Check initial interaction status & fetch viewer profile for matching
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

                    if (settingsRes.data) {
                        setIsViewerPremium(settingsRes.data.is_premium)
                    }

                    // Fetch viewed-me date for this specific user
                    const viewsRes = await fetch(`/api/views?userId=${currentUserId}`)
                    if (viewsRes.ok) {
                        const viewsData = await viewsRes.json()
                        const viewMe = (viewsData.viewedMe || []).find((v: any) => v.viewer_user_id === targetUserId)
                        setLastViewedMeDate(viewMe?.created_at || null)
                    }

                    if (viewerRes.data) {
                        setViewerProfile(viewerRes.data)
                        
                        if (prefs) {
                            // Calculate match score based on 21 categories
                            let matches = 0
                            const total = 21
                            
                            // 1. Age
                            if (viewerRes.data.age >= (prefs.preferred_age_min || 18) && 
                                viewerRes.data.age <= (prefs.preferred_age_max || 70)) matches++
                            
                            // 2. Height
                            if (viewerRes.data.height >= (prefs.preferred_height_min || 120) && 
                                viewerRes.data.height <= (prefs.preferred_height_max || 220)) matches++
                            
                            // 3. Marital Status
                            if (prefs.preferred_marital_status === "Any" || 
                                viewerRes.data.marital_status === prefs.preferred_marital_status) matches++
                            
                            // 4. Mother Tongue
                            if (!prefs.preferred_mother_tongue || 
                                viewerRes.data.mother_tongue === prefs.preferred_mother_tongue) matches++
                                
                            // 5. Physical Status
                            if (prefs.preferred_physical_status === "Any" || 
                                viewerRes.data.physical_status === prefs.preferred_physical_status) matches++
                                
                            // 6. Eating Habits
                            if (prefs.preferred_eating_habits === "Any" || 
                                viewerRes.data.food_preference === prefs.preferred_eating_habits) matches++
                                
                            // 7. Smoking Habits
                            if (prefs.preferred_smoking_habits === "Any" || 
                                soc?.smoking === prefs.preferred_smoking_habits) matches++

                            // 8. Drinking Habits
                            if (prefs.preferred_drinking_habits === "Any" || 
                                soc?.drinking === prefs.preferred_drinking_habits) matches++
                                
                            // 9. Religion
                            if (!prefs.preferred_religion || 
                                personal.religion === prefs.preferred_religion) matches++
                                
                            // 10. Caste
                            if (!prefs.preferred_caste || 
                                personal.caste === prefs.preferred_caste) matches++
                                
                            // 11. Subcaste
                            if (!prefs.preferred_subcaste || 
                                personal.subcaste === prefs.preferred_subcaste) matches++
                                
                            // 12. Star
                            if (!prefs.preferred_star || 
                                horo?.star === prefs.preferred_star) matches++
                                
                            // 13. Dosham
                            if (prefs.preferred_dosham === "Any" || 
                                horo?.dhosham === prefs.preferred_dosham) matches++
                                
                            // 14. Education
                            if (!prefs.preferred_education || 
                                edu?.some((e: any) => e.education === prefs.preferred_education)) matches++
                                
                            // 15. Employment Type
                            if (prefs.preferred_employment_type === "Any" || 
                                (emp && prefs.preferred_employment_type === "employee") ||
                                (bus && prefs.preferred_employment_type === "business") ||
                                (stu && prefs.preferred_employment_type === "student")) matches++
                                
                            // 16. Occupation
                            const prefOccArr: string[] = Array.isArray(prefs.preferred_occupation) ? prefs.preferred_occupation : []
                            const occAny = prefOccArr.length === 0 || prefOccArr.includes("Any")
                            if (occAny ||
                                (emp?.designation && prefOccArr.some((o: string) => o.toLowerCase() === emp.designation?.toLowerCase())) ||
                                (bus?.designation && prefOccArr.some((o: string) => o.toLowerCase() === bus.designation?.toLowerCase()))) matches++
                                
                            // 17. Annual Income
                            if (!prefs.preferred_annual_income || 
                                (emp?.salary && parseInt(emp.salary.replace(/[^\d]/g, '')) >= parseInt(prefs.preferred_annual_income))) matches++
                                
                            // 18. Country
                            if (!prefs.preferred_country || prefs.preferred_country === "Any" || 
                                contact?.current_country === prefs.preferred_country) matches++
                                
                            // 19. State
                            if (!prefs.preferred_state || prefs.preferred_state === "Any" || 
                                contact?.current_state === prefs.preferred_state) matches++
                                
                            // 20. City
                            if (!prefs.preferred_city || prefs.preferred_city === "Any" || 
                                contact?.current_district === prefs.preferred_city) matches++
                                
                            // 21. Citizenship
                            if (!prefs.preferred_citizenship || prefs.preferred_citizenship === "Any" || 
                                contact?.citizenship === prefs.preferred_citizenship) matches++

                            setMatchScore({ matches, total })

                            setMatchResults({
                                age: !!(viewerRes.data.age >= (prefs.preferred_age_min || 18) && viewerRes.data.age <= (prefs.preferred_age_max || 70)),
                                height: !!(viewerRes.data.height >= (prefs.preferred_height_min || 120) && viewerRes.data.height <= (prefs.preferred_height_max || 220)),
                                marital: !!(prefs.preferred_marital_status === "Any" || viewerRes.data.marital_status === prefs.preferred_marital_status),
                                motherTongue: !!(!prefs.preferred_mother_tongue || viewerRes.data.mother_tongue === prefs.preferred_mother_tongue),
                                physical: !!(prefs.preferred_physical_status === "Any" || viewerRes.data.physical_status === prefs.preferred_physical_status),
                                eating: !!(prefs.preferred_eating_habits === "Any" || viewerRes.data.food_preference === prefs.preferred_eating_habits),
                                smoking: !!(prefs.preferred_smoking_habits === "Any" || soc?.smoking === prefs.preferred_smoking_habits),
                                drinking: !!(prefs.preferred_drinking_habits === "Any" || soc?.drinking === prefs.preferred_drinking_habits),
                                religion: !!(!prefs.preferred_religion || personal.religion === prefs.preferred_religion),
                                caste: !!(!prefs.preferred_caste || personal.caste === prefs.preferred_caste),
                                subcaste: !!(!prefs.preferred_subcaste || personal.subcaste === prefs.preferred_subcaste),
                                star: !!(!prefs.preferred_star || horo?.star === prefs.preferred_star),
                                dosham: !!(prefs.preferred_dosham === "Any" || horo?.dhosham === prefs.preferred_dosham),
                                education: !!(!prefs.preferred_education || edu?.some((e: any) => e.education === prefs.preferred_education)),
                                employment: !!(prefs.preferred_employment_type === "Any" || (emp && prefs.preferred_employment_type === "employee") || (bus && prefs.preferred_employment_type === "business") || (stu && prefs.preferred_employment_type === "student")),
                                occupation: occAny || !!(emp?.designation && prefOccArr.some((o: string) => o.toLowerCase() === emp.designation?.toLowerCase())) || !!(bus?.designation && prefOccArr.some((o: string) => o.toLowerCase() === bus.designation?.toLowerCase())),
                                income: !!(!prefs.preferred_annual_income || (emp?.salary && parseInt(emp.salary.replace(/[^\d]/g, '')) >= parseInt(prefs.preferred_annual_income))),
                                location: !!((!prefs.preferred_city || prefs.preferred_city === "Any") && (!prefs.preferred_state || prefs.preferred_state === "Any")),
                                citizenship: !!(!prefs.preferred_citizenship || prefs.preferred_citizenship === "Any" || contact?.citizenship === prefs.preferred_citizenship)
                            })
                        } else {
                            setMatchScore({ matches: 0, total: 21 })
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
                toast.error("Failed to load profile details")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [targetUserId, currentUserId, router])

    const handleLike = async () => {
        if (!currentUserId || isLikeProcessing) return
        setIsLikeProcessing(true)
        try {
            const method = isLiked ? "DELETE" : "POST"
            const res = await fetch("/api/likes", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, likedUserId: targetUserId }),
            })
            if (res.ok) {
                setIsLiked(true)
                setILikedDate(new Date().toISOString())
                toast.success("Interest sent! We'll notify them.")
            } else {
                toast.error("Action failed")
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsLikeProcessing(false)
        }
    }

    const handleShortlist = async () => {
        if (!currentUserId || isShortlistProcessing) return
        setIsShortlistProcessing(true)
        try {
            const method = isShortlisted ? "DELETE" : "POST"
            const res = await fetch("/api/shortlists", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, targetUserId }),
            })
            if (res.ok) {
                setIsShortlisted(true)
                setShortlistedDate(new Date().toISOString())
                toast.success("Profile shortlisted!")
            } else {
                toast.error("Action failed.")
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsShortlistProcessing(false)
        }
    }

    const handleSendMessage = () => {
        // Open message dialog logic even for non-premium
        // MessageDialog will show the upgrade prompt internally
        setIsMessageDialogOpen(true)
    }

    const handleIgnore = async () => {
        if (!currentUserId || isLikeProcessing) return
        if (!confirm("Are you sure you want to ignore this profile? They will be removed from your feed.")) return
        setIsProcessing(true)
        try {
            const res = await fetch("/api/ignores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, targetUserId }),
            })
            if (res.ok) {
                toast.success("Profile has been ignored.")
                router.push("/dashboard/browse")
            } else {
                toast.error("Failed to ignore profile")
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBlock = async () => {
        if (!currentUserId || isLikeProcessing) return
        if (!confirm("Are you sure you want to block this profile permanently? This cannot be undone from here.")) return
        setIsProcessing(true)
        try {
            const res = await fetch("/api/blocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, targetUserId }),
            })
            if (res.ok) {
                toast.success("Profile has been blocked.")
                router.push("/dashboard/browse")
            } else {
                toast.error("Failed to block profile")
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#4B0082]" />
            <p className="text-gray-400 text-sm font-medium animate-pulse">Loading Detailed Profile...</p>
        </div>
    )

    const calculateDetailedAge = (dobString: string, currentAge: number) => {
        if (!dobString) return `${currentAge} Years`;
        const dob = new Date(dobString);
        const now = new Date();
        let yrs = now.getFullYear() - dob.getFullYear();
        let mos = now.getMonth() - dob.getMonth();
        if (mos < 0) {
            yrs--;
            mos += 12;
        }
        return `${yrs} Years and ${mos} months`;
    };

    const convertToFtIn = (cm: number) => {
        if (!cm) return null;
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${cm} cm (${feet}'${inches}")`;
    };

    const detailedAge = calculateDetailedAge(profile.date_of_birth, profile.age);
    const detailedHeight = convertToFtIn(profile.height);

    const ageHeightStr = [
        detailedAge,
        detailedHeight,
        profile.marital_status
    ].filter(Boolean).join(" • ")

    return (
        <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 to-indigo-50/30">

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
                {/* 1. Header & Quick Actions Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-indigo-100/50">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                                {profile.name || profile.userName || "Unknown"}
                            </h1>
                            <div className="h-8 px-4 rounded-full bg-indigo-50 text-[#4B0082] text-[10px] font-black flex items-center tracking-[0.2em] uppercase shadow-sm border border-indigo-100">
                                <Shield className="h-4 w-4 mr-2" /> ID Verified
                            </div>
                            
                            {/* Target Profile Premium Badge */}
                            {profile.isPremium && (
                                <div className="flex gap-3">
                                    {profile.premiumPlan === 'till_you_marry' && (
                                        <div className="h-8 px-4 rounded-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-[10px] font-black flex items-center tracking-[0.2em] uppercase shadow-xl shadow-pink-200">
                                            <Crown className="h-4 w-4 mr-2" /> Lifetime Member
                                        </div>
                                    )}
                                    {profile.premiumPlan === 'elite' && (
                                        <div className="h-8 px-4 rounded-full bg-gradient-to-r from-[#4B0082] to-[#8A2BE2] text-white text-[10px] font-black flex items-center tracking-[0.2em] uppercase shadow-xl shadow-purple-200">
                                            <Gem className="h-4 w-4 mr-2" /> Elite Member
                                        </div>
                                    )}
                                    {profile.premiumPlan === 'prime_gold' && (
                                        <div className="h-8 px-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black flex items-center tracking-[0.2em] uppercase shadow-xl shadow-amber-200">
                                            <Star className="h-4 w-4 mr-2" /> Gold Member
                                        </div>
                                    )}
                                    {(profile.premiumPlan === 'prime' || profile.premiumPlan === '3_months') && (
                                        <div className="h-8 px-4 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] font-black flex items-center tracking-[0.2em] uppercase shadow-xl shadow-indigo-200">
                                            <Shield className="h-4 w-4 mr-2" /> Prime Member
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xl md:text-2xl font-medium text-indigo-900/40 tracking-tight">
                            {detailedAge} • {detailedHeight} • {profile.marital_status} • Created by <span className="text-[#4B0082] font-bold">{profile.created_by || "Self"}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full md:w-auto">
                        {/* Interaction Timeline Labels */}
                        <div className="flex flex-col gap-2 items-end">
                            {shortlistedMeDate && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4B0082]">
                                    <Star className="h-4 w-4 fill-current" />
                                    She shortlisted you {shortlistedMeDate ? `on ${formatToDDMMYYYY(shortlistedMeDate)}` : 'Recently'}
                                </div>
                            )}
                            {isLiked && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-900/40">
                                    <Heart className="h-4 w-4 fill-indigo-900/40" />
                                    You sent her an interest {iLikedDate ? `- ${formatToDDMMYYYY(iLikedDate)}` : 'Recently'}
                                </div>
                            )}
                            {likedMeDate && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                    <Heart className="h-4 w-4 fill-emerald-600" />
                                    {likedMeStatus === 'accepted' ? 'Accepted interest' : (iLikedStatus === 'accepted' ? 'You accepted her interest' : 'She showed interest')} {likedMeDate ? `on ${formatToDDMMYYYY(likedMeDate)}` : 'Recently'}
                                </div>
                            )}
                            {lastViewedMeDate && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4B0082]/40">
                                    <Eye className="h-4 w-4" />
                                    Profile viewed you {lastViewedMeDate ? `on ${formatToDDMMYYYY(lastViewedMeDate)}` : 'Recently'}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-5 w-full md:w-auto items-center">
                            <Button 
                                onClick={handleShortlist}
                                disabled={isShortlistProcessing}
                                variant="outline"
                                className={`flex-1 md:flex-none h-16 px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] border-none shadow-xl transition-all duration-500 hover:scale-105 ${isShortlisted ? 'bg-[#FF1493]/10 text-[#FF1493] border-[#FF1493]/20' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                <Bookmark className={`h-5 w-5 mr-3 ${isShortlisted ? 'fill-current' : ''}`} />
                                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                            </Button>
                            <Button 
                                onClick={() => {
                                    if (isLiked) {
                                        handleSendMessage();
                                    } else {
                                        handleLike();
                                    }
                                }}
                                disabled={isLikeProcessing}
                                className={`flex-1 md:flex-none h-16 px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl border-none transition-all duration-500 hover:scale-105 ${isLiked ? 'bg-[#FF4500] text-white' : 'bg-[#4B0082] hover:bg-[#3b0062] text-white'}`}
                            >
                                {isLiked ? (
                                    <>
                                        <MessageCircle className="h-5 w-5 mr-3" />
                                        Send Message
                                    </>
                                ) : (
                                    <>
                                        <Heart className="h-5 w-5 mr-3" />
                                        Send Interest
                                    </>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-none shadow-2xl bg-white hover:bg-gray-50 text-gray-700 shrink-0 transition-transform hover:rotate-90 duration-500">
                                        <MoreVertical className="h-6 w-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 sds-glass rounded-3xl p-3 z-50 border-indigo-50/50 shadow-2xl">
                                    <DropdownMenuLabel className="text-[10px] font-black text-indigo-300 px-3 py-2 uppercase tracking-[0.2em]">Options</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={handleSendMessage} className="gap-3 cursor-pointer rounded-2xl p-4 focus:bg-[#4B0082] focus:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                                        <MessageCircle className="h-5 w-5" /> Send Message
                                        <Crown className="h-4 w-4 ml-auto text-amber-500" />
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-2 bg-indigo-50/50" />
                                    <DropdownMenuLabel className="text-[10px] font-black text-indigo-300 px-3 py-2 uppercase tracking-[0.2em]">More Options</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={handleIgnore} className="gap-3 cursor-pointer rounded-2xl p-4 focus:bg-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        <UserMinus className="h-5 w-5" /> Skip
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleBlock} className="gap-3 cursor-pointer rounded-2xl p-4 focus:bg-rose-500 focus:text-white text-rose-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                        <UserX className="h-5 w-5" /> Block
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left: Medium-sized Photo Area */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-2xl group">
                            {photos.length > 0 ? (
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentPhotoIndex}
                                        src={photos[currentPhotoIndex]}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full h-full object-cover"
                                    />
                                </AnimatePresence>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <User className="h-20 w-20 opacity-20" />
                                    <span className="text-sm font-medium mt-4">No Photos Shared</span>
                                </div>
                            )}

                            {/* Gallery Navigation Overlay */}
                            {photos.length > 1 && (
                                <div className="absolute inset-x-0 bottom-10 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setCurrentPhotoIndex(prev => (prev - 1 + photos.length) % photos.length)}
                                        className="p-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full text-white hover:bg-white/40 shadow-lg"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPhotoIndex(prev => (prev + 1) % photos.length)}
                                        className="p-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full text-white hover:bg-white/40 shadow-lg"
                                    >
                                        <ArrowLeft className="h-5 w-5 rotate-180" />
                                    </button>
                                </div>
                            )}

                            {/* Indicators */}
                            <div className="absolute top-4 inset-x-0 flex justify-center gap-1 px-4">
                                {photos.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1 rounded-full transition-all ${i === currentPhotoIndex ? 'w-6 bg-white' : 'w-1 bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Photo Thumbnails */}
                        {photos.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center sm:justify-start">
                                {photos.map((photo, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPhotoIndex(i)}
                                        className={`shrink-0 w-16 aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === currentPhotoIndex ? 'border-[#4B0082] scale-105' : 'border-transparent opacity-60'}`}
                                    >
                                        <img src={photo} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quick Summary Card */}
                        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl space-y-4">
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Basic Details</h3>
                            <div className="grid grid-cols-1 gap-y-4">
                                <SummaryRow label="Religion / Caste" value={`${profile.religion || "Hindu"} / ${profile.family.caste || "Not specified"}`} />
                                <SummaryRow label="Subcaste" value={profile.subcaste} />
                                <SummaryRow label="Mother Tongue" value={profile.religion === 'Christian' ? 'Malayalam' : 'Tamil'} />
                                <SummaryRow label="Profile Created By" value={profile.created_by || "Self"} />
                            </div>
                        </div>
                    </div>
                    {/* Right: Comprehensive Info Area */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Detailed Grid System */}
                        <div className="space-y-12">
                            {/* Personal & Social */}
                            <section className="space-y-8">
                                <h2 className="text-2xl font-black flex items-center gap-4 text-gray-900 dark:text-white uppercase tracking-widest">
                                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-lg shadow-pink-200">
                                        <User className="h-6 w-6" />
                                    </div>
                                    Personal Details
                                </h2>
                                <div className="space-y-6 sds-glass p-8 rounded-[2.5rem] shadow-2xl border-white/50">
                                    <DetailRow label="Date of Birth" value={formatToDDMMYYYY(profile.date_of_birth)} />
                                    <DetailRow label="Marital Status" value={profile.marital_status} />
                                    <DetailRow label="Physical Status" value={profile.physical_status || "Normal"} />
                                    <DetailRow label="Body Type" value={profile.body_type} />
                                    <DetailRow label="Skin Color" value={profile.skin_color} />
                                    <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                                    <DetailRow label="Food Preference" value={profile.food_preference} />
                                    <DetailRow label="Religion" value={profile.religion || "Hindu"} />
                                    <DetailRow label="Caste" value={profile.family?.caste || profile.caste} />
                                    <DetailRow label="Subcaste" value={profile.subcaste} />
                                    <DetailRow label="Mother Tongue" value={profile.mother_tongue || (profile.religion === 'Christian' ? 'Malayalam' : 'Tamil')} />
                                    <DetailRow label="Languages" value={Array.isArray(profile.languages) ? profile.languages.join(", ") : profile.languages} />
                                </div>
                            </section>

                            {/* Horoscope & Astrology */}
                            <section className="space-y-8">
                                <h2 className="text-2xl font-black flex items-center gap-4 text-gray-900 dark:text-white uppercase tracking-widest">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-200">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    Horoscope & Astrology
                                </h2>
                                <div className="space-y-6 sds-glass p-8 rounded-[2.5rem] shadow-2xl border-white/50">
                                    <DetailRow label="Star" value={profile.horoscope?.star} isLocked={true} isPremiumViewer={isViewerPremium} />
                                    <DetailRow label="Raasi" value={profile.horoscope?.zodiac_sign} isLocked={true} isPremiumViewer={isViewerPremium} />
                                    <DetailRow label="Lagnam" value={profile.horoscope?.lagnam} isLocked={true} isPremiumViewer={isViewerPremium} />
                                    <DetailRow label="Dosha(m)" value={profile.horoscope?.dhosham || "No Dosham"} isLocked={true} isPremiumViewer={isViewerPremium} />
                                </div>
                            </section>

                            {/* Education & Career */}
                            <section className="space-y-8">
                                <h2 className="text-2xl font-black flex items-center gap-4 text-gray-900 dark:text-white uppercase tracking-widest">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-200">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    Education & Career
                                </h2>
                                <div className="space-y-6 sds-glass p-8 rounded-[2.5rem] shadow-2xl border-white/50">
                                    <DetailRow label="Employment" value={profile.professionType ? `Employed in ${profile.professionType}` : null} isLocked={true} isPremiumViewer={isViewerPremium} />
                                    <DetailRow label="Education" value={profile.education?.[0]?.education} isLocked={true} isPremiumViewer={isViewerPremium} />
                                    <DetailRow label="Occupation" value={profile.professionDetails?.designation || profile.professionType} isLocked={true} isPremiumViewer={isViewerPremium} />
                                    <DetailRow label="Institution" value={profile.education?.[0]?.institution} isLocked={true} isPremiumViewer={isViewerPremium} />
                                </div>
                            </section>

                            {/* Family Details */}
                            <section className="space-y-8">
                                <h2 className="text-2xl font-black flex items-center gap-4 text-gray-900 dark:text-white uppercase tracking-widest">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-200">
                                        <Home className="h-6 w-6" />
                                    </div>
                                    Family Information
                                </h2>
                                <div className="space-y-6 sds-glass p-8 rounded-[2.5rem] shadow-2xl border-white/50">
                                    <DetailRow label="Parents" value={profile.family?.father_occupation ? `Father is ${profile.family.father_occupation}${profile.family.mother_occupation ? `, Mother is ${profile.family.mother_occupation}` : ''}` : null} />
                                    <DetailRow label="Siblings" value={profile.family?.siblings} />
                                    <DetailRow label="Ancestral Origin" value={profile.family?.ancestral_origin} />
                                    <DetailRow label="Family Type" value={profile.family?.family_type} />
                                </div>
                            </section>

                            {/* Contact Information */}
                            <section className="space-y-8">
                                <h2 className="text-2xl font-black flex items-center gap-4 text-gray-900 dark:text-white uppercase tracking-widest">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-lg shadow-sky-200">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    Contact Information
                                </h2>
                                <div className="space-y-6 sds-glass p-8 rounded-[2.5rem] shadow-2xl border-white/50">
                                    <DetailRow label="Mobile Number" value={profile.contact?.mobile_phone || profile.phone} isLocked={true} isPremiumViewer={isViewerPremium} />
                                    <DetailRow label="Email" value={profile.email} isLocked={true} isPremiumViewer={isViewerPremium} />
                                </div>
                            </section>

                            {/* Ideal Partner Preferences */}
                            {profile.partner_preferences && (
                                <section className="space-y-8 pt-10">
                                    <div className="bg-gradient-to-br from-[#4B0082] to-[#3a0066] rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                                        <div className="relative z-10 space-y-12">
                                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-white/10 pb-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
                                                        <Target className="h-8 w-8 text-pink-300" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h2 className="text-4xl font-black tracking-tight">Ideal Partner Preferences</h2>
                                                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
                                                            Seeking a life partner with these values
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isOwnProfile && (
                                                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6EB4]">Match Score</p>
                                                            <p className="text-2xl font-black">{matchScore.matches}/{matchScore.total}</p>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                            <Heart className="h-5 w-5 text-pink-400 fill-pink-400" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-white/5 backdrop-blur-sm p-8 sm:p-14 rounded-[3.5rem] border border-white/10 flex flex-col gap-12">
                                                <div className="space-y-4">
                                                    <h4 className="px-4 text-[11px] font-black uppercase tracking-[0.3em] text-pink-300/60">Basic Consistency</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <PrefRow label="Preferred Age" value={`${profile.partner_preferences.preferred_age_min || 18} to ${profile.partner_preferences.preferred_age_max || 70} years`} isMatch={matchResults.age} />
                                                        <PrefRow label="Preferred Height" value={`${profile.partner_preferences.preferred_height_min ? Math.floor(parseInt(profile.partner_preferences.preferred_height_min)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_min)/2.54)%12)+"\"" : 'Any'} - ${profile.partner_preferences.preferred_height_max ? Math.floor(parseInt(profile.partner_preferences.preferred_height_max)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_max)/2.54)%12)+"\"" : 'Any'}`} isMatch={matchResults.height} />
                                                        <PrefRow label="Marital Status" value={profile.partner_preferences.preferred_marital_status} isMatch={matchResults.marital} />
                                                        <PrefRow label="Physical Status" value={profile.partner_preferences.preferred_physical_status} isMatch={matchResults.physical} />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    <h4 className="px-4 text-[11px] font-black uppercase tracking-[0.3em] text-indigo-300/60">Religious & Background</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <PrefRow label="Religion / Caste" value={profile.partner_preferences.preferred_religion === 'Any' || !profile.partner_preferences.preferred_religion ? 'Open / Any' : `${profile.partner_preferences.preferred_religion} / ${profile.partner_preferences.preferred_caste || 'Any'}`} isMatch={matchResults.religion} />
                                                        <PrefRow label="Subcaste" value={profile.partner_preferences.preferred_subcaste} isMatch={matchResults.subcaste} />
                                                        <PrefRow label="Mother Tongue" value={profile.partner_preferences.preferred_mother_tongue} isMatch={matchResults.motherTongue} />
                                                        <PrefRow label="Preferred Star" value={profile.partner_preferences.preferred_star} isMatch={matchResults.star} />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    <h4 className="px-4 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300/60">Career & Location</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <PrefRow label="Preferred Education" value={Array.isArray(profile.partner_preferences.preferred_education) ? profile.partner_preferences.preferred_education.join(", ") : (profile.partner_preferences.preferred_education || "Any")} isMatch={matchResults.education} />
                                                        <PrefRow label="Employment Type" value={profile.partner_preferences.preferred_employment_type} isMatch={matchResults.employment} />
                                                        <PrefRow label="Ideal Occupation" value={Array.isArray(profile.partner_preferences.preferred_occupation) ? profile.partner_preferences.preferred_occupation.join(", ") : (profile.partner_preferences.preferred_occupation || "Any")} isMatch={matchResults.occupation} />
                                                        <PrefRow label="Location" value={profile.partner_preferences.preferred_location || "Open to any location"} isMatch={matchResults.location} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMessageDialogOpen && (
                    <MessageDialog
                        isOpen={isMessageDialogOpen}
                        onOpenChange={setIsMessageDialogOpen}
                        receiverId={targetUserId}
                        receiverName={profile.name || profile.userName || "this member"}
                        senderId={currentUserId || ""}
                        isPremium={isViewerPremium}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function DetailRow({ label, value, isLocked, isPremiumViewer }: { label: string, value?: string | number | null, isLocked?: boolean, isPremiumViewer?: boolean }) {
    const [revealed, setRevealed] = useState(false)
    
    const renderValue = () => {
        if (!value) return <span className="text-gray-400 italic font-medium">Not specified</span>
        
        if (isLocked) {
            if (isPremiumViewer && revealed) {
                return (
                    <span className="text-[13px] font-bold text-gray-900 break-words flex items-center gap-2">
                        {value}
                        <button onClick={() => setRevealed(false)} className="text-[10px] text-gray-400 hover:text-gray-600">(hide)</button>
                    </span>
                )
            }
            
            if (isPremiumViewer && !revealed) {
                return (
                    <button
                        onClick={() => setRevealed(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-200/50 text-amber-700 text-[11px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all group/reveal"
                    >
                        <Crown className="h-3 w-3 text-yellow-500 group-hover/reveal:scale-110 transition-transform" />
                        Tap to reveal
                    </button>
                )
            }

            return (
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 rounded-xl border border-gray-200 text-gray-500 text-[11px] font-black uppercase tracking-widest shadow-sm"
                >
                    <Lock className="h-3 w-3" />
                    Locked
                </button>
            )
        }
        
        return <span className="text-[13px] font-bold text-gray-900 break-words">{value}</span>
    }

    return (
        <div className="grid grid-cols-[140px_10px_auto] sm:grid-cols-[200px_10px_auto] items-center py-3 group/item">
            <span className="text-[13px] font-medium text-gray-800">{label}</span>
            <span className="text-[13px] font-bold text-gray-800 text-center">:</span>
            {renderValue()}
        </div>
    )
}

function SummaryRow({ label, value }: { label: string, value?: string | null }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{value || "Not specified"}</p>
        </div>
    )
}

function PrefRow({ label, value, isMatch }: { label: string, value?: string | number | null, isMatch?: boolean }) {
    const isUnspecified = !value || value === "Open / Any" || value === "Any" || value === "Any / Any" || value === "Any, Any" || value.toString().includes("Any") || value.toString().includes("Open");

    return (
        <div className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 group/pref hover:bg-white/5 px-6 rounded-2xl transition-all duration-300">
            <div className="flex items-center gap-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                    isUnspecified ? 'bg-white/5 text-white/20' : 
                    isMatch ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10' : 
                    'bg-rose-500/20 text-rose-400 shadow-rose-500/10'
                }`}>
                    {isUnspecified ? <Info className="h-4 w-4" /> : 
                     isMatch ? <CheckCircle2 className="h-5 w-5" /> : 
                     <UserX className="h-5 w-5" />}
                </div>
                <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.2em] group-hover/pref:text-pink-300 transition-colors">{label}</span>
            </div>
            <span className={`text-[15px] font-black text-white leading-relaxed tracking-tight text-right`}>
                {value || "Open / Any"}
            </span>
        </div>
    )
}
