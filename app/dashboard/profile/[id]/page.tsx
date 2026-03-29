"use client"

import { supabase } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { 
    ArrowLeft, MapPin, Briefcase, User, GraduationCap, 
    Heart, Star, CheckCircle2, Phone, MessageCircle,
    Calendar, Coffee, Eye, Info, Users, Shield, Sparkles,
    Search, Target, Award, HeartHandshake, MoreVertical, UserX, UserMinus, Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function ProfileViewPage() {
    const router = useRouter()
    const params = useParams()
    const targetUserId = params.id as string
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [photos, setPhotos] = useState<string[]>([])
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    
    // Interaction & Viewer states
    const [isLiked, setIsLiked] = useState(false)
    const [isShortlisted, setIsShortlisted] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [viewerProfile, setViewerProfile] = useState<any>(null)
    const [matchScore, setMatchScore] = useState<{ matches: number, total: number }>({ matches: 18, total: 21 })

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
                })
                setPhotos(allPhotos)

                // Check initial interaction status & fetch viewer profile for matching
                if (currentUserId) {
                    const [likesRes, shortRes, viewerRes] = await Promise.all([
                        fetch(`/api/likes?userId=${currentUserId}`),
                        fetch(`/api/shortlists?userId=${currentUserId}`),
                        supabase.from("personal_details").select("*").eq("user_id", currentUserId).maybeSingle()
                    ])
                    
                    if (likesRes.ok) {
                        const likesData = await likesRes.json()
                        setIsLiked(likesData.iLikedIds?.includes(targetUserId))
                    }
                    
                    if (shortRes.ok) {
                        const shortData = await shortRes.json()
                        setIsShortlisted(shortData.shortlistedIds?.includes(targetUserId))
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
                        } else {
                            setMatchScore({ matches: 15, total: 21 }) // Default fallback
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
        if (!currentUserId || isProcessing) return
        setIsProcessing(true)
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
            setIsProcessing(false)
        }
    }

    const handleShortlist = async () => {
        if (!currentUserId || isProcessing) return
        setIsProcessing(true)
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
            setIsProcessing(false)
        }
    }

    const handleSendMessage = () => {
        toast.error("Premium Member Feature", {
            description: "Upgrade your account to send direct personalized messages to this profile."
        })
    }

    const handleIgnore = async () => {
        if (!currentUserId || isProcessing) return
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
        if (!currentUserId || isProcessing) return
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
        <div className="min-h-screen pb-24">

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
                {/* 1. Header & Quick Actions Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-gray-100 dark:border-gray-800">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                                {profile.name || profile.userName || "Unknown"}
                            </h1>
                            <div className="h-6 px-3 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center tracking-wider uppercase">
                                <Shield className="h-3 w-3 mr-1.5" /> ID Verified
                            </div>
                        </div>
                        <p className="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400">
                            {detailedAge} • {detailedHeight} • {profile.marital_status} • Created by {profile.created_by || "Self"}
                        </p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto items-center">
                        <Button 
                            onClick={handleShortlist}
                            disabled={isProcessing}
                            variant="outline"
                            className={`flex-1 md:flex-none h-14 px-8 rounded-3xl font-black border-none shadow-xl transition-all ${isShortlisted ? 'bg-amber-50 text-amber-700' : 'bg-white text-gray-700 hover:text-amber-700'}`}
                        >
                            <Star className={`h-5 w-5 mr-3 ${isShortlisted ? 'fill-amber-500 text-amber-500' : ''}`} />
                            {isShortlisted ? 'Saved' : 'Save Profile'}
                        </Button>
                        <Button 
                            onClick={handleLike}
                            disabled={isProcessing}
                            className={`flex-1 md:flex-none h-14 px-8 rounded-3xl font-black shadow-xl transition-all ${isLiked ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#FF1493] hover:bg-[#E01183]'}`}
                        >
                            <Heart className={`h-5 w-5 mr-3 ${isLiked ? 'fill-white' : ''}`} />
                            {isLiked ? 'Interested' : 'Send Interest'}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-none shadow-xl bg-white hover:bg-gray-50 text-gray-700 shrink-0">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 z-50">
                                <DropdownMenuLabel className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={handleSendMessage} className="gap-2 cursor-pointer rounded-xl p-3 focus:bg-[#4B0082]/10 focus:text-[#4B0082] font-semibold">
                                    <MessageCircle className="h-4 w-4" /> Send Message
                                    <Crown className="h-3 w-3 ml-auto text-amber-500" />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1" />
                                <DropdownMenuLabel className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mt-1">Restrict</DropdownMenuLabel>
                                <DropdownMenuItem onClick={handleIgnore} className="gap-2 cursor-pointer rounded-xl p-3 focus:bg-gray-100 text-gray-600 font-medium">
                                    <UserMinus className="h-4 w-4" /> Ignore Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleBlock} className="gap-2 cursor-pointer rounded-xl p-3 focus:bg-rose-50 focus:text-rose-600 text-rose-500 font-medium">
                                    <UserX className="h-4 w-4" /> Block Forever
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            
                            {/* Personal & Social */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <User className="h-5 w-5 text-pink-500" />
                                    Personal & Appearance
                                </h2>
                                <div className="space-y-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-6 rounded-3xl shadow-2xl">
                                    <DetailRow label="Date of Birth" value={profile.date_of_birth} />
                                    <DetailRow label="Marital Status" value={profile.marital_status} />
                                    <DetailRow label="Physical Status" value={profile.physical_status || "Normal"} />
                                    <DetailRow label="Body Type" value={profile.body_type} />
                                    <DetailRow label="Skin Color" value={profile.skin_color} />
                                    <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                                    <DetailRow label="Food Preference" value={profile.food_preference} />
                                    <DetailRow label="Languages" value={Array.isArray(profile.languages) ? profile.languages.join(", ") : profile.languages} />
                                </div>
                            </section>

                            {/* Family Details */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Users className="h-5 w-5 text-amber-500" />
                                    Family Background
                                </h2>
                                <div className="space-y-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-6 rounded-3xl shadow-2xl">
                                    <DetailRow label="Ancestral Origin" value={profile.family.ancestral_origin} />
                                    <DetailRow label="Father Occupation" value={profile.family.father_occupation} />
                                    <DetailRow label="Mother Occupation" value={profile.family.mother_occupation} />
                                    <DetailRow label="Siblings Info" value={profile.family.siblings} />
                                    <DetailRow label="Caste / Kulam" value={profile.family.caste && `${profile.family.caste} / ${profile.family.kulam || '—'}`} />
                                    <DetailRow label="Gotram" value={profile.family.gotram} />
                                    <DetailRow label="Family Type" value={profile.family.family_type} />
                                </div>
                            </section>

                            {/* Horoscope Area */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    Astro & Horoscope
                                </h2>
                                <div className="space-y-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-6 rounded-3xl shadow-2xl">
                                    <DetailRow label="Star" value={profile.horoscope.star} />
                                    <DetailRow label="Raasi / Moon Sign" value={profile.horoscope.zodiac_sign} />
                                    <DetailRow label="Birth Place" value={profile.horoscope.place_of_birth} />
                                    <DetailRow label="Birth Time" value={profile.horoscope.time_of_birth} />
                                    <DetailRow label="Lagnam" value={profile.horoscope.lagnam} />
                                    <DetailRow label="Dhosham" value={profile.horoscope.dhosham || "None"} />
                                </div>
                            </section>

                            {/* Professional Area */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Award className="h-5 w-5 text-green-500" />
                                    Career & Lifestyle
                                </h2>
                                <div className="space-y-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-6 rounded-3xl shadow-2xl">
                                    <DetailRow label="Highest Education" value={profile.education[0]?.education} />
                                    <DetailRow label="Occupation" value={profile.professionDetails?.designation || profile.professionType} />
                                    <DetailRow label="Organization" value={profile.professionDetails?.company || profile.professionDetails?.business_name || profile.professionDetails?.institution} />
                                    <DetailRow label="Income (Annual)" value={profile.professionDetails?.annual_income || profile.professionDetails?.salary} />
                                    <DetailRow label="Hobbies" value={Array.isArray(profile.interests?.hobbies) ? profile.interests.hobbies.join(", ") : profile.interests?.hobbies} />
                                    <DetailRow label="Drinking / Smoking" value={`${profile.social?.drinking || 'No'} / ${profile.social?.smoking || 'No'}`} />
                                </div>
                            </section>
                        </div>

                        {/* Dedicated Partner Preferences Section */}
                        {profile.partner_preferences && (
                            <section className="pt-10 space-y-8">
                                {/* Match Score Banner */}
                                <div className="bg-white/95 p-6 rounded-[2rem] shadow-xl flex items-center justify-between border-l-8 border-pink-500">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-pink-50 flex items-center justify-center">
                                            <HeartHandshake className="h-7 w-7 text-pink-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Compatibility Score</h3>
                                            <p className="text-sm text-gray-500">You match {matchScore.matches}/{matchScore.total} of her preferences</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-pink-500">
                                        {Math.round((matchScore.matches / matchScore.total) * 100)}%
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#4B0082] to-[#3a0066] rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                                    {/* Abstract shapes for design */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
                                        <div className="space-y-4 max-w-sm">
                                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                                                <Target className="h-6 w-6 text-pink-300" />
                                            </div>
                                            <h2 className="text-3xl font-black">Ideal Partner Preferences</h2>
                                            <p className="text-white/60 text-sm leading-relaxed">
                                                Here is a detailed look at who {profile.name || "this member"} is looking for as a potential life partner.
                                            </p>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 bg-white/5 backdrop-blur-sm p-8 sm:p-10 rounded-[2.5rem]">
                                            <PrefRow label="Preferred Age" value={`${profile.partner_preferences.preferred_age_min || 18} to ${profile.partner_preferences.preferred_age_max || 70} years`} />
                                            <PrefRow label="Preferred Height" value={`${profile.partner_preferences.preferred_height_min ? Math.floor(parseInt(profile.partner_preferences.preferred_height_min) / 30.48) + "'" + Math.round((parseInt(profile.partner_preferences.preferred_height_min) / 2.54) % 12) + "\"" : 'Any'} - ${profile.partner_preferences.preferred_height_max ? Math.floor(parseInt(profile.partner_preferences.preferred_height_max) / 30.48) + "'" + Math.round((parseInt(profile.partner_preferences.preferred_height_max) / 2.54) % 12) + "\"" : 'Any'}`} />
                                            <PrefRow label="Marital Status" value={profile.partner_preferences.preferred_marital_status} />
                                            <PrefRow label="Mother Tongue" value={profile.partner_preferences.preferred_mother_tongue} />
                                            <PrefRow label="Physical Status" value={profile.partner_preferences.preferred_physical_status} />
                                            <PrefRow label="Religion / Caste" value={profile.partner_preferences.preferred_religion === 'Any' ? 'Open to any' : `${profile.partner_preferences.preferred_religion || 'Any'} / ${profile.partner_preferences.preferred_caste || 'Any'}`} />
                                            <PrefRow label="Subcaste" value={profile.partner_preferences.preferred_subcaste} />
                                            <PrefRow label="Star / Dosham" value={`${profile.partner_preferences.preferred_star || 'Any'} / ${profile.partner_preferences.preferred_dosham || 'Any'}`} />
                                            <PrefRow label="Education" value={profile.partner_preferences.preferred_education} />
                                            <PrefRow label="Employment" value={profile.partner_preferences.preferred_employment_type} />
                                            <PrefRow label="Occupation" value={profile.partner_preferences.preferred_occupation} />
                                            <PrefRow label="Eating Habits" value={profile.partner_preferences.preferred_eating_habits} />
                                            <PrefRow label="Lifestyle" value={`${profile.partner_preferences.preferred_smoking_habits || 'Any'} / ${profile.partner_preferences.preferred_drinking_habits || 'Any'}`} />
                                            <PrefRow label="Location" value={`${profile.partner_preferences.preferred_city || 'Any'}, ${profile.partner_preferences.preferred_state || 'Any'}`} />
                                            <PrefRow label="Citizenship" value={profile.partner_preferences.preferred_citizenship} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                        
                    </div>
                </div>
            </div>

        </div>
    )
}

function DetailRow({ label, value }: { label: string, value?: string | number | null }) {
    if (value === null || value === undefined || value === "" || value === "Not specified") {
        return (
            <div className="flex justify-between items-center py-1 group/item">
                <span className="text-xs font-bold text-gray-400/60 uppercase tracking-tighter">{label}</span>
                <span className="text-xs font-medium text-gray-300 italic">—</span>
            </div>
        )
    }
    return (
        <div className="flex justify-between items-center py-1 border-b border-gray-100/50 dark:border-gray-800/50 last:border-0 group/item">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200 text-right">{value}</span>
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

function PrefRow({ label, value }: { label: string, value?: string | number | null }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-white leading-tight">{value || "Open / Any"}</p>
        </div>
    )
}
