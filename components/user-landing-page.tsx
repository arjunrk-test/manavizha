"use client"

import { Button } from "@/components/ui/button"
import { VerificationDialog } from "@/components/verification-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
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
import { calculateTrustScore } from "@/lib/utils/profile-utils"
import { checkTamilPorutham } from "@/lib/astrology"
import { calculateLifestyleScore } from "@/lib/matching"
import { CompatibilitySheet } from "./compatibility-sheet"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UserLandingPageProps {
  userEmail: string
  userId: string
  onNavigateToProfileSetup: () => void
  onNavigateToBrowse: () => void
  onNavigateToParents: () => void
  onNavigateToSelections: () => void
  onNavigateToPartnerPreferences: () => void
  onNavigateToLikes: () => void
  onNavigateToMutualMatches: () => void
  onNavigateToILiked: () => void
  onNavigateToLikedMe: () => void
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

export function UserLandingPage({ userEmail, userId, onNavigateToProfileSetup, onNavigateToBrowse, onNavigateToParents, onNavigateToSelections, onNavigateToPartnerPreferences, onNavigateToLikes, onNavigateToMutualMatches, onNavigateToILiked, onNavigateToLikedMe, onProgressChange }: UserLandingPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [showMarriedConfirmDialog, setShowMarriedConfirmDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)

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
          { data: settings }
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
          supabase.from("user_settings").select("is_premium, premium_plan, premium_expires_at").eq("user_id", userId).maybeSingle()
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
          if (userPhotos.length >= 3 && photos.family_photo && photos.aadhar_front && photos.aadhar_back) {
            photosProgress = 100
          }
        }
        stepProgresses.push(photosProgress)

        // 10. Referral (Always 100% since it's optional, but only if they've started the form)
        // If they have NO personal data, they haven't started at all, so overall should be 0.
        // We handle this by calculating a base completeness check.
        const hasStartedProfile = personalProgress > 0 || contactProgress > 0
        let referralProgress = hasStartedProfile ? 100 : 0
        stepProgresses.push(referralProgress)

        const totalProgress = stepProgresses.reduce((sum, p) => sum + p, 0)
        // Only round and divide if they have started to avoid baseline 10%
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
                                // It's a signed URL for our bucket, extract the path after the bucket name
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

        if (!userData) return

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

        const viewerData = {
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
          fetch(`/api/views?userId=${userId}`),
          fetch(`/api/likes?userId=${userId}`)
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
          fetch(`/api/premium-status?userIds=${matchUserIds.join(",")}`).then(r => r.ok ? r.json() : []).catch(() => [])
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

            const lifestyleMatch = viewerData ? calculateLifestyleScore(viewerData, targetProfileData) : null
            const horoscopeMatch = (myHoro?.star && targetHoro?.star) 
                ? checkTamilPorutham(myHoro.star, myHoro.zodiac_sign || "", targetHoro.star, targetHoro.zodiac_sign || "")
                : { score: 0, status: 'Athamam', breakdown: {} }

            return {
                ...p,
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
                    setActiveBreakdown({ lifestyle: lifestyleMatch, horoscope: horoscopeMatch })
                    setBreakdownName(p.name || "Unknown")
                    setShowBreakdown(true)
                }
            }
        })

        // -- Apply Preference Filtering for "All Matches" --
        let filtered = combined
        if (prefs) {
            filtered = combined.filter(p => {
                if (prefs.min_age && p.age && p.age < prefs.min_age) return false
                if (prefs.max_age && p.age && p.age > prefs.max_age) return false
                return true
            })
        }

        // -- Section 1: Daily Recommendations (Seeded Shuffle) --
        // Use YYYY-MM-DD + userId as seed for stability
        const today = new Date().toISOString().split('T')[0]
        const seedStr = today + userId
        let seed = 0
        for (let i = 0; i < seedStr.length; i++) seed += seedStr.charCodeAt(i)

        const seededShuffle = (arr: any[]) => {
            const result = [...arr]
            let s = seed
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor((Math.sin(s++) * 10000 - Math.floor(Math.sin(s) * 10000)) * (i + 1))
                ;[result[i], result[j]] = [result[j], result[i]]
            }
            return result
        }
        setDailyRecs(seededShuffle(filtered).slice(0, 10))

        // -- Section 2: All Matches --
        setAllMatches(filtered)

        // -- Section 3: New Matches (Last 30 days) --
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        setNewMatches(combined.filter(p => new Date(p.created_at) > thirtyDaysAgo))

        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        const recentViews = (viewsData.viewedMe || []).filter((v: any) => new Date(v.created_at) > oneMonthAgo && !v.is_read)
        const recentViewedIds = recentViews.map((v: any) => v.viewer_user_id)
        
        const recentInterests = (likedMeDataList || []).filter((l: any) => new Date(l.created_at) > oneMonthAgo && !l.is_read)
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

  const handleMarkAsMarried = async () => {
    try {
      const { error } = await supabase
        .from("personal_details")
        .update({ marital_status: "Married" })
        .eq("user_id", userId)

      if (error) throw error

      // Also deactivate the profile permanently (10 years)
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
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
    // Optimistic Update
    if (type === 'view') {
        setWhoViewedMe(prev => prev.filter(p => p.user_id !== targetId))
        fetch('/api/views', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ viewerId: targetId, viewedUserId: userId })
        })
    } else {
        setWhoExpressedInterest(prev => prev.filter(p => p.user_id !== targetId))
        fetch('/api/likes', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: targetId, likedUserId: userId })
        })
    }
    // Navigate
    onNavigateToBrowse()
  }

  const isMarried = profile?.maritalStatus === "Married"

  const getPremiumBadge = () => {
    if (!profile?.isPremium) return null
    
    const isExpired = profile.premiumExpiresAt && new Date(profile.premiumExpiresAt) < new Date()
    if (isExpired) return null
    
    if (profile.premiumPlan === 'till_you_marry') return <span className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-[10px] md:text-xs uppercase font-black px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-pink-500/20 tracking-widest"><Crown className="h-3.5 w-3.5 md:h-4 md:w-4"/> Lifetime Member</span>
    if (profile.premiumPlan === 'elite') return <span className="bg-gradient-to-r from-[#4B0082] to-[#8A2BE2] text-white text-[10px] md:text-xs uppercase font-black px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-purple-500/20 tracking-widest"><Gem className="h-3.5 w-3.5 md:h-4 md:w-4"/> Elite Member</span>
    if (profile.premiumPlan === 'prime_gold') return <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] md:text-xs uppercase font-black px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-amber-500/20 tracking-widest"><Star className="h-3.5 w-3.5 md:h-4 md:w-4"/> Gold Member</span>
    if (profile.premiumPlan === 'prime' || profile.premiumPlan === '3_months') return <span className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white text-[10px] md:text-xs uppercase font-black px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-blue-500/20 tracking-widest"><Shield className="h-3.5 w-3.5 md:h-4 md:w-4"/> Prime Member</span>
    
    return <span className="bg-gradient-to-r from-[#4B0082] to-[#3b0062] text-white text-[10px] md:text-xs uppercase font-black px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-indigo-500/20 tracking-widest"><Crown className="h-3.5 w-3.5 md:h-4 md:w-4"/> Premium</span>
  }

  return (
  <>
    <div className="max-w-[105rem] mx-auto px-4 sm:px-8 py-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar - Sticky */}
        <aside className="w-full lg:w-[16rem] xl:w-[17rem] lg:sticky lg:top-16 space-y-3 flex-shrink-0">
          {/* Quick Search */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="sds-glass rounded-[1.5rem] p-1.5 flex items-center gap-2 border-indigo-100/50 hover:bg-white/90 transition-all shadow-lg shadow-indigo-900/5 mb-2"
          >
            <div className="w-10 h-10 bg-[#4B0082] rounded-xl flex items-center justify-center shadow-md shadow-indigo-900/10 shrink-0">
              <Search className="h-4 w-4 text-white" />
            </div>
            <input 
              type="text" 
              placeholder="Search by ID..." 
              className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-widest text-[#4B0082] placeholder:text-gray-300 w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sds-glass rounded-[2rem] overflow-hidden p-2"
          >
            <div className="py-2.5 px-4 mb-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40">
                  Quick Actions
                </h4>
            </div>
            
            <div className="space-y-0.5">
              {completionPercentage === 0 ? (
                <div className="text-[10px] text-amber-600 mb-2 bg-amber-50/50 p-3 rounded-2xl border border-amber-100 font-bold leading-relaxed text-center">
                  Complete your profile to see matches.
                </div>
              ) : null}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={onNavigateToMutualMatches}
                disabled={completionPercentage === 0}
              >
                <HeartHandshake className="h-4 w-4 mr-3 text-[#4B0082]" />
                <div className="flex-1 flex items-center justify-between">
                  <div className="font-bold text-[11px] text-gray-700">Mutual Matches</div>
                  <span className="bg-[#4B0082] text-white text-[8px] px-1.5 py-0.5 rounded-md font-black">{mutualCount}</span>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={onNavigateToILiked}
                disabled={completionPercentage === 0}
              >
                <Heart className="h-4 w-4 mr-3 text-rose-400" />
                <div className="flex-1 flex items-center justify-between">
                  <div className="font-bold text-[11px] text-gray-700">I Liked</div>
                  <span className="text-gray-400 text-[8px] font-black">{iLikedCount}</span>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={onNavigateToLikedMe}
                disabled={completionPercentage === 0}
              >
                <Sparkles className="h-4 w-4 mr-3 text-indigo-400" />
                <div className="flex-1 flex items-center justify-between">
                  <div className="font-bold text-[11px] text-gray-700">Liked Me</div>
                  <span className="text-gray-400 text-[8px] font-black">{likedMeCount}</span>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={onNavigateToPartnerPreferences}
                disabled={completionPercentage === 0}
              >
                <Search className="h-4 w-4 mr-3 text-indigo-400" />
                <div className="font-bold text-[11px] text-gray-700">Preferences</div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={onNavigateToBrowse}
                disabled={completionPercentage === 0}
              >
                <Users2 className="h-4 w-4 mr-3 text-indigo-400" />
                <div className="font-bold text-[11px] text-gray-700">Browse</div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={() => setShowSubscriptionDialog(true)}
              >
                <Star className="h-4 w-4 mr-3 text-amber-500" />
                <div className="font-bold text-[11px] text-gray-700">Generate Horoscope</div>
              </Button>
              
              <div className="py-2.5 px-4 mt-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40">
                  Parental Access
                </h4>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={onNavigateToSelections}
                disabled={completionPercentage === 0}
              >
                <Heart className="h-4 w-4 mr-3 text-rose-400" />
                <div className="font-bold text-[11px] text-gray-700">Selections</div>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={onNavigateToParents}
                disabled={completionPercentage === 0}
              >
                <UserCircle2 className="h-4 w-4 mr-3 text-indigo-400" />
                <div className="font-bold text-[11px] text-gray-700">Parents</div>
              </Button>

              <div className="py-2.5 px-4 mt-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40">
                  Profile Status
                </h4>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-4 rounded-xl hover:bg-[#4B0082]/5 hover:text-[#4B0082] group transition-all"
                onClick={() => setShowMarriedConfirmDialog(true)}
              >
                <HeartHandshake className="h-4 w-4 mr-3 text-rose-400" />
                <div className="font-bold text-[11px] text-gray-700">Mark as Married</div>
              </Button>
              
            </div>
          </motion.div>
          </aside>
  
          {/* Right Main Content */}
          <main className="flex-1 w-full min-w-0 space-y-8 pb-24 mt-4">


            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[2rem] sds-glass relative overflow-hidden shadow-xl border-indigo-100/30 flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-indigo-50 border-2 border-white shadow-md">
                    <img src={profile?.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || '')}`} className="w-full h-full object-cover" />
                  </div>
                  {profile?.isPremium && (
                    <div className="absolute -top-2 -right-2 bg-indigo-600 p-1.5 rounded-lg shadow-lg">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl md:text-2xl font-black text-indigo-900">
                      Welcome back, {userName?.split(' ')[0]}! 👋
                    </h1>
                    {profile?.photo_verified && (
                      <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                    We're excited to help you find your perfect match
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-black text-indigo-900/40 uppercase tracking-widest">Trust Score</p>
                  <p className="text-xl font-black text-indigo-900 tracking-tighter">
                    {calculateTrustScore(!!profile?.photo_verified, completionPercentage, profile?.photos?.length || 0, !!profile?.familyPhoto)}
                  </p>
                </div>
                <div className="h-10 w-px bg-indigo-100" />
                <Button 
                   onClick={onNavigateToProfileSetup}
                   variant="ghost" 
                   size="sm" 
                   className="h-10 px-4 rounded-xl text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50"
                >
                  Edit Profile
                </Button>
              </div>
            </motion.div>

 
            {/* Verification Prompt */}
            {isProfileComplete && !profile?.photo_verified && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={() => setShowVerificationDialog(true)}
                className="group cursor-pointer"
              >
                <div className="sds-glass p-6 rounded-[2.5rem] flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors border-indigo-100/50">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-900">ID Verification Required</h3>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Verify identity to build trust</p>
                    </div>
                  </div>
                  <Button className="h-12 px-6 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest">
                    Verify Now
                  </Button>
                </div>
              </motion.div>
            )}


          {/* Progress Card */}
          {!isProfileComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sds-glass rounded-[2.5rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-10"
            >
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Profile Progress</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-7xl font-black text-gray-900 tracking-tighter">{completionPercentage}</span>
                  <span className="text-xl font-black text-[#4B0082]">%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    className="h-full bg-[hsl(var(--marriage))] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  />
                </div>
              </div>
              <Button 
                onClick={onNavigateToProfileSetup}
                className="h-14 px-10 rounded-2xl bg-[#4B0082] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#3B0062] transition-all shadow-xl shadow-indigo-500/20"
              >
                Complete Profile
              </Button>
            </motion.div>
          )}


          {/* --- Match Sections --- */}
          <div className="space-y-2">
            <ProfileCarousel
                title="Daily Recommendations"
                subtitle="Recommended matches for today"
                profiles={dailyRecs}
                onProfileClick={(p) => onNavigateToBrowse()}
                onViewAll={onNavigateToBrowse}
                isLoading={isSectionsLoading}
                icon={<CalendarDays className="h-6 w-6" />}
            />

            <ProfileCarousel
                title="All Matches"
                subtitle="Members who match your partner preferences"
                profiles={allMatches}
                onProfileClick={(p) => onNavigateToBrowse()}
                onViewAll={onNavigateToBrowse}
                isLoading={isSectionsLoading}
                icon={<Users2 className="h-6 w-6" />}
            />

            <ProfileCarousel
                title="New Matches"
                subtitle="Members who joined in the last 30 days"
                profiles={newMatches}
                onProfileClick={(p) => onNavigateToBrowse()}
                onViewAll={onNavigateToBrowse}
                isLoading={isSectionsLoading}
                icon={<Clock className="h-6 w-6" />}
            />

            {/* Secondary Sections Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="sds-glass rounded-[3rem] p-8 border-indigo-100/30 hover:bg-white/60 transition-colors">
                    <ProfileCarousel
                        title="Who Viewed me"
                        subtitle="Visitors to your profile"
                        profiles={whoViewedMe}
                        onProfileClick={(p) => onNavigateToBrowse()}
                        onViewAll={onNavigateToBrowse}
                        isLoading={isSectionsLoading}
                        icon={<Eye className="h-5 w-5" />}
                    />
                </div>
                <div className="sds-glass rounded-[3rem] p-8 border-indigo-100/30 hover:bg-white/60 transition-colors">
                    <ProfileCarousel
                        title="Profiles I Viewed"
                        subtitle="Matches you visited"
                        profiles={profilesIViewed}
                        onProfileClick={(p) => onNavigateToBrowse()}
                        onViewAll={onNavigateToBrowse}
                        isLoading={isSectionsLoading}
                        icon={<History className="h-5 w-5" />}
                    />
                </div>
            </div>

        </div>
          {/* Marriage/Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            {isMarried ? (
              <div className="sds-glass rounded-[3rem] p-16 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[hsl(var(--marriage))]/5 rounded-full blur-[80px] -mr-40 -mt-40" />
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-[hsl(var(--marriage-light))] rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/10">
                    <Star className="h-10 w-10 text-[hsl(var(--marriage))]" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Congratulations!</h2>
                  <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                    Your profile is now hidden after your marriage. We wish you a happy life together!
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setShowMarriedConfirmDialog(true)}
                    className="h-14 px-10 rounded-2xl border-[#4B0082]/20 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:bg-[#4B0082] hover:text-white transition-all bg-white/80 shadow-sm"
                  >
                    Change Status
                  </Button>
                </div>
              </div>
            ) : (
              <div className="sds-glass rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-2">
                    <HeartHandshake className="h-6 w-6 text-[#FF1493]" />
                    Found your partner?
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
                    Once you find your partner, marking your profile as married hides it from other users. You will be moved to our success stories.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowMarriedConfirmDialog(true)}
                  className="h-14 px-10 rounded-2xl bg-white border border-[#FF1493]/20 text-[#FF1493] font-black text-[10px] uppercase tracking-widest hover:bg-[#FF1493] hover:text-white transition-all shadow-xl shadow-pink-500/10"
                >
                  Mark as Married
                </Button>
              </div>
            )}
          </motion.div>
        </main>
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
    featureName="Direct Horoscope Matching"
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
