"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormData } from "@/types/profile"
import { Plus, Trash2 } from "lucide-react"

interface EducationalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function EducationalDetailsStep({ formData, onChange }: EducationalDetailsStepProps) {
  const educationDetails = formData.educationDetails || []

  const addEducation = () => {
    const newEducation = {
      education: "",
      degree: "",
      institution: "",
      yearOfGraduation: "",
    }
    onChange("educationDetails", [...educationDetails, newEducation])
  }

  const removeEducation = (index: number) => {
    const updated = educationDetails.filter((_, i) => i !== index)
    onChange("educationDetails", updated)
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...educationDetails]
    updated[index] = { ...updated[index], [field]: value }
    onChange("educationDetails", updated)
  }

  return (
    <div className="space-y-6">
      {educationDetails.map((edu, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Education {index + 1}
            </h3>
            {educationDetails.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`education-${index}`}>Education Level *</Label>
              <select
                id={`education-${index}`}
                value={edu.education || ""}
                onChange={(e) => updateEducation(index, "education", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
                required
              >
                <option value="">Select</option>
                <option value="high-school">High School</option>
                <option value="diploma">Diploma</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`degree-${index}`}>Degree/Qualification</Label>
              <Input
                id={`degree-${index}`}
                value={edu.degree || ""}
                onChange={(e) => updateEducation(index, "degree", e.target.value)}
                placeholder="e.g., SSLC, HSC, B.Tech, MBA, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`institution-${index}`}>Institution/University</Label>
              <Input
                id={`institution-${index}`}
                value={edu.institution || ""}
                onChange={(e) => updateEducation(index, "institution", e.target.value)}
                placeholder="Enter institution name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`yearOfGraduation-${index}`}>Year of Graduation</Label>
              <Input
                id={`yearOfGraduation-${index}`}
                type="number"
                value={edu.yearOfGraduation || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  // Limit to 4 digits
                  if (value.length <= 4) {
                    updateEducation(index, "yearOfGraduation", value)
                  }
                }}
                placeholder="e.g., 2020"
                min="1950"
                max={new Date().getFullYear()}
                maxLength={4}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addEducation}
        variant="outline"
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#4B0082] hover:bg-[#4B0082]/10"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Education
      </Button>
    </div>
  )
}
