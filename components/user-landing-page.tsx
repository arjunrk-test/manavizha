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
  Sparkles
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

interface UserLandingPageProps {
  userEmail: string
  userId: string
  onNavigateToProfileSetup: () => void
}

interface ProfileData {
  name?: string
  contactNumber?: string
  profession?: string
  maritalStatus?: string
}

export function UserLandingPage({ userEmail, userId, onNavigateToProfileSetup }: UserLandingPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const userName = userEmail.split("@")[0]
  const isProfileComplete = completionPercentage === 100

  useEffect(() => {
    const calculateProgress = async () => {
      try {
        const stepIds = ["personal", "contact", "education", "professional", "family", "horoscope", "interests", "social", "photos", "referral"]
        const stepProgresses: number[] = []

        for (const stepId of stepIds) {
          let progress = 0

          if (stepId === "personal") {
            const { data } = await supabase
              .from("personal_details")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
            
            if (data) {
              const fields = ["name", "date_of_birth", "age", "sex", "height", "weight", "skin_color", "body_type", "marital_status", "about", "food_preference", "languages"]
              const filled = fields.filter(field => {
                const value = data[field]
                if (field === "languages") {
                  return Array.isArray(value) && value.length > 0
                }
                return value !== null && value !== undefined && value !== ""
              }).length
              progress = Math.round((filled / fields.length) * 100)
            }
          } else if (stepId === "contact") {
            const { data } = await supabase
              .from("contact_details")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
            
            if (data) {
              const fields = ["phone", "whatsapp_number", "permanent_address_line1", "permanent_pincode", "permanent_area", "permanent_taluk", "permanent_district", "permanent_division", "permanent_region", "permanent_state", "permanent_country", "current_address_line1", "current_pincode", "current_area", "current_taluk", "current_district", "current_division", "current_region", "current_state", "current_country"]
              const filled = fields.filter(field => {
                const value = data[field]
                return value !== null && value !== undefined && value !== ""
              }).length
              progress = Math.round((filled / fields.length) * 100)
            }
          } else if (stepId === "education") {
            const { data } = await supabase
              .from("education_details")
              .select("*")
              .eq("user_id", userId)
            
            if (data && data.length > 0) {
              const hasData = data.some(edu => edu.education && edu.education !== "")
              progress = hasData ? 100 : 0
            }
          } else if (stepId === "professional") {
            const { data: employeeData } = await supabase
              .from("profession_employee")
              .select("completion_percentage")
              .eq("user_id", userId)
              .maybeSingle()
            
            const { data: businessData } = await supabase
              .from("profession_business")
              .select("completion_percentage")
              .eq("user_id", userId)
              .maybeSingle()
            
            const { data: studentData } = await supabase
              .from("profession_student")
              .select("completion_percentage")
              .eq("user_id", userId)
              .maybeSingle()
            
            // If any table has 100%, use 100%
            if (employeeData?.completion_percentage === 100 || 
                businessData?.completion_percentage === 100 || 
                studentData?.completion_percentage === 100) {
              progress = 100
            } else if (employeeData?.completion_percentage !== null && employeeData?.completion_percentage !== undefined) {
              progress = employeeData.completion_percentage
            } else if (businessData?.completion_percentage !== null && businessData?.completion_percentage !== undefined) {
              progress = businessData.completion_percentage
            } else if (studentData?.completion_percentage !== null && studentData?.completion_percentage !== undefined) {
              progress = studentData.completion_percentage
            }
          } else if (stepId === "family") {
            const { data } = await supabase
              .from("family_details")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
            
            if (data) {
              const fields = ["father_name", "father_occupation", "mother_name", "mother_occupation", "parents_address_line1", "parents_pincode", "parents_area", "parents_taluk", "parents_district", "parents_division", "parents_region", "parents_state", "parents_country", "caste", "family_type", "family_status"]
              const filled = fields.filter(field => {
                const value = data[field]
                return value !== null && value !== undefined && value !== ""
              }).length
              progress = Math.round((filled / fields.length) * 100)
            }
          } else if (stepId === "horoscope") {
            const { data } = await supabase
              .from("horoscope_details")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
            
            if (data) {
              const fields = ["jaadhagam_url", "time_of_birth", "place_of_birth", "zodiac_sign", "star", "lagnam", "dhosham"]
              const filled = fields.filter(field => {
                const value = data[field]
                return value !== null && value !== undefined && value !== ""
              }).length
              progress = Math.round((filled / fields.length) * 100)
            }
          } else if (stepId === "interests") {
            const { data } = await supabase
              .from("interests")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
            
            if (data) {
              const hobbies = data.hobbies || []
              const interests = data.interests || []
              if (hobbies.length >= 3 && interests.length >= 3) {
                progress = 100
              } else {
                progress = 0
              }
            }
          } else if (stepId === "social") {
            const { data } = await supabase
              .from("social_habits")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
            
            if (data) {
              const fields = ["smoking", "drinking", "parties", "pubs"]
              const filled = fields.filter(field => {
                const value = data[field]
                return value !== null && value !== undefined && value !== ""
              }).length
              progress = Math.round((filled / fields.length) * 100)
            }
          } else if (stepId === "photos") {
            const { data } = await supabase
              .from("photos")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
            
            if (data) {
              const userPhotos = data.user_photos || []
              if (userPhotos.length >= 3 && data.family_photo && data.aadhar_front && data.aadhar_back) {
                progress = 100
              } else {
                progress = 0
              }
            }
          } else if (stepId === "referral") {
            // Referral is optional
            progress = 100
          }

          stepProgresses.push(progress)
        }

        const totalProgress = stepProgresses.reduce((sum, p) => sum + p, 0)
        const averageProgress = Math.round(totalProgress / stepIds.length)
        setCompletionPercentage(averageProgress)

        // Load profile data for display
        const { data: personalData } = await supabase
          .from("personal_details")
          .select("name, marital_status")
          .eq("user_id", userId)
          .maybeSingle()

        const { data: contactData } = await supabase
          .from("contact_details")
          .select("phone")
          .eq("user_id", userId)
          .maybeSingle()

        // Fetch professional data
        const { data: employeeData } = await supabase
          .from("profession_employee")
          .select("designation, company")
          .eq("user_id", userId)
          .maybeSingle()

        const { data: businessData } = await supabase
          .from("profession_business")
          .select("designation, business_name")
          .eq("user_id", userId)
          .maybeSingle()

        const { data: studentData } = await supabase
          .from("profession_student")
          .select("course, institution")
          .eq("user_id", userId)
          .maybeSingle()

        const profileData: ProfileData = {}

        // Name
        if (personalData?.name) {
          profileData.name = personalData.name
        }

        // Contact Number
        if (contactData?.phone) {
          profileData.contactNumber = contactData.phone
        }

        // Profession
        if (employeeData) {
          const parts: string[] = []
          if (employeeData.designation) parts.push(employeeData.designation)
          if (employeeData.company) parts.push(employeeData.company)
          if (parts.length > 0) {
            profileData.profession = parts.join(" at ")
          }
        } else if (businessData) {
          const parts: string[] = []
          if (businessData.designation) parts.push(businessData.designation)
          if (businessData.business_name) parts.push(businessData.business_name)
          if (parts.length > 0) {
            profileData.profession = parts.join(" at ")
          }
        } else if (studentData) {
          const parts: string[] = []
          if (studentData.course) parts.push(studentData.course)
          if (studentData.institution) parts.push(studentData.institution)
          if (parts.length > 0) {
            profileData.profession = parts.join(" at ")
          }
        }

        // Marital Status
        if (personalData?.marital_status) {
          const status = personalData.marital_status
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
                  disabled
                >
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Browse Profiles</div>
                    <div className="text-xs text-gray-500">Coming soon</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

