"use client"

import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import {
  SETUP_SECTION_BODY,
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"
import { HeartHandshake } from "lucide-react"

interface SocialHabitsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function SocialHabitsStep({ formData, onChange }: SocialHabitsStepProps) {
  const { data: smokingOptions } = useMasterData({ tableName: "master_smoking" })
  const { data: drinkingOptions } = useMasterData({ tableName: "master_drinking" })
  const { data: partiesOptions } = useMasterData({ tableName: "master_parties" })
  const { data: pubsOptions } = useMasterData({ tableName: "master_pubs" })

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={HeartHandshake}
            title="Social habits"
            description="Smoking, drinking, parties, and entertainment preferences"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
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
    </div>
  )
}
