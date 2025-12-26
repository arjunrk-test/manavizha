"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ProfileSetupForm } from "@/components/profile-setup-form"
import { UserLandingPage } from "@/components/user-landing-page"
import { LogOut, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profileProgress, setProfileProgress] = useState(0)
  const [showProfileSetup, setShowProfileSetup] = useState(false)

  // Calculate profile progress when not in profile setup
  useEffect(() => {
    if (user && !showProfileSetup) {
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
                .eq("user_id", user.id)
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
                .eq("user_id", user.id)
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
                .eq("user_id", user.id)
              
              if (data && data.length > 0) {
                const hasData = data.some(edu => edu.education && edu.education !== "")
                progress = hasData ? 100 : 0
              }
            } else if (stepId === "professional") {
              const { data: employeeData } = await supabase
                .from("profession_employee")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle()
              
              const { data: businessData } = await supabase
                .from("profession_business")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle()
              
              const { data: studentData } = await supabase
                .from("profession_student")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle()
              
              if (employeeData) {
                // Check sector (with "other" option handling)
                let sectorValid = false
                if (employeeData.sector) {
                  if (employeeData.sector === "other") {
                    sectorValid = employeeData.sector_other && employeeData.sector_other.trim() !== ""
                  } else {
                    sectorValid = true
                  }
                }
                
                const otherFields = ["company", "designation", "salary", "work_location"]
                const filled = otherFields.filter(field => {
                  const value = employeeData[field]
                  if (field === "salary") {
                    return value && value !== "₹" && value !== ""
                  }
                  return value !== null && value !== undefined && value !== ""
                }).length
                
                // Count sector as filled if valid, plus other fields, plus employmentType
                const totalFilled = (sectorValid ? 1 : 0) + filled + 1
                progress = Math.round((totalFilled / 6) * 100)
              } else if (businessData) {
                // Check sector (with "other" option handling)
                let sectorValid = false
                if (businessData.sector) {
                  if (businessData.sector === "other") {
                    sectorValid = businessData.sector_other && businessData.sector_other.trim() !== ""
                  } else {
                    sectorValid = true
                  }
                }
                
                // Check businessType (with "other" option handling)
                let businessTypeValid = false
                if (businessData.business_type) {
                  if (businessData.business_type === "other") {
                    businessTypeValid = businessData.business_type_other && businessData.business_type_other.trim() !== ""
                  } else {
                    businessTypeValid = true
                  }
                }
                
                const otherFields = ["designation", "annual_returns", "business_location"]
                const filled = otherFields.filter(field => {
                  const value = businessData[field]
                  if (field === "annual_returns") {
                    return value && value !== "₹" && value !== ""
                  }
                  return value !== null && value !== undefined && value !== ""
                }).length
                
                // Check business_name separately
                const businessNameFilled = businessData.business_name && businessData.business_name.trim() !== ""
                
                // Count sector, businessType, businessName, other fields, plus employmentType
                const totalFilled = (sectorValid ? 1 : 0) + (businessTypeValid ? 1 : 0) + (businessNameFilled ? 1 : 0) + filled + 1
                progress = Math.round((totalFilled / 7) * 100)
              } else if (studentData) {
                const fields = ["institution", "course", "field_of_study", "year_of_study", "expected_graduation_year"]
                const filled = fields.filter(field => {
                  const value = studentData[field]
                  return value !== null && value !== undefined && value !== ""
                }).length
                progress = Math.round(((filled + 1) / (fields.length + 1)) * 100)
              }
            } else if (stepId === "family") {
              const { data } = await supabase
                .from("family_details")
                .select("*")
                .eq("user_id", user.id)
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
                .eq("user_id", user.id)
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
                .eq("user_id", user.id)
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
                .eq("user_id", user.id)
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
                .eq("user_id", user.id)
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
          setProfileProgress(averageProgress)
        } catch (error) {
          console.error("Error calculating profile progress:", error)
        }
      }

      calculateProgress()
    }
  }, [user, showProfileSetup])

  useEffect(() => {
    // Check if user is authenticated and is NOT a referral partner
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }

      // Check if user is a referral partner - if so, deny access
      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("user_id")
        .eq("user_id", user.id)
        .single()

      if (!partnerError && partnerData) {
        // User is a referral partner, sign them out and redirect
        await supabase.auth.signOut()
        router.push("/")
        return
      }

      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    } else {
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
      
      {/* White overlay to lighten the gradient */}
      <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />
      
      {/* Overlay pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
      {/* Modern grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      
      {/* Decorative elements */}
      <div className="fixed inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
      </div>

      {/* Animated PNG Background Images */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          "/patterns/pattern1.png",
          "/patterns/pattern2.png",
          "/patterns/pattern3.png",
          "/patterns/pattern4.png",
          "/patterns/pattern5.png",
          "/patterns/pattern6.png",
          "/patterns/pattern7.png",
        ].map((imagePath, i) => {
          const baseX = 5 + (i * 13) % 82
          const baseY = 8 + (i * 15) % 75
          const size = 280 + (i % 3) * 80
          const fadeDuration = 8 + Math.random() * 4
          const rotateDuration = 60 + i * 8
          const moveDuration = 12 + Math.random() * 6
          
          return (
            <motion.div
              key={`bg-image-${i}`}
              className="absolute"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              initial={{ opacity: 0.15 }}
              animate={{
                opacity: [0.1, 0.25, 0.15, 0.25, 0.1],
                rotate: [0, 360],
                x: [-40, 40, -40],
              }}
              transition={{
                opacity: {
                  duration: fadeDuration,
                  repeat: Infinity,
                  delay: i * 1.2,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: rotateDuration,
                  repeat: Infinity,
                  ease: "linear",
                },
                x: {
                  duration: moveDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.7,
                },
              }}
            >
              <img
                src={imagePath}
                alt={`Background pattern ${i + 1}`}
                className="w-full h-full object-contain"
                style={{
                  filter: "brightness(0) invert(1)",
                  mixBlendMode: "screen",
                }}
                onError={(e) => {
                  console.warn(`Image not found: ${imagePath}`)
                  e.currentTarget.style.display = "none"
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Header with Logout - Sticky */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {showProfileSetup ? "Profile Setup" : "Dashboard"}
            </h1>
            {user?.email && (
              <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Back Button - Only show when in profile setup */}
            {showProfileSetup && (
              <Button
                onClick={() => setShowProfileSetup(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Dashboard
              </Button>
            )}
            {/* Profile Progress Icon */}
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] p-0.5">
                <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {profileProgress}%
                  </span>
                </div>
              </div>
              {/* Circular progress ring */}
              <svg className="absolute inset-0 h-10 w-10 transform -rotate-90" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="1.5"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - profileProgress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1F4068" />
                    <stop offset="50%" stopColor="#4B0082" />
                    <stop offset="100%" stopColor="#FF1493" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <Button
              onClick={handleLogout}
              size="sm"
              className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white border-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Show Landing Page or Profile Setup Form */}
        {user && (
          showProfileSetup ? (
            <ProfileSetupForm userId={user.id} onProgressChange={setProfileProgress} />
          ) : (
            <UserLandingPage 
              userEmail={user.email || ""}
              userId={user.id}
              onNavigateToProfileSetup={() => setShowProfileSetup(true)}
            />
          )
        )}

        {/* Footer - Sticky */}
        <footer className="sticky bottom-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60 mt-8">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>© 2024 Manavizha. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="/privacy-policy" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms-of-service" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

