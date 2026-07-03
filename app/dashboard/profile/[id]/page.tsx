"use client"

export const dynamic = 'force-dynamic'

import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import React, { use, useEffect, useState } from "react"
import { 
    ArrowLeft, MapPin, Briefcase, User, GraduationCap, ArrowRight,
    Heart, Star, CheckCircle2, Phone, MessageCircle, Lock,
    Calendar, Coffee, Eye, Info, Users, Shield, Sparkles, XCircle, Home,
    Search, Target, Award, HeartHandshake, MoreVertical, UserX, UserMinus, Crown, Gem, Bookmark, ShieldCheck,
    ChevronLeft, ChevronRight, Flag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { MessageDialog } from "@/components/message-dialog"
import { ReportProfileDialog } from "@/components/report-profile-dialog"
import { formatToDDMMYYYY, formatActivityTime } from "@/lib/utils/date-utils"
import { Badge } from "@/components/ui/badge"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { ProfileEducationCareerSection } from "@/components/profile/profile-education-career-section"
import { cn } from "@/lib/utils"

export default function ProfileViewPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const { id: targetUserId } = use(params)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    // Treat as unknown (not own) while session is loading to avoid false interaction button flash
    const isOwnProfile = currentUserId !== null && currentUserId === targetUserId;


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
    const [matchScore, setMatchScore] = useState<{ matches: number, total: number }>({ matches: 0, total: 19 })
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
    const [acceptedDate, setAcceptedDate] = useState<string | null>(null)
    
    // Navigation sequence states
    const [prevProfileId, setPrevProfileId] = useState<string | null>(null)
    const [nextProfileId, setNextProfileId] = useState<string | null>(null)

    // Confirm dialog state
    const [confirmAction, setConfirmAction] = useState<"ignore" | "block" | null>(null)
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            setCurrentUserId(data.session?.user?.id || null)
        }
        getSession()
    }, [])

    // Sibling Profile Navigation Sequence
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const sequenceStr = sessionStorage.getItem('manavizha_browse_sequence');
            if (sequenceStr) {
                try {
                    const sequence: string[] = JSON.parse(sequenceStr);
                    const currentIndex = sequence.indexOf(targetUserId);
                    
                    if (currentIndex !== -1) {
                        if (currentIndex > 0) setPrevProfileId(sequence[currentIndex - 1]);
                        if (currentIndex < sequence.length - 1) setNextProfileId(sequence[currentIndex + 1]);
                    }
                } catch (e) {
                    console.error("Error parsing navigation sequence", e);
                }
            }
        }
    }, [targetUserId]);

    useEffect(() => {
        if (!targetUserId || !currentUserId) return
        if (currentUserId === targetUserId) return
        // Track the view once both IDs are known and it's not the user's own profile
        authFetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ viewerId: currentUserId, viewedUserId: targetUserId })
        }).catch(e => console.error("Error logging view", e))
    }, [targetUserId, currentUserId])

    useEffect(() => {
        if (!targetUserId) return

        const fetchProfile = async () => {
            setIsLoading(true)
            setProfile(null)
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
                    supabase.from("users").select("*, name, email, phone, updated_at, is_premium, last_active_at").eq("id", targetUserId).single(),
                    // Use server API to bypass RLS - target user's settings not readable by anon
                    authFetch(`/api/premium-status?userIds=${targetUserId}`).then(r => r.ok ? r.json() : []).catch(() => []),
                ])

                if (!personal) {
                    return
                }

                // Process Photos
                let allPhotos: string[] = []
                if (photosRow?.user_photos) {
                    allPhotos = photosRow.user_photos
                }

                // Derive settingsRow from API result (array of users)
                const settingsRow = Array.isArray(settingsApiResult) 
                    ? settingsApiResult.find((s: any) => s.user_id === targetUserId) 
                    : null

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
                    sex: personal.sex || userRow?.sex || personal.gender || null,
                    partner_preferences: prefs || null,
                    isPremium: settingsRow?.is_premium || userRow?.is_premium || personal.is_premium || false,
                    premiumPlan: settingsRow?.premium_plan || userRow?.premium_plan || personal.premium_plan || null,
                    last_active: settingsRow?.last_active_at || userRow?.last_active_at || personal.last_active_at || personal.updated_at || userRow?.updated_at || personal.created_at,
                })
                setPhotos(allPhotos)

                // Check initial interaction status & fetch viewer profile for matching
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

                    if (settingsRes.data) {
                        setIsViewerPremium(settingsRes.data.is_premium)
                    }

                    // Fetch viewed-me date for this specific user
                    const viewsRes = await authFetch(`/api/views?userId=${currentUserId}`)
                    if (viewsRes.ok) {
                        const viewsData = await viewsRes.json()
                        const viewMe = (viewsData.viewedMe || []).find((v: any) => v.viewer_user_id === targetUserId)
                        setLastViewedMeDate(viewMe?.created_at || null)
                    }

                    if (viewerRes.data) {
                        setViewerProfile(viewerRes.data)
                        
                        if (prefs) {
                            // Calculate match score based on 19 categories
                            let matches = 0
                            const total = 19
                            
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
                                
                            // 18. Location (country + state + city combined into one criterion)
                            if (
                                (!prefs.preferred_country || prefs.preferred_country === "Any" || contact?.current_country === prefs.preferred_country) &&
                                (!prefs.preferred_state || prefs.preferred_state === "Any" || contact?.current_state === prefs.preferred_state) &&
                                (!prefs.preferred_city || prefs.preferred_city === "Any" || contact?.current_district === prefs.preferred_city)
                            ) matches++

                            // 19. Citizenship
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
                                location: !!(
                                    (!prefs.preferred_country || prefs.preferred_country === "Any" || contact?.current_country === prefs.preferred_country) &&
                                    (!prefs.preferred_state || prefs.preferred_state === "Any" || contact?.current_state === prefs.preferred_state) &&
                                    (!prefs.preferred_city || prefs.preferred_city === "Any" || contact?.current_district === prefs.preferred_city)
                                ),
                                citizenship: !!(!prefs.preferred_citizenship || prefs.preferred_citizenship === "Any" || contact?.citizenship === prefs.preferred_citizenship)
                            })
                        } else {
                            setMatchScore({ matches: 0, total: 19 })
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
        // currentUserId resolves asynchronously from getSession — without it in
        // the deps, the likes/shortlists/views statuses are skipped on first run
        // and never fetched.
    }, [targetUserId, currentUserId])

    const handleLike = async () => {
        if (!currentUserId || isLikeProcessing) return
        setIsLikeProcessing(true)
        try {
            const method = isLiked ? "DELETE" : "POST"
            
            // If they already liked us, our reciprocal like should be 'accepted' immediately
            const status = (!isLiked && likedMeDate) ? 'accepted' : undefined
            
            const res = await authFetch("/api/likes", {
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
            const res = await authFetch("/api/shortlists", {
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

    const handleIgnore = () => {
        if (!currentUserId || isLikeProcessing) return
        setConfirmAction("ignore")
    }

    const handleBlock = () => {
        if (!currentUserId || isLikeProcessing) return
        setConfirmAction("block")
    }

    const executeConfirmedAction = async () => {
        if (!confirmAction || !currentUserId) return
        setIsProcessing(true)
        try {
            const endpoint = confirmAction === "ignore" ? "/api/ignores" : "/api/blocks"
            const res = await authFetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId }),
            })
            if (res.ok) {
                toast.success(confirmAction === "ignore" ? "Profile has been ignored." : "Profile has been blocked.")
                router.push("/dashboard/browse")
            } else {
                toast.error(`Failed to ${confirmAction} profile`)
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setIsProcessing(false)
            setConfirmAction(null)
        }
    }

    if (isLoading) return <DashboardLoadingScreen />

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#faf8f4] flex flex-col items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <UserX className="h-12 w-12 text-[#9ca3af] mx-auto mb-4" />
                    <h1 className="text-lg font-semibold text-[#1F4068] mb-2">Profile not found</h1>
                    <p className="text-sm text-[#6b7280] mb-6">
                        This profile may have been removed or the link is invalid.
                    </p>
                    <Button
                        onClick={() => router.push("/dashboard/browse")}
                        className="rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white"
                    >
                        Browse profiles
                    </Button>
                </div>
            </div>
        )
    }

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
        <div className="min-h-screen pb-16 relative bg-[#faf8f4]">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-[#f0ebe3] bg-white text-[#4b5563] hover:text-[#1F4068] hover:bg-[#faf8f4] h-9 px-4 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => prevProfileId && router.push(`/dashboard/profile/${prevProfileId}`)}
                            disabled={!prevProfileId}
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-[#f0ebe3] bg-white text-[#6b7280] hover:text-[#e87898] disabled:opacity-40"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={() => nextProfileId && router.push(`/dashboard/profile/${nextProfileId}`)}
                            disabled={!nextProfileId}
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-[#f0ebe3] bg-white text-[#6b7280] hover:text-[#e87898] disabled:opacity-40"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

            <div className="pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] items-start gap-8">
                    
                    <div className="space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            {profile.last_active && (
                                <Badge className={cn(
                                    "border px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5",
                                    formatActivityTime(profile.last_active) === "Online"
                                        ? "bg-[#ecfdf5] border-[#bbf7d0] text-[#16a34a]"
                                        : "bg-white border-[#f0ebe3] text-[#6b7280]"
                                )}>
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        formatActivityTime(profile.last_active) === "Online" ? "bg-[#22c55e] animate-pulse" : "bg-[#9ca3af]"
                                    )} />
                                    {formatActivityTime(profile.last_active) === "Online" ? "Online" : formatActivityTime(profile.last_active)}
                                </Badge>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fce8ef] text-[#e87898] text-[11px] font-medium border border-[#f0ebe3]">
                                <ShieldCheck className="h-3 w-3" /> Verified
                            </span>
                            {profile.isPremium && (
                                <span className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-[11px] font-medium",
                                    profile.premiumPlan === "prime_gold" ? "bg-amber-500" : "bg-[#1F4068]"
                                )}>
                                    <Gem className="h-3 w-3" />
                                    {profile.premiumPlan?.replace(/_/g, " ") || "Premium"}
                                </span>
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1F4068] leading-tight break-words">
                                {profile.name || profile.userName || "Unknown"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-[#6b7280]">
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
                        <div className="flex flex-col items-stretch lg:items-end gap-4">
                            <div className="space-y-2 lg:text-right text-sm text-[#6b7280]">
                                {shortlistedMeDate && (
                                    <p className="flex items-center lg:justify-end gap-2 text-[#e87898]">
                                        <HeartHandshake className="h-4 w-4" />
                                        {(profile.sex?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "male") ? "He" : "She"} shortlisted you on {formatToDDMMYYYY(shortlistedMeDate)}
                                    </p>
                                )}
                                {iLikedDate && iLikedStatus !== "accepted" && likedMeStatus !== "accepted" && !isMutual && (
                                    <p className={cn("flex items-center lg:justify-end gap-2", iLikedStatus === "declined" ? "text-[#9ca3af]" : "text-[#4b5563]")}>
                                        <Heart className="h-4 w-4 text-[#e87898]" />
                                        {iLikedStatus === "declined"
                                            ? `${(profile.sex?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "male") ? "He" : "She"} declined your interest`
                                            : `You sent interest on ${formatToDDMMYYYY(iLikedDate)}`}
                                    </p>
                                )}
                                {likedMeDate && likedMeStatus !== "accepted" && iLikedStatus !== "accepted" && !isMutual && (
                                    <p className={cn("flex items-center lg:justify-end gap-2", likedMeStatus === "declined" ? "text-[#9ca3af]" : "text-[#4b5563]")}>
                                        <Heart className="h-4 w-4 text-[#e87898]" />
                                        {likedMeStatus === "declined"
                                            ? `You declined ${(profile.sex?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "male") ? "his" : "her"} interest`
                                            : `${(profile.sex?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "male") ? "He" : "She"} sent you an interest on ${formatToDDMMYYYY(likedMeDate)}`}
                                    </p>
                                )}
                                {(isMutual || iLikedStatus === "accepted" || likedMeStatus === "accepted") && (
                                    <p className="flex items-center lg:justify-end gap-2 text-[#e87898] font-medium">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Accepted interest on {formatToDDMMYYYY(acceptedDate || iLikedDate || likedMeDate || "")}
                                    </p>
                                )}
                                {lastViewedMeDate && (
                                    <p className="flex items-center lg:justify-end gap-2">
                                        <Eye className="h-4 w-4 text-[#9ca3af]" />
                                        {(profile.sex?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "male") ? "He" : "She"} viewed your profile on {formatToDDMMYYYY(lastViewedMeDate)}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                <Button
                                    onClick={handleShortlist}
                                    disabled={isShortlistProcessing}
                                    variant="outline"
                                    className={cn(
                                        "h-10 px-4 rounded-xl text-sm font-medium border-[#f0ebe3]",
                                        isShortlisted
                                            ? "bg-[#fce8ef] text-[#e87898] border-[#e87898]"
                                            : "bg-white text-[#6b7280] hover:bg-[#faf8f4]"
                                    )}
                                >
                                    <Bookmark className={cn("h-4 w-4 mr-2", isShortlisted && "fill-current")} />
                                    {isShortlisted ? "Shortlisted" : "Shortlist"}
                                </Button>
                                {iLikedStatus === "declined" || likedMeStatus === "declined" ? (
                                    <Button disabled className="h-10 px-5 rounded-xl bg-[#f3f4f6] text-[#9ca3af] text-sm cursor-not-allowed">
                                        Declined
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => (isLiked || isMutual) ? handleSendMessage() : handleLike()}
                                        disabled={isLikeProcessing}
                                        className="h-10 px-5 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        {(isLiked || isMutual) ? "Message" : "Send Interest"}
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-[#f0ebe3] bg-white text-[#6b7280] hover:bg-[#faf8f4]">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 border-[#f0ebe3]">
                                        <DropdownMenuItem onClick={handleIgnore} className="rounded-lg text-sm text-[#4b5563] cursor-pointer">
                                            <UserMinus className="h-4 w-4 mr-2" /> Skip profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleBlock} className="rounded-lg text-sm text-red-600 cursor-pointer">
                                            <UserX className="h-4 w-4 mr-2" /> Block member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)} className="rounded-lg text-sm text-red-600 cursor-pointer">
                                            <Flag className="h-4 w-4 mr-2" /> Report profile
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )}
                </div>
            </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24">
                        <div className="bg-white rounded-[18px] p-3 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] overflow-hidden space-y-3">
                            <div className="relative aspect-[4/5] rounded-[14px] overflow-hidden bg-[#faf8f4] group">
                                {/* Top Indicators */}
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
                                    <div className="w-full h-full flex items-center justify-center bg-[#fce8ef]/30">
                                        <User className="h-16 w-16 text-[#e87898]/30" />
                                    </div>
                                )}

                                {/* Persistent Arrows */}
                                {photos.length > 1 && (
                                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-between z-30 pointer-events-none">
                                        <button
                                            aria-label="Previous photo"
                                            onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(prev => (prev - 1 + photos.length) % photos.length); }}
                                            className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 text-white flex items-center justify-center hover:bg-white/50 transition-all pointer-events-auto shadow-lg"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            aria-label="Next photo"
                                            onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(prev => (prev + 1) % photos.length); }}
                                            className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 text-white flex items-center justify-center hover:bg-white/50 transition-all pointer-events-auto shadow-lg"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Integrated Thumbnails */}
                            {photos.length > 1 && (
                                <div className="flex gap-4 px-2 pb-2 overflow-x-auto no-scrollbar">
                                    {photos.map((p, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setCurrentPhotoIndex(i)} 
                                            className={cn("w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0", i === currentPhotoIndex ? "border-[#e87898] scale-105" : "border-transparent opacity-50 hover:opacity-100")}
                                        >
                                            <img src={p} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-4 pb-12">
                        <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-[#fce8ef] flex items-center justify-center text-[#e87898]">
                                    <User className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-semibold text-[#1F4068]">Personal Profile</h2>
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

                        <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-[#faf8f4] flex items-center justify-center text-[#1F4068]">
                                    <Users className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-semibold text-[#1F4068]">Family Details</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow label="Religion" value={profile.religion} />
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
                        </div>
                        {profile.about && (
                            <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-xl bg-[#fce8ef] flex items-center justify-center text-[#e87898]">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-base font-semibold text-[#1F4068]">About Myself</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-[#4b5563] border-l-2 border-[#e87898] pl-4">
                                    {profile.about}
                                </p>
                            </div>
                        )}
                        {profile.family?.family_description && (
                            <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-xl bg-[#faf8f4] flex items-center justify-center text-[#1F4068]">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-base font-semibold text-[#1F4068]">About My Family</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-[#4b5563] border-l-2 border-[#f0ebe3] pl-4">
                                    {profile.family.family_description}
                                </p>
                            </div>
                        )}

                        <ProfileEducationCareerSection
                            education={profile.education}
                            profession={profile.profession}
                            professionType={profile.professionType}
                            isPremiumViewer={isViewerPremium}
                        />

                        <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-semibold text-[#1F4068]">Horoscope & Astrology</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow label="Star" value={profile.horoscope?.star} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Raasi" value={profile.horoscope?.zodiac_sign} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Lagnam" value={profile.horoscope?.lagnam} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Dosha(m)" value={profile.horoscope?.dhosham || "No Dosham"} isLocked={true} isPremiumViewer={isViewerPremium} />
                                {profile.horoscope?.jaadhagam_url && (
                                    <DetailRow 
                                        label="Horoscope Chart (Jaadhagam)" 
                                        value={<a href={profile.horoscope.jaadhagam_url} target="_blank" rel="noopener noreferrer" className="text-[#e87898] hover:underline">View Chart</a>} 
                                        isLocked={true} 
                                        isPremiumViewer={isViewerPremium} 
                                    />
                                )}
                                <DetailRow label="Place of Birth" value={profile.horoscope?.place_of_birth} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="Time of Birth" value={profile.horoscope?.time_of_birth} isLocked={true} isPremiumViewer={isViewerPremium} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-[#fce8ef] flex items-center justify-center text-[#e87898]">
                                    <HeartHandshake className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-semibold text-[#1F4068]">Lifestyle & Habits</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow label="Diet" value={profile.social?.diet || profile.food_preference} />
                                <DetailRow label="Smoking" value={profile.social?.smoking || "No"} />
                                <DetailRow label="Drinking" value={profile.social?.drinking || "No"} />
                                <DetailRow label="Parties" value={profile.social?.parties} />
                                <DetailRow label="Pubs" value={profile.social?.pubs} />
                                <div className="py-4 px-1">
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
                            </div>
                        </div>

                        <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-[#faf8f4] flex items-center justify-center text-[#1F4068]">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-semibold text-[#1F4068]">Contact & Location</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow label="Phone Number" value={profile.contact?.phone || profile.phone} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow label="WhatsApp" value={profile.contact?.whatsapp_number} isLocked={true} isPremiumViewer={isViewerPremium} />
                                <DetailRow 
                                    label="Address" 
                                    value={[profile.contact?.current_address_line1, profile.contact?.current_area, profile.contact?.current_district, profile.contact?.current_state].filter(Boolean).join(", ")} 
                                    isLocked={true} 
                                    isPremiumViewer={isViewerPremium} 
                                />
                            </div>
                        </div>

                        {profile.partner_preferences && (
                            <div className="bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-[#fce8ef] flex items-center justify-center text-[#e87898]">
                                            <Target className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-base font-semibold text-[#1F4068]">Partner Preferences</h2>
                                    </div>
                                    {!isOwnProfile && (
                                        <div className="flex items-center gap-3 bg-[#fce8ef] px-4 py-2 rounded-xl border border-[#f0ebe3]">
                                            <div className="text-right">
                                                <p className="text-[10px] font-medium text-[#9ca3af]">Match score</p>
                                                <p className="text-lg font-semibold text-[#1F4068]">{matchScore.matches}<span className="text-[#d1d5db]">/</span>{matchScore.total}</p>
                                            </div>
                                            <div className="w-9 h-9 rounded-full bg-[#e87898] flex items-center justify-center">
                                                <Heart className="h-4 w-4 fill-current text-white" />
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
                        )}
                    </div>

                <AnimatePresence>
                {isMessageDialogOpen && (
                    <MessageDialog
                        key="message-dialog"
                        isOpen={isMessageDialogOpen}
                        onOpenChange={setIsMessageDialogOpen}
                        receiverId={targetUserId}
                        receiverName={profile.name || profile.userName || "this member"}
                        senderId={currentUserId || ""}
                        isPremium={isViewerPremium}
                    />
                )}
            </AnimatePresence>
                <ReportProfileDialog
                    open={isReportDialogOpen}
                    onOpenChange={setIsReportDialogOpen}
                    reportedUserId={targetUserId}
                    reportedName={profile.name || profile.userName}
                />
                </div>
            </div>

        <AlertDialog open={confirmAction !== null} onOpenChange={(open) => { if (!open) setConfirmAction(null) }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {confirmAction === "ignore" ? "Ignore this profile?" : "Block this profile?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {confirmAction === "ignore"
                            ? "This profile will be removed from your feed. You can undo this from your Settings."
                            : "This profile will be blocked permanently. You can unblock from your Settings."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={executeConfirmedAction} className="bg-red-500 hover:bg-red-600">
                        {confirmAction === "ignore" ? "Ignore" : "Block"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </div>
    )
}

function DetailRow({ label, value, isLocked, isPremiumViewer, compact }: { label: string, value?: React.ReactNode, isLocked?: boolean, isPremiumViewer?: boolean, compact?: boolean }) {
    const [revealed, setRevealed] = useState(false)
    
    const renderValue = () => {
        if (!value) return <span className="text-[#9ca3af] italic text-sm">Not specified</span>
        
        if (isLocked) {
            if (isPremiumViewer && revealed) {
                return (
                    <span className="text-sm font-medium text-[#1F4068] break-words flex items-center gap-2">
                        {value}
                        <button onClick={() => setRevealed(false)} className="text-xs text-[#e87898] hover:underline font-medium">Hide</button>
                    </span>
                )
            }
            
            if (isPremiumViewer && !revealed) {
                return (
                    <button
                        onClick={() => setRevealed(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fce8ef] rounded-lg border border-[#f0ebe3] text-[#e87898] text-xs font-medium hover:bg-[#f0ebe3] transition-colors"
                    >
                        <Crown className="h-3 w-3" />
                        Reveal
                    </button>
                )
            }

            return (
                <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs font-medium">
                    <Lock className="h-3 w-3" /> Locked
                </div>
            )
        }
        
        return <span className={cn("font-medium text-[#1F4068] whitespace-normal break-words", compact ? "text-[13px]" : "text-sm")}>{value}</span>
    }

    if (compact) {
        return (
            <div className="space-y-1">
                <p className="text-xs text-[#9ca3af]">{label}</p>
                {renderValue()}
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between py-2.5 border-b border-[#f0ebe3] last:border-0 gap-4">
            <span className="text-xs text-[#9ca3af] shrink-0">{label}</span>
            <div className="text-right min-w-0">{renderValue()}</div>
        </div>
    )
}


function PrefRow({ label, value, isMatch }: { label: string, value?: string | number | null, isMatch?: boolean }) {
    const isUnspecified = !value || value === "Open / Any" || value === "Any" || value === "Any / Any" || value === "Any, Any" || value.toString().includes("Any") || value.toString().includes("Open");

    return (
        <div className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-[#faf8f4] transition-colors gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    isUnspecified ? "bg-[#f3f4f6] text-[#9ca3af]" :
                    isMatch ? "bg-[#e87898] text-white" :
                    "bg-[#1F4068] text-white"
                )}>
                    {isUnspecified ? <Info className="h-3.5 w-3.5" /> :
                     isMatch ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     <UserX className="h-3.5 w-3.5" />}
                </div>
                <span className="text-xs text-[#9ca3af]">{label}</span>
            </div>
            <span className="text-sm font-medium text-[#1F4068] text-right ml-2 truncate">
                {value || "Open / Any"}
            </span>
        </div>
    )
}
