"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormData } from "@/types/profile"
import { Upload, X, Zap, Loader2 } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { Location } from "@/lib/astrology" // Note: import removed generateHoroscope
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { GlobalLocationSelector } from "@/components/ui/global-location-selector"

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
  const router = useRouter()

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

    // Navigate to the generator page with prefilled data
    router.push(`/dashboard/horoscope?dob=${encodeURIComponent(formData.dateOfBirth)}&tob=${encodeURIComponent(formData.timeOfBirth)}&city=${encodeURIComponent(formData.placeOfBirth)}`)
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">A1</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Horoscope</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Jaadhagam / Photo</h3>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
          </div>

          <div className="space-y-4 flex justify-center w-full">
            {preview ? (
              <div className="relative w-full max-w-lg mx-auto group">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#4B0082]/5 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img
                  src={preview}
                  alt="Jaadhagam preview"
                  className="relative w-full h-auto rounded-[2.5rem] border-8 border-white shadow-[0_30px_60px_-15px_rgba(75,0,130,0.15)] transition-all duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="absolute -top-4 -right-4 h-12 w-12 rounded-full shadow-2xl border-4 border-white bg-rose-500 hover:bg-rose-600 transition-transform group-hover:scale-110 active:scale-90"
                >
                  <X className="h-6 w-6 text-white" />
                </Button>
              </div>
            ) : (
              <div className="sds-glass border-2 border-dashed border-indigo-100 rounded-[3rem] p-16 text-center w-full max-w-xl mx-auto group hover:border-[#4B0082]/30 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4B0082]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="h-24 w-24 rounded-[2rem] bg-[#4B0082]/5 flex items-center justify-center text-[#4B0082]/20 mx-auto mb-8 group-hover:scale-110 group-hover:bg-[#4B0082]/10 group-hover:rotate-6 transition-all duration-700">
                  <Upload className="h-10 w-10" />
                </div>
                <Label htmlFor="jaadhagam-upload" className="cursor-pointer flex flex-col gap-4 relative z-10">
                  <span className="text-[14px] font-black uppercase tracking-[0.4em] text-[#4B0082] group-hover:tracking-[0.5em] transition-all duration-700">
                    Upload Horoscope Image
                  </span>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest bg-white/40 px-4 py-2 rounded-full border border-indigo-50/50 w-fit mx-auto">
                    PNG, JPG, BMP / Max 5MB
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

        {/* Computation Engine Banner */}
        <div className="md:col-span-2 sds-glass p-8 rounded-[3rem] border-2 border-amber-100/50 bg-gradient-to-br from-amber-50/30 to-white/40 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group shadow-[0_20px_40px_-10px_rgba(251,191,36,0.1)]">
          <div className="absolute -top-10 -right-10 p-12 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:rotate-45 group-hover:scale-150">
            <Zap className="h-48 w-48 text-amber-500" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center shadow-inner border border-amber-500/20 group-hover:rotate-[360deg] transition-transform duration-1000">
              <Zap className="h-8 w-8 text-amber-600 fill-amber-500/20" />
            </div>
            <div>
              <p className="font-black text-[10px] uppercase tracking-[0.4em] text-amber-600/60 mb-1">Traditional Method</p>
              <p className="font-light text-2xl tracking-tight text-gray-900">Calculate Details</p>
              <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-1">Instant details from Birth Time</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className="relative z-10 h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_15px_30px_-10px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale group"
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Zap className="h-5 w-5 mr-3 transition-transform group-hover:scale-125" />}
            {isGenerating ? "Calculating..." : "Start Calculation"}
          </Button>
        </div>

        {/* Input Fields Pair */}
        <div className="space-y-2">
          <Label htmlFor="timeOfBirth" className="sds-label">Time of Birth *</Label>
          <Input
            id="timeOfBirth"
            type="time"
            value={formData.timeOfBirth || ""}
            onChange={(e) => onChange("timeOfBirth", e.target.value)}
            required
            className="sds-input w-full"
          />
        </div>

        <div className="space-y-4">
          <Label className="sds-label text-indigo-900 border-indigo-100 flex items-center gap-2">Place of Birth *</Label>
          <GlobalLocationSelector 
            initialCity={formData.placeOfBirth || ""}
            onLocationChange={(loc) => {
              onChange("placeOfBirth", loc.city)
            }}
          />
        </div>

        {/* Selection Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
          <SelectDropdown
            id="zodiacSign"
            label="Zodiac (Rashi) *"
            value={formData.zodiacSign || ""}
            onChange={(value) => onChange("zodiacSign", value)}
            options={zodiacSignOptions}
            required
          />

          <SelectDropdown
            id="star"
            label="Star (Nakshatra) *"
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
            <Label htmlFor="dhosham" className="sds-label">Dhosham Details *</Label>
            <Input
              id="dhosham"
              value={formData.dhosham || ""}
              onChange={(e) => onChange("dhosham", e.target.value)}
              placeholder="e.g., No Dhosham / Chevvai Dhosham"
              required
              className="sds-input w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
