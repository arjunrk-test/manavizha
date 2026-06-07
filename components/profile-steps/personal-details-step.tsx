"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { LanguageDropdown } from "@/components/ui/language-dropdown"
import { SkinColorDropdown } from "@/components/ui/skin-color-dropdown"
import { SetupSectionHeader, SETUP_SECTION_CARD, SETUP_SECTION_BODY } from "@/components/profile-steps/setup-section-header"
import { INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from "@/lib/profile-data"
import { FileText, Globe, User, UserRound } from "lucide-react"

interface PersonalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

const SECTION_CARD = SETUP_SECTION_CARD
const SECTION_BODY = SETUP_SECTION_BODY

export function PersonalDetailsStep({ formData, onChange }: PersonalDetailsStepProps) {
  const { data: genderOptions } = useMasterData({ tableName: "master_gender" })
  const { data: skinColorData } = useMasterData({ tableName: "master_skin_colour" })
  const { data: bodyTypeOptions } = useMasterData({ tableName: "master_body_type" })
  const { data: maritalStatusOptions } = useMasterData({ tableName: "master_marital_status" })
  const { data: foodPreferenceOptions } = useMasterData({ tableName: "master_food_preferences" })
  const { data: religionOptions } = useMasterData({ tableName: "master_religion" })

  const indianLanguages = INDIAN_LANGUAGES
  const internationalLanguages = INTERNATIONAL_LANGUAGES

  const skinColorOptions = skinColorData.map((item) => ({
    value: item.value,
    label: item.value,
    color: item.colour_code || "#000000",
  }))

  const toggleLanguage = (lang: string) => {
    const currentLangs = formData.languages || []
    if (currentLangs.includes(lang)) {
      onChange("languages", currentLangs.filter((l) => l !== lang))
    } else {
      onChange("languages", [...currentLangs, lang])
    }
  }

  const religions = religionOptions.length > 0 ? religionOptions : [
    { id: "Hindu", value: "Hindu" },
    { id: "Christian", value: "Christian" },
    { id: "Muslim", value: "Muslim" },
    { id: "Jain", value: "Jain" },
    { id: "Sikh", value: "Sikh" },
    { id: "Buddhist", value: "Buddhist" },
    { id: "Other", value: "Other" },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SECTION_CARD}>
          <SetupSectionHeader
            icon={User}
            title="Personal information"
            description="Name, date of birth, gender, and religion"
          />
          <div className={`${SECTION_BODY} grid-cols-1 md:grid-cols-3`}>
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="name" className="sds-label">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="e.g., Arjun Ramakrishnan"
                required
                className="sds-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="sds-label">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) => {
                  const selectedDate = e.target.value
                  if (selectedDate) {
                    const birthDate = new Date(selectedDate)
                    const today = new Date()
                    const age = today.getFullYear() - birthDate.getFullYear()
                    const monthDiff = today.getMonth() - birthDate.getMonth()
                    const actualAge =
                      monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
                        ? age - 1
                        : age
                    onChange("dateOfBirth", selectedDate)
                    onChange("age", actualAge.toString())
                  } else {
                    onChange("dateOfBirth", "")
                    onChange("age", "")
                  }
                }}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                required
                className="sds-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age" className="sds-label">Age</Label>
              <Input
                id="age"
                value={formData.age || ""}
                readOnly
                disabled
                placeholder="Calculated"
                className="sds-input w-full bg-black/[0.02] border-[#f0ebe3] opacity-60 cursor-not-allowed font-medium text-gray-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="createdBy" className="sds-label">Created By *</Label>
              <Select value={formData.createdBy} onValueChange={(value) => onChange("createdBy", value)}>
                <SelectTrigger id="createdBy" className="sds-input w-full border-[#f0ebe3]">
                  <SelectValue placeholder="Select Creator" />
                </SelectTrigger>
                <SelectContent className="sds-glass rounded-2xl border-[#f0ebe3] shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                  {["Self", "Parents", "Sibling", "Relative", "Friend"].map((val) => (
                    <SelectItem
                      key={val}
                      value={val}
                      className="rounded-xl p-3 focus:bg-[#e87898] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SelectDropdown
              id="sex"
              label="Gender *"
              value={formData.sex}
              onChange={(value) => onChange("sex", value)}
              options={genderOptions}
              required
            />

            <SelectDropdown
              id="maritalStatus"
              label="Marital Status *"
              value={formData.maritalStatus}
              onChange={(value) => onChange("maritalStatus", value)}
              options={maritalStatusOptions}
              required
            />

            <SelectDropdown
              id="religion"
              label="Religion *"
              value={formData.religion}
              onChange={(value) => onChange("religion", value)}
              options={religions}
              required
            />
          </div>
        </div>

        <div className={SECTION_CARD}>
          <SetupSectionHeader
            icon={UserRound}
            title="Appearance & build"
            description="Height, weight, body type, and physical status"
          />
          <div className={`${SECTION_BODY} grid-cols-1 md:grid-cols-4`}>
            <div className="space-y-1.5">
              <Label htmlFor="height" className="sds-label">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "" || (value.length <= 3 && /^\d+$/.test(value))) {
                    onChange("height", value)
                  }
                }}
                placeholder="e.g., 170"
                maxLength={3}
                required
                className="sds-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weight" className="sds-label">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "" || (value.length <= 3 && /^\d+$/.test(value))) {
                    onChange("weight", value)
                  }
                }}
                placeholder="e.g., 65"
                maxLength={3}
                required
                className="sds-input w-full"
              />
            </div>

            <SelectDropdown
              id="bodyType"
              label="Body Type *"
              value={formData.bodyType}
              onChange={(value) => onChange("bodyType", value)}
              options={bodyTypeOptions}
              required
            />

            <SkinColorDropdown
              value={formData.skinColor}
              onChange={(value) => onChange("skinColor", value)}
              options={skinColorOptions}
              required
            />

            <div className="space-y-1.5 md:col-span-4">
              <Label htmlFor="physicalStatus" className="sds-label">Physical Status *</Label>
              <Select value={formData.physicalStatus} onValueChange={(value) => onChange("physicalStatus", value)}>
                <SelectTrigger id="physicalStatus" className="sds-input w-full border-[#f0ebe3]">
                  <SelectValue placeholder="Are you physically challenged?" />
                </SelectTrigger>
                <SelectContent className="sds-glass rounded-2xl border-[#f0ebe3] shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                  <SelectItem
                    value="Normal"
                    className="rounded-xl p-3 focus:bg-[#e87898] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    No
                  </SelectItem>
                  <SelectItem
                    value="Physically Challenged"
                    className="rounded-xl p-3 focus:bg-[#e87898] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    Yes
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className={SECTION_CARD}>
          <SetupSectionHeader
            icon={Globe}
            title="Languages & food"
            description="Diet preference and languages you speak"
          />
          <div className={`${SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
            <SelectDropdown
              id="foodPreference"
              label="Food Preference *"
              value={formData.foodPreference}
              onChange={(value) => onChange("foodPreference", value)}
              options={foodPreferenceOptions}
              required
            />

            <div className="space-y-1.5 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LanguageDropdown
                  label="Languages you speak *"
                  languages={indianLanguages}
                  selectedLanguages={formData.languages || []}
                  onToggle={toggleLanguage}
                  placeholder="Select languages"
                />

                <LanguageDropdown
                  label="International Languages"
                  languages={internationalLanguages}
                  selectedLanguages={formData.languages || []}
                  onToggle={toggleLanguage}
                  placeholder="Select international languages"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={SECTION_CARD}>
          <SetupSectionHeader
            icon={FileText}
            title="About yourself"
            description="Write a short introduction for your profile (minimum 100 characters)"
          />
          <div className="setup-section-card-body space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="about" className="sds-label mb-0">About me *</Label>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  formData.about.length < 100
                    ? "text-[#9ca3af] border-[#f0ebe3] bg-[#faf8f4]"
                    : formData.about.length > 550
                      ? "text-[#e87898] border-[#fce8ef] bg-[#fce8ef]"
                      : "text-[#e87898] border-[#fce8ef] bg-[#fce8ef]"
                }`}
              >
                {formData.about.length} / 600
                {formData.about.length < 100 && " · min 100"}
              </span>
            </div>
            <textarea
              id="about"
              value={formData.about}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 600) onChange("about", value)
              }}
              placeholder="Example: I am a software engineer who loves trekking and classical music. I value family traditions and am looking for someone with similar interests..."
              rows={4}
              maxLength={600}
              required
              className={`sds-input w-full resize-none leading-relaxed transition-all duration-500 ${
                formData.about.length < 100 && formData.about.length > 0 ? "border-[#e87898]/20" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
