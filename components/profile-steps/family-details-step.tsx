"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { Textarea } from "@/components/ui/textarea"

interface FamilyDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function FamilyDetailsStep({ formData, onChange }: FamilyDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father Name *</Label>
          <Input
            id="fatherName"
            value={formData.fatherName || ""}
            onChange={(e) => onChange("fatherName", e.target.value)}
            placeholder="Enter father's name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherOccupation">Father's Occupation *</Label>
          <Input
            id="fatherOccupation"
            value={formData.fatherOccupation || ""}
            onChange={(e) => onChange("fatherOccupation", e.target.value)}
            placeholder="Enter father's occupation"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherName">Mother Name *</Label>
          <Input
            id="motherName"
            value={formData.motherName || ""}
            onChange={(e) => onChange("motherName", e.target.value)}
            placeholder="Enter mother's name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherOccupation">Mother's Occupation *</Label>
          <Input
            id="motherOccupation"
            value={formData.motherOccupation || ""}
            onChange={(e) => onChange("motherOccupation", e.target.value)}
            placeholder="Enter mother's occupation"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="parentsResidence">Current Residence of Parents (Permanent/Temporary) *</Label>
          <Input
            id="parentsResidence"
            value={formData.parentsResidence || ""}
            onChange={(e) => onChange("parentsResidence", e.target.value)}
            placeholder="Enter parents' current residence"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="siblings">Siblings Details (if any)</Label>
          <Input
            id="siblings"
            value={formData.siblings || ""}
            onChange={(e) => onChange("siblings", e.target.value)}
            placeholder="e.g., 1 brother, 1 sister"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="familyDescription">Brief Description About Family</Label>
          <Textarea
            id="familyDescription"
            value={formData.familyDescription || ""}
            onChange={(e) => onChange("familyDescription", e.target.value)}
            placeholder="Enter a brief description about your family"
            rows={4}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="caste">Caste *</Label>
          <Input
            id="caste"
            value={formData.caste || ""}
            onChange={(e) => onChange("caste", e.target.value)}
            placeholder="Enter caste"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subcaste">Subcaste</Label>
          <Input
            id="subcaste"
            value={formData.subcaste || ""}
            onChange={(e) => onChange("subcaste", e.target.value)}
            placeholder="Enter subcaste"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kulam">Kulam</Label>
          <Input
            id="kulam"
            value={formData.kulam || ""}
            onChange={(e) => onChange("kulam", e.target.value)}
            placeholder="Enter kulam"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="familyType">Family Type</Label>
          <select
            id="familyType"
            value={formData.familyType || ""}
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
            value={formData.familyStatus || ""}
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
