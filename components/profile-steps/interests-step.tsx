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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">H1</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Leisure Matrix</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Hobbies & Activities</h3>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {hobbiesList.map((hobby) => {
              const isSelected = formData.hobbies.includes(hobby)
              return (
                <label 
                  key={hobby} 
                  className={`relative group cursor-pointer h-14 flex items-center justify-center px-4 rounded-2xl border-2 transition-all duration-300 font-bold text-[10px] uppercase tracking-widest text-center ${
                    isSelected 
                    ? "bg-[#4B0082] border-[#4B0082] text-white shadow-lg shadow-indigo-900/20 active:scale-95" 
                    : "sds-glass border-indigo-50/50 text-gray-500 hover:border-[#4B0082]/30 hover:text-[#4B0082] hover:-translate-y-1"
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

        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">I2</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Intellectual Vector</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Interests & Pursuits</h3>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {interestsList.map((interest) => {
              const isSelected = formData.interests.includes(interest)
              return (
                <label 
                  key={interest} 
                  className={`relative group cursor-pointer h-14 flex items-center justify-center px-4 rounded-2xl border-2 transition-all duration-300 font-bold text-[10px] uppercase tracking-widest text-center ${
                    isSelected 
                    ? "bg-[#4B0082] border-[#4B0082] text-white shadow-lg shadow-indigo-900/20 active:scale-95" 
                    : "sds-glass border-indigo-50/50 text-gray-500 hover:border-[#4B0082]/30 hover:text-[#4B0082] hover:-translate-y-1"
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
  )
}

