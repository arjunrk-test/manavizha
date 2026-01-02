"use client"

import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"

interface InterestsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function InterestsStep({ formData, onChange }: InterestsStepProps) {
  // Fetch hobbies and interests from master tables using the common hook
  const { data: hobbiesData } = useMasterData({ tableName: "master_hobbies" })
  const { data: interestsData } = useMasterData({ tableName: "master_interests" })

  // Transform data to arrays of values
  const hobbiesList = hobbiesData.map((item) => item.value)
  const interestsList = interestsData.map((item) => item.value)

  const handleHobbyToggle = (hobby: string, checked: boolean) => {
    if (checked) {
      onChange("hobbies", [...formData.hobbies, hobby])
    } else {
      onChange("hobbies", formData.hobbies.filter((h) => h !== hobby))
    }
  }

  const handleInterestToggle = (interest: string, checked: boolean) => {
    if (checked) {
      onChange("interests", [...formData.interests, interest])
    } else {
      onChange("interests", formData.interests.filter((i) => i !== interest))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Hobbies</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {hobbiesList.map((hobby) => (
              <label key={hobby} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hobbies.includes(hobby)}
                  onChange={(e) => handleHobbyToggle(hobby, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{hobby}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Interests</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestsList.map((interest) => (
              <label key={interest} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={(e) => handleInterestToggle(interest, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{interest}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

