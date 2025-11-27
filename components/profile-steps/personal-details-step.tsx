"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface PersonalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PersonalDetailsStep({ formData, onChange }: PersonalDetailsStepProps) {
  const languagesList = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Gujarati", "Marathi", "Punjabi"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            placeholder="Enter your age"
            min="18"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex *</Label>
          <select
            id="sex"
            value={formData.sex}
            onChange={(e) => onChange("sex", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (cm) *</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => onChange("height", e.target.value)}
            placeholder="Enter height in cm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => onChange("weight", e.target.value)}
            placeholder="Enter weight in kg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skinColor">Skin Color</Label>
          <select
            id="skinColor"
            value={formData.skinColor}
            onChange={(e) => onChange("skinColor", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="fair">Fair</option>
            <option value="wheatish">Wheatish</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyType">Body Type</Label>
          <select
            id="bodyType"
            value={formData.bodyType}
            onChange={(e) => onChange("bodyType", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="slim">Slim</option>
            <option value="average">Average</option>
            <option value="athletic">Athletic</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Permanent Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Enter your permanent address"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="currentAddress">Current Address of Residence *</Label>
          <Input
            id="currentAddress"
            value={formData.currentAddress}
            onChange={(e) => onChange("currentAddress", e.target.value)}
            placeholder="Enter your current address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status *</Label>
          <select
            id="maritalStatus"
            value={formData.maritalStatus}
            onChange={(e) => onChange("maritalStatus", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="">Select</option>
            <option value="never-married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="foodPreference">Food Preference</Label>
          <select
            id="foodPreference"
            value={formData.foodPreference}
            onChange={(e) => onChange("foodPreference", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="">Select</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about">About Yourself</Label>
          <textarea
            id="about"
            value={formData.about}
            onChange={(e) => onChange("about", e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Languages Known</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languagesList.map((lang) => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange("languages", [...formData.languages, lang])
                    } else {
                      onChange("languages", formData.languages.filter((l) => l !== lang))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{lang}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

