"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface EducationalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function EducationalDetailsStep({ formData, onChange }: EducationalDetailsStepProps) {
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

