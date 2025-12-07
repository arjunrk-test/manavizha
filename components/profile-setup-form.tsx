"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, CheckCircle } from "lucide-react"
import type { FormData } from "@/types/profile"
import { PersonalDetailsStep } from "@/components/profile-steps/personal-details-step"
import { ContactDetailsStep } from "@/components/profile-steps/contact-details-step"
import { EducationalDetailsStep } from "@/components/profile-steps/educational-details-step"
import { ProfessionalDetailsStep } from "@/components/profile-steps/professional-details-step"
import { FamilyDetailsStep } from "@/components/profile-steps/family-details-step"
import { HoroscopeDetailsStep } from "@/components/profile-steps/horoscope-details-step"
import { InterestsStep } from "@/components/profile-steps/interests-step"
import { SocialHabitsStep } from "@/components/profile-steps/social-habits-step"
import { PhotosStep } from "@/components/profile-steps/photos-step"
import { ReferralStep } from "@/components/profile-steps/referral-step"

const formSteps = [
  { id: "personal", title: "Personal Details" },
  { id: "contact", title: "Contact Details" },
  { id: "education", title: "Educational Details" },
  { id: "professional", title: "Professional Details" },
  { id: "family", title: "Family Details" },
  { id: "horoscope", title: "Horoscope Details" },
  { id: "interests", title: "Interests" },
  { id: "social", title: "Social Habits" },
  { id: "photos", title: "Photos" },
  { id: "referral", title: "Referral" },
]

export function ProfileSetupForm({ userId, onProgressChange }: { userId: string; onProgressChange?: (progress: number) => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    dateOfBirth: "",
    phone: "",
    whatsappNumber: "",
    sex: "",
    height: "",
    weight: "",
    skinColor: "",
    bodyType: "",
    permanentAddressLine1: "",
    permanentAddressLine2: "",
    permanentPincode: "",
    permanentArea: "",
    permanentTaluk: "",
    permanentDistrict: "",
    permanentDivision: "",
    permanentRegion: "",
    permanentState: "",
    permanentCountry: "",
    permanentLandmark: "",
    currentAddressLine1: "",
    currentAddressLine2: "",
    currentPincode: "",
    currentArea: "",
    currentTaluk: "",
    currentDistrict: "",
    currentDivision: "",
    currentRegion: "",
    currentState: "",
    currentCountry: "",
    currentLandmark: "",
    maritalStatus: "",
    about: "",
    foodPreference: "",
    languages: [],
    educationDetails: [
      {
        education: "",
        degree: "",
        institution: "",
        yearOfGraduation: "",
      },
    ],
    occupation: "",
    company: "",
    salary: "₹",
    workLocation: "",
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    parentsResidence: "",
    siblings: "",
    familyDescription: "",
    caste: "",
    subcaste: "",
    kulam: "",
    familyType: "",
    familyStatus: "",
    jaadhagam: "",
    timeOfBirth: "",
    placeOfBirth: "",
    zodiacSign: "",
    star: "",
    lagnam: "",
    dhosham: "",
    hobbies: [],
    interests: [],
    smoking: "",
    drinking: "",
    parties: "",
    pubs: "",
    diet: "",
    preferredAgeMin: "",
    preferredAgeMax: "",
    preferredHeight: "",
    preferredEducation: "",
    preferredOccupation: "",
    preferredLocation: "",
    userPhotos: [],
    familyPhoto: "",
    aadharFront: "",
    aadharBack: "",
    referralPartnerId: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const totalFields = Object.keys(formData).length
    const filledFields = Object.entries(formData).filter(([key, value]) => {
      // Special handling for salary field - only count if it has more than just "₹"
      if (key === "salary") {
        return value !== "₹" && value !== "" && value !== null && value !== undefined
      }
      
      // Special handling for educationDetails - check if at least one entry has actual data
      if (key === "educationDetails") {
        if (Array.isArray(value) && value.length > 0) {
          return value.some((edu: any) => 
            edu && (edu.education || edu.degree || edu.institution || edu.yearOfGraduation)
          )
        }
        return false
      }
      
      // For arrays, check if they have meaningful content
      if (Array.isArray(value)) {
        // For userPhotos, require at least 3 photos
        if (key === "userPhotos") {
          return value.length >= 3
        }
        // For other arrays, check if they have any items
        return value.length > 0
      }
      
      // For regular fields, check if they're not empty
      return value !== "" && value !== null && value !== undefined
    }).length
    return Math.round((filledFields / totalFields) * 100)
  }

  // Calculate step progress
  const calculateStepProgress = (stepId: string) => {
    const stepFields: Record<string, (keyof FormData)[]> = {
      personal: ["name", "age", "sex", "height", "weight", "skinColor", "bodyType", "maritalStatus", "about", "foodPreference", "languages"],
      contact: [
        "phone",
        "whatsappNumber",
        "permanentAddressLine1",
        "permanentPincode",
        "permanentArea",
        "permanentTaluk",
        "permanentDistrict",
        "permanentDivision",
        "permanentRegion",
        "permanentState",
        "permanentCountry",
        "currentAddressLine1",
        "currentPincode",
        "currentArea",
        "currentTaluk",
        "currentDistrict",
        "currentDivision",
        "currentRegion",
        "currentState",
        "currentCountry",
      ],
      education: ["educationDetails"],
      professional: ["occupation", "company", "salary", "workLocation"],
      family: ["fatherName", "fatherOccupation", "motherName", "motherOccupation", "parentsResidence", "caste", "familyType", "familyStatus"],
      horoscope: ["jaadhagam", "timeOfBirth", "placeOfBirth", "zodiacSign", "star", "lagnam"],
      interests: ["hobbies", "interests"],
      social: ["smoking", "drinking", "parties", "pubs"],
      photos: ["userPhotos", "familyPhoto", "aadharFront", "aadharBack"],
      referral: ["referralPartnerId"],
    }

    const fields = stepFields[stepId] || []
    const filled = fields.filter((field) => {
      const value = formData[field]
      if (field === "educationDetails") {
        // For education details, check if at least one entry has education level filled
        const educationDetails = value as FormData["educationDetails"]
        if (Array.isArray(educationDetails) && educationDetails.length > 0) {
          return educationDetails.some((edu) => edu && edu.education && edu.education !== "")
        }
        return false
      }
      if (field === "userPhotos") {
        // User photos: minimum 3 required
        return Array.isArray(value) && value.length >= 3
      }
      if (field === "salary") {
        // Salary field starts with ₹, so check if there's a value after it
        return value && value !== "₹" && value !== "" && value !== null && value !== undefined
      }
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== "" && value !== null && value !== undefined
    }).length
    return fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("users")
        .update(formData)
        .eq("id", userId)

      if (error) throw error
      alert("Profile saved successfully!")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      alert("Error saving profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const overallProgress = calculateOverallProgress()

  // Notify parent of progress changes
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(overallProgress)
    }
  }, [overallProgress, onProgressChange])

  const stepProgress = calculateStepProgress(formSteps[currentStep].id)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Setup</h3>
              </div>

              <div className="space-y-2">
                {formSteps.map((step, index) => {
                  const stepProg = calculateStepProgress(step.id)
                  const isActive = index === currentStep
                  const isCompleted = stepProg === 100

                  return (
                    <motion.button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] text-white shadow-lg scale-105"
                          : isCompleted
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                          : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                      }`}
                      whileHover={!isActive ? { scale: 1.02 } : {}}
                      whileTap={!isActive ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : isActive ? (
                            <Circle className="h-5 w-5 fill-white text-white" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{step.title}</div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Save Button */}
              {currentStep === formSteps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              {/* Step Title */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formSteps[currentStep].title}
                </h2>
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] p-0.5">
                    <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {stepProgress}%
                      </span>
                    </div>
                  </div>
                  {/* Circular progress ring */}
                  <svg className="absolute inset-0 h-12 w-12 transform -rotate-90" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      fill="none"
                      stroke="url(#step-progress-gradient)"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (1 - stepProgress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    <defs>
                      <linearGradient id="step-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1F4068" />
                        <stop offset="50%" stopColor="#4B0082" />
                        <stop offset="100%" stopColor="#FF1493" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 0 && <PersonalDetailsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 1 && <ContactDetailsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 2 && <EducationalDetailsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 3 && <ProfessionalDetailsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 4 && <FamilyDetailsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 5 && <HoroscopeDetailsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 6 && <InterestsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 7 && <SocialHabitsStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 8 && <PhotosStep formData={formData} onChange={handleInputChange} />}
                  {currentStep === 9 && <ReferralStep formData={formData} onChange={handleInputChange} />}
                </motion.div>
              </AnimatePresence>

              {/* Save Button for each form */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white font-semibold py-3"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save {formSteps[currentStep].title}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
