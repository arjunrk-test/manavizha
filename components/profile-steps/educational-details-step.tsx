"use client"

import { useState, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormData } from "@/types/profile"
import { Plus, Trash2 } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { CustomSelectDropdown } from "@/components/ui/custom-select-dropdown"

interface EducationalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function EducationalDetailsStep({ formData, onChange }: EducationalDetailsStepProps) {
  const educationDetails = formData.educationDetails || []

  // Fetch education level data from master_education_level table
  const { data: educationLevelData } = useMasterData({ tableName: "master_education_level" })
  
  // Fetch status options from master_status table
  const { data: statusData } = useMasterData({ tableName: "master_status" })
  
  // Extract unique categories for Education Level dropdown
  const educationLevelOptions = useMemo(() => {
    return Array.from(
      new Set(
        educationLevelData
          .map(item => item.category?.trim())
          .filter((category): category is string => Boolean(category && category.length > 0))
      )
    ).map(category => ({
      id: category,
      value: category
    }))
  }, [educationLevelData])
  
  // Transform status data to match CustomSelectDropdown format
  const statusOptions = useMemo(() => {
    return statusData.map(item => ({
      id: item.id,
      value: item.value
    }))
  }, [statusData])

  // Get degree/qualification options for a selected education level (category)
  const getQualificationsForLevel = (educationLevel: string) => {
    if (!educationLevel) return []
    
    // Filter education level data by the selected category (trim for comparison)
    const filteredData = educationLevelData.filter(item => item.category?.trim() === educationLevel.trim())
    
    // Return options with id and value
    return filteredData.map(item => ({
      id: item.id,
      value: item.value
    }))
  }

  const addEducation = () => {
    const newEducation = {
      education: "",
      educationOther: "",
      degree: "",
      degreeOther: "",
      branch: "",
      institution: "",
      yearOfGraduation: "",
      status: "",
    }
    onChange("educationDetails", [...educationDetails, newEducation])
  }

  const removeEducation = (index: number) => {
    const updated = educationDetails.filter((_, i) => i !== index)
    onChange("educationDetails", updated)
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...educationDetails]
    // Ensure the education detail object exists
    if (!updated[index]) {
      updated[index] = {
        education: "",
        educationOther: "",
        degree: "",
        degreeOther: "",
        branch: "",
        institution: "",
        yearOfGraduation: "",
        status: "",
      }
    }
    // Ensure value is a string and trim it
    const trimmedValue = (value || "").trim()
    
    // If education level changes, reset the degree field and educationOther
    if (field === "education") {
      updated[index] = { 
        ...updated[index], 
        [field]: trimmedValue, 
        degree: "",
        degreeOther: "",
        educationOther: trimmedValue.toLowerCase() === "other" ? updated[index].educationOther || "" : ""
      }
    } else if (field === "degree") {
      // If degree changes, reset degreeOther
      updated[index] = { 
        ...updated[index], 
        [field]: trimmedValue,
        degreeOther: trimmedValue.toLowerCase() === "other" ? updated[index].degreeOther || "" : ""
      }
    } else {
      updated[index] = { ...updated[index], [field]: trimmedValue }
    }
    onChange("educationDetails", updated)
  }

  return (
    <div className="space-y-6">
      {educationDetails.map((edu, index) => (
        <div key={`education-${index}-${edu.education || index}`} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6">
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
            <CustomSelectDropdown
              id={`education-${index}`}
              label="Education Level *"
              value={edu.education || ""}
              onChange={(value) => {
                updateEducation(index, "education", value)
              }}
              options={educationLevelOptions}
              required
              showOtherInput={educationLevelOptions.some(opt => opt.value.toLowerCase() === "other")}
              otherValue={edu.educationOther || ""}
              onOtherChange={(value) => updateEducation(index, "educationOther", value)}
              otherPlaceholder="Please specify education level"
            />
            <CustomSelectDropdown
              id={`degree-${index}`}
              label="Degree/Qualification"
              value={edu.degree || ""}
              onChange={(value) => updateEducation(index, "degree", value)}
              options={getQualificationsForLevel(edu.education || "")}
              showOtherInput={getQualificationsForLevel(edu.education || "").some(opt => opt.value.toLowerCase() === "other")}
              otherValue={edu.degreeOther || ""}
              onOtherChange={(value) => updateEducation(index, "degreeOther", value)}
              otherPlaceholder="Please specify degree/qualification"
              className={!edu.education ? "opacity-50 pointer-events-none" : ""}
            />
            <div className="space-y-2">
              <Label htmlFor={`branch-${index}`}>Branch/Specialization</Label>
              <Input
                id={`branch-${index}`}
                value={edu.branch || ""}
                onChange={(e) => updateEducation(index, "branch", e.target.value)}
                placeholder="e.g., Electronics and Instrumentation Engineering, Computer Science, etc."
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
                disabled={edu.status === "ongoing" || edu.status === "pursuing"}
              />
            </div>
            <CustomSelectDropdown
              id={`status-${index}`}
              label="Status *"
              value={edu.status || ""}
              onChange={(value) => updateEducation(index, "status", value)}
              options={statusOptions}
              required
            />
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
