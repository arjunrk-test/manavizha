"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { FormData } from "@/types/profile"

interface ProfessionalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function ProfessionalDetailsStep({ formData, onChange }: ProfessionalDetailsStepProps) {
  const [payslipError, setPayslipError] = useState<string>("")
  const [itrError, setItrError] = useState<string>("")

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

  const isEmployee = formData.employmentType === "employee"
  const isBusiness = formData.employmentType === "business"
  const isStudent = formData.employmentType === "student"

  return (
    <div className="space-y-6">
      {/* Employment Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="employmentType">Employment Type *</Label>
        <select
          id="employmentType"
          value={formData.employmentType || ""}
          onChange={(e) => onChange("employmentType", e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          required
        >
          <option value="">Select</option>
          <option value="employee">Employee</option>
          <option value="business">Business / Self-Employed</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Employee-specific fields */}
      {isEmployee && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <select
                id="sector"
                value={formData.sector || ""}
                onChange={(e) => {
                  onChange("sector", e.target.value)
                  if (e.target.value !== "other") {
                    onChange("sectorOther", "")
                  }
                }}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
                required
              >
                <option value="">Select</option>
                <option value="it-software">IT / Software</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance-banking">Finance / Banking</option>
                <option value="education">Education</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="hospitality">Hospitality</option>
                <option value="real-estate">Real Estate</option>
                <option value="consulting">Consulting</option>
                <option value="media-entertainment">Media / Entertainment</option>
                <option value="telecommunications">Telecommunications</option>
                <option value="automotive">Automotive</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="energy">Energy</option>
                <option value="government">Government</option>
                <option value="non-profit">Non-Profit</option>
                <option value="legal">Legal</option>
                <option value="engineering">Engineering</option>
                <option value="logistics">Logistics</option>
                <option value="agriculture">Agriculture</option>
                <option value="other">Other</option>
              </select>
              {formData.sector === "other" && (
                <Input
                  id="sectorOther"
                  value={formData.sectorOther || ""}
                  onChange={(e) => onChange("sectorOther", e.target.value)}
                  placeholder="Please specify sector"
                  className="mt-2"
                  required
                />
              )}
            </div>
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
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
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
            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <select
                id="sector"
                value={formData.sector || ""}
                onChange={(e) => {
                  onChange("sector", e.target.value)
                  if (e.target.value !== "other") {
                    onChange("sectorOther", "")
                  }
                }}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
                required
              >
                <option value="">Select</option>
                <option value="it-software">IT / Software</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance-banking">Finance / Banking</option>
                <option value="education">Education</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="hospitality">Hospitality</option>
                <option value="real-estate">Real Estate</option>
                <option value="consulting">Consulting</option>
                <option value="media-entertainment">Media / Entertainment</option>
                <option value="telecommunications">Telecommunications</option>
                <option value="automotive">Automotive</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="energy">Energy</option>
                <option value="government">Government</option>
                <option value="non-profit">Non-Profit</option>
                <option value="legal">Legal</option>
                <option value="engineering">Engineering</option>
                <option value="logistics">Logistics</option>
                <option value="agriculture">Agriculture</option>
                <option value="other">Other</option>
              </select>
              {formData.sector === "other" && (
                <Input
                  id="sectorOther"
                  value={formData.sectorOther || ""}
                  onChange={(e) => onChange("sectorOther", e.target.value)}
                  placeholder="Please specify sector"
                  className="mt-2"
                  required
                />
              )}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="businessType">What Type of Business *</Label>
              <select
                id="businessType"
                value={formData.businessType || ""}
                onChange={(e) => {
                  onChange("businessType", e.target.value)
                  if (e.target.value !== "other") {
                    onChange("businessTypeOther", "")
                  }
                }}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
                required
              >
                <option value="">Select</option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="llp">LLP (Limited Liability Partnership)</option>
                <option value="private-limited">Private Limited Company</option>
                <option value="public-limited">Public Limited Company</option>
                <option value="one-person-company">One Person Company (OPC)</option>
                <option value="huf">HUF (Hindu Undivided Family)</option>
                <option value="freelancer">Freelancer / Independent Contractor</option>
                <option value="consultant">Consultant</option>
                <option value="other">Other</option>
              </select>
              {formData.businessType === "other" && (
                <Input
                  id="businessTypeOther"
                  value={formData.businessTypeOther || ""}
                  onChange={(e) => onChange("businessTypeOther", e.target.value)}
                  placeholder="Please specify business type"
                  className="mt-2"
                  required
                />
              )}
            </div>
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
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
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
            <div className="space-y-2">
              <Label htmlFor="course">Course / Degree *</Label>
              <select
                id="course"
                value={formData.course || ""}
                onChange={(e) => onChange("course", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
                required
              >
                <option value="">Select</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD / Doctorate</option>
                <option value="diploma">Diploma</option>
                <option value="certification">Professional Certification</option>
                <option value="other">Other</option>
              </select>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of Study *</Label>
              <select
                id="yearOfStudy"
                value={formData.yearOfStudy || ""}
                onChange={(e) => onChange("yearOfStudy", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
                required
              >
                <option value="">Select</option>
                <option value="1st-year">1st Year</option>
                <option value="2nd-year">2nd Year</option>
                <option value="3rd-year">3rd Year</option>
                <option value="4th-year">4th Year</option>
                <option value="5th-year">5th Year</option>
                <option value="final-year">Final Year</option>
                <option value="post-graduate">Post Graduate</option>
              </select>
            </div>
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

