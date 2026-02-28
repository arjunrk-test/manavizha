"use client"

import { Button } from "@/components/ui/button"
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
  AlertTriangle
} from "lucide-react"
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
}

interface ProfileData {
  name?: string
  contactNumber?: string
  profession?: string
  maritalStatus?: string
}

export function UserLandingPage({ userEmail, userId, onNavigateToProfileSetup, onNavigateToBrowse }: UserLandingPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showMarriedConfirmDialog, setShowMarriedConfirmDialog] = useState(false)
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
          supabase.from("personal_details").select("completion_percentage, name, date_of_birth, age, sex, height, weight, skin_color, body_type, marital_status, about, food_preference, languages").eq("user_id", userId).maybeSingle(),
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

        const profileData: ProfileData = {}

        // Name
        if (personal?.name) {
          profileData.name = personal.name
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-6 w-6 text-[#4B0082]" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, {userName}! 👋
            </h1>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-400">
            We're excited to help you find your perfect match
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <User className="h-6 w-6 text-[#4B0082]" />
                      Profile Status
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Complete your profile to increase your match potential
                    </CardDescription>
                  </div>
                  {isProfileComplete && (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Completion
                      </span>
                      <span className="text-sm font-bold text-[#4B0082]">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Profile Info */}
                  {profile && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {profile.name && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.name}</p>
                        </div>
                      )}
                      {profile.contactNumber && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact Number</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.contactNumber}</p>
                        </div>
                      )}
                      {profile.profession && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profession</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.profession}</p>
                        </div>
                      )}
                      {profile.maritalStatus && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marital Status</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.maritalStatus}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={onNavigateToProfileSetup}
                    className="w-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white font-semibold py-6 text-lg"
                  >
                    {isProfileComplete ? (
                      <>
                        <Edit className="h-5 w-5 mr-2" />
                        Update Profile
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Complete Your Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl h-full">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#4B0082]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completionPercentage === 0 ? (
                  <div className="text-sm text-red-500 mb-4 bg-red-50 dark:bg-red-900/10 p-3 rounded-md border border-red-100 dark:border-red-900/50 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Please complete your profile to access matchmaking features.</p>
                  </div>
                ) : null}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 hover:bg-[#4B0082]/10 hover:border-[#4B0082]"
                  disabled
                >
                  <Heart className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">View Matches</div>
                    <div className="text-xs text-gray-500">Coming soon</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 hover:bg-[#4B0082]/10 hover:border-[#4B0082]"
                  onClick={onNavigateToBrowse}
                  disabled={completionPercentage === 0}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Browse Profiles</div>
                    <div className="text-xs text-gray-500">
                      {completionPercentage === 0
                        ? "Unlock by completing your profile"
                        : "Find your perfect match"}
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

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
      </div>

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
