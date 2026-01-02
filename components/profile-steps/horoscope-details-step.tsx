"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormData } from "@/types/profile"
import { Upload, X } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"

interface HoroscopeDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function HoroscopeDetailsStep({ formData, onChange }: HoroscopeDetailsStepProps) {
  const [preview, setPreview] = useState<string | null>(formData.jaadhagam || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch horoscope master data using the common hook
  const { data: zodiacSignOptions } = useMasterData({ tableName: "master_zodiac_moon_sign" })
  const { data: starOptions } = useMasterData({ tableName: "master_star" })
  const { data: lagnamOptions } = useMasterData({ tableName: "master_lagnam" })

  // Update preview when formData.jaadhagam changes (e.g., when loading from database)
  useEffect(() => {
    if (formData.jaadhagam) {
      setPreview(formData.jaadhagam)
    } else {
      setPreview(null)
    }
  }, [formData.jaadhagam])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onChange("jaadhagam", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onChange("jaadhagam", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="jaadhagam">Jaadhagam *</Label>
          <div className="space-y-4 flex justify-center">
            {preview ? (
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src={preview}
                  alt="Jaadhagam preview"
                  className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center w-full max-w-md mx-auto">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="jaadhagam-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload Jaadhagam image
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </Label>
                <input
                  ref={fileInputRef}
                  id="jaadhagam-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeOfBirth">Time of Birth *</Label>
          <Input
            id="timeOfBirth"
            type="time"
            value={formData.timeOfBirth || ""}
            onChange={(e) => onChange("timeOfBirth", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">Place of Birth *</Label>
          <Input
            id="placeOfBirth"
            value={formData.placeOfBirth || ""}
            onChange={(e) => onChange("placeOfBirth", e.target.value)}
            placeholder="Enter place of birth"
            required
          />
        </div>

        <SelectDropdown
          id="zodiacSign"
          label="Zodiac or Moon Sign *"
          value={formData.zodiacSign || ""}
          onChange={(value) => onChange("zodiacSign", value)}
          options={zodiacSignOptions}
          required
        />

        <SelectDropdown
          id="star"
          label="Star *"
          value={formData.star || ""}
          onChange={(value) => onChange("star", value)}
          options={starOptions}
          required
        />

        <SelectDropdown
          id="lagnam"
          label="Lagnam *"
          value={formData.lagnam || ""}
          onChange={(value) => onChange("lagnam", value)}
          options={lagnamOptions}
          required
        />

        <div className="space-y-2">
          <Label htmlFor="dhosham">Dhosham *</Label>
          <Input
            id="dhosham"
            value={formData.dhosham || ""}
            onChange={(e) => onChange("dhosham", e.target.value)}
            placeholder="Enter Dhosham"
            required
          />
        </div>
      </div>
    </div>
  )
}
