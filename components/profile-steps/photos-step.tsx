"use client"

import { FormData } from "@/types/profile"

interface PhotosStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PhotosStep({ formData, onChange }: PhotosStepProps) {
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // For now, we'll just store the file names
    // In production, you'd upload to Supabase Storage
    const fileNames = Array.from(files).map((file) => file.name)
    onChange("photos", [...formData.photos, ...fileNames])
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <span className="text-4xl">📷</span>
            <span className="text-gray-600 dark:text-gray-400">
              Click to upload photos or drag and drop
            </span>
            <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>
          </label>
        </div>
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">{photo}</span>
                </div>
                <button
                  onClick={() => {
                    onChange("photos", formData.photos.filter((_, i) => i !== index))
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

