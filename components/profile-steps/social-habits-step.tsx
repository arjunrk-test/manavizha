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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectDropdown
          id="smoking"
          label="Smoking *"
          value={formData.smoking || ""}
          onChange={(value) => onChange("smoking", value)}
          options={smokingOptions}
          required
        />

        <SelectDropdown
          id="drinking"
          label="Drinking *"
          value={formData.drinking || ""}
          onChange={(value) => onChange("drinking", value)}
          options={drinkingOptions}
          required
        />

        <SelectDropdown
          id="parties"
          label="Parties *"
          value={formData.parties || ""}
          onChange={(value) => onChange("parties", value)}
          options={partiesOptions}
          required
        />

        <SelectDropdown
          id="pubs"
          label="Pubs *"
          value={formData.pubs || ""}
          onChange={(value) => onChange("pubs", value)}
          options={pubsOptions}
          required
        />
      </div>
    </div>
  )
}
