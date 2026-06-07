"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormData } from "@/types/profile"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { CustomSelectDropdown } from "@/components/ui/custom-select-dropdown"
import {
  SETUP_SECTION_BODY,
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"

interface EducationalDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

function normalizeEducationKey(value: string) {
  return value.trim().toLowerCase()
}

function getQualificationDescription(edu: FormData["educationDetails"][number]) {
  const degree =
    edu.degree?.toLowerCase() === "other" ? edu.degreeOther?.trim() : edu.degree?.trim()
  const institution = edu.institution?.trim()

  if (degree && institution) return `${degree} at ${institution}`
  if (degree) return degree
  if (institution) return institution
  return "Degree, institution, and graduation details"
}

export function EducationalDetailsStep({ formData, onChange }: EducationalDetailsStepProps) {
  const educationDetails = formData.educationDetails || []

  const { data: educationLevelData } = useMasterData({ tableName: "master_education_level" })
  const { data: statusData } = useMasterData({ tableName: "master_status" })

  const educationLevelOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        educationLevelData
          .map((item) => item.category?.trim())
          .filter((category): category is string => Boolean(category && category.length > 0))
      )
    ).sort((a, b) => a.localeCompare(b))

    const options = categories.map((category) => ({
      id: category,
      value: category,
    }))

    // Keep legacy saved values visible if they were stored as degree names
    for (const edu of educationDetails) {
      const saved = edu.education?.trim()
      if (saved && !options.some((opt) => normalizeEducationKey(opt.value) === normalizeEducationKey(saved))) {
        options.push({ id: saved, value: saved })
      }
    }

    return options
  }, [educationLevelData, educationDetails])

  const statusOptions = useMemo(() => {
    return statusData.map(item => ({
      id: item.id,
      value: item.value
    }))
  }, [statusData])

  const getQualificationsForLevel = useMemo(() => {
    return (educationLevel: string) => {
      if (!educationLevel?.trim()) return []

      const normalizedSelection = normalizeEducationKey(educationLevel)

      // Resolve category: selection may be a category name or a legacy saved value
      let categoryKey = normalizedSelection
      const hasCategoryMatch = educationLevelData.some(
        (item) => normalizeEducationKey(item.category || "") === normalizedSelection
      )

      if (!hasCategoryMatch) {
        const valueMatch = educationLevelData.find(
          (item) => normalizeEducationKey(item.value || "") === normalizedSelection
        )
        if (valueMatch?.category) {
          categoryKey = normalizeEducationKey(valueMatch.category)
        }
      }

      const degrees = educationLevelData
        .filter((item) => normalizeEducationKey(item.category || "") === categoryKey)
        .map((item) => item.value?.trim())
        .filter((value): value is string => Boolean(value))

      const unique = Array.from(
        new Map(
          degrees.map((value) => [normalizeEducationKey(value), { id: value, value }])
        ).values()
      )

      if (!unique.some((item) => normalizeEducationKey(item.value) === "other")) {
        unique.push({ id: "other", value: "Other" })
      }

      return unique
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

    const processedValue = value || ""

    if (field === "education") {
      updated[index] = {
        ...updated[index],
        [field]: processedValue,
        degree: "",
        degreeOther: "",
        educationOther: processedValue.toLowerCase().trim() === "other" ? updated[index].educationOther || "" : ""
      }
    } else if (field === "degree") {
      updated[index] = {
        ...updated[index],
        [field]: processedValue,
        degreeOther: processedValue.toLowerCase().trim() === "other" ? updated[index].degreeOther || "" : ""
      }
    } else {
      updated[index] = { ...updated[index], [field]: processedValue }
    }

    onChange("educationDetails", updated)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        {educationDetails.map((edu, index) => (
          <div key={`education-${index}`} className={`${SETUP_SECTION_CARD} relative`}>
            {educationDetails.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(index)}
                className="absolute right-2 top-2 z-10 h-8 w-8 text-[#e87898] hover:bg-[#fce8ef] rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <SetupSectionHeader
              icon={GraduationCap}
              title={`Qualification ${index + 1}`}
              description={getQualificationDescription(edu)}
            />
            <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
              <CustomSelectDropdown
                id={`education-${index}`}
                label="Education Category *"
                value={edu.education || ""}
                onChange={(value) => {
                  updateEducation(index, "education", value)
                }}
                options={educationLevelOptions}
                placeholder="Select education level"
                required
              />
              {educationLevelOptions.some(opt => opt.value.toLowerCase() === "other") && edu.education?.toLowerCase() === "other" && (
                <div className="space-y-1.5">
                  <Label htmlFor={`educationOther-${index}`} className="sds-label">Specify Level *</Label>
                  <Input
                    id={`educationOther-${index}`}
                    value={edu.educationOther || ""}
                    onChange={(e) => updateEducation(index, "educationOther", e.target.value)}
                    placeholder="e.g., Higher Secondary, Diploma"
                    required
                    className="sds-input w-full"
                  />
                </div>
              )}
              <CustomSelectDropdown
                id={`degree-${index}`}
                label="Degree / Qualification *"
                value={edu.degree || ""}
                onChange={(value) => updateEducation(index, "degree", value)}
                options={getQualificationsForLevel(edu.education || "")}
                disabled={!edu.education}
                placeholder={edu.education ? "Select degree / qualification" : "Select education level first"}
                showOtherInput
                otherValue={edu.degreeOther || ""}
                onOtherChange={(value) => updateEducation(index, "degreeOther", value)}
                otherPlaceholder="e.g., B.Sc. Visual Communication"
                required
              />
              <div className="space-y-1.5">
                <Label htmlFor={`branch-${index}`} className="sds-label">Major / Subject</Label>
                <Input
                  id={`branch-${index}`}
                  value={edu.branch || ""}
                  onChange={(e) => updateEducation(index, "branch", e.target.value)}
                  placeholder="e.g. Computer Science, Commerce"
                  className="sds-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`institution-${index}`} className="sds-label">Academy / University</Label>
                <Input
                  id={`institution-${index}`}
                  value={edu.institution || ""}
                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  placeholder="e.g., Loyola College, Chennai"
                  className="sds-input w-full"
                />
              </div>
              <div className="space-y-1.5">
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
                  max={new Date().getFullYear() + 10}
                  className="sds-input w-full"
                  disabled={edu.status?.toLowerCase().includes("pursuing") || edu.status?.toLowerCase().includes("ongoing") || edu.status?.toLowerCase().includes("studying")}
                />
              </div>
              <CustomSelectDropdown
                id={`status-${index}`}
                label="Education Status *"
                value={edu.status || ""}
                onChange={(value) => updateEducation(index, "status", value)}
                options={statusOptions}
                placeholder="Select status"
                required
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          onClick={addEducation}
          className="h-24 w-full rounded-[2.5rem] bg-[#e87898]/[0.02] text-[#e87898] border-2 border-dashed border-[#f0ebe3] hover:bg-[#fce8ef]/80 hover:border-[#e87898]/40 transition-all duration-500 font-black text-[11px] uppercase tracking-[0.4em] group"
        >
          <Plus className="h-6 w-6 mr-4 transition-transform group-hover:rotate-90 group-hover:scale-110" />
          Add More Education
        </Button>
      </div>
    </div>
  )
}
