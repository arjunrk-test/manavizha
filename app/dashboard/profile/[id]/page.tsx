"use client"

import { supabase } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { 
    ArrowLeft, MapPin, Briefcase, User, GraduationCap, ArrowRight,
    Heart, Star, CheckCircle2, Phone, MessageCircle, Lock,
    Calendar, Coffee, Eye, Info, Users, Shield, Sparkles, XCircle, Home,
    Search, Target, Award, HeartHandshake, MoreVertical, UserX, UserMinus, Crown, Gem
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
                        setIsLiked(likesData.iLikedIds?.includes(targetUserId))
                        setIsMutual(likesData.iLikedIds?.includes(targetUserId) && likesData.likedMeIds?.includes(targetUserId))
                    }
                    
                    if (shortRes.ok) {
                        const shortData = await shortRes.json()
                        setIsShortlisted(shortData.shortlistedIds?.includes(targetUserId))
                    }

                    if (settingsRes.data) {
                        setIsViewerPremium(settingsRes.data.is_premium)
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
                            if (!prefs.preferred_occupation || 
                                emp?.designation === prefs.preferred_occupation || 
                                bus?.designation === prefs.preferred_occupation) matches++
                                
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
                                occupation: !!(!prefs.preferred_occupation || emp?.designation === prefs.preferred_occupation || bus?.designation === prefs.preferred_occupation),
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
                setIsLiked(!isLiked)
                toast.success(isLiked ? "Interest removed" : "Interest expressed!")
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
                setIsShortlisted(!isShortlisted)
                toast.success(isShortlisted ? "Removed from list" : "Saved to shortlist!")
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
        if (isViewerPremium || isMutual) {
            // Open message dialog logic
            setIsMessageDialogOpen(true)
        } else {
            toast.error("Premium Feature or Mutual Match required", {
                description: "Upgrade to Premium to message anyone directly, or wait for a mutual interest match."
            })
        }
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

                    <div className="flex gap-5 w-full md:w-auto items-center">
                        <Button 
                            onClick={handleShortlist}
                            disabled={isShortlistProcessing}
                            variant="outline"
                            className={`flex-1 md:flex-none h-16 px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] border-none shadow-2xl transition-all duration-500 hover:scale-105 ${isShortlisted ? 'bg-amber-500 text-white shadow-amber-500/30' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Star className={`h-5 w-5 mr-3 ${isShortlisted ? 'fill-white' : ''}`} />
                            {isShortlisted ? 'Saved' : 'Save'}
                        </Button>
                        <Button 
                            onClick={handleLike}
                            disabled={isLikeProcessing}
                            className={`flex-1 md:flex-none h-16 px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 hover:scale-105 ${isLiked ? 'bg-indigo-900 text-white shadow-indigo-900/30' : 'bg-[#4B0082] hover:bg-[#3b0062] text-white shadow-indigo-500/30'}`}
                        >
                            <Heart className={`h-5 w-5 mr-3 ${isLiked ? 'fill-white' : ''}`} />
                            {isLiked ? 'Interested' : 'Send Interest'}
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
                                    <DetailRow label="Languages" value={Array.isArray(profile.languages) ? profile.languages.join(", ") : profile.languages} />
                    <div className="lg:col-span-8 space-y-6">

                        {/* Personal Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-rose-50/60 to-white">
                                <div className="w-8 h-8 rounded-full border border-rose-200 flex items-center justify-center shrink-0 text-rose-500 bg-white shadow-sm">
                                    <User className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 tracking-tight">Personal Information</h2>
                            </div>
                            <div className="px-6 py-4 space-y-0 text-sm">
                                <DetailRow label="Age" value={detailedAge} />
                                <DetailRow label="Height" value={detailedHeight} />
                                <DetailRow label="Weight" value={profile.weight ? `${profile.weight} Kg` : null} />
                                <DetailRow label="Body Type" value={profile.body_type} />
                                <DetailRow label="Mother Tongue" value={profile.mother_tongue || (profile.religion === 'Christian' ? 'Malayalam' : 'Tamil')} />
                                <DetailRow label="Spoken Language" value={Array.isArray(profile.languages) ? profile.languages.join(", ") : profile.languages} />
                                <DetailRow label="Profile Created By" value={profile.created_by || "Self"} />
                                <DetailRow label="Marital Status" value={profile.marital_status} />
                                <DetailRow label="Lives In" value={profile.location} />
                                <DetailRow label="Eating Habits" value={profile.food_preference} />
                                <DetailRow label="Religion" value={profile.religion || "Hindu"} />
                                <DetailRow label="Caste" value={profile.family?.caste || profile.caste} />
                                <DetailRow label="Subcaste" value={profile.subcaste} />
                                <DetailRow label="Gothra(m)" value={profile.family?.gotram} />
                                <DetailRow label="Dosha(m)" value={profile.horoscope?.dhosham || "No Dosham"} />
                            </div>
                        </div>

                        {/* Horoscope & Astrology Card — Premium Gated */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-indigo-50/60 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-500 bg-white shadow-sm">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-gray-900 tracking-tight">Horoscope & Astrology</h2>
                                </div>
                                {!isViewerPremium && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Crown className="h-2.5 w-2.5" /> Premium
                                    </span>
                                )}
                                {isViewerPremium && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Crown className="h-2.5 w-2.5" /> Your Benefit
                                    </span>
                                )}
                            </div>
                            <div className="px-6 py-4 space-y-0 text-sm">
                                <DetailRow label="Date Of Birth" value={formatToDDMMYYYY(profile.date_of_birth)} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Star" value={profile.horoscope?.star} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Raasi" value={profile.horoscope?.zodiac_sign} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Horoscope" value={profile.horoscope?.lagnam ? "Available" : null} isLocked={true} isPremiumViewer={isViewerPremium} />
                            </div>
                        </div>

                        {/* Education & Career Card — Premium Gated */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-emerald-50/60 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600 bg-white shadow-sm">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-gray-900 tracking-tight">Education & Career</h2>
                                </div>
                                {!isViewerPremium && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Crown className="h-2.5 w-2.5" /> Premium
                                    </span>
                                )}
                                {isViewerPremium && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Crown className="h-2.5 w-2.5" /> Your Benefit
                                    </span>
                                )}
                            </div>
                            <div className="px-6 py-4 space-y-0 text-sm">
                                <DetailRow label="Employment" value={profile.professionType ? `Employed in ${profile.professionType}` : null} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Education" value={profile.education?.[0]?.education} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Occupation" value={profile.professionDetails?.designation || profile.professionType} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Studied at" value={profile.education?.[0]?.institution} isLocked={true} isPremiumViewer={isViewerPremium} />
                            </div>
                        </div>

                        {/* Family Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-amber-50/50 to-white">
                                <div className="w-8 h-8 rounded-full border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 bg-white shadow-sm">
                                    <Home className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 tracking-tight">Family Information</h2>
                            </div>
                            <div className="px-6 py-4 space-y-0 text-sm">
                                <DetailRow label="Parents" value={profile.family?.father_occupation ? `Father is a ${profile.family.father_occupation}${profile.family.mother_occupation ? `, Mother is a ${profile.family.mother_occupation}` : ''}` : null} />
                                <DetailRow label="Siblings" value={profile.family?.siblings} />
                                <DetailRow label="Ancestral Origin" value={profile.family?.ancestral_origin} />
                                <DetailRow label="Family Type" value={profile.family?.family_type} />
                            </div>
                        </div>

                        {/* Contact Information Card — Premium Gated */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-sky-50/60 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-sky-200 flex items-center justify-center shrink-0 text-sky-600 bg-white shadow-sm">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-gray-900 tracking-tight">Contact Information</h2>
                                </div>
                                {!isViewerPremium && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Crown className="h-2.5 w-2.5" /> Premium
                                    </span>
                                )}
                                {isViewerPremium && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Crown className="h-2.5 w-2.5" /> Your Benefit
                                    </span>
                                )}
                            </div>
                            <div className="px-6 py-4 space-y-0 text-sm">
                                <DetailRow label="Mobile Number" value={profile.contact?.mobile_phone || profile.phone} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Email" value={profile.email} isLocked={true} isPremiumViewer={isViewerPremium} />
                            </div>
                        </div>

                        {/* About Myself Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-rose-50/60 to-white">
                                <div className="w-8 h-8 rounded-full border border-rose-200 flex items-center justify-center shrink-0 text-rose-500 bg-white shadow-sm">
                                    <User className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 tracking-tight">About Myself</h2>
                            </div>
                            <div className="px-6 py-4">
                                <p className="text-[14px] leading-relaxed text-gray-700">
                                    {profile.about || `I am making this profile for my ${(profile.created_by || 'relative').toLowerCase()}. They completed their education and currently work as a ${profile.professionDetails?.designation || 'professional'} in ${profile.location?.split(',')[0] || 'their city'}. We belong to a good family with traditional values.`}
                                </p>
                            </div>
                        </div>

                        {/* Lifestyle Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-purple-50/50 to-white">
                                <div className="w-8 h-8 rounded-full border border-purple-200 flex items-center justify-center shrink-0 text-purple-500 bg-white shadow-sm">
                                    <Coffee className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 tracking-tight">Lifestyle</h2>
                            </div>
                            <div className="px-6 py-4 space-y-0 text-sm">
                                <DetailRow label="Cuisine" value={profile.food_preference === 'Non-Vegetarian' ? 'Continental, South Indian, Non-Veg' : 'South Indian, Vegetarian'} />
                                <DetailRow label="Hobbies" value={Array.isArray(profile.interests?.hobbies) ? profile.interests.hobbies.join(" / ") : profile.interests?.hobbies} />
                                <DetailRow label="Movies" value={Array.isArray(profile.interests?.movies) ? profile.interests.movies.join(", ") : profile.interests?.movies} />
                                <DetailRow label="Music" value={Array.isArray(profile.interests?.music) ? profile.interests.music.join(", ") : profile.interests?.music} />
                                <DetailRow label="Sports" value={Array.isArray(profile.interests?.sports) ? profile.interests.sports.join(" / ") : profile.interests?.sports} />
                                <DetailRow label="Smoking Habits" value={profile.social?.smoking} />
                                <DetailRow label="Drinking Habits" value={profile.social?.drinking} />
                            </div>
                        </div>

                        {/* Dedicated Partner Preferences Section */}
                        {profile.partner_preferences && (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-10">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">✨ {isOwnProfile ? 'My' : (profile.gender === 'Female' ? 'Her' : 'His')} Partner Preferences ✨</h2>
                                </div>

                                {/* Match Banner */}
                                {!isOwnProfile && (
                                    <div className="rounded-2xl p-4 flex items-center justify-between mb-8 shadow-inner relative overflow-hidden"
                                         style={{ background: 'linear-gradient(280deg, rgba(240,230,255,1) 0%, rgba(255,255,255,1) 100%)', border: '1px solid #7E22CE' }}>

                                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden border-2 border-white shadow-sm z-10">
                                        {photos.length > 0 ? (
                                            <img src={photos[0]} alt="Target Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-full h-full p-2 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-center z-10">
                                        <p className="text-[14px] font-bold text-gray-800">
                                            You match <span className="text-[#7E22CE]">{matchScore.matches}/{matchScore.total}</span> of {profile.gender === 'Female' ? 'her' : 'his'} preferences
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden border-2 border-white shadow-sm z-10">
                                        {viewerProfile?.photos?.[0] ? (
                                            <img src={viewerProfile.photos[0]} alt="Viewer" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-full h-full p-2 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                )}

                                <div className="space-y-6">
                                    {/* Basic Preferences */}
                                    <div>
                                        <div className="bg-rose-50/80 px-4 py-2.5 rounded-xl flex justify-between items-center mb-2">
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Basic Preferences</h3>
                                            {!isOwnProfile && <span className="text-[11px] font-bold text-gray-500 uppercase">You match</span>}
                                        </div>
                                        <div className="px-2">
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Groom's Age" value={`${profile.partner_preferences.preferred_age_min || 18} - ${profile.partner_preferences.preferred_age_max || 70} yrs`} isMatch={matchResults.age} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Height" value={`${profile.partner_preferences.preferred_height_min ? Math.floor(parseInt(profile.partner_preferences.preferred_height_min) / 30.48) + "'" + Math.round((parseInt(profile.partner_preferences.preferred_height_min) / 2.54) % 12) + '"' : 'Any'} - ${profile.partner_preferences.preferred_height_max ? Math.floor(parseInt(profile.partner_preferences.preferred_height_max) / 30.48) + "'" + Math.round((parseInt(profile.partner_preferences.preferred_height_max) / 2.54) % 12) + '"' : 'Any'}`} isMatch={matchResults.height} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Marital Status" value={profile.partner_preferences.preferred_marital_status} isMatch={matchResults.marital} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Mother Tongue" value={profile.partner_preferences.preferred_mother_tongue} isMatch={matchResults.motherTongue} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Physical Status" value={profile.partner_preferences.preferred_physical_status} isMatch={matchResults.physical} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Eating Habits" value={profile.partner_preferences.preferred_eating_habits} isMatch={matchResults.eating} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Smoking Habits" value={profile.partner_preferences.preferred_smoking_habits} isMatch={matchResults.smoking} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Drinking Habits" value={profile.partner_preferences.preferred_drinking_habits} isMatch={matchResults.drinking} />
                                        </div>
                                    </div>

                                    {/* Religious Preferences */}
                                    <div>
                                        <div className="bg-rose-50/80 px-4 py-2.5 rounded-xl mb-2">
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Religious Preferences</h3>
                                        </div>
                                        <div className="px-2">
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Religion" value={profile.partner_preferences.preferred_religion} isMatch={matchResults.religion} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Caste" value={profile.partner_preferences.preferred_caste} isMatch={matchResults.caste} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Subcaste" value={profile.partner_preferences.preferred_subcaste} isMatch={matchResults.subcaste} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Star" value={profile.partner_preferences.preferred_star} isMatch={matchResults.star} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Dosham" value={profile.partner_preferences.preferred_dosham} isMatch={matchResults.dosham} />
                                        </div>
                                    </div>

                                <div className="bg-gradient-to-br from-[#4B0082] to-[#3a0066] rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                                    {/* Abstract shapes for design */}
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
                                                        Seeking a potential life partner with these values
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-white/60 text-sm max-w-md md:text-right leading-relaxed font-medium">
                                                Here is a detailed look at who {profile.name || "this member"} is looking for as a potential life match.
                                            </p>
                                    {/* Professional Preferences */}
                                    <div>
                                        <div className="bg-rose-50/80 px-4 py-2.5 rounded-xl mb-2">
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Professional Preferences</h3>
                                        </div>
                                        <div className="px-2">
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Education" value={profile.partner_preferences.preferred_education} isMatch={matchResults.education} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Employment Type" value={profile.partner_preferences.preferred_employment_type} isMatch={matchResults.employment} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Occupation" value={profile.partner_preferences.preferred_occupation} isMatch={matchResults.occupation} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Annual Income" value={profile.partner_preferences.preferred_annual_income ? `Rs. ${profile.partner_preferences.preferred_annual_income} Lakhs and above` : "Any"} isMatch={matchResults.income} />
                                        </div>
                                    </div>

                                        <div className="bg-white/5 backdrop-blur-sm p-8 sm:p-14 rounded-[3.5rem] border border-white/10 flex flex-col gap-12">
                                             {/* Sub-section 1: Basic Compatibility */}
                                             <div className="space-y-4">
                                                 <h4 className="px-4 text-[11px] font-black uppercase tracking-[0.3em] text-pink-300/60">Basic Consistency</h4>
                                                 <div className="grid grid-cols-1 gap-2">
                                                     <PrefRow label="Preferred Age" value={`${profile.partner_preferences.preferred_age_min || 18} to ${profile.partner_preferences.preferred_age_max || 70} years`} isMatch={matchResults.age} />
                                                     <PrefRow label="Preferred Height" value={`${profile.partner_preferences.preferred_height_min ? Math.floor(parseInt(profile.partner_preferences.preferred_height_min) / 30.48) + "'" + Math.round((parseInt(profile.partner_preferences.preferred_height_min) / 2.54) % 12) + "\"" : 'Any'} - ${profile.partner_preferences.preferred_height_max ? Math.floor(parseInt(profile.partner_preferences.preferred_height_max) / 30.48) + "'" + Math.round((parseInt(profile.partner_preferences.preferred_height_max) / 2.54) % 12) + "\"" : 'Any'}`} isMatch={matchResults.height} />
                                                     <PrefRow label="Marital Status" value={profile.partner_preferences.preferred_marital_status} isMatch={matchResults.marital} />
                                                     <PrefRow label="Physical Status" value={profile.partner_preferences.preferred_physical_status} isMatch={matchResults.physical} />
                                                 </div>
                                             </div>

                                             {/* Sub-section 2: Religious & Background */}
                                             <div className="space-y-4 pt-4 border-t border-white/5">
                                                 <h4 className="px-4 text-[11px] font-black uppercase tracking-[0.3em] text-indigo-300/60">Religious & Background</h4>
                                                 <div className="grid grid-cols-1 gap-2">
                                                     <PrefRow label="Religion / Caste" value={profile.partner_preferences.preferred_religion === 'Any' || !profile.partner_preferences.preferred_religion ? 'Open / Any' : `${profile.partner_preferences.preferred_religion} / ${profile.partner_preferences.preferred_caste || 'Any'}`} isMatch={matchResults.religion} />
                                                     <PrefRow label="Subcaste" value={profile.partner_preferences.preferred_subcaste} isMatch={matchResults.subcaste} />
                                                     <PrefRow label="Mother Tongue" value={profile.partner_preferences.preferred_mother_tongue} isMatch={matchResults.motherTongue} />
                                                     <PrefRow label="Star / Dosham" value={`${profile.partner_preferences.preferred_star || 'Any'} / ${profile.partner_preferences.preferred_dosham || 'Any'}`} isMatch={matchResults.star} />
                                                 </div>
                                             </div>

                                             {/* Sub-section 3: Career & Lifestlye */}
                                             <div className="space-y-4 pt-4 border-t border-white/5">
                                                 <h4 className="px-4 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300/60">Professional & Lifestyle</h4>
                                                 <div className="grid grid-cols-1 gap-2">
                                                     <PrefRow label="Education" value={profile.partner_preferences.preferred_education} isMatch={matchResults.education} />
                                                     <PrefRow label="Employment Type" value={profile.partner_preferences.preferred_employment_type} isMatch={matchResults.employment} />
                                                     <PrefRow label="Occupation" value={profile.partner_preferences.preferred_occupation} isMatch={matchResults.occupation} />
                                                     <PrefRow label="Eating Habits" value={profile.partner_preferences.preferred_eating_habits} isMatch={matchResults.eating} />
                                                     <PrefRow label="Smoking / Drinking" value={`${profile.partner_preferences.preferred_smoking_habits || 'Any'} / ${profile.partner_preferences.preferred_drinking_habits || 'Any'}`} isMatch={matchResults.smoking} />
                                                 </div>
                                             </div>

                                             {/* Sub-section 4: Location */}
                                             <div className="space-y-4 pt-4 border-t border-white/5">
                                                 <h4 className="px-4 text-[11px] font-black uppercase tracking-[0.3em] text-amber-300/60">Geography</h4>
                                                 <div className="grid grid-cols-1 gap-2">
                                                     <PrefRow label="Location" value={`${profile.partner_preferences.preferred_city || 'Any'}, ${profile.partner_preferences.preferred_state || 'Any'}`} isMatch={matchResults.location} />
                                                     <PrefRow label="Citizenship" value={profile.partner_preferences.preferred_citizenship} isMatch={matchResults.citizenship} />
                                                 </div>
                                             </div>
                                         </div>
                                    {/* Location Preferences */}
                                    <div>
                                        <div className="bg-rose-50/80 px-4 py-2.5 rounded-xl mb-2">
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Location Preferences</h3>
                                        </div>
                                        <div className="px-2">
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Country" value={profile.partner_preferences.preferred_country || "India"} isMatch={matchResults.citizenship} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Residing State" value={profile.partner_preferences.preferred_state} isMatch={matchResults.location} />
                                            <PrefRow isOwnProfile={isOwnProfile} label="Preferred Residing City" value={profile.partner_preferences.preferred_city} isMatch={matchResults.location} />
                                        </div>
                                    </div>
                                    
                                    {/* Both of you like */}
                                    {!isOwnProfile && (
                                        <div className="pt-6">
                                            <div className="bg-rose-50/80 px-4 py-2.5 rounded-xl mb-4 flex items-center gap-3">
                                                <div className="bg-white rounded-md p-1 shadow-sm border border-rose-100"><Heart className="h-4 w-4 text-rose-400" fill="currentColor" /></div>
                                                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Both of you like</h3>
                                            </div>
                                            <div className="px-2">
                                                <DetailRow label="Cuisine" value={profile.food_preference === viewerProfile?.food_preference ? profile.food_preference : "South Indian"} />
                                                <DetailRow label="Movies" value={Array.isArray(profile.interests?.movies) ? profile.interests.movies.join(", ") : "Action, Comedy, Horror"} />
                                                <DetailRow label="Music" value={Array.isArray(profile.interests?.music) ? profile.interests.music.join(", ") : "Melodies"} />
                                                <DetailRow label="Sports" value={Array.isArray(profile.interests?.sports) ? profile.interests.sports.join(", ") : "Cycling, Jogging / Walking"} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>

            {/* Message Dialog */}
            <MessageDialog
                isOpen={isMessageDialogOpen}
                onOpenChange={setIsMessageDialogOpen}
                receiverId={targetUserId}
                receiverName={profile.name || profile.userName || "this member"}
                senderId={currentUserId || ""}
                isPremium={isViewerPremium}
            />
        </div>
    )
}

function DetailRow({ label, value, isLocked, isPremiumViewer }: { label: string, value?: string | number | null, isLocked?: boolean, isPremiumViewer?: boolean }) {
    const [revealed, setRevealed] = useState(false)

    if ((value === null || value === undefined || value === "" || value === "Not specified") && !isLocked) {
        return null;
    }

    const renderValue = () => {
        if (!isLocked) {
            return <span className="text-[13px] font-bold text-gray-900">{value}</span>
        }
        if (isPremiumViewer) {
            // Premium user — click to reveal
            if (revealed) {
                return (
                    <span className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
                        {value}
                        <button onClick={() => setRevealed(false)} className="text-[10px] text-gray-300 hover:text-gray-400 ml-1">(hide)</button>
                    </span>
                )
            }
            return (
                <button
                    onClick={() => setRevealed(true)}
                    className="group/reveal flex items-center gap-2 text-[12px] font-bold px-3 py-1 rounded-lg border border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-400 transition-all shadow-sm cursor-pointer"
                >
                    <Crown className="h-3 w-3 text-yellow-500 group-hover/reveal:scale-110 transition-transform" />
                    Tap to reveal
                </button>
            )
        }
        // Non-premium — upgrade CTA
        return (
            <span className="text-[13px] font-semibold text-amber-600 flex items-center cursor-pointer hover:text-amber-700 transition-colors">
                <Lock className="h-3 w-3 mr-1.5" /> Upgrade to view <ArrowRight className="h-3 w-3 ml-1" />
            </span>
        )
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
                    isUnspecified ? 'bg-indigo-500/10 text-indigo-300/40' : 
                    isMatch ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10' : 
                    'bg-rose-500/20 text-rose-400 shadow-rose-500/10'
                }`}>
                    {isUnspecified ? <Info className="h-4 w-4" /> : 
                     isMatch ? <CheckCircle2 className="h-5 w-5" /> : 
                     <UserX className="h-5 w-5" />}
                </div>
                <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.2em] group-hover/pref:text-pink-300 transition-colors">{label}</span>
            </div>
            <span className={`text-[15px] font-black text-white leading-relaxed tracking-tight text-right ${isMatch ? '' : ''}`}>
                {value || "Open / Any"}
            </span>
function PrefRow({ label, value, isMatch, isOwnProfile }: { label: string, value?: string | number | null, isMatch?: boolean, isOwnProfile?: boolean }) {
    const isUnspecified = !value || value === "Open / Any" || value === "Any" || value === "Any / Any" || value === "Any, Any" || value.toString().includes("Any") || value.toString().includes("Open");

    return (
        <div className="grid grid-cols-[220px_1fr_40px] items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors rounded-xl px-2">
            <span className="text-[13px] font-bold text-gray-900">{label}</span>
            <span className="text-[13px] font-semibold text-gray-700">{value || "Any"}</span>
            <div className="flex justify-end pr-2">
                {isOwnProfile ? (
                    <div className="h-5 w-5" />
                ) : isUnspecified ? (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                ) : isMatch ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                )}
            </div>
        </div>
    )
}
