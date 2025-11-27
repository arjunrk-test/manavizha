"use client"

import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface SocialHabitsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function SocialHabitsStep({ formData, onChange }: SocialHabitsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smoking">Smoking</Label>
          <select
            id="smoking"
            value={formData.smoking}
            onChange={(e) => onChange("smoking", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="never">Never</option>
            <option value="occasionally">Occasionally</option>
            <option value="regularly">Regularly</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="drinking">Drinking</Label>
          <select
            id="drinking"
            value={formData.drinking}
            onChange={(e) => onChange("drinking", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="never">Never</option>
            <option value="occasionally">Occasionally</option>
            <option value="regularly">Regularly</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="diet">Diet Preference</Label>
          <select
            id="diet"
            value={formData.diet}
            onChange={(e) => onChange("diet", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
          </select>
        </div>
      </div>
    </div>
  )
}

