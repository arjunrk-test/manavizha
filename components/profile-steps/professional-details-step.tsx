"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"
import { CustomSelectDropdown } from "@/components/ui/custom-select-dropdown"

interface ProfessionalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function ProfessionalDetailsStep({ formData, onChange }: ProfessionalDetailsStepProps) {
  const [payslipError, setPayslipError] = useState<string>("")
  const [itrError, setItrError] = useState<string>("")

  // Fetch employment type from master_employment_type table using the common hook
  const { data: employmentTypeOptions } = useMasterData({ tableName: "master_employment_type" })
  
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

  const handleItrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setItrError(error)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      onChange("itrDocument", result)
      setItrError("")
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ""
  }

  const removeItr = () => {
    onChange("itrDocument", "")
    setItrError("")
  }

  // Check employment type (case-insensitive comparison)
  const employmentTypeValue = (formData.employmentType || "").toLowerCase()
  
  // Find the selected option to check its value
  const selectedOption = employmentTypeOptions.find(opt => opt.value.toLowerCase() === employmentTypeValue)
  const selectedValue = selectedOption?.value.toLowerCase() || employmentTypeValue
  
  const isEmployee = selectedValue === "employee"
  const isBusiness = selectedValue === "business" || selectedValue.includes("business") || selectedValue.includes("self-employed")
  const isStudent = selectedValue === "student"

  return (
    <div className="space-y-6">
      {/* Employment Type Selection */}
      <CustomSelectDropdown
        id="employmentType"
        label="Employment Type *"
        value={formData.employmentType || ""}
        onChange={(value) => onChange("employmentType", value)}
        options={employmentTypeOptions}
        required
      />

      {/* Employee-specific fields */}
      {isEmployee && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomSelectDropdown
          id="sector"
          label="Sector *"
          value={formData.sector || ""}
          onChange={(value) => onChange("sector", value)}
          options={sectorOptions}
          required
          showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
          otherValue={formData.sectorOther || ""}
          onOtherChange={(value) => onChange("sectorOther", value)}
          otherPlaceholder="Please specify sector"
        />
        <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
                value={formData.company || ""}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation || ""}
                onChange={(e) => onChange("designation", e.target.value)}
                placeholder="e.g., Software Engineer, Manager, etc."
                required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Annual Salary *</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-0">
              ₹
            </div>
            <Input
              id="salary"
              type="text"
                  value={formData.salary?.startsWith("₹") ? formData.salary.slice(1) : formData.salary || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "")
                onChange("salary", value ? `₹${value}` : "₹")
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && formData.salary === "₹") {
                  e.preventDefault()
                }
              }}
              placeholder="Enter annual salary"
              required
              className="pl-8"
            />
          </div>
        </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="workLocation">Work Location *</Label>
          <Input
            id="workLocation"
                value={formData.workLocation || ""}
            onChange={(e) => onChange("workLocation", e.target.value)}
            placeholder="Enter work location"
                required
              />
            </div>
          </div>

          {/* Payslip Upload */}
          <div className="space-y-2">
            <Label htmlFor="payslip">Last 3 Months Payslip (Optional - Max 3 files, each under 5MB)</Label>
            {payslipError && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {payslipError}
              </div>
            )}
            {(formData.payslip as string[]) && (formData.payslip as string[]).length > 0 ? (
              <div className="space-y-4">
                {(formData.payslip as string[]).map((payslip, index) => (
                  <div key={index} className="relative max-w-md">
                    {payslip.startsWith("data:image/") ? (
                      <img
                        src={payslip}
                        alt={`Payslip ${index + 1}`}
                        className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payslip {index + 1} uploaded</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePayslip(index)}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(formData.payslip as string[]).length < 3 && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handlePayslipUpload}
                      className="hidden"
                      id="payslip-upload"
                      multiple
                    />
                    <label
                      htmlFor="payslip-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Click to upload more payslips or drag and drop
                      </span>
                      <span className="text-sm text-gray-500">
                        {(formData.payslip as string[]).length} of 3 files uploaded. Image or PDF up to 5MB each
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handlePayslipUpload}
                  className="hidden"
                  id="payslip-upload"
                  multiple
                  required
                />
                <label
                  htmlFor="payslip-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Click to upload payslips or drag and drop
                  </span>
                  <span className="text-sm text-gray-500">Max 3 files, Image or PDF up to 5MB each</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business/Self-Employed specific fields */}
      {isBusiness && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomSelectDropdown
              id="sector"
              label="Sector *"
              value={formData.sector || ""}
              onChange={(value) => onChange("sector", value)}
              options={sectorOptions}
              required
              showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
              otherValue={formData.sectorOther || ""}
              onOtherChange={(value) => onChange("sectorOther", value)}
              otherPlaceholder="Please specify sector"
            />
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName || ""}
                onChange={(e) => onChange("businessName", e.target.value)}
                placeholder="Enter business name"
                required
              />
            </div>
            <CustomSelectDropdown
              id="businessType"
              label="What Type of Business *"
              value={formData.businessType || ""}
              onChange={(value) => onChange("businessType", value)}
              options={businessTypeOptions}
              required
              showOtherInput={businessTypeOptions.some(opt => opt.value.toLowerCase() === "other")}
              otherValue={formData.businessTypeOther || ""}
              onOtherChange={(value) => onChange("businessTypeOther", value)}
              otherPlaceholder="Please specify business type"
            />
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation || ""}
                onChange={(e) => onChange("designation", e.target.value)}
                placeholder="e.g., Owner, Director, Partner, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualReturns">Annual Returns *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-0">
                  ₹
                </div>
                <Input
                  id="annualReturns"
                  type="text"
                  value={formData.annualReturns?.startsWith("₹") ? formData.annualReturns.slice(1) : formData.annualReturns || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    onChange("annualReturns", value ? `₹${value}` : "₹")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && formData.annualReturns === "₹") {
                      e.preventDefault()
                    }
                  }}
                  placeholder="Enter annual returns"
                  required
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessLocation">Business Location *</Label>
              <Input
                id="businessLocation"
                value={formData.businessLocation || ""}
                onChange={(e) => onChange("businessLocation", e.target.value)}
                placeholder="Enter main business location"
                required
              />
            </div>
          </div>

          {/* ITR Document Upload */}
          <div className="space-y-2">
            <Label htmlFor="itrDocument">Last Filed ITR Document (Optional)</Label>
            {itrError && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {itrError}
              </div>
            )}
            {formData.itrDocument ? (
              <div className="relative max-w-md">
                {formData.itrDocument.startsWith("data:image/") ? (
                  <img
                    src={formData.itrDocument}
                    alt="ITR Document"
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">ITR Document uploaded</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeItr}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleItrUpload}
                  className="hidden"
                  id="itr-upload"
                />
                <label
                  htmlFor="itr-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Click to upload ITR document or drag and drop
                  </span>
                  <span className="text-sm text-gray-500">Image or PDF up to 5MB</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student-specific fields */}
      {isStudent && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="institution">Institution / University *</Label>
              <Input
                id="institution"
                value={formData.institution || ""}
                onChange={(e) => onChange("institution", e.target.value)}
                placeholder="Enter institution or university name"
                required
              />
            </div>
            <CustomSelectDropdown
              id="course"
              label="Course / Degree *"
              value={formData.course || ""}
              onChange={(value) => onChange("course", value)}
              options={courseOptions}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study / Major *</Label>
              <Input
                id="fieldOfStudy"
                value={formData.fieldOfStudy || ""}
                onChange={(e) => onChange("fieldOfStudy", e.target.value)}
                placeholder="e.g., Computer Science, Electronics, etc."
                required
              />
            </div>
            <CustomSelectDropdown
              id="yearOfStudy"
              label="Year of Study *"
              value={formData.yearOfStudy || ""}
              onChange={(value) => onChange("yearOfStudy", value)}
              options={yearOfStudyOptions}
              required
            />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expectedGraduationYear">Expected Graduation Year *</Label>
              <Input
                id="expectedGraduationYear"
                type="number"
                value={formData.expectedGraduationYear || ""}
                onChange={(e) => onChange("expectedGraduationYear", e.target.value)}
                placeholder="e.g., 2025"
                min="2000"
                max="2100"
                required
          />
        </div>
      </div>
        </div>
      )}
    </div>
  )
}

