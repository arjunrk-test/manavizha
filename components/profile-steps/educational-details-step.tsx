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

  // Qualifications mapped by education level
  const qualificationsByLevel: Record<string, { value: string; label: string }[]> = {
    "10th-standard": [
      { value: "sslc", label: "SSLC (10th Standard)" },
      { value: "cbse-10th", label: "CBSE 10th" },
      { value: "icse-10th", label: "ICSE 10th" },
      { value: "other", label: "Other" },
    ],
    "12th-standard": [
      { value: "hsc", label: "HSC (12th Standard)" },
      { value: "cbse-12th", label: "CBSE 12th" },
      { value: "icse-12th", label: "ICSE 12th" },
      { value: "other", label: "Other" },
    ],
    "diploma-iti": [
      { value: "diploma-engineering", label: "Diploma in Engineering" },
      { value: "diploma-pharmacy", label: "Diploma in Pharmacy" },
      { value: "diploma-nursing", label: "Diploma in Nursing" },
      { value: "iti", label: "ITI (Industrial Training Institute)" },
      { value: "other", label: "Other" },
    ],
    "bachelors-degree": [
      { value: "btech", label: "B.Tech (Bachelor of Technology)" },
      { value: "be", label: "B.E. (Bachelor of Engineering)" },
      { value: "bsc", label: "B.Sc. (Bachelor of Science)" },
      { value: "bcom", label: "B.Com. (Bachelor of Commerce)" },
      { value: "ba", label: "B.A. (Bachelor of Arts)" },
      { value: "bba", label: "BBA (Bachelor of Business Administration)" },
      { value: "bca", label: "BCA (Bachelor of Computer Applications)" },
      { value: "bpharm", label: "B.Pharm (Bachelor of Pharmacy)" },
      { value: "bds", label: "BDS (Bachelor of Dental Surgery)" },
      { value: "mbbs", label: "MBBS (Bachelor of Medicine, Bachelor of Surgery)" },
      { value: "llb", label: "LLB (Bachelor of Laws)" },
      { value: "bpt", label: "BPT (Bachelor of Physiotherapy)" },
      { value: "bams", label: "BAMS (Bachelor of Ayurvedic Medicine and Surgery)" },
      { value: "bhms", label: "BHMS (Bachelor of Homeopathic Medicine and Surgery)" },
      { value: "bsc-nursing", label: "B.Sc. Nursing" },
      { value: "bsc-agriculture", label: "B.Sc. Agriculture" },
      { value: "other", label: "Other" },
    ],
    "masters-degree": [
      { value: "mtech", label: "M.Tech (Master of Technology)" },
      { value: "me", label: "M.E. (Master of Engineering)" },
      { value: "msc", label: "M.Sc. (Master of Science)" },
      { value: "mcom", label: "M.Com. (Master of Commerce)" },
      { value: "ma", label: "M.A. (Master of Arts)" },
      { value: "mba", label: "MBA (Master of Business Administration)" },
      { value: "mca", label: "MCA (Master of Computer Applications)" },
      { value: "mpharm", label: "M.Pharm (Master of Pharmacy)" },
      { value: "mds", label: "MDS (Master of Dental Surgery)" },
      { value: "md", label: "MD (Doctor of Medicine)" },
      { value: "ms", label: "MS (Master of Surgery)" },
      { value: "llm", label: "LLM (Master of Laws)" },
      { value: "mpt", label: "MPT (Master of Physiotherapy)" },
      { value: "other", label: "Other" },
    ],
    "doctorate-phd": [
      { value: "phd", label: "Ph.D. (Doctor of Philosophy)" },
      { value: "dm", label: "DM (Doctorate of Medicine)" },
      { value: "mch", label: "M.Ch. (Master of Chirurgiae)" },
      { value: "other", label: "Other" },
    ],
    "professional-certification": [
      { value: "pmp", label: "PMP (Project Management Professional)" },
      { value: "cpa", label: "CPA (Certified Public Accountant)" },
      { value: "cfa", label: "CFA (Chartered Financial Analyst)" },
      { value: "ca", label: "CA (Chartered Accountant)" },
      { value: "cs", label: "CS (Company Secretary)" },
      { value: "icwa", label: "ICWA (Cost and Management Accountant)" },
      { value: "cma", label: "CMA (Certified Management Accountant)" },
      { value: "aws-certified", label: "AWS Certified" },
      { value: "google-cloud-certified", label: "Google Cloud Certified" },
      { value: "microsoft-certified", label: "Microsoft Certified" },
      { value: "cisco-certified", label: "Cisco Certified" },
      { value: "oracle-certified", label: "Oracle Certified" },
      { value: "salesforce-certified", label: "Salesforce Certified" },
      { value: "other", label: "Other" },
    ],
    "no-educational-qualification": [
      { value: "none", label: "No Qualification" },
    ],
    "other": [
      { value: "other", label: "Other" },
    ],
  }

  const getQualificationsForLevel = (educationLevel: string) => {
    return qualificationsByLevel[educationLevel] || []
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
    // If education level changes, reset the degree field and educationOther
    if (field === "education") {
      updated[index] = { 
        ...updated[index], 
        [field]: value, 
        degree: "",
        degreeOther: "",
        educationOther: value === "other" ? updated[index].educationOther || "" : ""
      }
    } else if (field === "degree") {
      // If degree changes, reset degreeOther
      updated[index] = { 
        ...updated[index], 
        [field]: value,
        degreeOther: value === "other" ? updated[index].degreeOther || "" : ""
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
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
                <option value="10th-standard">10th Standard</option>
                <option value="12th-standard">12th Standard</option>
                <option value="diploma-iti">Diploma / ITI</option>
                <option value="bachelors-degree">Bachelor's Degree</option>
                <option value="masters-degree">Master's Degree</option>
                <option value="doctorate-phd">Doctorate (PhD)</option>
                <option value="professional-certification">Professional Certification</option>
                <option value="no-educational-qualification">No Educational qualification</option>
                <option value="other">Other</option>
              </select>
              {edu.education === "other" && (
                <Input
                  id={`education-other-${index}`}
                  value={edu.educationOther || ""}
                  onChange={(e) => updateEducation(index, "educationOther", e.target.value)}
                  placeholder="Please specify education level"
                  className="mt-2"
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`degree-${index}`}>Degree/Qualification</Label>
              <select
                id={`degree-${index}`}
                value={edu.degree || ""}
                onChange={(e) => updateEducation(index, "degree", e.target.value)}
                disabled={!edu.education}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{edu.education ? "Select" : "Select Education Level first"}</option>
                {getQualificationsForLevel(edu.education || "").map((qual) => (
                  <option key={qual.value} value={qual.value}>
                    {qual.label}
                  </option>
                ))}
              </select>
              {edu.degree === "other" && (
                <Input
                  id={`degree-other-${index}`}
                  value={edu.degreeOther || ""}
                  onChange={(e) => updateEducation(index, "degreeOther", e.target.value)}
                  placeholder="Please specify degree/qualification"
                  className="mt-2"
                  required
                />
              )}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor={`status-${index}`}>Status *</Label>
              <select
                id={`status-${index}`}
                value={edu.status || ""}
                onChange={(e) => updateEducation(index, "status", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
                required
              >
                <option value="">Select</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="pursuing">Pursuing</option>
                <option value="discontinued">Discontinued</option>
              </select>
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
