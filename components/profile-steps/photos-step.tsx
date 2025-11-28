"use client"

import { useState } from "react"
import { FormData } from "@/types/profile"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, AlertCircle } from "lucide-react"

interface PhotosStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PhotosStep({ formData, onChange }: PhotosStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    <div className="space-y-8">
      {/* User Photos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Your Photos *</Label>
          <span className={`text-sm ${userPhotos.length < minPhotos ? "text-red-500" : userPhotos.length >= maxPhotos ? "text-yellow-600" : "text-gray-600"}`}>
            {userPhotos.length} / {maxPhotos} (Minimum {minPhotos} required)
          </span>
        </div>
        {errors.userPhotos && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.userPhotos}</span>
          </div>
        )}
        {userPhotos.length < minPhotos && userPhotos.length > 0 && (
          <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Please upload at least {minPhotos} photos. You have {userPhotos.length} photo(s).</span>
          </div>
        )}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUserPhotoUpload}
            className="hidden"
            id="user-photo-upload"
            disabled={userPhotos.length >= maxPhotos}
          />
          <label
            htmlFor="user-photo-upload"
            className={`cursor-pointer flex flex-col items-center gap-2 ${userPhotos.length >= maxPhotos ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Click to upload your photos or drag and drop
            </span>
            <span className="text-sm text-gray-500">PNG, JPG up to 5MB each</span>
          </label>
        </div>
        {userPhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`User photo ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeUserPhoto(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family Photo Section */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Family Photo *</Label>
        {errors.familyPhoto && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.familyPhoto}</span>
          </div>
        )}
        {formData.familyPhoto ? (
          <div className="relative max-w-md">
            <img
              src={formData.familyPhoto}
              alt="Family photo"
              className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeFamilyPhoto}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFamilyPhotoUpload}
              className="hidden"
              id="family-photo-upload"
              required
            />
            <label
              htmlFor="family-photo-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Click to upload family photo or drag and drop
              </span>
              <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
            </label>
          </div>
        )}
      </div>

      {/* ID Proof Section */}
      <div className="space-y-6">
        <Label className="text-lg font-semibold">ID Proof (Aadhar Card) *</Label>
        
        {/* Aadhar Front */}
        <div className="space-y-4">
          <Label htmlFor="aadhar-front">Aadhar Card Front *</Label>
          {errors.aadharFront && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.aadharFront}</span>
            </div>
          )}
          {formData.aadharFront ? (
            <div className="relative max-w-md">
              <img
                src={formData.aadharFront}
                alt="Aadhar front"
                className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeAadharFront}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleAadharFrontUpload}
                className="hidden"
                id="aadhar-front-upload"
                required
              />
              <label
                htmlFor="aadhar-front-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Click to upload Aadhar card front or drag and drop
                </span>
                <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
              </label>
            </div>
          )}
        </div>

        {/* Aadhar Back */}
        <div className="space-y-4">
          <Label htmlFor="aadhar-back">Aadhar Card Back *</Label>
          {errors.aadharBack && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.aadharBack}</span>
            </div>
          )}
          {formData.aadharBack ? (
            <div className="relative max-w-md">
              <img
                src={formData.aadharBack}
                alt="Aadhar back"
                className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeAadharBack}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleAadharBackUpload}
                className="hidden"
                id="aadhar-back-upload"
                required
              />
              <label
                htmlFor="aadhar-back-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Click to upload Aadhar card back or drag and drop
                </span>
                <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
