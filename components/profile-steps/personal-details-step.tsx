"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { ChevronDown } from "lucide-react"

interface PersonalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PersonalDetailsStep({ formData, onChange }: PersonalDetailsStepProps) {
  const indianLanguages = ["Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Gujarati", "Marathi", "Punjabi", "Urdu", "Odia", "Assamese", "Sanskrit"]
  const internationalLanguages = ["English", "French", "Spanish", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic", "Russian"]
  
  const [isIndianLangOpen, setIsIndianLangOpen] = useState(false)
  const [isInternationalLangOpen, setIsInternationalLangOpen] = useState(false)
  const indianLangRef = useRef<HTMLDivElement>(null)
  const internationalLangRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (indianLangRef.current && !indianLangRef.current.contains(event.target as Node)) {
        setIsIndianLangOpen(false)
      }
      if (internationalLangRef.current && !internationalLangRef.current.contains(event.target as Node)) {
        setIsInternationalLangOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleLanguage = (lang: string, category: "indian" | "international") => {
    const currentLangs = formData.languages || []
    if (currentLangs.includes(lang)) {
      onChange("languages", currentLangs.filter((l) => l !== lang))
    } else {
      onChange("languages", [...currentLangs, lang])
    }
  }
  const [isSkinColorOpen, setIsSkinColorOpen] = useState(false)
  const skinColorRef = useRef<HTMLDivElement>(null)

  const skinColorOptions = [
    { value: "very-fair", label: "Very Fair", color: "#FBE8D3" },
    { value: "fair-wheatish", label: "Fair / Wheatish", color: "#F0C8A0" },
    { value: "light-brown", label: "Light Brown", color: "#D2A679" },
    { value: "medium-brown", label: "Medium Brown", color: "#B7834B" },
    { value: "deep-brown", label: "Deep Brown", color: "#7A4B2A" },
    { value: "dark-brown", label: "Dark Brown", color: "#4A2A18" },
    { value: "very-dark", label: "Very Dark", color: "#2C1A12" },
  ]

  const selectedSkinColor = skinColorOptions.find(opt => opt.value === formData.skinColor)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skinColorRef.current && !skinColorRef.current.contains(event.target as Node)) {
        setIsSkinColorOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
          <Label htmlFor="age">Age *</Label>
          <div className="relative">
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => {
                const value = e.target.value
                // Restrict to 2 digits only
                if (value === "" || (value.length <= 2 && /^\d+$/.test(value))) {
                  onChange("age", value)
                }
              }}
              placeholder="Enter your age"
              min="18"
              max="50"
              maxLength={2}
              required
              className={formData.age && (Number(formData.age) > 50 || formData.age.length > 2) ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {formData.age && (Number(formData.age) > 50 || formData.age.length > 2) && (
              <div className="absolute left-0 top-full mt-1 z-10 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-lg max-w-xs">
                Currently we accept profiles with age less than or equal to 50
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Gender *</Label>
          <select
            id="sex"
            value={formData.sex}
            onChange={(e) => onChange("sex", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="" disabled>Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

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
          <Label htmlFor="weight">Weight (kg)</Label>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skinColor">Skin Color</Label>
          <div className="relative" ref={skinColorRef}>
            <button
              type="button"
              onClick={() => setIsSkinColorOpen(!isSkinColorOpen)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem]"
            >
              <div className="flex items-center gap-2">
                {selectedSkinColor ? (
                  <>
                    <span>{selectedSkinColor.label}</span>
                    <div
                      className="w-5 h-5 rounded border border-gray-300"
                      style={{ backgroundColor: selectedSkinColor.color }}
                    />
                  </>
                ) : (
                  <span className="text-gray-500">Select</span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isSkinColorOpen ? "rotate-180" : ""}`} />
            </button>
            {isSkinColorOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {skinColorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange("skinColor", option.value)
                      setIsSkinColorOpen(false)
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between text-left transition-colors"
                  >
                    <span>{option.label}</span>
                    <div
                      className="w-5 h-5 rounded border border-gray-300"
                      style={{ backgroundColor: option.color }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyType">Body Type</Label>
          <select
            id="bodyType"
            value={formData.bodyType}
            onChange={(e) => onChange("bodyType", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          >
            <option value="" disabled>Select</option>
            <option value="slim">Slim</option>
            <option value="average-medium">Average / Medium Build</option>
            <option value="athletic-fit">Athletic / Fit</option>
            <option value="muscular">Muscular</option>
            <option value="few-extra-kilos">Few Extra Kilos</option>
            <option value="plus-size">Plus Size</option>
          </select>
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
            <option value="" disabled>Select</option>
            <option value="never-married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="separated">Separated</option>
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
            <option value="" disabled>Select</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain-vegetarian">Jain Vegetarian</option>
            <option value="no-preference">No preference</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="about">About Yourself</Label>
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

        <div className="space-y-2 md:col-span-2">
          <Label>Languages Known</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Indian Languages Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Indian Languages</Label>
              <div className="relative" ref={indianLangRef}>
                <button
                  type="button"
                  onClick={() => setIsIndianLangOpen(!isIndianLangOpen)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem]"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {formData.languages.filter((lang) => indianLanguages.includes(lang)).length > 0 ? (
                      <span className="text-sm">
                        {formData.languages.filter((lang) => indianLanguages.includes(lang)).length} selected
                      </span>
                    ) : (
                      <span className="text-gray-500">Select Indian languages</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isIndianLangOpen ? "rotate-180" : ""}`} />
                </button>
                {isIndianLangOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {indianLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang, "indian")}
                        className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-left transition-colors ${
                          formData.languages.includes(lang) ? "bg-gray-100 dark:bg-gray-800" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => {}}
                          className="rounded border-gray-300"
                          readOnly
                        />
                        <span>{lang}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* International Languages Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">International Languages</Label>
              <div className="relative" ref={internationalLangRef}>
                <button
                  type="button"
                  onClick={() => setIsInternationalLangOpen(!isInternationalLangOpen)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem]"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {formData.languages.filter((lang) => internationalLanguages.includes(lang)).length > 0 ? (
                      <span className="text-sm">
                        {formData.languages.filter((lang) => internationalLanguages.includes(lang)).length} selected
                      </span>
                    ) : (
                      <span className="text-gray-500">Select International languages</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isInternationalLangOpen ? "rotate-180" : ""}`} />
                </button>
                {isInternationalLangOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {internationalLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang, "international")}
                        className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-left transition-colors ${
                          formData.languages.includes(lang) ? "bg-gray-100 dark:bg-gray-800" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => {}}
                          className="rounded border-gray-300"
                          readOnly
                        />
                        <span>{lang}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

