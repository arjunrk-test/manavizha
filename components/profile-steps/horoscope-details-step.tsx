"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface HoroscopeDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function HoroscopeDetailsStep({ formData, onChange }: HoroscopeDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeOfBirth">Time of Birth</Label>
          <Input
            id="timeOfBirth"
            type="time"
            value={formData.timeOfBirth}
            onChange={(e) => onChange("timeOfBirth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">Place of Birth</Label>
          <Input
            id="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={(e) => onChange("placeOfBirth", e.target.value)}
            placeholder="Enter place of birth"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zodiacSign">Zodiac Sign</Label>
          <select
            id="zodiacSign"
            value={formData.zodiacSign}
            onChange={(e) => onChange("zodiacSign", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="aries">Aries</option>
            <option value="taurus">Taurus</option>
            <option value="gemini">Gemini</option>
            <option value="cancer">Cancer</option>
            <option value="leo">Leo</option>
            <option value="virgo">Virgo</option>
            <option value="libra">Libra</option>
            <option value="scorpio">Scorpio</option>
            <option value="sagittarius">Sagittarius</option>
            <option value="capricorn">Capricorn</option>
            <option value="aquarius">Aquarius</option>
            <option value="pisces">Pisces</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rashi">Rashi</Label>
          <Input
            id="rashi"
            value={formData.rashi}
            onChange={(e) => onChange("rashi", e.target.value)}
            placeholder="Enter Rashi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nakshatra">Nakshatra</Label>
          <Input
            id="nakshatra"
            value={formData.nakshatra}
            onChange={(e) => onChange("nakshatra", e.target.value)}
            placeholder="Enter Nakshatra"
          />
        </div>
      </div>
    </div>
  )
}

