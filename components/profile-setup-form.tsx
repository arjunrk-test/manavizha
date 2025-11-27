"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import type { FormData } from "@/types/profile"
import { PersonalDetailsStep } from "@/components/profile-steps/personal-details-step"
import { EducationalDetailsStep } from "@/components/profile-steps/educational-details-step"
import { ProfessionalDetailsStep } from "@/components/profile-steps/professional-details-step"
import { FamilyDetailsStep } from "@/components/profile-steps/family-details-step"
import { HoroscopeDetailsStep } from "@/components/profile-steps/horoscope-details-step"
import { InterestsStep } from "@/components/profile-steps/interests-step"
import { SocialHabitsStep } from "@/components/profile-steps/social-habits-step"
import { PartnerPreferencesStep } from "@/components/profile-steps/partner-preferences-step"
import { PhotosStep } from "@/components/profile-steps/photos-step"
import { ReferralStep } from "@/components/profile-steps/referral-step"

const formSteps = [
  { id: "personal", title: "Personal Details" },
  { id: "education", title: "Educational Details" },
  { id: "professional", title: "Professional Details" },
  { id: "family", title: "Family Details" },
  { id: "horoscope", title: "Horoscope Details" },
  { id: "interests", title: "Interests" },
  { id: "social", title: "Social Habits" },
  { id: "partner", title: "Partner Preferences" },
  { id: "photos", title: "Photos" },
  { id: "referral", title: "Referral" },
]

export function ProfileSetupForm({ userId, onProgressChange }: { userId: string; onProgressChange?: (progress: number) => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    age: "",
    sex: "",
    height: "",
    weight: "",
    skinColor: "",
    bodyType: "",
    address: "",
    currentAddress: "",
    maritalStatus: "",
    about: "",
    foodPreference: "",
    languages: [],
    education: "",
    degree: "",
    institution: "",
    yearOfGraduation: "",
    occupation: "",
    company: "",
    salary: "",
    workLocation: "",
    fatherName: "",
    motherName: "",
    siblings: "",
    familyType: "",
    familyStatus: "",
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: "",
    zodiacSign: "",
    rashi: "",
    nakshatra: "",
    hobbies: [],
    interests: [],
    smoking: "",
    drinking: "",
    diet: "",
    preferredAgeMin: "",
    preferredAgeMax: "",
    preferredHeight: "",
    preferredEducation: "",
    preferredOccupation: "",
    preferredLocation: "",
    photos: [],
    referralPartnerId: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const totalFields = Object.keys(formData).length
    const filledFields = Object.values(formData).filter((value) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== "" && value !== null && value !== undefined
    }).length
    return Math.round((filledFields / totalFields) * 100)
  }

  // Calculate step progress
  const calculateStepProgress = (stepId: string) => {
    const stepFields: Record<string, (keyof FormData)[]> = {
      personal: ["name", "phone", "age", "sex", "height", "weight", "skinColor", "bodyType", "address", "currentAddress", "maritalStatus", "about", "foodPreference", "languages"],
      education: ["education", "degree", "institution", "yearOfGraduation"],
      professional: ["occupation", "company", "salary", "workLocation"],
      family: ["fatherName", "motherName", "siblings", "familyType", "familyStatus"],
      horoscope: ["dateOfBirth", "timeOfBirth", "placeOfBirth", "zodiacSign", "rashi", "nakshatra"],
      interests: ["hobbies", "interests"],
      social: ["smoking", "drinking", "diet"],
      partner: ["preferredAgeMin", "preferredAgeMax", "preferredHeight", "preferredEducation", "preferredOccupation", "preferredLocation"],
      photos: ["photos"],
      referral: ["referralPartnerId"],
    }

    const fields = stepFields[stepId] || []
    const filled = fields.filter((field) => {
      const value = formData[field]
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

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Form Content */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 relative">
          {/* Step Progress Icon - Top Right Corner */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] p-0.5">
                <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {stepProgress}%
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
                  stroke="url(#step-progress-gradient)"
                  strokeWidth="1.5"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - stepProgress / 100)}`}
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
          
          {/* Step Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pr-16">
            {formSteps[currentStep].title}
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <PersonalDetailsStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 1 && <EducationalDetailsStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 2 && <ProfessionalDetailsStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 3 && <FamilyDetailsStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 4 && <HoroscopeDetailsStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 5 && <InterestsStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 6 && <SocialHabitsStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 7 && <PartnerPreferencesStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 8 && <PhotosStep formData={formData} onChange={handleInputChange} />}
              {currentStep === 9 && <ReferralStep formData={formData} onChange={handleInputChange} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {formSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-[#4B0082] w-8"
                      : index < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>

            {currentStep < formSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#4B0082] hover:bg-[#5a0099]"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                {isSaving ? "Saving..." : "Save Profile"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
