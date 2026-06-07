"use client"

import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"
import {
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"
import { Heart, Palette } from "lucide-react"

interface InterestsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function InterestsStep({ formData, onChange }: InterestsStepProps) {
  const { data: hobbiesData } = useMasterData({ tableName: "master_hobbies" })
  const { data: interestsData } = useMasterData({ tableName: "master_interests" })

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Palette}
            title="Hobbies"
            description="Activities you enjoy in your free time"
          />
          <div className="setup-section-card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {hobbiesList.map((hobby) => {
                const isSelected = formData.hobbies.includes(hobby)
                return (
                  <label
                    key={hobby}
                    className={`relative group cursor-pointer h-11 flex items-center justify-center px-3 rounded-xl border-2 transition-all duration-300 font-semibold text-[10px] uppercase tracking-wide text-center ${
                      isSelected
                        ? "bg-[#e87898] border-[#e87898] text-white shadow-sm active:scale-95"
                        : "sds-glass border-[#f0ebe3] text-gray-500 hover:border-[#e87898]/30 hover:text-[#e87898]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleHobbyToggle(hobby, e.target.checked)}
                      className="hidden"
                    />
                    {hobby}
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Heart}
            title="Interests"
            description="Topics and passions that matter to you"
          />
          <div className="setup-section-card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {interestsList.map((interest) => {
                const isSelected = formData.interests.includes(interest)
                return (
                  <label
                    key={interest}
                    className={`relative group cursor-pointer h-11 flex items-center justify-center px-3 rounded-xl border-2 transition-all duration-300 font-semibold text-[10px] uppercase tracking-wide text-center ${
                      isSelected
                        ? "bg-[#e87898] border-[#e87898] text-white shadow-sm active:scale-95"
                        : "sds-glass border-[#f0ebe3] text-gray-500 hover:border-[#e87898]/30 hover:text-[#e87898]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleInterestToggle(interest, e.target.checked)}
                      className="hidden"
                    />
                    {interest}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
