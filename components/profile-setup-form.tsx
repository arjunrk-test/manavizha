"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"

interface FormData {
  // Personal Details
  name: string
  phone: string
  age: string
  sex: string
  height: string
  weight: string
  skinColor: string
  bodyType: string
  address: string
  currentAddress: string
  maritalStatus: string
  about: string
  foodPreference: string
  languages: string[]
  
  // Educational Details
  education: string
  degree: string
  institution: string
  yearOfGraduation: string
  
  // Professional Details
  occupation: string
  company: string
  salary: string
  workLocation: string
  
  // Family Details
  fatherName: string
  motherName: string
  siblings: string
  familyType: string
  familyStatus: string
  
  // Horoscope Details
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  zodiacSign: string
  rashi: string
  nakshatra: string
  
  // Interests
  hobbies: string[]
  interests: string[]
  
  // Social Habits
  smoking: string
  drinking: string
  diet: string
  
  // Partner Preferences
  preferredAgeMin: string
  preferredAgeMax: string
  preferredHeight: string
  preferredEducation: string
  preferredOccupation: string
  preferredLocation: string
  
  // Photo Section
  photos: string[]
  
  // Referral
  referralPartnerId: string
}

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

// Personal Details Step Component
function PersonalDetailsStep({
  formData,
  onChange,
}: {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}) {
  const languagesList = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Gujarati", "Marathi", "Punjabi"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            placeholder="Enter your age"
            min="18"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex *</Label>
          <select
            id="sex"
            value={formData.sex}
            onChange={(e) => onChange("sex", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (cm) *</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => onChange("height", e.target.value)}
            placeholder="Enter height in cm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => onChange("weight", e.target.value)}
            placeholder="Enter weight in kg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skinColor">Skin Color</Label>
          <select
            id="skinColor"
            value={formData.skinColor}
            onChange={(e) => onChange("skinColor", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="fair">Fair</option>
            <option value="wheatish">Wheatish</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyType">Body Type</Label>
          <select
            id="bodyType"
            value={formData.bodyType}
            onChange={(e) => onChange("bodyType", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="slim">Slim</option>
            <option value="average">Average</option>
            <option value="athletic">Athletic</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Permanent Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Enter your permanent address"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="currentAddress">Current Address of Residence *</Label>
          <Input
            id="currentAddress"
            value={formData.currentAddress}
            onChange={(e) => onChange("currentAddress", e.target.value)}
            placeholder="Enter your current address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status *</Label>
          <select
            id="maritalStatus"
            value={formData.maritalStatus}
            onChange={(e) => onChange("maritalStatus", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="">Select</option>
            <option value="never-married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="foodPreference">Food Preference</Label>
          <select
            id="foodPreference"
            value={formData.foodPreference}
            onChange={(e) => onChange("foodPreference", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about">About Yourself</Label>
          <textarea
            id="about"
            value={formData.about}
            onChange={(e) => onChange("about", e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Languages Known</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languagesList.map((lang) => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange("languages", [...formData.languages, lang])
                    } else {
                      onChange("languages", formData.languages.filter((l) => l !== lang))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{lang}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Educational Details Step
function EducationalDetailsStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="education">Education Level *</Label>
          <select
            id="education"
            value={formData.education}
            onChange={(e) => onChange("education", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="">Select</option>
            <option value="high-school">High School</option>
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="degree">Degree/Qualification</Label>
          <Input
            id="degree"
            value={formData.degree}
            onChange={(e) => onChange("degree", e.target.value)}
            placeholder="e.g., B.Tech, MBA, etc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="institution">Institution/University</Label>
          <Input
            id="institution"
            value={formData.institution}
            onChange={(e) => onChange("institution", e.target.value)}
            placeholder="Enter institution name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearOfGraduation">Year of Graduation</Label>
          <Input
            id="yearOfGraduation"
            type="number"
            value={formData.yearOfGraduation}
            onChange={(e) => onChange("yearOfGraduation", e.target.value)}
            placeholder="e.g., 2020"
            min="1950"
            max={new Date().getFullYear()}
          />
        </div>
      </div>
    </div>
  )
}

// Professional Details Step
function ProfessionalDetailsStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation/Profession *</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => onChange("occupation", e.target.value)}
            placeholder="e.g., Software Engineer, Doctor, etc."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company/Organization</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Annual Salary (₹)</Label>
          <Input
            id="salary"
            type="number"
            value={formData.salary}
            onChange={(e) => onChange("salary", e.target.value)}
            placeholder="Enter annual salary"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workLocation">Work Location</Label>
          <Input
            id="workLocation"
            value={formData.workLocation}
            onChange={(e) => onChange("workLocation", e.target.value)}
            placeholder="Enter work location"
          />
        </div>
      </div>
    </div>
  )
}

// Family Details Step
function FamilyDetailsStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father's Name</Label>
          <Input
            id="fatherName"
            value={formData.fatherName}
            onChange={(e) => onChange("fatherName", e.target.value)}
            placeholder="Enter father's name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherName">Mother's Name</Label>
          <Input
            id="motherName"
            value={formData.motherName}
            onChange={(e) => onChange("motherName", e.target.value)}
            placeholder="Enter mother's name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siblings">Siblings</Label>
          <Input
            id="siblings"
            value={formData.siblings}
            onChange={(e) => onChange("siblings", e.target.value)}
            placeholder="e.g., 1 brother, 1 sister"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="familyType">Family Type</Label>
          <select
            id="familyType"
            value={formData.familyType}
            onChange={(e) => onChange("familyType", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="joint">Joint Family</option>
            <option value="nuclear">Nuclear Family</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="familyStatus">Family Status</Label>
          <select
            id="familyStatus"
            value={formData.familyStatus}
            onChange={(e) => onChange("familyStatus", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="middle-class">Middle Class</option>
            <option value="upper-middle-class">Upper Middle Class</option>
            <option value="rich">Rich</option>
            <option value="affluent">Affluent</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Horoscope Details Step
function HoroscopeDetailsStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeOfBirth">Time of Birth</Label>
          <Input
            id="timeOfBirth"
            type="time"
            value={formData.timeOfBirth}
            onChange={(e) => onChange("timeOfBirth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">Place of Birth</Label>
          <Input
            id="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={(e) => onChange("placeOfBirth", e.target.value)}
            placeholder="Enter place of birth"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zodiacSign">Zodiac Sign</Label>
          <select
            id="zodiacSign"
            value={formData.zodiacSign}
            onChange={(e) => onChange("zodiacSign", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="aries">Aries</option>
            <option value="taurus">Taurus</option>
            <option value="gemini">Gemini</option>
            <option value="cancer">Cancer</option>
            <option value="leo">Leo</option>
            <option value="virgo">Virgo</option>
            <option value="libra">Libra</option>
            <option value="scorpio">Scorpio</option>
            <option value="sagittarius">Sagittarius</option>
            <option value="capricorn">Capricorn</option>
            <option value="aquarius">Aquarius</option>
            <option value="pisces">Pisces</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rashi">Rashi</Label>
          <Input
            id="rashi"
            value={formData.rashi}
            onChange={(e) => onChange("rashi", e.target.value)}
            placeholder="Enter Rashi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nakshatra">Nakshatra</Label>
          <Input
            id="nakshatra"
            value={formData.nakshatra}
            onChange={(e) => onChange("nakshatra", e.target.value)}
            placeholder="Enter Nakshatra"
          />
        </div>
      </div>
    </div>
  )
}

// Interests Step
function InterestsStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  const hobbiesList = ["Reading", "Writing", "Music", "Dancing", "Sports", "Traveling", "Cooking", "Photography", "Art", "Gaming", "Movies", "Fitness"]
  const interestsList = ["Technology", "Business", "Science", "Arts", "Literature", "History", "Politics", "Sports", "Entertainment", "Food", "Fashion", "Nature"]

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Hobbies</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {hobbiesList.map((hobby) => (
              <label key={hobby} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hobbies.includes(hobby)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange("hobbies", [...formData.hobbies, hobby])
                    } else {
                      onChange("hobbies", formData.hobbies.filter((h) => h !== hobby))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{hobby}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Interests</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestsList.map((interest) => (
              <label key={interest} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange("interests", [...formData.interests, interest])
                    } else {
                      onChange("interests", formData.interests.filter((i) => i !== interest))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{interest}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Social Habits Step
function SocialHabitsStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smoking">Smoking</Label>
          <select
            id="smoking"
            value={formData.smoking}
            onChange={(e) => onChange("smoking", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="never">Never</option>
            <option value="occasionally">Occasionally</option>
            <option value="regularly">Regularly</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="drinking">Drinking</Label>
          <select
            id="drinking"
            value={formData.drinking}
            onChange={(e) => onChange("drinking", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="never">Never</option>
            <option value="occasionally">Occasionally</option>
            <option value="regularly">Regularly</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="diet">Diet Preference</Label>
          <select
            id="diet"
            value={formData.diet}
            onChange={(e) => onChange("diet", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Partner Preferences Step
function PartnerPreferencesStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="preferredAgeMin">Preferred Age (Min)</Label>
          <Input
            id="preferredAgeMin"
            type="number"
            value={formData.preferredAgeMin}
            onChange={(e) => onChange("preferredAgeMin", e.target.value)}
            placeholder="Minimum age"
            min="18"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredAgeMax">Preferred Age (Max)</Label>
          <Input
            id="preferredAgeMax"
            type="number"
            value={formData.preferredAgeMax}
            onChange={(e) => onChange("preferredAgeMax", e.target.value)}
            placeholder="Maximum age"
            min="18"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredHeight">Preferred Height (cm)</Label>
          <Input
            id="preferredHeight"
            type="number"
            value={formData.preferredHeight}
            onChange={(e) => onChange("preferredHeight", e.target.value)}
            placeholder="Preferred height"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredEducation">Preferred Education</Label>
          <Input
            id="preferredEducation"
            value={formData.preferredEducation}
            onChange={(e) => onChange("preferredEducation", e.target.value)}
            placeholder="Preferred education level"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredOccupation">Preferred Occupation</Label>
          <Input
            id="preferredOccupation"
            value={formData.preferredOccupation}
            onChange={(e) => onChange("preferredOccupation", e.target.value)}
            placeholder="Preferred occupation"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredLocation">Preferred Location</Label>
          <Input
            id="preferredLocation"
            value={formData.preferredLocation}
            onChange={(e) => onChange("preferredLocation", e.target.value)}
            placeholder="Preferred location"
          />
        </div>
      </div>
    </div>
  )
}

// Photos Step
function PhotosStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // For now, we'll just store the file names
    // In production, you'd upload to Supabase Storage
    const fileNames = Array.from(files).map((file) => file.name)
    onChange("photos", [...formData.photos, ...fileNames])
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <span className="text-4xl">📷</span>
            <span className="text-gray-600 dark:text-gray-400">
              Click to upload photos or drag and drop
            </span>
            <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>
          </label>
        </div>
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">{photo}</span>
                </div>
                <button
                  onClick={() => {
                    onChange("photos", formData.photos.filter((_, i) => i !== index))
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Referral Step
function ReferralStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="referralPartnerId">Referral Partner ID (Optional)</Label>
          <Input
            id="referralPartnerId"
            value={formData.referralPartnerId}
            onChange={(e) => onChange("referralPartnerId", e.target.value)}
            placeholder="Enter referral partner ID if you have one"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If someone referred you to this platform, enter their partner ID here.
          </p>
        </div>
      </div>
    </div>
  )
}

