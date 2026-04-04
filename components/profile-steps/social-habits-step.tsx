"use client"

import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"

interface SocialHabitsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function SocialHabitsStep({ formData, onChange }: SocialHabitsStepProps) {
  // Fetch all social habits master data using the common hook
  const { data: smokingOptions } = useMasterData({ tableName: "master_smoking" })
  const { data: drinkingOptions } = useMasterData({ tableName: "master_drinking" })
  const { data: partiesOptions } = useMasterData({ tableName: "master_parties" })
  const { data: pubsOptions } = useMasterData({ tableName: "master_pubs" })

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">S1</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Lifestyle</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Social Habits</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50">
          <SelectDropdown
            id="smoking"
            label="Smoking Preference *"
            value={formData.smoking || ""}
            onChange={(value) => onChange("smoking", value)}
            options={smokingOptions}
            required
          />

          <SelectDropdown
            id="drinking"
            label="Drinking Preference *"
            value={formData.drinking || ""}
            onChange={(value) => onChange("drinking", value)}
            options={drinkingOptions}
            required
          />

          <SelectDropdown
            id="parties"
            label="Socializing / Parties *"
            value={formData.parties || ""}
            onChange={(value) => onChange("parties", value)}
            options={partiesOptions}
            required
          />

          <SelectDropdown
            id="pubs"
            label="Entertainment / Pubs *"
            value={formData.pubs || ""}
            onChange={(value) => onChange("pubs", value)}
            options={pubsOptions}
            required
          />
        </div>
      </div>
    </div>
  )
}
