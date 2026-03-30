"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormData } from "@/types/profile"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { LanguageDropdown } from "@/components/ui/language-dropdown"
import { SkinColorDropdown } from "@/components/ui/skin-color-dropdown"

interface PersonalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PersonalDetailsStep({ formData, onChange }: PersonalDetailsStepProps) {
  // Fetch all master data using the common hook
  const { data: genderOptions } = useMasterData({ tableName: "master_gender" })
  const { data: skinColorData } = useMasterData({ tableName: "master_skin_colour" })
  const { data: bodyTypeOptions } = useMasterData({ tableName: "master_body_type" })
  const { data: maritalStatusOptions } = useMasterData({ tableName: "master_marital_status" })
  const { data: foodPreferenceOptions } = useMasterData({ tableName: "master_food_preferences" })
  const { data: indianLanguagesData } = useMasterData({ tableName: "master_indian_languages" })
  const { data: internationalLanguagesData } = useMasterData({ tableName: "master_international_languages" })
  
  // Transform skin color data to match the expected structure
  const skinColorOptions = skinColorData.map((item) => ({
    value: item.value,
    label: item.value,
    color: item.colour_code || "#000000", // Default to black if no colour_code
  }))
  
  // Transform languages data to arrays of language names
  const indianLanguages = indianLanguagesData.map((item) => item.value)
  const internationalLanguages = internationalLanguagesData.map((item) => item.value)

  const toggleLanguage = (lang: string) => {
    const currentLangs = formData.languages || []
    if (currentLangs.includes(lang)) {
      onChange("languages", currentLangs.filter((l) => l !== lang))
    } else {
      onChange("languages", [...currentLangs, lang])
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name, Date of Birth, and Age in a single row */}
        <div className="space-y-2 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
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
                    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
                    
                    // Set both dateOfBirth and calculate age for backward compatibility
                    onChange("dateOfBirth", selectedDate)
                    onChange("age", actualAge.toString())
                  } else {
                    onChange("dateOfBirth", "")
                    onChange("age", "")
                  }
                }}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
                value={formData.age || ""}
                readOnly
                disabled
                placeholder="Auto-calculated"
                className="w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75"
              />
            </div>
          </div>
          {formData.dateOfBirth && formData.age && Number(formData.age) > 50 && (
            <p className="text-sm text-red-500 dark:text-red-400">
                Currently we accept profiles with age less than or equal to 50
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="createdBy">Profile Created By *</Label>
            <Select value={formData.createdBy} onValueChange={(value) => onChange("createdBy", value)}>
              <SelectTrigger id="createdBy" className="rounded-2xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <SelectValue placeholder="Select who is creating this profile" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xl">
                <SelectItem value="Self">Self</SelectItem>
                <SelectItem value="Parents">Parents</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Relative">Relative</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="physicalStatus">Physical Status *</Label>
            <Select value={formData.physicalStatus} onValueChange={(value) => onChange("physicalStatus", value)}>
              <SelectTrigger id="physicalStatus" className="rounded-2xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <SelectValue placeholder="Select physical status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-xl">
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Physically Challenged">Physically Challenged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SelectDropdown
          id="sex"
          label="Gender *"
          value={formData.sex}
          onChange={(value) => onChange("sex", value)}
          options={genderOptions}
          required
        />

        <div className="space-y-2">
          <Label htmlFor="height">Height (cm) *</Label>
          <div className="relative">
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => {
                const value = e.target.value
                // Restrict to 3 digits only
                if (value === "" || (value.length <= 3 && /^\d+$/.test(value))) {
                  onChange("height", value)
                }
              }}
              placeholder="Enter height in cm"
              maxLength={3}
              required
              className={formData.height && (Number(formData.height) > 251 || formData.height.length > 3) ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {formData.height && (Number(formData.height) > 251 || formData.height.length > 3) && (
              <div className="absolute left-0 top-full mt-1 z-10 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-lg max-w-xs">
                Height cannot exceed 251cm (tallest person's height ever recorded)
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg) *</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => {
              const value = e.target.value
              // Restrict to 3 digits only
              if (value === "" || (value.length <= 3 && /^\d+$/.test(value))) {
                onChange("weight", value)
              }
            }}
            placeholder="Enter weight in kg"
            maxLength={3}
            required
          />
        </div>

        <SkinColorDropdown
          value={formData.skinColor}
          onChange={(value) => onChange("skinColor", value)}
          options={skinColorOptions}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
          <SelectDropdown
            id="bodyType"
            label="Body Type *"
            value={formData.bodyType}
            onChange={(value) => onChange("bodyType", value)}
            options={bodyTypeOptions}
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
            id="foodPreference"
            label="Food Preference *"
            value={formData.foodPreference}
            onChange={(value) => onChange("foodPreference", value)}
            options={foodPreferenceOptions}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LanguageDropdown
              label="Indian Languages *"
              languages={indianLanguages}
              selectedLanguages={formData.languages || []}
              onToggle={toggleLanguage}
              placeholder="Select Indian languages"
            />

            <LanguageDropdown
              label="International Languages *"
              languages={internationalLanguages}
              selectedLanguages={formData.languages || []}
              onToggle={toggleLanguage}
              placeholder="Select International languages"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="about">About Yourself *</Label>
            <span className={`text-sm ${formData.about.length < 100 ? "text-gray-500" : formData.about.length > 600 ? "text-red-500" : "text-gray-600"}`}>
              {formData.about.length} / 600 {formData.about.length < 100 && "(min 100)"}
            </span>
          </div>
          <div className="relative">
            <textarea
              id="about"
              value={formData.about}
              onChange={(e) => {
                const value = e.target.value
                // Prevent typing if already at max limit
                if (value.length <= 600) {
                  onChange("about", value)
                }
              }}
              placeholder="Tell us about yourself... (minimum 100 characters)"
              rows={4}
              maxLength={600}
              required
              className={`w-full rounded-2xl border px-3 py-2 focus:outline-none focus:ring-2 dark:bg-gray-900 ${
                formData.about.length > 600
                  ? "border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10"
                  : formData.about.length < 100 && formData.about.length > 0
                  ? "border-yellow-500 focus:ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                  : "border-gray-200 focus:ring-[#4B0082] bg-gray-50 dark:border-gray-800"
              }`}
            />
            {formData.about.length >= 600 && (
              <div className="absolute left-0 top-full mt-1 z-10 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-lg max-w-xs">
                Maximum character limit reached (600 characters)
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"></div>
              </div>
            )}
          </div>
          {formData.about.length > 0 && formData.about.length < 100 && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Please enter at least 100 characters (currently {formData.about.length} characters)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

