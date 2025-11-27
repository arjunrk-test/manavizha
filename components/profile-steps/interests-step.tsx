"use client"

import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface InterestsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function InterestsStep({ formData, onChange }: InterestsStepProps) {
  const hobbiesList = ["Reading", "Writing", "Music", "Dancing", "Sports", "Traveling", "Cooking", "Photography", "Art", "Gaming", "Movies", "Fitness"]
  const interestsList = ["Technology", "Business", "Science", "Arts", "Literature", "History", "Politics", "Sports", "Entertainment", "Food", "Fashion", "Nature"]

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
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange("hobbies", [...formData.hobbies, hobby])
                    } else {
                      onChange("hobbies", formData.hobbies.filter((h) => h !== hobby))
                    }
                  }}
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
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange("interests", [...formData.interests, interest])
                    } else {
                      onChange("interests", formData.interests.filter((i) => i !== interest))
                    }
                  }}
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

