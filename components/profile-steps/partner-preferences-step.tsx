"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface PartnerPreferencesStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PartnerPreferencesStep({ formData, onChange }: PartnerPreferencesStepProps) {
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

