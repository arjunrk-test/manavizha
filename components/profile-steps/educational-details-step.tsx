"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormData } from "@/types/profile"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"

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
  const getQualificationsForLevel = useMemo(() => {
    return (educationLevel: string) => {
      if (!educationLevel) return []

      // Filter education level data by the selected category (trim for comparison)
      const trimmedLevel = educationLevel.trim()
      const filteredData = educationLevelData.filter(item => item.category?.trim() === trimmedLevel)

      // Return options with id and value
      return filteredData.map(item => ({
        id: item.id,
        value: item.value
      }))
    }
  }, [educationLevelData])

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

    // For dropdown fields, use the exact value from the option to ensure perfect matching
    // The CustomSelectDropdown passes option.value directly, so we should store it as-is
    // Only trim text input fields
    const isDropdownField = field === "education" || field === "degree" || field === "status"
    const processedValue = isDropdownField ? (value || "") : (value || "").trim()

    // If education level changes, reset the degree field and educationOther
    if (field === "education") {
      updated[index] = {
        ...updated[index],
        [field]: processedValue,
        degree: "",
        degreeOther: "",
        educationOther: processedValue.toLowerCase().trim() === "other" ? updated[index].educationOther || "" : ""
      }
    } else if (field === "degree") {
      // If degree changes, reset degreeOther
      updated[index] = {
        ...updated[index],
        [field]: processedValue,
        degreeOther: processedValue.toLowerCase().trim() === "other" ? updated[index].degreeOther || "" : ""
      }
    } else {
      updated[index] = { ...updated[index], [field]: processedValue }
    }

    // Call onChange to update parent state
    onChange("educationDetails", updated)
  }

  return (
    <div className="space-y-8">
      {educationDetails.map((edu, index) => (
        <div key={`education-${index}`} className="sds-glass rounded-[2.5rem] p-10 border-2 border-indigo-50/50 space-y-10 relative overflow-hidden group shadow-[0_20px_50px_rgba(75,0,130,0.05)] bg-gradient-to-br from-white/40 to-transparent">
          <div className="flex items-center justify-between border-b border-black/[0.03] pb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
                <GraduationCap className="h-6 w-6 text-[#4B0082]" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-1">Education</h4>
                <h3 className="text-2xl font-light text-gray-900 tracking-tight">
                  Qualification <span className="font-bold text-[#4B0082]/40">{index + 1}</span>
                </h3>
              </div>
            </div>
            {educationDetails.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(index)}
                className="h-12 px-6 rounded-2xl text-rose-500 hover:bg-rose-50/80 font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-300 border border-transparent hover:border-rose-100"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SelectDropdown
              id={`education-${index}`}
              label="Education Category *"
              value={edu.education || ""}
              onChange={(value) => {
                updateEducation(index, "education", value)
              }}
              options={educationLevelOptions}
              required
            />
            {educationLevelOptions.some(opt => opt.value.toLowerCase() === "other") && edu.education?.toLowerCase() === "other" && (
              <div className="space-y-2">
                <Label htmlFor={`educationOther-${index}`} className="sds-label">Specify Level *</Label>
                <Input
                  id={`educationOther-${index}`}
                  value={edu.educationOther || ""}
                  onChange={(e) => updateEducation(index, "educationOther", e.target.value)}
                  placeholder="Enter Education Level"
                  required
                  className="sds-input w-full"
                />
              </div>
            )}
            <SelectDropdown
              id={`degree-${index}`}
              label="Degree / Qualification *"
              value={edu.degree || ""}
              onChange={(value) => updateEducation(index, "degree", value)}
              options={getQualificationsForLevel(edu.education || "")}
              className={!edu.education ? "opacity-40 grayscale pointer-events-none" : ""}
              required
            />
            {getQualificationsForLevel(edu.education || "").some(opt => opt.value.toLowerCase() === "other") && edu.degree?.toLowerCase() === "other" && (
              <div className="space-y-2">
                <Label htmlFor={`degreeOther-${index}`} className="sds-label">Specify Degree *</Label>
                <Input
                  id={`degreeOther-${index}`}
                  value={edu.degreeOther || ""}
                  onChange={(e) => updateEducation(index, "degreeOther", e.target.value)}
                  placeholder="Enter Degree Name"
                  required
                  className="sds-input w-full"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`branch-${index}`} className="sds-label">Major / Subject</Label>
              <Input
                id={`branch-${index}`}
                value={edu.branch || ""}
                onChange={(e) => updateEducation(index, "branch", e.target.value)}
                placeholder="e.g. Computer Science, Commerce"
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`institution-${index}`} className="sds-label">Academy / University</Label>
              <Input
                id={`institution-${index}`}
                value={edu.institution || ""}
                onChange={(e) => updateEducation(index, "institution", e.target.value)}
                placeholder="Enter College Name"
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`yearOfGraduation-${index}`} className="sds-label">Graduation Year</Label>
              <Input
                id={`yearOfGraduation-${index}`}
                type="number"
                value={edu.yearOfGraduation || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  if (value.length <= 4) {
                    updateEducation(index, "yearOfGraduation", value)
                  }
                }}
                placeholder="YYYY"
                min="1950"
                max={new Date().getFullYear() + 5}
                className="sds-input w-full"
                disabled={edu.status === "ongoing" || edu.status === "pursuing"}
              />
            </div>
            <SelectDropdown
              id={`status-${index}`}
              label="Education Status *"
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
        className="h-24 w-full rounded-[2.5rem] bg-[#4B0082]/[0.02] text-[#4B0082] border-2 border-dashed border-indigo-100 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all duration-500 font-black text-[11px] uppercase tracking-[0.4em] group"
      >
        <Plus className="h-6 w-6 mr-4 transition-transform group-hover:rotate-90 group-hover:scale-110" />
        Add More Education
      </Button>
    </div>
  )
}
