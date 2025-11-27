"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface FamilyDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function FamilyDetailsStep({ formData, onChange }: FamilyDetailsStepProps) {
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

