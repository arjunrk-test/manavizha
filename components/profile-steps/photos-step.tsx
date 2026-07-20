"use client"

import { useState, useEffect } from "react"
import { FormData } from "@/types/profile"
import { supabase } from "@/lib/supabase"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"
import { AlertCircle, Camera, IdCard, ShieldCheck, Upload, Users, X } from "lucide-react"
import { VerificationDialog } from "@/components/verification-dialog"
import { ImageCropModal } from "@/components/ui/image-crop-modal"

interface PhotosStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
  userId?: string
}

export function PhotosStep({ formData, onChange, userId }: PhotosStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchStatus = async () => {
      // First check if already verified in personal details
      const { data: personal } = await supabase
        .from("personal_details")
        .select("photo_verified")
        .eq("user_id", userId)
        .maybeSingle()

      if (personal?.photo_verified) {
        setVerificationStatus("verified")
        return
      }

      // Then check pending requests in photos
      const { data: photoData } = await supabase
        .from("photos")
        .select("verification_status")
        .eq("user_id", userId)
        .maybeSingle()

      if (photoData?.verification_status) {
        setVerificationStatus(photoData.verification_status)
      }
    }

    fetchStatus()
  }, [userId])

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }
    if (!file.type.startsWith("image/")) {
      return "Please upload an image file"
    }
    return null
  }

  // Photos are added one at a time so each can be cropped before saving.
  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const currentPhotos = formData.userPhotos || []
    if (currentPhotos.length >= 6) {
      setErrors((prev) => ({ ...prev, userPhotos: "Maximum 6 photos allowed." }))
      e.target.value = ""
      return
    }

    const error = validateFile(file)
    if (error) {
      setErrors((prev) => ({ ...prev, userPhotos: `${file.name}: ${error}` }))
      e.target.value = ""
      return
    }

    // Read the file, then open the crop modal
    const reader = new FileReader()
    reader.onloadend = () => {
      setCropSrc(reader.result as string)
      setErrors((prev) => {
        const { userPhotos, ...rest } = prev
        return rest
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleCroppedPhoto = (dataUrl: string) => {
    const currentPhotos = formData.userPhotos || []
    if (currentPhotos.length < 6) {
      onChange("userPhotos", [...currentPhotos, dataUrl])
    }
    setCropSrc(null)
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

  const photoCountDescription =
    userPhotos.length < minPhotos
      ? `${userPhotos.length} / ${maxPhotos} photos uploaded · minimum ${minPhotos} required`
      : `${userPhotos.length} / ${maxPhotos} photos uploaded`

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Camera}
            title="Personal photos"
            description={photoCountDescription}
          />
          <div className="setup-section-card-body space-y-4">
        {errors.userPhotos && (
          <div className="flex items-center gap-3 text-primary text-xs font-bold uppercase tracking-widest bg-primary border border-primary p-4 rounded-2xl animate-in shake duration-500">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.userPhotos}</span>
          </div>
        )}
        
        {userPhotos.length < minPhotos && (
          <div className="flex items-center gap-3 text-[#e87898] text-xs font-bold uppercase tracking-widest bg-[#e87898]/5 border border-[#e87898]/10 p-4 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <span>Please upload at least {minPhotos} personal photos</span>
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
                className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl border-2 border-white bg-primary hover:bg-primary scale-0 group-hover:scale-100 transition-all duration-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ))}
          
          {userPhotos.length < maxPhotos && (
            <div className="relative group aspect-[3/4]">
              <input
                type="file"
                accept="image/*"
                onChange={handleUserPhotoUpload}
                className="hidden"
                id="user-photo-upload"
              />
              <label
                htmlFor="user-photo-upload"
                className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer sds-glass border-2 border-dashed border-[#f0ebe3] rounded-[2rem] transition-all duration-500 hover:border-[#e87898]/30 hover:bg-[#e87898]/[0.02]"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#e87898]/5 flex items-center justify-center text-[#e87898]/40 group-hover:scale-110 group-hover:bg-[#e87898]/10 transition-all duration-500">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="text-center px-4">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#e87898] mb-1">Add Photo</span>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">PNG, JPG &lt; 5MB</p>
                </div>
              </label>
            </div>
          )}
        </div>
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Users}
            title="Family photo"
            description="Optional photo of your family"
          />
          <div className="setup-section-card-body space-y-4">
        {errors.familyPhoto && (
          <div className="flex items-center gap-3 text-primary text-xs font-bold uppercase tracking-widest bg-primary border border-primary p-4 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.familyPhoto}</span>
          </div>
        )}

        <div className="flex justify-center">
          {formData.familyPhoto ? (
            <div className="relative max-w-2xl w-full group overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl transition-all duration-700 hover:shadow-[#e87898]/10">
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
                className="absolute top-6 right-6 h-12 w-12 rounded-full shadow-2xl border-4 border-white bg-primary hover:bg-primary opacity-0 group-hover:opacity-100 transition-all duration-500"
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
                className="flex flex-col items-center justify-center gap-6 cursor-pointer sds-glass border-2 border-dashed border-[#f0ebe3] rounded-[3rem] p-16 transition-all duration-700 hover:border-[#e87898]/30 group"
              >
                <div className="w-20 h-20 rounded-3xl bg-[#e87898]/5 flex items-center justify-center text-[#e87898]/30 group-hover:scale-110 group-hover:bg-[#e87898]/10 group-hover:rotate-6 transition-all duration-700">
                  <Upload className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <span className="block text-[12px] font-black uppercase tracking-[0.4em] text-[#e87898] mb-2">Upload Family Photo</span>
                  <div className="mx-auto w-fit px-3 py-1 rounded-full border border-[#f0ebe3] bg-white text-[9px] font-black tracking-widest text-[#6b7280]">
                    Optional
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={IdCard}
            title="ID proof (Aadhar)"
            description="Upload front and back of your Aadhar card"
          />
          <div className="setup-section-card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Aadhar Front */}
          <div className="space-y-4">
            <Label className="sds-label ml-2">Aadhar Front *</Label>
            {formData.aadharFront ? (
              <div className="relative group overflow-hidden rounded-[2rem] border-4 border-white shadow-xl">
                <img src={formData.aadharFront} alt="Aadhar front" className="w-full h-auto" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removeAadharFront}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl border-2 border-white bg-primary hover:bg-primary"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handleAadharFrontUpload} className="hidden" id="aadhar-front-upload" />
                <label
                  htmlFor="aadhar-front-upload"
                  className="flex flex-col items-center justify-center h-48 cursor-pointer sds-glass border-2 border-dashed border-[#f0ebe3] rounded-[2rem] transition-all duration-500 hover:border-[#e87898]/40"
                >
                  <Upload className="h-8 w-8 text-[#e87898]/30 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#e87898]/60">Upload Front</span>
                </label>
              </div>
            )}
          </div>

          {/* Aadhar Back */}
          <div className="space-y-4">
            <Label className="sds-label ml-2">Aadhar Back *</Label>
            {formData.aadharBack ? (
              <div className="relative group overflow-hidden rounded-[2rem] border-4 border-white shadow-xl">
                <img src={formData.aadharBack} alt="Aadhar back" className="w-full h-auto" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removeAadharBack}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl border-2 border-white bg-primary hover:bg-primary"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handleAadharBackUpload} className="hidden" id="aadhar-back-upload" />
                <label
                  htmlFor="aadhar-back-upload"
                  className="flex flex-col items-center justify-center h-48 cursor-pointer sds-glass border-2 border-dashed border-[#f0ebe3] rounded-[2rem] transition-all duration-500 hover:border-[#e87898]/40"
                >
                  <Upload className="h-8 w-8 text-[#e87898]/30 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#e87898]/60">Upload Back</span>
                </label>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>

      {userId && (
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={ShieldCheck}
            title="Profile verification"
            description="Increase your visibility with identity verification"
          />
          <div className="setup-section-card-body">
          <div className="p-10 border-2 border-[#f0ebe3] bg-gradient-to-br from-[#e87898]/[0.02] to-transparent relative overflow-hidden group rounded-[2rem]">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:scale-150">
              <ShieldCheck className="h-48 w-48 text-[#e87898]" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="h-24 w-24 rounded-[2rem] bg-[#e87898]/5 flex items-center justify-center flex-shrink-0 shadow-inner border border-[#e87898]/10 group-hover:rotate-12 transition-transform duration-700">
                <ShieldCheck className="h-12 w-12 text-[#e87898] fill-[#e87898]/10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e87898]/40 mb-2">Verify Profile</h4>
                <h3 className="text-2xl font-light text-gray-900 tracking-tight mb-3">Increase your visibility</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                  Profiles with verified profiles achieve <span className="text-[#e87898] font-black">much faster matches</span>. Complete identity verification to verify your account.
                </p>
              </div>
              
              {verificationStatus === "verified" ? (
                <Button
                  type="button"
                  disabled
                  className="h-16 px-12 rounded-[1.25rem] bg-[#10b981] hover:bg-[#10b981] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] whitespace-nowrap"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Verified
                </Button>
              ) : verificationStatus === "pending" ? (
                <Button
                  type="button"
                  disabled
                  className="h-16 px-12 rounded-[1.25rem] bg-[#f59e0b] hover:bg-[#f59e0b] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] whitespace-nowrap"
                >
                  <AlertCircle className="h-4 w-4 mr-2" /> Pending Review
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setShowVerificationDialog(true)}
                  className="h-16 px-12 rounded-[1.25rem] bg-[#e87898] hover:bg-[#d66686] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(59,185,172,0.4)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  Start Verification
                </Button>
              )}
            </div>
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

      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        aspect={3 / 4}
        onCancel={() => setCropSrc(null)}
        onCropped={handleCroppedPhoto}
      />
      </div>
    </div>
  )
}
