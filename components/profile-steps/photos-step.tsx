"use client"

import { useState } from "react"
import { FormData } from "@/types/profile"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, AlertCircle, ShieldCheck } from "lucide-react"
import { VerificationDialog } from "@/components/verification-dialog"

interface PhotosStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
  userId?: string
}

export function PhotosStep({ formData, onChange, userId }: PhotosStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }
    if (!file.type.startsWith("image/")) {
      return "Please upload an image file"
    }
    return null
  }

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const currentPhotos = formData.userPhotos || []
    const filesArray = Array.from(files)
    const newErrors: string[] = []
    const validFiles: File[] = []

    // First, validate all files
    filesArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    // Check if adding valid files would exceed max limit
    if (currentPhotos.length + validFiles.length > 6) {
      newErrors.push(`Maximum 6 photos allowed. You currently have ${currentPhotos.length} photo(s). Cannot add ${validFiles.length} more.`)
    }

    if (newErrors.length > 0) {
      setErrors((prev) => ({
        ...prev,
        userPhotos: newErrors.join(", "),
      }))
      e.target.value = ""
      return
    }

    // Process valid files
    let processedCount = 0
    const newPhotos: string[] = []

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        newPhotos.push(result)
        processedCount++

        // When all files are processed, update state
        if (processedCount === validFiles.length) {
          const updatedPhotos = [...currentPhotos, ...newPhotos]
          onChange("userPhotos", updatedPhotos)
          setErrors((prev) => {
            const { userPhotos, ...rest } = prev
            return rest
          })
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    e.target.value = ""
  }

  const handleFamilyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setErrors((prev) => ({
        ...prev,
        familyPhoto: error,
      }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      onChange("familyPhoto", result)
      setErrors((prev) => {
        const { familyPhoto, ...rest } = prev
        return rest
      })
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ""
  }

  const handleAadharFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setErrors((prev) => ({
        ...prev,
        aadharFront: error,
      }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      onChange("aadharFront", result)
      setErrors((prev) => {
        const { aadharFront, ...rest } = prev
        return rest
      })
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ""
  }

  const handleAadharBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setErrors((prev) => ({
        ...prev,
        aadharBack: error,
      }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      onChange("aadharBack", result)
      setErrors((prev) => {
        const { aadharBack, ...rest } = prev
        return rest
      })
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ""
  }

  const removeUserPhoto = (index: number) => {
    const updated = (formData.userPhotos || []).filter((_, i) => i !== index)
    onChange("userPhotos", updated)
    setErrors((prev) => {
      const { userPhotos, ...rest } = prev
      return rest
    })
  }

  const removeFamilyPhoto = () => {
    onChange("familyPhoto", "")
  }

  const removeAadharFront = () => {
    onChange("aadharFront", "")
  }

  const removeAadharBack = () => {
    onChange("aadharBack", "")
  }

  const userPhotos = formData.userPhotos || []
  const minPhotos = 3
  const maxPhotos = 6

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* User Photos Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">U1</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Visual Identity</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Your Portfolio *</h3>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
            userPhotos.length < minPhotos 
            ? "bg-rose-50 border-rose-100 text-rose-500" 
            : userPhotos.length >= maxPhotos 
            ? "bg-amber-50 border-amber-100 text-amber-600" 
            : "bg-emerald-50 border-emerald-100 text-emerald-600"
          }`}>
            {userPhotos.length} / {maxPhotos} Nodes Synchronized
          </div>
        </div>

        {errors.userPhotos && (
          <div className="flex items-center gap-3 text-rose-600 text-xs font-bold uppercase tracking-widest bg-rose-50/50 border border-rose-100 p-4 rounded-2xl animate-in shake duration-500">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.userPhotos}</span>
          </div>
        )}
        
        {userPhotos.length < minPhotos && (
          <div className="flex items-center gap-3 text-[#4B0082] text-xs font-bold uppercase tracking-widest bg-[#4B0082]/5 border border-[#4B0082]/10 p-4 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <span>Protocol requires at least {minPhotos} personal captures</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {userPhotos.map((photo, index) => (
            <div key={index} className="relative group aspect-[3/4] overflow-hidden rounded-[2rem] border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <img
                src={photo}
                alt={`User photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeUserPhoto(index)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl border-2 border-white bg-rose-500 hover:bg-rose-600 scale-0 group-hover:scale-100 transition-all duration-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ))}
          
          {userPhotos.length < maxPhotos && (
            <div className="relative group aspect-[3/4]">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUserPhotoUpload}
                className="hidden"
                id="user-photo-upload"
              />
              <label
                htmlFor="user-photo-upload"
                className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer sds-glass border-2 border-dashed border-indigo-100 rounded-[2rem] transition-all duration-500 hover:border-[#4B0082]/30 hover:bg-[#4B0082]/[0.02]"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#4B0082]/5 flex items-center justify-center text-[#4B0082]/40 group-hover:scale-110 group-hover:bg-[#4B0082]/10 transition-all duration-500">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="text-center px-4">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#4B0082] mb-1">Upload Archive</span>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">PNG, JPG &lt; 5MB</p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Family Photo Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">F2</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Familial Context</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Family Archive *</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        {errors.familyPhoto && (
          <div className="flex items-center gap-3 text-rose-600 text-xs font-bold uppercase tracking-widest bg-rose-50/50 border border-rose-100 p-4 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.familyPhoto}</span>
          </div>
        )}

        <div className="flex justify-center">
          {formData.familyPhoto ? (
            <div className="relative max-w-2xl w-full group overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl transition-all duration-700 hover:shadow-indigo-900/10">
              <img
                src={formData.familyPhoto}
                alt="Family photo"
                className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={removeFamilyPhoto}
                className="absolute top-6 right-6 h-12 w-12 rounded-full shadow-2xl border-4 border-white bg-rose-500 hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-all duration-500"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              <input
                type="file"
                accept="image/*"
                onChange={handleFamilyPhotoUpload}
                className="hidden"
                id="family-photo-upload"
              />
              <label
                htmlFor="family-photo-upload"
                className="flex flex-col items-center justify-center gap-6 cursor-pointer sds-glass border-2 border-dashed border-indigo-100 rounded-[3rem] p-16 transition-all duration-700 hover:border-[#4B0082]/30 group"
              >
                <div className="w-20 h-20 rounded-3xl bg-[#4B0082]/5 flex items-center justify-center text-[#4B0082]/30 group-hover:scale-110 group-hover:bg-[#4B0082]/10 group-hover:rotate-6 transition-all duration-700">
                  <Upload className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <span className="block text-[12px] font-black uppercase tracking-[0.4em] text-[#4B0082] mb-2">Synchronize Family Portrait</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white/40 border border-indigo-50/50 w-fit mx-auto">
                    Mandatory Visual Requirement
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ID Proof Section */}
      <div className="space-y-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">V3</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Security Protocol</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Identity Validation *</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Aadhar Front */}
          <div className="space-y-4">
            <Label className="sds-label ml-2">Aadhar Obverse (Front) *</Label>
            {formData.aadharFront ? (
              <div className="relative group overflow-hidden rounded-[2rem] border-4 border-white shadow-xl">
                <img src={formData.aadharFront} alt="Aadhar front" className="w-full h-auto" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removeAadharFront}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl border-2 border-white bg-rose-500 hover:bg-rose-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handleAadharFrontUpload} className="hidden" id="aadhar-front-upload" />
                <label
                  htmlFor="aadhar-front-upload"
                  className="flex flex-col items-center justify-center h-48 cursor-pointer sds-glass border-2 border-dashed border-indigo-100 rounded-[2rem] transition-all duration-500 hover:border-[#4B0082]/40"
                >
                  <Upload className="h-8 w-8 text-[#4B0082]/30 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#4B0082]/60">Upload Obverse</span>
                </label>
              </div>
            )}
          </div>

          {/* Aadhar Back */}
          <div className="space-y-4">
            <Label className="sds-label ml-2">Aadhar Reverse (Back) *</Label>
            {formData.aadharBack ? (
              <div className="relative group overflow-hidden rounded-[2rem] border-4 border-white shadow-xl">
                <img src={formData.aadharBack} alt="Aadhar back" className="w-full h-auto" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removeAadharBack}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl border-2 border-white bg-rose-500 hover:bg-rose-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handleAadharBackUpload} className="hidden" id="aadhar-back-upload" />
                <label
                  htmlFor="aadhar-back-upload"
                  className="flex flex-col items-center justify-center h-48 cursor-pointer sds-glass border-2 border-dashed border-indigo-100 rounded-[2rem] transition-all duration-500 hover:border-[#4B0082]/40"
                >
                  <Upload className="h-8 w-8 text-[#4B0082]/30 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#4B0082]/60">Upload Reverse</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Verification Section */}
      {userId && (
        <div className="pt-8">
          <div className="sds-glass rounded-[3rem] p-10 border-2 border-indigo-100/50 bg-gradient-to-br from-[#4B0082]/[0.02] to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:scale-150">
              <ShieldCheck className="h-48 w-48 text-[#4B0082]" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="h-24 w-24 rounded-[2rem] bg-[#4B0082]/5 flex items-center justify-center flex-shrink-0 shadow-inner border border-[#4B0082]/10 group-hover:rotate-12 transition-transform duration-700">
                <ShieldCheck className="h-12 w-12 text-[#4B0082] fill-[#4B0082]/10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/40 mb-2">Trust Calibration</h4>
                <h3 className="text-2xl font-light text-gray-900 tracking-tight mb-3">Optimize Interest Vectors</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                  Profiles with verified signatures achieve <span className="text-[#4B0082] font-black">300% higher engagement</span>. Complete live biometric synchronization to authorize your presence.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setShowVerificationDialog(true)}
                className="h-16 px-12 rounded-[1.25rem] bg-[#4B0082] hover:bg-indigo-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(75,0,130,0.4)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Initiate Verification
              </Button>
            </div>
          </div>
        </div>
      )}

      {userId && (
        <VerificationDialog
          isOpen={showVerificationDialog}
          onClose={() => setShowVerificationDialog(false)}
          userId={userId}
          existingPhotos={userPhotos}
        />
      )}
    </div>
  )
}
