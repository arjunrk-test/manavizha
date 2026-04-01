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
    <div className="space-y-12">
      {/* Employment Type Selection */}
      <CustomSelectDropdown
        id="employmentType"
        label="Professional Matrix Status *"
        value={formData.employmentType || ""}
        onChange={(value) => onChange("employmentType", value)}
        options={employmentTypeOptions}
        required
      />

      {/* Employee-specific fields */}
      {isEmployee && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CustomSelectDropdown
              id="sector"
              label="Economic Sector *"
              value={formData.sector || ""}
              onChange={(value) => onChange("sector", value)}
              options={sectorOptions}
              required
              showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
              otherValue={formData.sectorOther || ""}
              onOtherChange={(value) => onChange("sectorOther", value)}
              otherPlaceholder="Manual Sector Entry"
            />
            <div className="space-y-2">
              <Label htmlFor="company" className="sds-label">Enterprise Entity *</Label>
              <Input
                id="company"
                value={formData.company || ""}
                onChange={(e) => onChange("company", e.target.value)}
                placeholder="Official Corporate Name"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation" className="sds-label">Professional Designation *</Label>
              <Input
                id="designation"
                value={formData.designation || ""}
                onChange={(e) => onChange("designation", e.target.value)}
                placeholder="e.g., Senior Systems Architect"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="sds-label">Annual Compensation *</Label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4B0082]/40 font-black text-sm pointer-events-none z-10 transition-colors group-focus-within:text-[#4B0082]">
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
                  placeholder="e.g., 2,400,000"
                  required
                  className="sds-input pl-10 w-full"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="workLocation" className="sds-label">Geographic Operating Base *</Label>
              <Input
                id="workLocation"
                value={formData.workLocation || ""}
                onChange={(e) => onChange("workLocation", e.target.value)}
                placeholder="City, State, Country"
                required
                className="sds-input w-full"
              />
            </div>
          </div>

          {/* Payslip Upload */}
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-4">
              <Label htmlFor="payslip" className="sds-label !mb-0 whitespace-nowrap">Earnings Verification Matrix</Label>
              <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent" />
            </div>
            
            {payslipError && (
              <div className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 animate-in shake-in duration-300">
                {payslipError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(formData.payslip as string[] || []).map((payslip, index) => (
                <div key={index} className="relative group">
                  <div className="sds-glass rounded-3xl overflow-hidden border-2 border-indigo-50/50 shadow-lg aspect-[4/3] flex items-center justify-center bg-white/20">
                    {payslip.startsWith("data:image/") ? (
                      <img
                        src={payslip}
                        alt={`Payslip ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-[#4B0082]/10 flex items-center justify-center text-[#4B0082]">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">PDF Protocol {index + 1}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removePayslip(index)}
                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-rose-500 hover:bg-rose-600 border-2 border-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(formData.payslip as string[] || []).length < 3 && (
                <div className="sds-glass rounded-3xl border-2 border-dashed border-indigo-100 bg-indigo-50/10 aspect-[4/3] relative group hover:border-[#4B0082]/30 transition-all duration-500">
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
                    className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-[#4B0082]/5 flex items-center justify-center text-[#4B0082]/40 mb-3 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#4B0082]/10 group-hover:text-[#4B0082]">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 group-hover:text-[#4B0082] transition-colors">
                      Sync Attachment
                    </span>
                    <span className="text-[9px] text-[#4B0082]/20 font-bold uppercase mt-1 tracking-widest group-hover:text-[#4B0082]/40 transition-colors">
                      {(formData.payslip as string[] || []).length} / 03 Records
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Business/Self-Employed specific fields */}
      {isBusiness && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CustomSelectDropdown
              id="sector"
              label="Market Sector *"
              value={formData.sector || ""}
              onChange={(value) => onChange("sector", value)}
              options={sectorOptions}
              required
              showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
              otherValue={formData.sectorOther || ""}
              onOtherChange={(value) => onChange("sectorOther", value)}
              otherPlaceholder="Manual Sector Entry"
            />
            <div className="space-y-2">
              <Label htmlFor="businessName" className="sds-label">Commercial Entity Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName || ""}
                onChange={(e) => onChange("businessName", e.target.value)}
                placeholder="Official Registered Title"
                required
                className="sds-input w-full"
              />
            </div>
            <CustomSelectDropdown
              id="businessType"
              label="Operating Architecture *"
              value={formData.businessType || ""}
              onChange={(value) => onChange("businessType", value)}
              options={businessTypeOptions}
              required
              showOtherInput={businessTypeOptions.some(opt => opt.value.toLowerCase() === "other")}
              otherValue={formData.businessTypeOther || ""}
              onOtherChange={(value) => onChange("businessTypeOther", value)}
              otherPlaceholder="Manual Type Entry"
            />
            <div className="space-y-2">
              <Label htmlFor="designation" className="sds-label">Strategic Designation *</Label>
              <Input
                id="designation"
                value={formData.designation || ""}
                onChange={(e) => onChange("designation", e.target.value)}
                placeholder="e.g., Executive Director"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualReturns" className="sds-label">Fiscal Annual Returns *</Label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4B0082]/40 font-black text-sm pointer-events-none z-10 transition-colors group-focus-within:text-[#4B0082]">
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
                  placeholder="e.g., 5,000,000"
                  required
                  className="sds-input pl-10 w-full"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessLocation" className="sds-label">Headquarters Location *</Label>
              <Input
                id="businessLocation"
                value={formData.businessLocation || ""}
                onChange={(e) => onChange("businessLocation", e.target.value)}
                placeholder="City, State, Country"
                required
                className="sds-input w-full"
              />
            </div>
          </div>

          {/* ITR Document Upload */}
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-4">
              <Label htmlFor="itrDocument" className="sds-label !mb-0 whitespace-nowrap">Fiscal Integrity Verification</Label>
              <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent" />
            </div>

            {itrError && (
              <div className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 animate-in shake-in duration-300">
                {itrError}
              </div>
            )}

            <div className="max-w-md">
              {formData.itrDocument ? (
                <div className="relative group">
                  <div className="sds-glass rounded-3xl overflow-hidden border-2 border-indigo-50/50 shadow-lg p-2 bg-white/20">
                    {formData.itrDocument.startsWith("data:image/") ? (
                      <img
                        src={formData.itrDocument}
                        alt="ITR Document"
                        className="w-full h-auto rounded-2xl"
                      />
                    ) : (
                      <div className="p-8 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">ITR Protocol Verified</p>
                          <p className="text-[9px] text-amber-500/60 font-bold uppercase tracking-widest mt-1 text-xs">File Encrypted & Stored</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={removeItr}
                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-xl bg-rose-500 hover:bg-rose-600 border-2 border-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="sds-glass rounded-3xl border-2 border-dashed border-indigo-100 bg-indigo-50/10 relative group hover:border-[#4B0082]/30 transition-all duration-500 overflow-hidden">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleItrUpload}
                    className="hidden"
                    id="itr-upload"
                  />
                  <label
                    htmlFor="itr-upload"
                    className="cursor-pointer flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="h-16 w-16 rounded-[2rem] bg-[#4B0082]/5 flex items-center justify-center text-[#4B0082]/40 mb-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#4B0082]/10 group-hover:text-[#4B0082]">
                      <Upload className="h-8 w-8" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 group-hover:text-[#4B0082] transition-colors mb-2">
                       Append ITR Logic (Optional)
                    </span>
                    <span className="text-[9px] text-black/20 font-bold uppercase tracking-tighter">
                      Image or PDF Protocol up to 5MB
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student-specific fields */}
      {isStudent && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="institution" className="sds-label">Academy / University *</Label>
              <Input
                id="institution"
                value={formData.institution || ""}
                onChange={(e) => onChange("institution", e.target.value)}
                placeholder="Official Institution Name"
                required
                className="sds-input w-full"
              />
            </div>
            <CustomSelectDropdown
              id="course"
              label="Course / Vector *"
              value={formData.course || ""}
              onChange={(value) => onChange("course", value)}
              options={courseOptions}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy" className="sds-label">Field of Strategic Study *</Label>
              <Input
                id="fieldOfStudy"
                value={formData.fieldOfStudy || ""}
                onChange={(e) => onChange("fieldOfStudy", e.target.value)}
                placeholder="e.g., Quantum Computing, Humanities"
                required
                className="sds-input w-full"
              />
            </div>
            <CustomSelectDropdown
              id="yearOfStudy"
              label="Phase of Study *"
              value={formData.yearOfStudy || ""}
              onChange={(value) => onChange("yearOfStudy", value)}
              options={yearOfStudyOptions}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="expectedGraduationYear" className="sds-label">Expected Archival Year *</Label>
              <Input
                id="expectedGraduationYear"
                type="number"
                value={formData.expectedGraduationYear || ""}
                onChange={(e) => onChange("expectedGraduationYear", e.target.value)}
                placeholder="YYYY"
                min="2000"
                max="2100"
                required
                className="sds-input w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

