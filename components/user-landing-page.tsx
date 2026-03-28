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
  ShieldCheck
} from "lucide-react"
import { ProfileCarousel } from "./profile-carousel"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
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
}

export function UserLandingPage({ userEmail, userId, onNavigateToProfileSetup, onNavigateToBrowse, onNavigateToParents, onNavigateToSelections, onNavigateToPartnerPreferences, onNavigateToLikes, onNavigateToMutualMatches, onNavigateToILiked, onNavigateToLikedMe, onProgressChange }: UserLandingPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showMarriedConfirmDialog, setShowMarriedConfirmDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // New states for match sections
  const [dailyRecs, setDailyRecs] = useState<any[]>([])
  const [allMatches, setAllMatches] = useState<any[]>([])
  const [newMatches, setNewMatches] = useState<any[]>([])
  const [whoViewedMe, setWhoViewedMe] = useState<any[]>([])
  const [profilesIViewed, setProfilesIViewed] = useState<any[]>([])
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
          { data: photos }
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
          supabase.from("photos").select("user_photos, family_photo, aadhar_front, aadhar_back").eq("user_id", userId).maybeSingle()
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
          .select("sex")
          .eq("user_id", userId)
          .maybeSingle()

        if (!userData) return

        const targetGender = (userData.sex || "").toLowerCase() === "male" ? "Female" : "Male"

        // 2. Fetch partner preferences
        const { data: prefs } = await supabase
          .from("partner_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        // 3. Fetch activity data (views & likes for counts)
        const [viewsRes, likesRes] = await Promise.all([
          fetch(`/api/views?userId=${userId}`),
          fetch(`/api/likes?userId=${userId}`)
        ])
        const viewsData = await viewsRes.json()
        const likesData = await likesRes.json()

        const likedIds = likesData.iLikedIds || []
        const likedByMeIds = likesData.likedMeIds || []
        
        const viewedIds = (viewsData.iViewed || []).map((v: any) => v.viewed_user_id)
        const viewedByMeIds = (viewsData.viewedMe || []).map((v: any) => v.viewer_user_id)
        
        setILikedCount(likedIds.length)
        setLikedMeCount(likedByMeIds.length)
        
        // Calculate Mutual Count
        const mutuals = likedIds.filter((id: string) => likedByMeIds.includes(id))
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
          { data: eduData }
        ] = await Promise.all([
          supabase.from("photos").select("user_id, user_photos").in("user_id", matchUserIds),
          supabase.from("contact_details").select("user_id, current_district, current_state").in("user_id", matchUserIds),
          supabase.from("profession_employee").select("user_id, designation, company").in("user_id", matchUserIds),
          supabase.from("profession_business").select("user_id, designation, business_name").in("user_id", matchUserIds),
          supabase.from("education_details").select("user_id, education").in("user_id", matchUserIds)
        ])

        const combined = potentialMatches.map(p => {
            const photos = photosData?.find(x => x.user_id === p.user_id)?.user_photos || []
            const contact = contactData?.find(x => x.user_id === p.user_id)
            const emp = empData?.find(x => x.user_id === p.user_id)
            const bus = busData?.find(x => x.user_id === p.user_id)
            const edu = eduData?.find(x => x.user_id === p.user_id)

            let profession = "Not specified"
            if (emp?.designation) profession = emp.designation + (emp.company ? ` at ${emp.company}` : "")
            else if (bus?.designation) profession = bus.designation + (bus.business_name ? ` at ${bus.business_name}` : "")

            return {
                ...p,
                photos,
                location: contact?.current_district ? `${contact.current_district}${contact.current_state ? `, ${contact.current_state}` : ""}` : "Location hidden",
                profession,
                education: edu?.education || "Not specified"
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

        setWhoViewedMe(combined.filter(p => viewedByMeIds.includes(p.user_id)))
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

      setProfile(prev => prev ? { ...prev, maritalStatus: "Married" } : { maritalStatus: "Married" })
      setShowMarriedConfirmDialog(false)
    } catch (error) {
      console.error("Error updating marital status:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  const isMarried = profile?.maritalStatus === "Married"

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar - Sticky */}
        <aside className="w-full lg:w-48 xl:w-56 lg:sticky lg:top-20 space-y-4 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden">
              <CardHeader className="py-3 px-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <CardTitle className="text-[11px] uppercase tracking-wider flex items-center gap-2 font-bold text-gray-500">
                  <Sparkles className="h-3 w-3 text-[#4B0082]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-1.5 space-y-0.5">
                {completionPercentage === 0 ? (
                  <div className="text-xs text-red-500 mb-2 bg-red-50 dark:bg-red-900/10 p-2 rounded-md border border-red-100 dark:border-red-900/50">
                    Complete profile to unlock features
                  </div>
                ) : null}
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#4B0082]/10 hover:text-[#4B0082] group transition-all"
                  onClick={onNavigateToMutualMatches}
                  disabled={completionPercentage === 0}
                >
                  <HeartHandshake className="h-3.5 w-3.5 mr-2.5 text-[#4B0082] group-hover:scale-110 transition-transform" />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="font-semibold text-[11px]">Mutual Matches</div>
                    <span className="bg-[#4B0082] text-white text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{mutualCount}</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#4B0082]/10 hover:text-[#4B0082] group transition-all"
                  onClick={onNavigateToILiked}
                  disabled={completionPercentage === 0}
                >
                  <Heart className="h-3.5 w-3.5 mr-2.5 text-[#FF1493] group-hover:scale-110 transition-transform" />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="font-semibold text-[11px]">I Liked</div>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{iLikedCount}</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#4B0082]/10 hover:text-[#4B0082] group transition-all"
                  onClick={onNavigateToLikedMe}
                  disabled={completionPercentage === 0}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-2.5 text-[#4B0082] group-hover:scale-110 transition-transform" />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="font-semibold text-[11px]">Liked Me</div>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{likedMeCount}</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#4B0082]/10 hover:text-[#4B0082] group transition-all"
                  onClick={onNavigateToPartnerPreferences}
                  disabled={completionPercentage === 0}
                >
                  <Search className="h-3.5 w-3.5 mr-2.5 text-[#4B0082] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-[11px]">Preferences</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#4B0082]/10 hover:text-[#4B0082] group transition-all"
                  onClick={onNavigateToBrowse}
                  disabled={completionPercentage === 0}
                >
                  <Users className="h-3.5 w-3.5 mr-2.5 text-[#4B0082] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-[11px]">Browse</div>
                  </div>
                </Button>
                <div className="pt-2 pb-1 px-2">
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full mb-2"></div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Parental Access</div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#4B0082]/10 hover:text-[#4B0082] group transition-all"
                  onClick={onNavigateToSelections}
                >
                  <Heart className="h-3.5 w-3.5 mr-2.5 text-[#FF1493] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-[11px]">Selections</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#4B0082]/10 hover:text-[#4B0082] group transition-all"
                  onClick={onNavigateToParents}
                >
                  <UserCircle2 className="h-3.5 w-3.5 mr-2.5 text-[#4B0082] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-[11px]">Parents</div>
                  </div>
                </Button>

                {!isMarried && (
                  <>
                    <div className="pt-2 pb-1 px-2">
                      <div className="h-px bg-gray-100 dark:bg-gray-700 w-full mb-2"></div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Profile Status</div>
                    </div>
                      {!profile?.photo_verified && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto py-1.5 px-2 hover:bg-blue-500/10 hover:text-blue-600 group transition-all"
                          onClick={() => setShowVerificationDialog(true)}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-2.5 text-blue-500 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <div className="font-semibold text-[11px]">Verify Profile</div>
                          </div>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto py-1.5 px-2 hover:bg-[#FF1493]/10 hover:text-[#FF1493] group transition-all"
                        onClick={() => setShowMarriedConfirmDialog(true)}
                      >
                        <HeartHandshake className="h-3.5 w-3.5 mr-2.5 text-[#FF1493] group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="font-semibold text-[11px]">Mark as Married</div>
                        </div>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </aside>
  
          {/* Right Main Content */}
          <main className="flex-1 w-full min-w-0 space-y-6">
            {/* Welcome Area */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-2xl bg-gradient-to-r from-[#4B0082]/5 via-[#FF1493]/5 to-transparent border border-[#4B0082]/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-[#4B0082]" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {userName}! 👋
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We're excited to help you find your perfect match
                </p>
                {profile?.photo_verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                )}
              </div>
            </motion.div>
 
            {/* Verification Banner Prompt - Only show if complete but NOT verified */}
            {isProfileComplete && !profile?.photo_verified && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={() => setShowVerificationDialog(true)}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-r from-[#4B0082] to-blue-600 p-4 rounded-2xl text-white shadow-xl hover:shadow-[#4B0082]/20 transition-all active:scale-[0.98] border border-white/10 relative overflow-hidden">
                    {/* Animated background pulse */}
                    <div className="absolute inset-0 bg-white/10 animate-pulse group-hover:bg-white/20 transition-colors" />
                    
                    <div className="relative flex items-center justify-between font-outfit">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Welcome back! Verify your identity by clicking here</h3>
                                <p className="text-[10px] opacity-80 mt-0.5 group-hover:opacity-100 transition-opacity">Help others trust your profile more. It only takes a minute!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all">
                             Verify Now <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
              </motion.div>
            )}

          {/* Profile Status Card - Only show if not 100% */}
          {!isProfileComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/95 dark:bg-gray-800/95 border-2 border-[#4B0082]/20 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <User className="h-5 w-5 text-[#4B0082]" />
                        Complete Your Profile
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Unlock better matches by completing your profile
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">Completion Progress</span>
                      <span className="text-xs font-bold text-[#4B0082]">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden border border-gray-200 dark:border-gray-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-[#4B0082] to-[#FF1493]"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={onNavigateToProfileSetup} 
                    className="w-full bg-[#4B0082] hover:bg-[#3B0062] text-white text-sm"
                  >
                    Update My Profile
                  </Button>
                </CardContent>
              </Card>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ProfileCarousel
                    title="Who Viewed You"
                    subtitle="Members who visited your profile"
                    profiles={whoViewedMe}
                    onProfileClick={(p) => onNavigateToBrowse()}
                    onViewAll={onNavigateToBrowse}
                    isLoading={isSectionsLoading}
                    icon={<Eye className="h-6 w-6" />}
                />
                <ProfileCarousel
                    title="Profiles You Viewed"
                    subtitle="Members whose profiles you visited"
                    profiles={profilesIViewed}
                    onProfileClick={(p) => onNavigateToBrowse()}
                    onViewAll={onNavigateToBrowse}
                    isLoading={isSectionsLoading}
                    icon={<History className="h-6 w-6" />}
                />
            </div>

        </div>

        {/* Marriage Status Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          {isMarried ? (
            <Card className="bg-gradient-to-br from-[#FF1493]/10 via-[#4B0082]/10 to-[#4B0082]/10 border-2 border-[#FF1493]/30 dark:border-[#FF1493]/60 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF1493]/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4B0082]/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FF1493] to-[#4B0082] rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <HeartHandshake className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Congratulations on finding your match! 🎉
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                  We are thrilled that you found your life partner. Your profile is now marked as Married and has been respectfully hidden from public matching. Wishing you a lifetime of joy and happiness!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <HeartHandshake className="h-5 w-5 text-[#FF1493]" />
                    Found your match here?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                    Once you've found your life partner, letting us know ensures you won't be disturbed by new matches or calls. Your profile will be moved securely into our successfully matched section.
                  </p>
                </div>
                <button
                  onClick={() => setShowMarriedConfirmDialog(true)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-lg bg-gradient-to-r from-[#FF1493] to-[#4B0082] hover:opacity-90 text-white shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <HeartHandshake className="h-5 w-5" />
                  Mark Profile as Married
                </button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>

    {/* Verification Dialog */}
    <VerificationDialog 
        isOpen={showVerificationDialog} 
        onClose={() => setShowVerificationDialog(false)} 
        userId={userId} 
        existingPhotos={profile?.photos || []}
    />

    {/* Confirmation Dialog */}
    <AlertDialog open={showMarriedConfirmDialog} onOpenChange={setShowMarriedConfirmDialog}>
      <AlertDialogContent className="bg-white dark:bg-gray-900 border-2 border-[#FF1493]/30 dark:border-[#FF1493]/60 shadow-2xl">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 bg-[#FF1493]/10 dark:bg-[#FF1493]/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-[#FF1493]" />
          </div>
          <AlertDialogTitle className="text-center text-xl text-gray-900 dark:text-white">
            Confirm Marriage Status
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Are you sure you want to mark your profile as Married? <br /><br />
            <strong className="text-gray-900 dark:text-gray-200">This action will:</strong>
            <ul className="list-disc text-left pl-6 mt-2 space-y-1">
              <li>Remove your profile from the public matching pool.</li>
              <li>Stop you from receiving new match suggestions.</li>
              <li>Hide your profile from new searches.</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center mt-6 gap-3">
          <AlertDialogCancel className="w-full sm:w-auto mt-0 border-2 border-gray-400 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleMarkAsMarried}
            className="w-full sm:w-auto bg-gradient-to-r from-[#FF1493] to-[#4B0082] hover:opacity-90 text-white border-0 font-semibold shadow-lg shadow-[#FF1493]/20"
          >
            Yes, Mark as Married
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
  )
}
