"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, CheckCircle } from "lucide-react"
import type { FormData } from "@/types/profile"
import { toast } from "sonner"
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
        educationOther: "",
        degree: "",
        degreeOther: "",
        branch: "",
        institution: "",
        yearOfGraduation: "",
        status: "",
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
    parentsAddressLine1: "",
    parentsAddressLine2: "",
    parentsPincode: "",
    parentsArea: "",
    parentsTaluk: "",
    parentsDistrict: "",
    parentsDivision: "",
    parentsRegion: "",
    parentsState: "",
    parentsCountry: "",
    parentsLandmark: "",
    siblings: "",
    familyDescription: "",
    caste: "",
    subcaste: "",
    kulam: "",
    gotram: "",
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
  const [isLoading, setIsLoading] = useState(true)
  const [originalPersonalDetails, setOriginalPersonalDetails] = useState<Partial<FormData> | null>(null)
  const [originalContactDetails, setOriginalContactDetails] = useState<Partial<FormData> | null>(null)
  const [originalEducationDetails, setOriginalEducationDetails] = useState<FormData["educationDetails"] | null>(null)
  const [originalFamilyDetails, setOriginalFamilyDetails] = useState<Partial<FormData> | null>(null)

  // Load personal details from database on mount
  useEffect(() => {
    const loadPersonalDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("personal_details")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        if (error && error.code !== "PGRST116") {
          console.error("Error loading personal details:", error)
          setIsLoading(false)
          return
        }

        if (data) {
          // Map database column names (snake_case) to form field names (camelCase)
          const loadedData = {
            name: data.name || "",
            dateOfBirth: data.date_of_birth || "",
            age: data.age ? data.age.toString() : "",
            sex: data.sex || "",
            height: data.height ? data.height.toString() : "",
            weight: data.weight ? data.weight.toString() : "",
            skinColor: data.skin_color || "",
            bodyType: data.body_type || "",
            maritalStatus: data.marital_status || "",
            about: data.about || "",
            foodPreference: data.food_preference || "",
            languages: data.languages || [],
          }
          
          // Store original data for comparison
          setOriginalPersonalDetails(loadedData)
          
          // Update form data
          setFormData((prev) => ({
            ...prev,
            ...loadedData,
          }))
        }
      } catch (error) {
        console.error("Unexpected error loading personal details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPersonalDetails()
  }, [userId])

  // Load contact details from database on mount
  useEffect(() => {
    const loadContactDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("contact_details")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        if (error && error.code !== "PGRST116") {
          console.error("Error loading contact details:", error)
          return
        }

        if (data) {
          // Map database column names (snake_case) to form field names (camelCase)
          const loadedData = {
            phone: data.phone || "",
            whatsappNumber: data.whatsapp_number || "",
            permanentAddressLine1: data.permanent_address_line1 || "",
            permanentAddressLine2: data.permanent_address_line2 || "",
            permanentPincode: data.permanent_pincode || "",
            permanentArea: data.permanent_area || "",
            permanentTaluk: data.permanent_taluk || "",
            permanentDistrict: data.permanent_district || "",
            permanentDivision: data.permanent_division || "",
            permanentRegion: data.permanent_region || "",
            permanentState: data.permanent_state || "",
            permanentCountry: data.permanent_country || "",
            permanentLandmark: data.permanent_landmark || "",
            currentAddressLine1: data.current_address_line1 || "",
            currentAddressLine2: data.current_address_line2 || "",
            currentPincode: data.current_pincode || "",
            currentArea: data.current_area || "",
            currentTaluk: data.current_taluk || "",
            currentDistrict: data.current_district || "",
            currentDivision: data.current_division || "",
            currentRegion: data.current_region || "",
            currentState: data.current_state || "",
            currentCountry: data.current_country || "",
            currentLandmark: data.current_landmark || "",
          }
          
          // Store original data for comparison
          setOriginalContactDetails(loadedData)
          
          // Update form data
          setFormData((prev) => ({
            ...prev,
            ...loadedData,
          }))
        }
      } catch (error) {
        console.error("Unexpected error loading contact details:", error)
      }
    }

    loadContactDetails()
  }, [userId])

  // Load education details from database on mount
  useEffect(() => {
    const loadEducationDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("education_details")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })

        if (error && error.code !== "PGRST116") {
          console.error("Error loading education details:", error)
          return
        }

        if (data && data.length > 0) {
          // Map database column names (snake_case) to form field names (camelCase)
          const loadedData = data.map((edu) => ({
            education: edu.education || "",
            educationOther: edu.education_other || "",
            degree: edu.degree || "",
            degreeOther: edu.degree_other || "",
            branch: edu.branch || "",
            institution: edu.institution || "",
            yearOfGraduation: edu.year_of_graduation ? edu.year_of_graduation.toString() : "",
            status: edu.status || "",
          }))
          
          // Store original data for comparison
          setOriginalEducationDetails(loadedData)
          
          // Update form data
          setFormData((prev) => ({
            ...prev,
            educationDetails: loadedData,
          }))
        }
      } catch (error) {
        console.error("Unexpected error loading education details:", error)
      }
    }

    loadEducationDetails()
  }, [userId])

  // Load family details from database on mount
  useEffect(() => {
    const loadFamilyDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("family_details")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        if (error && error.code !== "PGRST116") {
          console.error("Error loading family details:", error)
          return
        }

        if (data) {
          // Map database column names (snake_case) to form field names (camelCase)
          const loadedData = {
            fatherName: data.father_name || "",
            fatherOccupation: data.father_occupation || "",
            motherName: data.mother_name || "",
            motherOccupation: data.mother_occupation || "",
            parentsAddressLine1: data.parents_address_line1 || "",
            parentsAddressLine2: data.parents_address_line2 || "",
            parentsPincode: data.parents_pincode || "",
            parentsArea: data.parents_area || "",
            parentsTaluk: data.parents_taluk || "",
            parentsDistrict: data.parents_district || "",
            parentsDivision: data.parents_division || "",
            parentsRegion: data.parents_region || "",
            parentsState: data.parents_state || "",
            parentsCountry: data.parents_country || "",
            parentsLandmark: data.parents_landmark || "",
            siblings: data.siblings || "",
            familyDescription: data.family_description || "",
            caste: data.caste || "",
            subcaste: data.subcaste || "",
            kulam: data.kulam || "",
            gotram: data.gotram || "",
            familyType: data.family_type || "",
            familyStatus: data.family_status || "",
          }
          
          // Store original data for comparison
          setOriginalFamilyDetails(loadedData)
          
          // Update form data
          setFormData((prev) => ({
            ...prev,
            ...loadedData,
          }))
        }
      } catch (error) {
        console.error("Unexpected error loading family details:", error)
      }
    }

    loadFamilyDetails()
  }, [userId])

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
      personal: ["name", "dateOfBirth", "age", "sex", "height", "weight", "skinColor", "bodyType", "maritalStatus", "about", "foodPreference", "languages"],
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
      family: ["fatherName", "fatherOccupation", "motherName", "motherOccupation", "parentsAddressLine1", "parentsPincode", "parentsArea", "parentsTaluk", "parentsDistrict", "parentsDivision", "parentsRegion", "parentsState", "parentsCountry", "caste", "familyType", "familyStatus"],
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

  const validatePersonalDetails = (): boolean => {
    const requiredFields = [
      { key: "name", label: "Full Name" },
      { key: "dateOfBirth", label: "Date of Birth" },
      { key: "sex", label: "Gender" },
      { key: "height", label: "Height" },
      { key: "weight", label: "Weight" },
      { key: "skinColor", label: "Skin Color" },
      { key: "bodyType", label: "Body Type" },
      { key: "maritalStatus", label: "Marital Status" },
      { key: "about", label: "About Yourself" },
      { key: "foodPreference", label: "Food Preference" },
    ]

    const missingFields: string[] = []

    requiredFields.forEach((field) => {
      const value = formData[field.key as keyof FormData]
      if (!value || (typeof value === "string" && value.trim() === "")) {
        missingFields.push(field.label)
      }
    })

    // Check languages separately
    if (!formData.languages || formData.languages.length === 0) {
      missingFields.push("Languages")
    }

    // Check about field minimum length
    if (formData.about && formData.about.trim().length > 0 && formData.about.trim().length < 100) {
      missingFields.push("About Yourself (minimum 100 characters)")
    }

    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        // Show specific field name if only one field is missing
        toast.error(`Please fill out ${missingFields[0]}`, {
          description: "This field is required to save your personal details.",
          style: {
            background: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
          },
        })
      } else {
        // Show generic message if multiple fields are missing
        toast.error("Please fill out all fields", {
          description: "All fields are required to save your personal details.",
          style: {
            background: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
          },
        })
      }
      return false
    }

    return true
  }

  // Check if personal details have changed
  const hasPersonalDetailsChanged = (): boolean => {
    if (!originalPersonalDetails) {
      // If no original data exists, check if any field is filled
      const personalFields = ["name", "dateOfBirth", "age", "sex", "height", "weight", "skinColor", "bodyType", "maritalStatus", "about", "foodPreference", "languages"]
      return personalFields.some((field) => {
        const value = formData[field as keyof FormData]
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== "" && value !== null && value !== undefined
      })
    }

    // Compare current form data with original saved data
    const fieldsToCompare: (keyof FormData)[] = ["name", "dateOfBirth", "age", "sex", "height", "weight", "skinColor", "bodyType", "maritalStatus", "about", "foodPreference", "languages"]
    
    for (const field of fieldsToCompare) {
      const currentValue = formData[field]
      const originalValue = originalPersonalDetails[field]
      
      // Handle array comparison (languages)
      if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
        const currentArr = Array.isArray(currentValue) ? currentValue : []
        const originalArr = Array.isArray(originalValue) ? originalValue : []
        if (JSON.stringify(currentArr.sort()) !== JSON.stringify(originalArr.sort())) {
          return true
        }
      } else {
        // Handle string/number comparison
        const currentStr = currentValue?.toString().trim() || ""
        const originalStr = originalValue?.toString().trim() || ""
        if (currentStr !== originalStr) {
          return true
        }
      }
    }
    
    return false
  }

  const validateEducationDetails = (): boolean => {
    if (!formData.educationDetails || formData.educationDetails.length === 0) {
      toast.error("Please add at least one education entry", {
        description: "At least one education detail is required.",
        style: {
          background: "#fee2e2",
          border: "1px solid #ef4444",
          color: "#991b1b",
        },
      })
      return false
    }

    const missingFields: string[] = []

    formData.educationDetails.forEach((edu, index) => {
      const entryNum = index + 1
      
      if (!edu.education || edu.education.trim() === "") {
        missingFields.push(`Education ${entryNum}: Education Level`)
      } else if (edu.education === "other" && (!edu.educationOther || edu.educationOther.trim() === "")) {
        missingFields.push(`Education ${entryNum}: Education Level (Other)`)
      }
      
      if (!edu.degree || edu.degree.trim() === "") {
        missingFields.push(`Education ${entryNum}: Degree/Qualification`)
      } else if (edu.degree === "other" && (!edu.degreeOther || edu.degreeOther.trim() === "")) {
        missingFields.push(`Education ${entryNum}: Degree/Qualification (Other)`)
      }
      
      if (!edu.institution || edu.institution.trim() === "") {
        missingFields.push(`Education ${entryNum}: Institution/University`)
      }
      
      if (!edu.status || edu.status.trim() === "") {
        missingFields.push(`Education ${entryNum}: Status`)
      }
      
      // Year of graduation is required only if status is completed or discontinued
      if ((edu.status === "completed" || edu.status === "discontinued") && 
          (!edu.yearOfGraduation || edu.yearOfGraduation.trim() === "")) {
        missingFields.push(`Education ${entryNum}: Year of Graduation`)
      }
    })

    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        toast.error(`Please fill out ${missingFields[0]}`, {
          description: "This field is required to save your education details.",
          style: {
            background: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
          },
        })
      } else {
        toast.error("Please fill out all fields", {
          description: "All fields are required to save your education details.",
          style: {
            background: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
          },
        })
      }
      return false
    }

    return true
  }

  const validateFamilyDetails = (): boolean => {
    const requiredFields = [
      { key: "fatherName", label: "Father Name" },
      { key: "fatherOccupation", label: "Father's Occupation" },
      { key: "motherName", label: "Mother Name" },
      { key: "motherOccupation", label: "Mother's Occupation" },
      { key: "parentsAddressLine1", label: "Parents Address Line 1" },
      { key: "parentsPincode", label: "Parents Pincode" },
      { key: "parentsArea", label: "Parents Area" },
      { key: "parentsTaluk", label: "Parents Taluk" },
      { key: "parentsDistrict", label: "Parents District" },
      { key: "parentsDivision", label: "Parents Division" },
      { key: "parentsRegion", label: "Parents Region" },
      { key: "parentsState", label: "Parents State" },
      { key: "parentsCountry", label: "Parents Country" },
      { key: "siblings", label: "Siblings Details" },
      { key: "familyDescription", label: "Brief Description About Family" },
      { key: "caste", label: "Caste" },
      { key: "subcaste", label: "Subcaste" },
      { key: "kulam", label: "Kulam" },
      { key: "gotram", label: "Gotram" },
      { key: "familyType", label: "Family Type" },
      { key: "familyStatus", label: "Family Status" },
    ]

    const missingFields: string[] = []

    requiredFields.forEach((field) => {
      const value = formData[field.key as keyof FormData]
      if (!value || (typeof value === "string" && value.trim() === "")) {
        missingFields.push(field.label)
      }
    })

    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        toast.error(`Please fill out ${missingFields[0]}`, {
          description: "This field is required to save your family details.",
          style: {
            background: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
          },
        })
      } else {
        toast.error("Please fill out all fields", {
          description: "All fields are required to save your family details.",
          style: {
            background: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
          },
        })
      }
      return false
    }

    return true
  }

  // Check if contact details have changed
  const hasContactDetailsChanged = (): boolean => {
    if (!originalContactDetails) {
      // If no original data exists, check if any field is filled
      const contactFields = ["phone", "whatsappNumber", "permanentAddressLine1", "permanentPincode", "permanentArea", "permanentTaluk", "permanentDistrict", "permanentDivision", "permanentRegion", "permanentState", "permanentCountry", "currentAddressLine1", "currentPincode", "currentArea", "currentTaluk", "currentDistrict", "currentDivision", "currentRegion", "currentState", "currentCountry"]
      return contactFields.some((field) => {
        const value = formData[field as keyof FormData]
        return value !== "" && value !== null && value !== undefined
      })
    }

    // Compare current form data with original saved data
    const fieldsToCompare: (keyof FormData)[] = ["phone", "whatsappNumber", "permanentAddressLine1", "permanentAddressLine2", "permanentPincode", "permanentArea", "permanentTaluk", "permanentDistrict", "permanentDivision", "permanentRegion", "permanentState", "permanentCountry", "permanentLandmark", "currentAddressLine1", "currentAddressLine2", "currentPincode", "currentArea", "currentTaluk", "currentDistrict", "currentDivision", "currentRegion", "currentState", "currentCountry", "currentLandmark"]
    
    for (const field of fieldsToCompare) {
      const currentValue = formData[field]
      const originalValue = originalContactDetails[field]
      
      // Handle string comparison
      const currentStr = currentValue?.toString().trim() || ""
      const originalStr = originalValue?.toString().trim() || ""
      if (currentStr !== originalStr) {
        return true
      }
    }
    
    return false
  }

  // Check if education details have changed
  const hasEducationDetailsChanged = (): boolean => {
    if (!originalEducationDetails || originalEducationDetails.length === 0) {
      // If no original data exists, check if any education entry has data
      if (!formData.educationDetails || formData.educationDetails.length === 0) {
        return false
      }
      return formData.educationDetails.some((edu) => 
        edu.education || edu.degree || edu.institution || edu.status
      )
    }

    // Compare current form data with original saved data
    const current = formData.educationDetails || []
    const original = originalEducationDetails

    // Check if lengths are different
    if (current.length !== original.length) {
      return true
    }

    // Compare each education entry
    for (let i = 0; i < current.length; i++) {
      const curr = current[i]
      const orig = original[i] || {}

      const fieldsToCompare = ["education", "educationOther", "degree", "degreeOther", "branch", "institution", "yearOfGraduation", "status"]
      
      for (const field of fieldsToCompare) {
        const currValue = curr[field as keyof typeof curr]?.toString().trim() || ""
        const origValue = orig[field as keyof typeof orig]?.toString().trim() || ""
        
        if (currValue !== origValue) {
          return true
        }
      }
    }
    
    return false
  }

  // Check if family details have changed
  const hasFamilyDetailsChanged = (): boolean => {
    if (!originalFamilyDetails) {
      // If no original data exists, check if any field is filled
      const familyFields = ["fatherName", "fatherOccupation", "motherName", "motherOccupation", "parentsAddressLine1", "parentsPincode", "parentsArea", "parentsTaluk", "parentsDistrict", "parentsDivision", "parentsRegion", "parentsState", "parentsCountry", "siblings", "familyDescription", "caste", "subcaste", "kulam", "gotram", "familyType", "familyStatus"]
      return familyFields.some((field) => {
        const value = formData[field as keyof FormData]
        return value !== "" && value !== null && value !== undefined
      })
    }

    // Compare current form data with original saved data
    const fieldsToCompare: (keyof FormData)[] = ["fatherName", "fatherOccupation", "motherName", "motherOccupation", "parentsAddressLine1", "parentsAddressLine2", "parentsPincode", "parentsArea", "parentsTaluk", "parentsDistrict", "parentsDivision", "parentsRegion", "parentsState", "parentsCountry", "parentsLandmark", "siblings", "familyDescription", "caste", "subcaste", "kulam", "gotram", "familyType", "familyStatus"]
    
    for (const field of fieldsToCompare) {
      const currentValue = formData[field]
      const originalValue = originalFamilyDetails[field]
      
      // Handle string comparison
      const currentStr = currentValue?.toString().trim() || ""
      const originalStr = originalValue?.toString().trim() || ""
      if (currentStr !== originalStr) {
        return true
      }
    }

    return false
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save personal details if we're on the personal details step
      if (currentStep === 0) {
        // Validate all fields
        if (!validatePersonalDetails()) {
          setIsSaving(false)
          return
        }

        // Calculate completion percentage for personal details
        const personalDetailsProgress = calculateStepProgress("personal")

        const personalDetailsData = {
          user_id: userId,
          name: formData.name,
          date_of_birth: formData.dateOfBirth || null,
          age: formData.age ? parseInt(formData.age) : null,
          sex: formData.sex || null,
          height: formData.height ? parseInt(formData.height) : null,
          weight: formData.weight ? parseInt(formData.weight) : null,
          skin_color: formData.skinColor || null,
          body_type: formData.bodyType || null,
          marital_status: formData.maritalStatus || null,
          about: formData.about || null,
          food_preference: formData.foodPreference || null,
          languages: formData.languages || [],
          completion_percentage: personalDetailsProgress,
        }

        const { error } = await supabase
          .from("personal_details")
          .upsert(personalDetailsData, {
            onConflict: "user_id",
          })

        if (error) throw error
        
        // Update original data after successful save
        setOriginalPersonalDetails({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          age: formData.age,
          sex: formData.sex,
          height: formData.height,
          weight: formData.weight,
          skinColor: formData.skinColor,
          bodyType: formData.bodyType,
          maritalStatus: formData.maritalStatus,
          about: formData.about,
          foodPreference: formData.foodPreference,
          languages: formData.languages,
        })
        
        toast.success("Personal details saved successfully!", {
          style: {
            background: "#dcfce7",
            border: "1px solid #22c55e",
            color: "#166534",
          },
        })
      } else if (currentStep === 1) {
        // Save contact details if we're on the contact details step
        // Calculate completion percentage for contact details
        const contactDetailsProgress = calculateStepProgress("contact")

        const contactDetailsData = {
          user_id: userId,
          phone: formData.phone || null,
          whatsapp_number: formData.whatsappNumber || null,
          permanent_address_line1: formData.permanentAddressLine1 || null,
          permanent_address_line2: formData.permanentAddressLine2 || null,
          permanent_pincode: formData.permanentPincode || null,
          permanent_area: formData.permanentArea || null,
          permanent_taluk: formData.permanentTaluk || null,
          permanent_district: formData.permanentDistrict || null,
          permanent_division: formData.permanentDivision || null,
          permanent_region: formData.permanentRegion || null,
          permanent_state: formData.permanentState || null,
          permanent_country: formData.permanentCountry || null,
          permanent_landmark: formData.permanentLandmark || null,
          current_address_line1: formData.currentAddressLine1 || null,
          current_address_line2: formData.currentAddressLine2 || null,
          current_pincode: formData.currentPincode || null,
          current_area: formData.currentArea || null,
          current_taluk: formData.currentTaluk || null,
          current_district: formData.currentDistrict || null,
          current_division: formData.currentDivision || null,
          current_region: formData.currentRegion || null,
          current_state: formData.currentState || null,
          current_country: formData.currentCountry || null,
          current_landmark: formData.currentLandmark || null,
          completion_percentage: contactDetailsProgress,
        }

        const { error } = await supabase
          .from("contact_details")
          .upsert(contactDetailsData, {
            onConflict: "user_id",
          })

        if (error) throw error
        
        // Update original data after successful save
        setOriginalContactDetails({
          phone: formData.phone,
          whatsappNumber: formData.whatsappNumber,
          permanentAddressLine1: formData.permanentAddressLine1,
          permanentAddressLine2: formData.permanentAddressLine2,
          permanentPincode: formData.permanentPincode,
          permanentArea: formData.permanentArea,
          permanentTaluk: formData.permanentTaluk,
          permanentDistrict: formData.permanentDistrict,
          permanentDivision: formData.permanentDivision,
          permanentRegion: formData.permanentRegion,
          permanentState: formData.permanentState,
          permanentCountry: formData.permanentCountry,
          permanentLandmark: formData.permanentLandmark,
          currentAddressLine1: formData.currentAddressLine1,
          currentAddressLine2: formData.currentAddressLine2,
          currentPincode: formData.currentPincode,
          currentArea: formData.currentArea,
          currentTaluk: formData.currentTaluk,
          currentDistrict: formData.currentDistrict,
          currentDivision: formData.currentDivision,
          currentRegion: formData.currentRegion,
          currentState: formData.currentState,
          currentCountry: formData.currentCountry,
          currentLandmark: formData.currentLandmark,
        })
        
        toast.success("Contact details saved successfully!", {
          style: {
            background: "#dcfce7",
            border: "1px solid #22c55e",
            color: "#166534",
          },
        })
      } else if (currentStep === 2) {
        // Save education details if we're on the education details step
        // Validate all fields
        if (!validateEducationDetails()) {
          setIsSaving(false)
          return
        }

        // Calculate completion percentage for education details
        const educationDetailsProgress = calculateStepProgress("education")

        // Delete all existing education details for this user
        const { error: deleteError } = await supabase
          .from("education_details")
          .delete()
          .eq("user_id", userId)

        if (deleteError) throw deleteError

        // Insert all education details
        if (formData.educationDetails && formData.educationDetails.length > 0) {
          const educationDetailsData = formData.educationDetails.map((edu) => ({
            user_id: userId,
            education: edu.education || null,
            education_other: edu.education === "other" ? (edu.educationOther || null) : null,
            degree: edu.degree || null,
            degree_other: edu.degree === "other" ? (edu.degreeOther || null) : null,
            branch: edu.branch || null,
            institution: edu.institution || null,
            year_of_graduation: edu.yearOfGraduation ? parseInt(edu.yearOfGraduation) : null,
            status: edu.status || null,
          }))

          const { error: insertError } = await supabase
            .from("education_details")
            .insert(educationDetailsData)

          if (insertError) throw insertError
        }
        
        // Update original data after successful save
        setOriginalEducationDetails(formData.educationDetails || [])
        
        toast.success("Education details saved successfully!", {
          style: {
            background: "#dcfce7",
            border: "1px solid #22c55e",
            color: "#166534",
          },
        })
      } else if (currentStep === 4) {
        // Save family details if we're on the family details step
        // Validate all fields
        if (!validateFamilyDetails()) {
          setIsSaving(false)
          return
        }

        // Calculate completion percentage for family details
        const familyDetailsProgress = calculateStepProgress("family")

        const familyDetailsData = {
          user_id: userId,
          father_name: formData.fatherName || null,
          father_occupation: formData.fatherOccupation || null,
          mother_name: formData.motherName || null,
          mother_occupation: formData.motherOccupation || null,
          parents_address_line1: formData.parentsAddressLine1 || null,
          parents_address_line2: formData.parentsAddressLine2 || null,
          parents_pincode: formData.parentsPincode || null,
          parents_area: formData.parentsArea || null,
          parents_taluk: formData.parentsTaluk || null,
          parents_district: formData.parentsDistrict || null,
          parents_division: formData.parentsDivision || null,
          parents_region: formData.parentsRegion || null,
          parents_state: formData.parentsState || null,
          parents_country: formData.parentsCountry || null,
          parents_landmark: formData.parentsLandmark || null,
          siblings: formData.siblings || null,
          family_description: formData.familyDescription || null,
          caste: formData.caste || null,
          subcaste: formData.subcaste || null,
          kulam: formData.kulam || null,
          gotram: formData.gotram || null,
          family_type: formData.familyType || null,
          family_status: formData.familyStatus || null,
          completion_percentage: familyDetailsProgress,
        }

        const { error } = await supabase
          .from("family_details")
          .upsert(familyDetailsData, {
            onConflict: "user_id",
          })

        if (error) throw error
        
        // Update original data after successful save
        setOriginalFamilyDetails({
          fatherName: formData.fatherName,
          fatherOccupation: formData.fatherOccupation,
          motherName: formData.motherName,
          motherOccupation: formData.motherOccupation,
          parentsAddressLine1: formData.parentsAddressLine1,
          parentsAddressLine2: formData.parentsAddressLine2,
          parentsPincode: formData.parentsPincode,
          parentsArea: formData.parentsArea,
          parentsTaluk: formData.parentsTaluk,
          parentsDistrict: formData.parentsDistrict,
          parentsDivision: formData.parentsDivision,
          parentsRegion: formData.parentsRegion,
          parentsState: formData.parentsState,
          parentsCountry: formData.parentsCountry,
          parentsLandmark: formData.parentsLandmark,
          siblings: formData.siblings,
          familyDescription: formData.familyDescription,
          caste: formData.caste,
          subcaste: formData.subcaste,
          kulam: formData.kulam,
          gotram: formData.gotram,
          familyType: formData.familyType,
          familyStatus: formData.familyStatus,
        })
        
        toast.success("Family details saved successfully!", {
          style: {
            background: "#dcfce7",
            border: "1px solid #22c55e",
            color: "#166534",
          },
        })
      } else {
        // For other steps, use the existing save logic
        const { error } = await supabase
          .from("users")
          .update(formData)
          .eq("id", userId)

        if (error) throw error
        toast.success("Profile saved successfully!", {
          style: {
            background: "#dcfce7",
            border: "1px solid #22c55e",
            color: "#166534",
          },
        })
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast.error("Error saving profile", {
        description: "Please try again.",
        style: {
          background: "#fee2e2",
          border: "1px solid #ef4444",
          color: "#991b1b",
        },
      })
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

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

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
                  disabled={isSaving || (currentStep === 0 && !hasPersonalDetailsChanged()) || (currentStep === 1 && !hasContactDetailsChanged()) || (currentStep === 2 && !hasEducationDetailsChanged()) || (currentStep === 4 && !hasFamilyDetailsChanged())}
                  className="w-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white font-semibold py-3 disabled:opacity-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
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
