"use client"

import { Button } from "@/components/ui/button"
import { VerificationDialog } from "@/components/verification-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Bookmark,
  User,
  CheckCircle2,
  Edit,
  ArrowRight,
  Heart,
  Users,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  UserCircle2,
  ListFilter,
  Users2,
  Clock,
  Eye,
  History,
  ThumbsUp,
  MessageSquareHeart,
  CalendarDays,
  Search,
  ShieldCheck,
  Star,
  Crown,
  Gem,
  Shield,
  Bell
} from "lucide-react"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ProfileCarousel } from "./profile-carousel"
import {
  MarriedConfirmationDialog
} from "@/components/married-confirmation-dialog"
import { SubscriptionDialog } from "./subscription-dialog"
import { HoroscopeGeneratorDialog } from "./horoscope-generator-dialog"
import { calculateTrustScore } from "@/lib/utils/profile-utils"
import { checkTamilPoruthamByGender } from "@/lib/astrology"
import { calculateLifestyleScore } from "@/lib/matching"
import { CompatibilitySheet } from "./compatibility-sheet"
import { DashboardSidebar } from "./dashboard/dashboard-sidebar"
import { DashboardHeroBanner, EliteMemberBadge } from "./dashboard/dashboard-hero-banner"
import { DashboardStatsRow } from "./dashboard/dashboard-stats-row"
import { DashboardDailyRecommendations } from "./dashboard/dashboard-daily-recommendations"
import { DashboardJourneyPanel } from "./dashboard/dashboard-journey-panel"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getDailySeed, seededShuffle } from "@/lib/utils/match-utils"
import { filterProfilesByPartnerPreferences } from "@/lib/utils/partner-preference-filter"
import { cn } from "@/lib/utils"

interface UserLandingPageProps {
  userEmail: string
  userId: string
  onNavigateToProfileSetup: () => void
  onNavigateToBrowse: (category?: string) => void
  onNavigateToParents: () => void
  onNavigateToSelections: () => void
  onNavigateToPartnerPreferences: () => void
  onNavigateToLikes: () => void
  onNavigateToMutualMatches: () => void
  onNavigateToILiked: () => void
  onNavigateToLikedMe: () => void
  onNavigateToHoroscope: () => void
  onProgressChange?: (progress: number) => void
}

interface ProfileData {
  name?: string
  contactNumber?: string
  profession?: string
  maritalStatus?: string
  photo_verified?: boolean
  photos?: string[]
  familyPhoto?: string | null
  isPremium?: boolean
  premiumPlan?: string | null
  premiumExpiresAt?: string | null
}

export function UserLandingPage({ userEmail, userId, onNavigateToProfileSetup, onNavigateToBrowse, onNavigateToParents, onNavigateToSelections, onNavigateToPartnerPreferences, onNavigateToLikes, onNavigateToMutualMatches, onNavigateToILiked, onNavigateToLikedMe, onNavigateToHoroscope, onProgressChange }: UserLandingPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [showMarriedConfirmDialog, setShowMarriedConfirmDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [showHoroscopeDialog, setShowHoroscopeDialog] = useState(false)

  // New states for match sections
  const [dailyRecs, setDailyRecs] = useState<any[]>([])
  const [allMatches, setAllMatches] = useState<any[]>([])
  const [newMatches, setNewMatches] = useState<any[]>([])
  const [whoViewedMe, setWhoViewedMe] = useState<any[]>([])
  const [profilesIViewed, setProfilesIViewed] = useState<any[]>([])
  const [whoExpressedInterest, setWhoExpressedInterest] = useState<any[]>([])
  
  // Dual Core Compatibility states
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [activeBreakdown, setActiveBreakdown] = useState<any>(null)
  const [breakdownName, setBreakdownName] = useState("")
  const [viewerFullProfile, setViewerFullProfile] = useState<any>(null)
  const [mutualCount, setMutualCount] = useState(0)
  const [iLikedCount, setILikedCount] = useState(0)
  const [likedMeCount, setLikedMeCount] = useState(0)
  const [isSectionsLoading, setIsSectionsLoading] = useState(true)
  const userName = userEmail.split("@")[0]
  const isProfileComplete = completionPercentage === 100

  const [shortlistedIds, setShortlistedIds] = useState<string[]>([])
  const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null)
  const [isCoreProfileComplete, setIsCoreProfileComplete] = useState(false)

  useEffect(() => {
    const calculateProgress = async () => {
      try {
        // Fetch all needed stats in parallel to drastically improve loading time
        const [
          { data: personal },
          { data: contact },
          { data: eduData },
          { data: empData },
          { data: busData },
          { data: stuData },
          { data: family },
          { data: horoscope },
          { data: interests },
          { data: social },
          { data: photos },
          { data: settings },
          { data: preferences }
        ] = await Promise.all([
          supabase.from("personal_details").select("completion_percentage, name, date_of_birth, age, sex, height, weight, skin_color, body_type, marital_status, about, food_preference, languages, photo_verified").eq("user_id", userId).maybeSingle(),
          supabase.from("contact_details").select("completion_percentage, phone, whatsapp_number, permanent_address_line1, permanent_pincode, permanent_area, permanent_taluk, permanent_district, permanent_division, permanent_region, permanent_state, permanent_country, current_address_line1, current_pincode, current_area, current_taluk, current_district, current_division, current_region, current_state, current_country").eq("user_id", userId).maybeSingle(),
          supabase.from("education_details").select("education").eq("user_id", userId),
          supabase.from("profession_employee").select("completion_percentage, designation, company").eq("user_id", userId).maybeSingle(),
          supabase.from("profession_business").select("completion_percentage, designation, business_name").eq("user_id", userId).maybeSingle(),
          supabase.from("profession_student").select("completion_percentage, course, institution").eq("user_id", userId).maybeSingle(),
          supabase.from("family_details").select("completion_percentage, father_name, father_occupation, mother_name, mother_occupation, parents_address_line1, parents_pincode, parents_area, parents_taluk, parents_district, parents_division, parents_region, parents_state, parents_country, caste, family_type, family_status").eq("user_id", userId).maybeSingle(),
          supabase.from("horoscope_details").select("completion_percentage, jaadhagam_url, time_of_birth, place_of_birth, zodiac_sign, star, lagnam, dhosham").eq("user_id", userId).maybeSingle(),
          supabase.from("interests").select("hobbies, interests").eq("user_id", userId).maybeSingle(),
          supabase.from("social_habits").select("smoking, drinking, parties, pubs").eq("user_id", userId).maybeSingle(),
          supabase.from("photos").select("user_photos, family_photo, aadhar_front, aadhar_back").eq("user_id", userId).maybeSingle(),
          supabase.from("user_settings").select("is_premium, premium_plan, premium_expires_at").eq("user_id", userId).maybeSingle(),
          supabase.from("partner_preferences").select("preferred_age_min, preferred_age_max, preferred_height_min, preferred_height_max").eq("user_id", userId).maybeSingle()
        ])

        const stepProgresses: number[] = []

        // 1. Personal
        let personalProgress = 0
        if (personal?.completion_percentage !== undefined && personal?.completion_percentage !== null) {
          personalProgress = personal.completion_percentage
        } else if (personal) {
          const personalFields = ["name", "date_of_birth", "age", "sex", "height", "weight", "skin_color", "body_type", "marital_status", "about", "food_preference", "languages"]
          const pFilled = personalFields.filter(f => {
            const val = personal[f as keyof typeof personal]
            if (f === "languages") return Array.isArray(val) && val.length > 0
            return val !== null && val !== undefined && val !== ""
          }).length
          personalProgress = Math.round((pFilled / personalFields.length) * 100)
        }
        stepProgresses.push(personalProgress)

        // 2. Contact
        let contactProgress = 0
        if (contact?.completion_percentage !== undefined && contact?.completion_percentage !== null) {
          contactProgress = contact.completion_percentage
        } else if (contact) {
          const contactFields = ["phone", "whatsapp_number", "permanent_address_line1", "permanent_pincode", "permanent_area", "permanent_taluk", "permanent_district", "permanent_division", "permanent_region", "permanent_state", "permanent_country", "current_address_line1", "current_pincode", "current_area", "current_taluk", "current_district", "current_division", "current_region", "current_state", "current_country"]
          const cFilled = contactFields.filter(f => {
            const val = contact[f as keyof typeof contact]
            return val !== null && val !== undefined && val !== ""
          }).length
          contactProgress = Math.round((cFilled / contactFields.length) * 100)
        }
        stepProgresses.push(contactProgress)

        // 3. Education
        let eduProgress = 0
        if (eduData && eduData.length > 0) {
          const hasData = eduData.some(edu => edu.education && edu.education !== "")
          eduProgress = hasData ? 100 : 0
        }
        stepProgresses.push(eduProgress)

        // 4. Professional
        let profProgress = 0
        if (empData?.completion_percentage === 100 || busData?.completion_percentage === 100 || stuData?.completion_percentage === 100) {
          profProgress = 100
        } else if (empData?.completion_percentage !== null && empData?.completion_percentage !== undefined) {
          profProgress = empData.completion_percentage
        } else if (busData?.completion_percentage !== null && busData?.completion_percentage !== undefined) {
          profProgress = busData.completion_percentage
        } else if (stuData?.completion_percentage !== null && stuData?.completion_percentage !== undefined) {
          profProgress = stuData.completion_percentage
        }
        stepProgresses.push(profProgress)

        // 5. Family
        let familyProgress = 0
        if (family?.completion_percentage !== undefined && family?.completion_percentage !== null) {
          familyProgress = family.completion_percentage
        } else if (family) {
          const familyFields = ["father_name", "father_occupation", "mother_name", "mother_occupation", "parents_address_line1", "parents_pincode", "parents_area", "parents_taluk", "parents_district", "parents_division", "parents_region", "parents_state", "parents_country", "caste", "family_type", "family_status"]
          const fFilled = familyFields.filter(f => {
            const val = family[f as keyof typeof family]
            return val !== null && val !== undefined && val !== ""
          }).length
          familyProgress = Math.round((fFilled / familyFields.length) * 100)
        }
        stepProgresses.push(familyProgress)

        // 6. Horoscope
        let horoscopeProgress = 0
        if (horoscope?.completion_percentage !== undefined && horoscope?.completion_percentage !== null) {
          horoscopeProgress = horoscope.completion_percentage
        } else if (horoscope) {
          const horoscopeFields = ["jaadhagam_url", "time_of_birth", "place_of_birth", "zodiac_sign", "star", "lagnam", "dhosham"]
          const hFilled = horoscopeFields.filter(f => {
            const val = horoscope[f as keyof typeof horoscope]
            return val !== null && val !== undefined && val !== ""
          }).length
          horoscopeProgress = Math.round((hFilled / horoscopeFields.length) * 100)
        }
        stepProgresses.push(horoscopeProgress)

        // 7. Interests
        let interestsProgress = 0
        if (interests) {
          const hobbies = interests.hobbies || []
          const userInterests = interests.interests || []
          if (hobbies.length >= 3 && userInterests.length >= 3) {
            interestsProgress = 100
          }
        }
        stepProgresses.push(interestsProgress)

        // 8. Social
        let socialProgress = 0
        if (social) {
          const socialFields = ["smoking", "drinking", "parties", "pubs"]
          const sFilled = socialFields.filter(f => {
            const val = social[f as keyof typeof social]
            return val !== null && val !== undefined && val !== ""
          }).length
          socialProgress = Math.round((sFilled / socialFields.length) * 100)
        }
        stepProgresses.push(socialProgress)

        // 9. Photos
        let photosProgress = 0
        if (photos) {
          const userPhotos = photos.user_photos || []
          if (userPhotos.length >= 3) {
            photosProgress = 100
          }
        }
        stepProgresses.push(photosProgress)

        // 10. Partner Preferences
        let preferencesProgress = 0
        if (preferences) {
          // As per setup form, we only strictly require age and height fields to be explicitly filled
          const prefFields = ["preferred_age_min", "preferred_age_max", "preferred_height_min", "preferred_height_max"]
          const pFilled = prefFields.filter(f => {
            const val = preferences[f as keyof typeof preferences]
            return val !== null && val !== undefined && val !== ""
          }).length
          // Simulate the 26 fields by pretending the other 22 are filled with "Any"
          preferencesProgress = Math.round(((pFilled + 22) / 26) * 100)
        }
        stepProgresses.push(preferencesProgress)

        const coreComplete = personalProgress === 100 && contactProgress === 100 && eduProgress === 100 && profProgress === 100 && familyProgress === 100
        setIsCoreProfileComplete(coreComplete)

        const totalProgress = stepProgresses.reduce((sum, p) => sum + p, 0)
        // Only round and divide if they have started to avoid baseline 10%
        const hasStartedProfile = personalProgress > 0 || contactProgress > 0
        const averageProgress = hasStartedProfile ? Math.round(totalProgress / stepProgresses.length) : 0
        setCompletionPercentage(averageProgress)
        if (onProgressChange) onProgressChange(averageProgress)

        const profileData: ProfileData = {}

        // Name
        if (personal?.name) {
          profileData.name = personal.name
        }
        
        // Photo Verified
        if (personal?.photo_verified !== undefined) {
            profileData.photo_verified = personal.photo_verified
        }

        // Contact Number
        if (contact?.phone) {
          profileData.contactNumber = contact.phone
        }

        // Profession
        if (empData) {
          const parts: string[] = []
          if (empData.designation) parts.push(empData.designation)
          if (empData.company) parts.push(empData.company)
          if (parts.length > 0) {
            profileData.profession = parts.join(" at ")
          }
        } else if (busData) {
          const parts: string[] = []
          if (busData.designation) parts.push(busData.designation)
          if (busData.business_name) parts.push(busData.business_name)
          if (parts.length > 0) {
            profileData.profession = parts.join(" at ")
          }
        } else if (stuData) {
          const parts: string[] = []
          if (stuData.course) parts.push(stuData.course)
          if (stuData.institution) parts.push(stuData.institution)
          if (parts.length > 0) {
            profileData.profession = parts.join(" at ")
          }
        }

        // Marital Status
        if (personal?.marital_status) {
          const status = personal.marital_status
          profileData.maritalStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        }
        
        if (photos?.user_photos) {
            const userPhotoUrls = await Promise.all(
                (photos.user_photos || []).map(async (photo: string, index: number) => {
                    if (!photo) return ""
                    
                    try {
                        let filePath = photo
                        
                        // If it's a full URL, check if it's a Supabase storage URL that needs re-signing
                        if (photo.startsWith("http")) {
                            if (photo.includes("/storage/v1/object/sign/user-photos/")) {
                                const pathParts = photo.split("/user-photos/")
                                if (pathParts.length > 1) {
                                    filePath = pathParts[1].split("?")[0]
                                } else {
                                    return photo // Fallback to original
                                }
                            } else {
                                return photo // External URL or different bucket, return as-is
                            }
                        }

                        // Standardize the path: ensure it includes the userId if it's just a filename
                        if (!filePath.includes("/")) {
                            filePath = `${userId}/${filePath}`
                        }
                        
                        const { data: urlData, error: signError } = await supabase.storage
                            .from("user-photos")
                            .createSignedUrl(filePath, 31536000)
                        
                        if (signError) {
                            console.warn(`Could not sign photo ${filePath}:`, signError.message)
                            return photo // Fallback to raw path or original URL
                        }
                        return urlData?.signedUrl || photo
                    } catch (err) { 
                        console.error(`Error signing photo ${index}:`, err)
                        return photo 
                    }
                })
            )
            profileData.photos = userPhotoUrls.filter(Boolean)
        }
        
        if (photos?.family_photo) {
            profileData.familyPhoto = photos.family_photo
        }

        if (settings) {
            profileData.isPremium = settings.is_premium
            profileData.premiumPlan = settings.premium_plan
            profileData.premiumExpiresAt = settings.premium_expires_at
        }
        
        if (Object.keys(profileData).length > 0) {
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error calculating profile progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    calculateProgress()
  }, [userId])

  useEffect(() => {
    const fetchSectionsData = async () => {
      if (!userId) return
      setIsSectionsLoading(true)
      try {
        // 1. Get my gender preference
        const { data: userData } = await supabase
          .from("personal_details")
          .select("sex, food_preference")
          .eq("user_id", userId)
          .maybeSingle()

        if (!userData) {
          setIsSectionsLoading(false)
          return
        }

        const targetGender = (userData.sex || "").toLowerCase() === "male" ? "Female" : "Male"

        // 2. Fetch partner preferences and viewer details
        const [
            { data: prefs },
            { data: myHoro },
            { data: myInterests },
            { data: mySocial },
            { data: myEmp },
            { data: myBus }
        ] = await Promise.all([
            supabase.from("partner_preferences").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("horoscope_details").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("interests").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("social_habits").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("profession_employee").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("profession_business").select("*").eq("user_id", userId).maybeSingle()
        ])

        const viewerData: any = {
            ...userData,
            interests: myInterests?.interests || [],
            hobbies: myInterests?.hobbies || [],
            smoking: mySocial?.smoking,
            drinking: mySocial?.drinking,
            foodPreference: userData?.food_preference,
            workLocation: myEmp?.work_location || myBus?.business_location,
            sector: myEmp?.sector || myBus?.business_type,
            salary: myEmp?.salary || myBus?.annual_returns
        }
        setViewerFullProfile(viewerData)

        // 3. Fetch activity data (views & likes for counts)
        const [viewsRes, likesRes] = await Promise.all([
          authFetch(`/api/views?userId=${userId}`),
          authFetch(`/api/likes?userId=${userId}`)
        ])
        const viewsData = await viewsRes.json()
        const likesData = await likesRes.json()

        const likedIds = (likesData.iLiked || []).map((l: any) => l.id)
        const likedMeDataList = likesData.likedMe || []
        const likedMeIds = likedMeDataList.map((l: any) => l.id)
        
        const viewedIds = (viewsData.iViewed || []).map((v: any) => v.viewed_user_id)
        const viewedByMeIds = (viewsData.viewedMe || []).map((v: any) => v.viewer_user_id)
        
        setILikedCount(likedIds.length)
        setLikedMeCount(likedMeIds.length)
        
        // Calculate Mutual Count
        const mutuals = likedIds.filter((id: string) => likedMeIds.includes(id))
        setMutualCount(mutuals.length)

        // 4. Fetch all potential matches (opposite gender, not married)
        const { data: potentialMatches } = await supabase
          .from("personal_details")
          .select("*, created_at")
          .ilike("sex", targetGender)
          .neq("user_id", userId)
          .neq("marital_status", "Married")

        if (!potentialMatches || potentialMatches.length === 0) {
          setIsSectionsLoading(false)
          return
        }

        const matchUserIds = potentialMatches.map(p => p.user_id)

        // 5. Fetch photos and contact for these matches
        const [
          { data: photosData },
          { data: contactData },
          { data: empData },
          { data: busData },
          { data: eduData },
          { data: targetInterestsData },
          { data: targetSocialData },
          { data: targetHoroData },
          { data: familyData },
          premiumApiRes
        ] = await Promise.all([
          supabase.from("photos").select("user_id, user_photos").in("user_id", matchUserIds),
          supabase.from("contact_details").select("user_id, current_district, current_state").in("user_id", matchUserIds),
          supabase.from("profession_employee").select("*").in("user_id", matchUserIds),
          supabase.from("profession_business").select("*").in("user_id", matchUserIds),
          supabase.from("education_details").select("user_id, education").in("user_id", matchUserIds),
          supabase.from("interests").select("*").in("user_id", matchUserIds),
          supabase.from("social_habits").select("*").in("user_id", matchUserIds),
          supabase.from("horoscope_details").select("*").in("user_id", matchUserIds),
          supabase.from("family_details").select("user_id, caste, subcaste").in("user_id", matchUserIds),
          authFetch(`/api/premium-status?userIds=${matchUserIds.join(",")}`).then(r => r.ok ? r.json() : []).catch(() => [])
        ])

        const combined = potentialMatches.map(p => {
            const photos = photosData?.find(x => x.user_id === p.user_id)?.user_photos || []
            const contact = contactData?.find(x => x.user_id === p.user_id)
            const emp = empData?.find(x => x.user_id === p.user_id)
            const bus = busData?.find(x => x.user_id === p.user_id)
            const edu = eduData?.find(x => x.user_id === p.user_id)
            const premiumStatus = Array.isArray(premiumApiRes) ? premiumApiRes.find((x: any) => x.user_id === p.user_id) : null

            let profession = "Not specified"
            if (emp?.designation) profession = emp.designation + (emp.company ? ` at ${emp.company}` : "")
            else if (bus?.designation) profession = bus.designation + (bus.business_name ? ` at ${bus.business_name}` : "")

            const targetInterests = targetInterestsData?.find(x => x.user_id === p.user_id)
            const targetSocial = targetSocialData?.find(x => x.user_id === p.user_id)
            const targetHoro = targetHoroData?.find(x => x.user_id === p.user_id)
            const targetFamily = familyData?.find(x => x.user_id === p.user_id)

            const targetProfileData = {
                ...p,
                foodPreference: p.food_preference,
                hobbies: targetInterests?.hobbies || [],
                interests: targetInterests?.interests || [],
                smoking: targetSocial?.smoking,
                drinking: targetSocial?.drinking,
                workLocation: emp?.work_location || bus?.business_location,
                sector: emp?.sector || bus?.business_type,
                salary: emp?.salary || bus?.annual_returns
            }

            const lifestyleMatch = viewerData ? calculateLifestyleScore(viewerData as any, targetProfileData as any) : null
            const horoscopeMatch = (myHoro?.star && targetHoro?.star)
                ? checkTamilPoruthamByGender(targetHoro.star, targetHoro.zodiac_sign || "", (p.sex || "").toLowerCase() === "female", myHoro.star, myHoro.zodiac_sign || "")
                : { score: 0, status: 'Athamam', breakdown: {} }

            return {
                ...p,
                caste: targetFamily?.caste ?? p.caste ?? null,
                subcaste: targetFamily?.subcaste ?? p.subcaste ?? null,
                family: targetFamily ?? null,
                photos,
                location: contact?.current_district ? `${contact.current_district}${contact.current_state ? `, ${contact.current_state}` : ""}` : "Location hidden",
                profession,
                education: edu?.education || "Not specified",
                isPremium: premiumStatus?.is_premium || false,
                premiumPlan: premiumStatus?.premium_plan || null,
                lifestyleScore: lifestyleMatch?.totalScore || 0,
                poruthamScore: horoscopeMatch?.score || 0,
                viewerIsPremium: profile?.isPremium,
                onScoreClick: (e: any) => {
                    e.stopPropagation()
                    if (profile?.isPremium) {
                        setActiveBreakdown({ lifestyle: lifestyleMatch, horoscope: horoscopeMatch })
                        setBreakdownName(p.name || "Unknown")
                        setShowBreakdown(true)
                    } else {
                        setShowSubscriptionDialog(true)
                    }
                }
            }
        })

        // Apply partner preferences (age always; caste/subcaste when compulsory)
        let filtered = combined
        if (prefs) {
            filtered = filterProfilesByPartnerPreferences(combined, prefs)
        }

        // -- Section 1: Daily Recommendations (Seeded Shuffle) --
        const seedStr = getDailySeed(userId)
        setDailyRecs(seededShuffle(filtered, seedStr).slice(0, 10))

        // -- Section 2: All Matches --
        setAllMatches(filtered)

        // -- Section 3: New Matches (Last 30 days) --
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        setNewMatches(combined.filter(p => new Date(p.created_at) > thirtyDaysAgo))

        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        const recentViews = (viewsData.viewedMe || []).filter((v: any) => new Date(v.created_at) > oneMonthAgo)
        const recentViewedIds = recentViews.map((v: any) => v.viewer_user_id)
        
        const recentInterests = (likedMeDataList || []).filter((l: any) => new Date(l.created_at) > oneMonthAgo)
        const recentInterestIds = recentInterests.map((l: any) => l.id)

        setWhoViewedMe(recentViews.map((rv: any) => {
            const p = combined.find(c => c.user_id === rv.viewer_user_id)
            return p ? { ...p, interaction_at: rv.created_at } : null
        }).filter(Boolean))

        setWhoExpressedInterest(recentInterests.map((ri: any) => {
            const p = combined.find(c => c.user_id === ri.id)
            return p ? { ...p, interaction_at: ri.created_at } : null
        }).filter(Boolean))
        
        setProfilesIViewed(combined.filter(p => viewedIds.includes(p.user_id)))

      } catch (err) {
        console.error("Error fetching dash sections:", err)
      } finally {
        setIsSectionsLoading(false)
      }
    }
    fetchSectionsData()
  }, [userId])

  useEffect(() => {
    const fetchShortlists = async () => {
      if (!userId) return
      const res = await authFetch(`/api/shortlists?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setShortlistedIds(data.shortlistedIds || [])
      }
    }
    fetchShortlists()
  }, [userId])

  const handleShortlist = async (targetId: string) => {
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
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update shortlist")
      }
    } catch (err) {
      toast.error("Network error. Please try again.")
    } finally {
      setShortlistLoadingId(null)
    }
  }

  const handleMarkAsMarried = async () => {
    try {
      const { error } = await supabase
        .from("personal_details")
        .update({ marital_status: "Married" })
        .eq("user_id", userId)

      if (error) throw error

      // Also deactivate the profile permanently (10 years)
      await authFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: { is_deactivated: true, deactivated_until: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString() }
        })
      })

      setProfile(prev => prev ? { ...prev, maritalStatus: "Married" } : { maritalStatus: "Married" })
      setShowMarriedConfirmDialog(false)
    } catch (error) {
      console.error("Error updating marital status:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  const handleNotificationClick = async (type: 'view' | 'interest', targetId: string) => {
    if (type === 'view') {
      setWhoViewedMe(prev => prev.filter(p => p.user_id !== targetId))
    } else {
      setWhoExpressedInterest(prev => prev.filter(p => p.user_id !== targetId))
    }

    try {
      const res = await authFetch(`/api/${type === 'view' ? 'views' : 'likes'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          type === 'view'
            ? { viewerId: targetId, viewedUserId: userId }
            : { userId: targetId, likedUserId: userId, is_read: true }
        ),
      })
      if (!res.ok) {
        throw new Error(`Failed to mark notification as read (${res.status})`)
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }

    router.push(`/dashboard/profile/${targetId}`)
  }

  const isMarried = profile?.maritalStatus === "Married"

  const getPremiumBadge = () => {
    if (!profile?.isPremium) return null
    
    const isExpired = profile.premiumExpiresAt && new Date(profile.premiumExpiresAt) < new Date()
    if (isExpired) return null
    
    if (profile.premiumPlan === 'till_you_marry') return <span className="inline-flex items-center gap-1 bg-[#fce8ef] text-[#e87898] px-2.5 py-1 rounded-full text-xs font-medium border border-[#e87898]/15"><Crown className="h-3 w-3"/> Lifetime Member</span>
    if (profile.premiumPlan === 'elite') return <EliteMemberBadge />
    if (profile.premiumPlan === 'prime_gold') return <span className="inline-flex items-center gap-1 bg-[#c9a227]/10 text-[#c9a227] px-2.5 py-1 rounded-full text-xs font-medium"><Star className="h-3 w-3"/> Gold Member</span>
    if (profile.premiumPlan === 'prime' || profile.premiumPlan === '3_months') return <span className="inline-flex items-center gap-1 bg-[#1F4068]/10 text-[#1F4068] px-2.5 py-1 rounded-full text-xs font-medium"><Shield className="h-3 w-3"/> Prime Member</span>
    
    return <span className="inline-flex items-center gap-1 bg-[#fce8ef] text-[#e87898] px-2.5 py-1 rounded-full text-xs font-medium border border-[#e87898]/15"><Crown className="h-3 w-3"/> Premium</span>
  }

  const displayName = profile?.name?.split(" ")[0] || userName?.split(" ")[0] || "there"
  const trustScore = calculateTrustScore(!!profile?.photo_verified, completionPercentage, profile?.photos?.length || 0, !!profile?.familyPhoto)
  const trustLabel = trustScore >= 9 ? "Excellent" : trustScore >= 7 ? "Good" : "Fair"
  const photoCount = profile?.photos?.length || 0
  const mobileVerified = !!profile?.contactNumber

  return (
  <>
    <div className="flex min-w-0">
      <aside className="hidden lg:flex w-[272px] shrink-0 sticky top-0 self-start bg-white border-r border-[#f0f0f0] flex-col px-3 py-6 lg:min-h-full">
        <DashboardSidebar
          mutualCount={mutualCount}
          iLikedCount={iLikedCount}
          likedMeCount={likedMeCount}
          isCoreProfileComplete={isCoreProfileComplete}
          completionPercentage={completionPercentage}
          onDashboard={() => router.push("/dashboard")}
          onMutualMatches={onNavigateToMutualMatches}
          onInterestsSent={onNavigateToILiked}
          onInterestsReceived={onNavigateToLikedMe}
          onPreferences={onNavigateToPartnerPreferences}
          onBrowse={() => onNavigateToBrowse()}
          onHoroscope={onNavigateToHoroscope}
          onSelections={onNavigateToSelections}
          onParents={onNavigateToParents}
          onShortlisted={() => onNavigateToBrowse("shortlisted-by-you")}
          onImproveProfile={onNavigateToProfileSetup}
        />
      </aside>

      <div className="flex-1 bg-[#faf8f4] min-w-0">
        <div className="p-5 lg:p-6 space-y-5 max-w-[1200px] min-w-0">
          <DashboardHeroBanner
            displayName={displayName}
            photoUrl={profile?.photos?.[0]}
            isPremium={profile?.isPremium}
            photoVerified={profile?.photo_verified}
            trustScore={trustScore}
            trustLabel={trustLabel}
            premiumBadge={getPremiumBadge()}
          />

          {completionPercentage < 100 && (
            <div className="rounded-[18px] border border-[#eadfce] bg-gradient-to-r from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-[0_2px_12px_rgba(31,64,104,0.05)]">
              <div className="relative h-14 w-14 shrink-0">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0ebe3" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="#e87898" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(completionPercentage / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-[#1F4068]">
                  {completionPercentage}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#1F4068]">Complete your profile</h3>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Profiles with complete details and photos get up to 5× more interest. Finish the
                  remaining sections to appear in more matches.
                </p>
              </div>
              <button
                onClick={onNavigateToProfileSetup}
                className="shrink-0 rounded-[10px] bg-[#e87898] hover:bg-[#d66686] px-5 h-10 text-[13px] font-medium text-white transition-colors"
              >
                Complete now
              </button>
            </div>
          )}

          {isCoreProfileComplete ? (
            <>
              <DashboardStatsRow
                mutualCount={mutualCount}
                iLikedCount={iLikedCount}
                likedMeCount={likedMeCount}
                onMutualMatches={onNavigateToMutualMatches}
                onInterestsSent={onNavigateToILiked}
                onInterestsReceived={onNavigateToLikedMe}
              />

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5 items-stretch min-w-0">
                <div className="min-w-0">
                  <DashboardDailyRecommendations
                    profiles={dailyRecs}
                    onProfileClick={(p) => router.push(`/dashboard/daily-recommendations?id=${p.user_id}`)}
                    onViewAll={() => router.push("/dashboard/daily-recommendations")}
                    isLoading={isSectionsLoading}
                    shortlistedIds={shortlistedIds}
                    onShortlist={handleShortlist}
                    shortlistLoadingId={shortlistLoadingId}
                  />
                </div>

                <div className="min-w-0">
                  <DashboardJourneyPanel
                    completionPercentage={completionPercentage}
                    photoCount={photoCount}
                    mobileVerified={mobileVerified}
                    idVerified={!!profile?.photo_verified}
                    onAddPhotos={onNavigateToProfileSetup}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[20px] border border-dashed border-[#fcd34d] p-10 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F4068] mb-2">Complete your profile first</h3>
              <p className="text-sm text-[#6b7280] mb-6 max-w-md mx-auto leading-relaxed">
                Fill in your personal, contact, education, profession, and family details to view matches.
              </p>
              <Button
                onClick={onNavigateToProfileSetup}
                className="h-10 px-6 rounded-[10px] bg-[#e87898] hover:bg-[#d66686] text-white text-[13px] font-medium"
              >
                Go to profile setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {isProfileComplete && !profile?.photo_verified && (
            <div
              onClick={() => setShowVerificationDialog(true)}
              className="cursor-pointer bg-white rounded-[20px] border border-[#fce8ef] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#e87898]/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-[#fce8ef] rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-[#e87898]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F4068] text-[15px]">Verify your identity</h3>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">Build trust with other members.</p>
                </div>
              </div>
              <Button className="h-9 px-5 rounded-[10px] bg-[#e87898] hover:bg-[#d66686] text-white text-[13px] font-medium shrink-0">
                Verify now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>

  {/* Portals / Dialogs Moved to root level for proper viewport centering */}
  <VerificationDialog 
    isOpen={showVerificationDialog} 
    onClose={() => setShowVerificationDialog(false)} 
    userId={userId} 
    existingPhotos={profile?.photos || []}
  />

  <MarriedConfirmationDialog 
    isOpen={showMarriedConfirmDialog} 
    onOpenChange={setShowMarriedConfirmDialog} 
    onConfirm={handleMarkAsMarried} 
    isLoading={false} 
  />

  <SubscriptionDialog 
    isOpen={showSubscriptionDialog} 
    onClose={() => setShowSubscriptionDialog(false)} 
    featureName="Horoscope Matching & Compatibility"
  />

  <HoroscopeGeneratorDialog
    isOpen={showHoroscopeDialog}
    onClose={() => setShowHoroscopeDialog(false)}
    userId={userId}
    onSave={() => {
      // Refresh logic if needed
    }}
  />

  <CompatibilitySheet 
    isOpen={showBreakdown}
    onClose={() => setShowBreakdown(false)}
    userName={breakdownName}
    lifestyleScore={activeBreakdown?.lifestyle?.totalScore || 0}
    poruthamScore={activeBreakdown?.horoscope?.score || 0}
    breakdown={activeBreakdown?.lifestyle?.breakdown || []}
    poruthamDetails={activeBreakdown?.horoscope?.breakdown}
  />
</>
)
}
