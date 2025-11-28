"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface ProfessionalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function ProfessionalDetailsStep({ formData, onChange }: ProfessionalDetailsStepProps) {
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
          <Label htmlFor="salary">Annual Salary *</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
              ₹
            </div>
            <Input
              id="salary"
              type="text"
              value={formData.salary.startsWith("₹") ? formData.salary.slice(1) : formData.salary}
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

