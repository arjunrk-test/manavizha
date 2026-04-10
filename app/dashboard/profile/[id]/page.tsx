"use client"

import { supabase } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { 
    ArrowLeft, MapPin, Briefcase, User, GraduationCap, ArrowRight,
    Heart, Star, CheckCircle2, Phone, MessageCircle, Lock,
    Calendar, Coffee, Eye, Info, Users, Shield, Sparkles, XCircle, Home,
    Search, Target, Award, HeartHandshake, MoreVertical, UserX, UserMinus, Crown, Gem, Bookmark, ShieldCheck
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
            
            // If they already liked us, our reciprocal like should be 'accepted' immediately
            const status = (!isLiked && likedMeDate) ? 'accepted' : undefined
            
            const res = await fetch("/api/likes", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    userId: currentUserId, 
                    likedUserId: targetUserId,
                    status
                }),
            })
            if (res.ok) {
                const newLikedState = !isLiked
                setIsLiked(newLikedState)
                setILikedDate(newLikedState ? new Date().toISOString() : null)
                setILikedStatus(newLikedState ? (status || 'pending') : null)
                
                // If it was an acceptance, we are now mutual
                if (newLikedState && (status === 'accepted' || likedMeStatus === 'accepted')) {
                    setIsMutual(true)
                } else if (!newLikedState) {
                    setIsMutual(false)
                }

                toast.success(newLikedState ? "Interest sent! We'll notify them." : "Interest withdrawn.")
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
                const newShortState = !isShortlisted
                setIsShortlisted(newShortState)
                setShortlistedDate(newShortState ? new Date().toISOString() : null)
                toast.success(newShortState ? "Profile shortlisted!" : "Removed from shortlist.")
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

    const formatSiblings = () => {
        const count = profile.family?.siblings;
        const details = profile.family?.sibling_details;
        
        if (!details || !Array.isArray(details) || details.length === 0) {
            return count ? `${count} Sibling${count > 1 ? 's' : ''}` : "None";
        }

        const countsByRelation: Record<string, number> = {};
        details.forEach((s: any) => {
            const rel = s.relation?.toLowerCase() || 'sibling';
            const status = s.maritalStatus?.toLowerCase() || 'unmarried';
            const key = `${rel} (${status})`;
            countsByRelation[key] = (countsByRelation[key] || 0) + 1;
        });

        const parts = Object.entries(countsByRelation).map(([label, count]) => `${count} ${label}`);
        return `${count || details.length} Siblings: ${parts.join(', ')}`;
    };

    return (
        <div className="min-h-screen pb-24 relative">
            {/* Homepage-style Premium Background - Deepened */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A3060]/40 via-[#4B0082]/40 via-[#FF1493]/40 to-[#FFA500]/40 bg-[length:200%_auto] animate-gradient" />
                <div className="absolute inset-0 bg-[#FAFAFA]/40" />
                
                {/* Deeper Floating Glow Orbs */}
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#4B0082]/20 rounded-full blur-[140px] animate-float" />
                <div className="absolute top-1/2 -right-32 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: '-10s' }} />
                <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px]" />
            </div>

            {/* Header: Identity & Status Overview (Integrated) */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] items-end gap-16">
                    
                    {/* Left Column: Name and Subtitle */}
                    <div className="space-y-6 min-w-0">
                        <div className="space-y-6">
                            {/* Top Accent Row: Badges & Status */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 backdrop-blur-md rounded-full border border-white/50 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Now</span>
                                </div>
                                <div className="h-7 px-3 rounded-full bg-[#F3F4FF] text-[#4B0082] text-[9px] font-black flex items-center tracking-widest uppercase border border-[#E0E2FF]">
                                    <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Verified
                                </div>
                                {profile.isPremium && (
                                    <div className={`h-7 px-3 rounded-full text-white text-[9px] font-black flex items-center tracking-widest uppercase shadow-md ${
                                        profile.premiumPlan === 'elite' ? 'bg-[#4B0082]' : 
                                        profile.premiumPlan === 'prime_gold' ? 'bg-amber-500' : 'bg-pink-500'
                                    }`}>
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
                                    <span className="text-gray-500/60 lowercase">Created by <span className="text-[#4B0082] font-black uppercase text-xs tracking-widest">{profile.created_by || "Self"}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interaction Dates + Action Buttons */}
                    <div className="flex flex-col items-end gap-10">
                        {/* Stacked Interaction Statuses */}
                        <div className="space-y-4 text-right">
                            {shortlistedMeDate && (
                                <div className="flex items-center justify-end gap-3 text-[10.5px] font-medium uppercase tracking-widest text-gray-400">
                                    <Bookmark className="h-4 w-4" />
                                    <span>{profile.gender === 'male' ? 'He' : 'She'} shortlisted you on {formatToDDMMYYYY(shortlistedMeDate).replace(/-/g, '.')}</span>
                                </div>
                            )}
                            {iLikedDate && (
                                <div className="flex items-center justify-end gap-3 text-[10.5px] font-medium uppercase tracking-widest text-gray-400">
                                    <Heart className="h-4 w-4" />
                                    <span>You sent {profile.gender === 'male' ? 'him' : 'her'} an interest — {formatToDDMMYYYY(iLikedDate).replace(/-/g, '.')}</span>
                                </div>
                            )}
                            {lastViewedMeDate && (
                                <div className="flex items-center justify-end gap-3 text-[10.5px] font-medium uppercase tracking-widest text-gray-400">
                                    <Eye className="h-4 w-4" />
                                    <span>Profile viewed you {formatToDDMMYYYY(lastViewedMeDate).replace(/-/g, '.')}</span>
                                </div>
                            )}
                        </div>

                        {/* Button Action Bar */}
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={handleShortlist}
                                className={`h-[3.5rem] px-8 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all group ${
                                    isShortlisted 
                                    ? 'bg-[#4B0082] text-white hover:bg-[#3B0062] shadow-[#4B0082]/20' 
                                    : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                                }`}
                            >
                                <Bookmark className={`h-4 w-4 mr-2 transition-transform group-hover:scale-110 ${isShortlisted ? 'fill-current' : ''}`} />
                                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                            </Button>
                            <Button
                                onClick={() => (isLiked || isMutual) ? handleSendMessage() : handleLike()}
                                className="h-[3.5rem] px-10 rounded-full bg-[#FF4500] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <MessageCircle className="h-4 w-4 mr-3" />
                                {(isLiked || isMutual) ? 'Send Message' : 'Send Interest'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-[3.5rem] w-[3.5rem] rounded-full bg-white border-gray-100 shadow-lg hover:bg-gray-50 transition-all text-gray-900">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 z-50 shadow-2xl border-none">
                                    <DropdownMenuItem onClick={handleIgnore} className="rounded-2xl p-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest cursor-pointer">
                                        <UserMinus className="h-5 w-5 mr-3" /> Skip Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleBlock} className="rounded-2xl p-4 text-rose-500 font-bold text-[10px] uppercase tracking-widest cursor-pointer">
                                        <UserX className="h-5 w-5 mr-3" /> Block Member
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    
                    {/* Left Column (Sidebar) */}
                    <div className="w-full lg:w-[380px] space-y-10 shrink-0 lg:sticky lg:top-8">
                        {/* Photo Carousel: Rectangular with top indicators */}
                        <div className="space-y-6">
                            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-100 shadow-2xl group border-8 border-white">
                                {/* Top Indicators (Progress Bars) */}
                                <div className="absolute top-6 inset-x-8 flex gap-2 z-20">
                                    {photos.map((_, i) => (
                                        <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className={`h-full bg-white transition-all duration-300 ${i === currentPhotoIndex ? 'w-full' : 'w-0'}`} />
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
                                            className="w-full h-full object-cover"
                                        />
                                    </AnimatePresence>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <User className="h-20 w-20 text-gray-200" />
                                    </div>
                                )}

                                {/* Simple Arrows */}
                                {photos.length > 1 && (
                                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => setCurrentPhotoIndex(prev => (prev - 1 + photos.length) % photos.length)} className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40"><ArrowLeft className="h-5 w-5" /></button>
                                        <button onClick={() => setCurrentPhotoIndex(prev => (prev + 1) % photos.length)} className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40"><ArrowRight className="h-5 w-5" /></button>
                                    </div>
                                )}
                            </div>

                            {/* Mini Thumbnails */}
                            {photos.length > 1 && (
                                <div className="flex gap-3 px-2">
                                    {photos.map((p, i) => (
                                        <button key={i} onClick={() => setCurrentPhotoIndex(i)} className={`w-14 h-14 rounded-2xl overflow-hidden border-4 transition-all ${i === currentPhotoIndex ? 'border-[#4B0082] scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                            <img src={p} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Main Content) */}
                    <div className="flex-1 min-w-0 space-y-12 pb-24">
                        
                        {/* 1. Heritage & Personal Details */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#4B0082]">
                                    <User className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Personal Profile</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow label="Date of Birth" value={formatToDDMMYYYY(profile.date_of_birth)} />
                                <DetailRow label="Marital Status" value={profile.marital_status} />
                                <DetailRow label="Mother Tongue" value={profile.languages?.[0] || profile.mother_tongue} />
                                <DetailRow label="Height" value={detailedHeight || profile.height} />
                                <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                                <DetailRow label="Physical Status" value={profile.physical_status || "Normal"} />
                                <DetailRow label="Complexion" value={profile.skin_color} />
                                <DetailRow label="Build" value={profile.body_type} />
                                <DetailRow label="Food Preference" value={profile.food_preference} />
                            </div>
                        </div>

                        {/* 2. Family Details Card */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Family Details</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
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
                            </div>
                        </div>                        {/* About Family & Self Sections (Uniform Width Stack) */}
                        <div className="space-y-12">
                            {profile.about && (
                                <div className="bg-white rounded-[3rem] p-8 space-y-4 border border-gray-50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">About Myself</h3>
                                    </div>
                                    <p className="text-lg font-light leading-relaxed text-gray-900 italic border-l-4 border-indigo-50 pl-6">
                                        "{profile.about}"
                                    </p>
                                </div>
                            )}
                            {profile.family?.family_description && (
                                <div className="bg-white rounded-[3rem] p-8 space-y-4 border border-gray-50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-2xl" />
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">About My Family</h3>
                                    </div>
                                    <p className="text-lg font-light leading-relaxed text-gray-900 border-l-4 border-amber-50 pl-6">
                                        {profile.family.family_description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 3. Education & Career Card */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Education & Career</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                {profile.education?.map((edu: any, idx: number) => (
                                    <DetailRow key={idx} label={`Education ${idx + 1}`} value={`${edu.education}${edu.institution ? ` at ${edu.institution}` : ''}`} />
                                ))}
                                <DetailRow label="Current Occupation" value={profile.profession?.designation || profile.professionType} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label={profile.professionType === 'employee' ? "Sector" : "Business Type"} value={profile.profession?.sector || profile.profession?.business_type} />
                                <DetailRow label={profile.professionType === 'business' ? "Business Name" : "Company Name"} value={profile.profession?.business_name || profile.profession?.company} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow 
                                    label={profile.professionType === 'business' ? "Annual Revenue" : "Annual Salary"} 
                                    value={profile.profession?.revenue_range || profile.profession?.salary_range || profile.profession?.annual_returns || profile.profession?.salary} 
                                    isLocked={true} 
                                    isPremiumViewer={isViewerPremium} 
                                />
                                <DetailRow label="Work Location" value={profile.profession?.work_location || profile.profession?.business_location} />
                            </div>
                        </div>

                        {/* 4. Horoscope & Astrology Card */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Horoscope & Astrology</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow label="Star" value={profile.horoscope?.star} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Raasi" value={profile.horoscope?.zodiac_sign} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Lagnam" value={profile.horoscope?.lagnam} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Dosha(m)" value={profile.horoscope?.dhosham || "No Dosham"} isLocked={true} isPremiumViewer={isViewerPremium} />
                                {profile.horoscope?.jaadhagam_url && (
                                    <DetailRow 
                                        label="Horoscope Chart (Jaadhagam)" 
                                        value={<a href={profile.horoscope.jaadhagam_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Chart</a>} 
                                        isLocked={true} 
                                        isPremiumViewer={isViewerPremium} 
                                    />
                                )}
                                <DetailRow label="Place of Birth" value={profile.horoscope?.place_of_birth} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Time of Birth" value={profile.horoscope?.time_of_birth} isLocked={true} isPremiumViewer={isViewerPremium} />
                            </div>
                        </div>

                        {/* 5. Lifestyle & Interests Card */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                                    <HeartHandshake className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Lifestyle & Habits</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
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
                                                <span key={i} className="px-5 py-2.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                                    {int}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-300 text-[10px] font-bold uppercase italic">No interests shared</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Contact Information Card */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Contact & Location</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow label="Phone Number" value={profile.contact?.phone || profile.phone} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="WhatsApp" value={profile.contact?.whatsapp_number || profile.phone} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow 
                                    label="Address" 
                                    value={[profile.contact?.current_address_line1, profile.contact?.current_area, profile.contact?.current_district, profile.contact?.current_state].filter(Boolean).join(", ")} 
                                    isLocked={true} 
                                    isPremiumViewer={isViewerPremium} 
                                />
                            </div>
                        </div>

                        {/* 7. Partner Preferences */}
                        {profile.partner_preferences && (
                            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 relative overflow-hidden group space-y-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-50/20 transition-all duration-1000" />
                                <div className="relative z-10 space-y-10">
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Target className="h-5 w-5" />
                                            </div>
                                            <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]">Partner Preferences</h2>
                                        </div>
                                        {!isOwnProfile && (
                                            <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 opacity-60">Match Score</p>
                                                    <p className="text-2xl font-black text-gray-900">{matchScore.matches}<span className="text-gray-200">/</span>{matchScore.total}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                                    <Heart className="h-5 w-5 fill-current text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <PrefRow label="Preferred Age" value={`${profile.partner_preferences.preferred_age_min || 18} to ${profile.partner_preferences.preferred_age_max || 70} years`} isMatch={matchResults.age} />
                                        <PrefRow label="Preferred Height" value={`${profile.partner_preferences.preferred_height_min ? Math.floor(parseInt(profile.partner_preferences.preferred_height_min)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_min)/2.54)%12)+"\"" : 'Any'} - ${profile.partner_preferences.preferred_height_max ? Math.floor(parseInt(profile.partner_preferences.preferred_height_max)/30.48)+"'"+Math.round((parseInt(profile.partner_preferences.preferred_height_max)/2.54)%12)+"\"" : 'Any'}`} isMatch={matchResults.height} />
                                        <PrefRow label="Marital Status" value={profile.partner_preferences.preferred_marital_status} isMatch={matchResults.marital} />
                                        <PrefRow label="Religion / Caste" value={profile.partner_preferences.preferred_religion === 'Any' || !profile.partner_preferences.preferred_religion ? 'Open / Any' : `${profile.partner_preferences.preferred_religion} / ${profile.partner_preferences.preferred_caste || 'Any'}`} isMatch={matchResults.religion} />
                                        <PrefRow label="Education" value={Array.isArray(profile.partner_preferences.preferred_education) ? profile.partner_preferences.preferred_education.join(", ") : (profile.partner_preferences.preferred_education || "Any")} isMatch={matchResults.education} />
                                        <PrefRow label="Occupation" value={Array.isArray(profile.partner_preferences.preferred_occupation) ? profile.partner_preferences.preferred_occupation.join(", ") : (profile.partner_preferences.preferred_occupation || "Any")} isMatch={matchResults.occupation} />
                                        <PrefRow label="Location" value={profile.partner_preferences.preferred_location || "Any Location"} isMatch={matchResults.location} />
                                    </div>
                                </div>
                            </div>
                        )}
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
            </div>
        </div>
    )
}

function DetailRow({ label, value, isLocked, isPremiumViewer, compact }: { label: string, value?: React.ReactNode, isLocked?: boolean, isPremiumViewer?: boolean, compact?: boolean }) {
    const [revealed, setRevealed] = useState(false)
    
    const renderValue = () => {
        if (!value) return <span className="text-gray-300 italic font-medium">Not specified</span>
        
        if (isLocked) {
            if (isPremiumViewer && revealed) {
                return (
                    <span className="text-sm font-bold text-[#1A1A1A] break-words flex items-center gap-2">
                        {value}
                        <button onClick={() => setRevealed(false)} className="text-[9px] text-[#4B0082] hover:underline uppercase tracking-widest font-black">Hide</button>
                    </span>
                )
            }
            
            if (isPremiumViewer && !revealed) {
                return (
                    <button
                        onClick={() => setRevealed(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-[#F3F4FF] rounded-lg border border-[#E0E2FF] text-[#4B0082] text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-[#E0E2FF] transition-all"
                    >
                        <Crown className="h-3 w-3" />
                        Reveal
                    </button>
                )
            }

            return (
                <div className="flex items-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-widest">
                    <Lock className="h-3 w-3" /> Locked
                </div>
            )
        }
        
        return <span className={`font-bold text-[#1A1A1A] tracking-tight whitespace-normal break-words ${compact ? 'text-[13px]' : 'text-sm'}`}>{value}</span>
    }

    if (compact) {
        return (
            <div className="space-y-1 group/item">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
                <div className="flex items-center justify-between gap-4">
                    {renderValue()}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors px-1 -mx-1 rounded-lg group/item">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
            <div className="text-right">
                {renderValue()}
            </div>
        </div>
    )
}

function SummaryRow({ label, value }: { label: string, value?: string | null }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-[13px] font-bold text-gray-900">{value || "Not specified"}</p>
        </div>
    )
}

function PrefRow({ label, value, isMatch }: { label: string, value?: string | number | null, isMatch?: boolean }) {
    const isUnspecified = !value || value === "Open / Any" || value === "Any" || value === "Any / Any" || value === "Any, Any" || value.toString().includes("Any") || value.toString().includes("Open");

    return (
        <div className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors group/row">
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUnspecified ? 'bg-gray-100 text-gray-300' : 
                    isMatch ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                    'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                }`}>
                    {isUnspecified ? <Info className="h-4 w-4" /> : 
                     isMatch ? <CheckCircle2 className="h-4 w-4" /> : 
                     <UserX className="h-4 w-4" />}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/row:text-gray-900 transition-colors">{label}</span>
            </div>
            <span className="text-[13px] font-bold text-[#1A1A1A] tracking-tight text-right ml-4">
                {value || "Open / Any"}
            </span>
        </div>
    )
}
