"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Briefcase, Building2, GraduationCap, Store, Upload, X } from "lucide-react"
import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"
import { CustomSelectDropdown } from "@/components/ui/custom-select-dropdown"
import {
  SETUP_SECTION_BODY,
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"
import { EMPLOYMENT_TYPES } from "@/lib/profile-data"

interface ProfessionalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function ProfessionalDetailsStep({ formData, onChange }: ProfessionalDetailsStepProps) {
  const [payslipError, setPayslipError] = useState<string>("")

  // Transform EMPLOYMENT_TYPES to match the expected structure
  const employmentTypeOptions = EMPLOYMENT_TYPES.map(type => ({ id: type, value: type }))
  
  // Fetch sector, business type, and year of study from master tables
  const { data: sectorOptions } = useMasterData({ tableName: "master_sector" })
  const { data: businessTypeOptions } = useMasterData({ tableName: "master_type_of_business" })
  const { data: yearOfStudyOptions } = useMasterData({ tableName: "master_year_of_study" })
  
  // Fetch education level data to get unique categories for course dropdown
  const { data: educationLevelData } = useMasterData({ tableName: "master_education_level" })
  
  // Extract unique categories from education level data
  const courseOptions = Array.from(
    new Set(educationLevelData.map(item => item.category).filter(Boolean))
  ).map(category => ({
    id: category || "",
    value: category || ""
  }))

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return "Please upload an image or PDF file"
    }
    return null
  }

  const handlePayslipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentPayslips = (formData.payslip as string[]) || []
    
    // Check if adding these files would exceed 3 files
    if (currentPayslips.length + files.length > 3) {
      setPayslipError("Maximum 3 payslips allowed")
      e.target.value = ""
      return
    }

    // Validate all files
    const fileArray = Array.from(files)
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        setPayslipError(error)
        e.target.value = ""
        return
      }
    }

    // Read all files
    const newPayslips: string[] = []
    let filesRead = 0

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        newPayslips.push(result)
        filesRead++

        // When all files are read, update form data
        if (filesRead === fileArray.length) {
          onChange("payslip", [...currentPayslips, ...newPayslips])
          setPayslipError("")
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    e.target.value = ""
  }

  const removePayslip = (index: number) => {
    const currentPayslips = (formData.payslip as string[]) || []
    const updatedPayslips = currentPayslips.filter((_, i) => i !== index)
    onChange("payslip", updatedPayslips)
    setPayslipError("")
  }


  // Check employment type (case-insensitive comparison)
  const employmentTypeValue = (formData.employmentType || "").toLowerCase()
  
  const isEmployee = ["private", "government/psu", "defence"].includes(employmentTypeValue)
  const isBusiness = ["business", "self employed"].includes(employmentTypeValue)
  const isStudent = employmentTypeValue === "student"

  const salaryRanges = [
    { id: "below_2l", value: "Below 2 Lakhs" },
    { id: "2l_5l", value: "2L - 5L" },
    { id: "5l_10l", value: "5L - 10L" },
    { id: "10l_15l", value: "10L - 15L" },
    { id: "15l_25l", value: "15L - 25L" },
    { id: "25l_50l", value: "25L - 50L" },
    { id: "50l_1c", value: "50L - 1 Crore" },
    { id: "above_1c", value: "Above 1 Crore" },
  ]

  const revenueRanges = [
    { id: "below_5l", value: "Below 5 Lakhs" },
    { id: "5l_10l", value: "5L - 10L" },
    { id: "10l_25l", value: "10L - 25L" },
    { id: "25l_50l", value: "25L - 50L" },
    { id: "50l_1c", value: "50L - 1 Crore" },
    { id: "1c_5c", value: "1C - 5 Crore" },
    { id: "above_5c", value: "Above 5 Crores" },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Briefcase}
            title="Employment type"
            description="Select your current employment status"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1`}>
            <CustomSelectDropdown
              id="employmentType"
              label="Employment Type *"
              value={formData.employmentType || ""}
              onChange={(value) => onChange("employmentType", value)}
              options={employmentTypeOptions}
              required
            />
          </div>
        </div>

        {isEmployee && (
          <div className={SETUP_SECTION_CARD}>
            <SetupSectionHeader
              icon={Building2}
              title="Work details"
              description="Industry, company, role, salary, and location"
            />
            <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
              <CustomSelectDropdown
                id="sector"
                label="Industry *"
                value={formData.sector || ""}
                onChange={(value) => onChange("sector", value)}
                options={sectorOptions}
                required
                showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
                otherValue={formData.sectorOther || ""}
                onOtherChange={(value) => onChange("sectorOther", value)}
                otherPlaceholder="Enter Industry Name"
              />
              <div className="space-y-1.5">
                <Label htmlFor="company" className="sds-label">Company Name *</Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={(e) => onChange("company", e.target.value)}
                  placeholder="e.g., Google India / TCS"
                  required
                  className="sds-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designation" className="sds-label">Role / Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation || ""}
                  onChange={(e) => onChange("designation", e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  required
                  className="sds-input w-full"
                />
              </div>
              <CustomSelectDropdown
                id="salaryRange"
                label="Annual Salary Range *"
                value={formData.salaryRange || ""}
                onChange={(value) => onChange("salaryRange", value)}
                options={salaryRanges}
                required
              />
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="workLocation" className="sds-label">Work Location *</Label>
                <Input
                  id="workLocation"
                  value={formData.workLocation || ""}
                  onChange={(e) => onChange("workLocation", e.target.value)}
                  placeholder="e.g., Bengaluru, Karnataka"
                  required
                  className="sds-input w-full"
                />
              </div>
            </div>
          </div>
        )}

        {isStudent && (
          <div className={SETUP_SECTION_CARD}>
            <SetupSectionHeader
              icon={GraduationCap}
              title="Student details"
              description="Institution, sector, graduation year, and location"
            />
            <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
              <CustomSelectDropdown
                id="sector"
                label="Current Sector"
                value={formData.sector || ""}
                onChange={(value) => onChange("sector", value)}
                options={sectorOptions}
                showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
                otherValue={formData.sectorOther || ""}
                onOtherChange={(value) => onChange("sectorOther", value)}
                otherPlaceholder="Enter Industry Name"
              />
              <div className="space-y-1.5">
                <Label htmlFor="company" className="sds-label">Institution Name *</Label>
                <Input
                  id="company"
                  value={formData.institution || ""}
                  onChange={(e) => onChange("institution", e.target.value)}
                  placeholder="e.g., IIT Madras"
                  required
                  className="sds-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designation" className="sds-label">Role / Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation || "Student"}
                  onChange={(e) => onChange("designation", e.target.value)}
                  placeholder="e.g., Student"
                  required
                  className="sds-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expectedGraduationYear" className="sds-label">Expected Graduation Year *</Label>
                <Input
                  id="expectedGraduationYear"
                  type="number"
                  value={formData.expectedGraduationYear || ""}
                  onChange={(e) => onChange("expectedGraduationYear", e.target.value)}
                  placeholder="YYYY"
                  required
                  className="sds-input w-full"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="workLocation" className="sds-label">Current Location *</Label>
                <Input
                  id="workLocation"
                  value={formData.workLocation || ""}
                  onChange={(e) => onChange("workLocation", e.target.value)}
                  placeholder="e.g., Bengaluru, Karnataka"
                  required
                  className="sds-input w-full"
                />
              </div>
            </div>
          </div>
        )}

        {isBusiness && (
          <div className={SETUP_SECTION_CARD}>
            <SetupSectionHeader
              icon={Store}
              title="Business details"
              description="Sector, business name, type, revenue, and location"
            />
            <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
              <CustomSelectDropdown
                id="sector"
                label="Business Sector *"
                value={formData.sector || ""}
                onChange={(value) => onChange("sector", value)}
                options={sectorOptions}
                required
                showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
                otherValue={formData.sectorOther || ""}
                onOtherChange={(value) => onChange("sectorOther", value)}
                otherPlaceholder="Enter Sector Name"
              />
              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="sds-label">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName || ""}
                  onChange={(e) => onChange("businessName", e.target.value)}
                  placeholder="e.g., Green Earth Solutions"
                  required
                  className="sds-input w-full"
                />
              </div>
              <CustomSelectDropdown
                id="businessType"
                label="Business Type *"
                value={formData.businessType || ""}
                onChange={(value) => onChange("businessType", value)}
                options={businessTypeOptions}
                required
                showOtherInput={businessTypeOptions.some(opt => opt.value.toLowerCase() === "other")}
                otherValue={formData.businessTypeOther || ""}
                onOtherChange={(value) => onChange("businessTypeOther", value)}
                otherPlaceholder="Enter Business Type"
              />
              <div className="space-y-1.5">
                <Label htmlFor="designation" className="sds-label">Role in Business *</Label>
                <Input
                  id="designation"
                  value={formData.designation || ""}
                  onChange={(e) => onChange("designation", e.target.value)}
                  placeholder="e.g., Founder & CEO"
                  required
                  className="sds-input w-full"
                />
              </div>
              <CustomSelectDropdown
                id="revenueRange"
                label="Annual Business Revenue *"
                value={formData.revenueRange || ""}
                onChange={(value) => onChange("revenueRange", value)}
                options={revenueRanges}
                required
              />
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="businessLocation" className="sds-label">Business Location *</Label>
                <Input
                  id="businessLocation"
                  value={formData.businessLocation || ""}
                  onChange={(e) => onChange("businessLocation", e.target.value)}
                  placeholder="e.g., Coimbatore, Tamil Nadu"
                  required
                  className="sds-input w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
