"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormData } from "@/types/profile"
import { Upload, X, Zap, Loader2 } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { generateHoroscope, Location } from "@/lib/astrology"
import { toast } from "sonner"

const MAJOR_CITIES: Record<string, Location> = {
  "Chennai": { latitude: 13.0827, longitude: 80.2707 },
  "Madurai": { latitude: 9.9252, longitude: 78.1198 },
  "Coimbatore": { latitude: 11.0168, longitude: 76.9558 },
  "Trichy": { latitude: 10.7905, longitude: 78.7047 },
  "Salem": { latitude: 11.6643, longitude: 78.1460 },
  "Tirunelveli": { latitude: 8.7139, longitude: 77.7567 },
  "Thanjavur": { latitude: 10.7870, longitude: 79.1378 },
  "Vellore": { latitude: 12.9165, longitude: 79.1325 },
  "Erode": { latitude: 11.3410, longitude: 77.7172 },
  "Tuticorin": { latitude: 8.8053, longitude: 78.1460 },
};

interface HoroscopeDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function HoroscopeDetailsStep({ formData, onChange }: HoroscopeDetailsStepProps) {
  const [preview, setPreview] = useState<string | null>(formData.jaadhagam || null)
  const [isGenerating, setIsGenerating] = useState(false)
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

  const handleAutoGenerate = async () => {
    if (!formData.dateOfBirth) {
      toast.error("Please enter your Date of Birth in the Personal Details step first")
      return
    }
    if (!formData.timeOfBirth || !formData.placeOfBirth) {
      toast.error("Please fill in Time and Place of Birth to generate")
      return
    }

    setIsGenerating(true)
    try {
      const location = MAJOR_CITIES[formData.placeOfBirth] || MAJOR_CITIES["Chennai"]
      const fullDateTime = `${formData.dateOfBirth}T${formData.timeOfBirth}:00`
      const data = await generateHoroscope(fullDateTime, location)
      
      onChange("star", data.star)
      onChange("zodiacSign", data.rashi)
      onChange("lagnam", data.lagnam)
      
      toast.success(`Generated: ${data.star} - ${data.rashi}`)
    } catch (err) {
      console.error("Error generating horoscope:", err)
      toast.error("Failed to generate horoscope details")
    } finally {
      setIsGenerating(false)
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

        <div className="md:col-span-2 bg-gradient-to-r from-[#4B0082]/5 to-[#FF1493]/5 p-4 rounded-xl border border-[#4B0082]/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-sm">Traditional Horoscope Generator</p>
              <p className="text-[10px] text-gray-500">Auto-fill Star, Rashi, and Lagnam from birth details</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className="bg-[#4B0082] hover:bg-[#3B0062] text-white gap-2 font-bold"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate from Birth Details"}
          </Button>
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
