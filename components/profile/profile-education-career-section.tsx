"use client"

import { useState } from "react"
import { Crown, GraduationCap, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  formatCollegeEducationDetail,
  formatCollegeEducationSummary,
  getCollegeEducationEntries,
  getHighestCollegeEducationSummary,
  type EducationRecord,
} from "@/lib/utils/education-display"

type DetailRowProps = {
  label: string
  value?: React.ReactNode
  isLocked?: boolean
  isPremiumViewer?: boolean
  compact?: boolean
}

function DetailRow({
  label,
  value,
  isLocked,
  isPremiumViewer,
  compact,
}: DetailRowProps) {
  const [revealed, setRevealed] = useState(false)

  const renderValue = () => {
    if (!value) return <span className="text-[#9ca3af] italic text-sm">Not specified</span>

    if (isLocked) {
      if (isPremiumViewer && revealed) {
        return (
          <span className="text-sm font-medium text-[#1F4068] break-words flex items-center gap-2">
            {value}
            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="text-xs text-[#e87898] hover:underline font-medium"
            >
              Hide
            </button>
          </span>
        )
      }

      if (isPremiumViewer && !revealed) {
        return (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fce8ef] rounded-lg border border-[#f0ebe3] text-[#e87898] text-xs font-medium hover:bg-[#f0ebe3] transition-colors"
          >
            <Crown className="h-3 w-3" />
            Reveal
          </button>
        )
      }

      return (
        <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs font-medium">
          <Lock className="h-3 w-3" /> Locked
        </div>
      )
    }

    return (
      <span
        className={cn(
          "font-medium text-[#1F4068] whitespace-normal break-words",
          compact ? "text-[13px]" : "text-sm"
        )}
      >
        {value}
      </span>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 border-b border-[#f0ebe3]/70 last:border-0">
      <span className="text-xs sm:text-sm text-[#9ca3af] shrink-0">{label}</span>
      <div className="sm:text-right min-w-0">{renderValue()}</div>
    </div>
  )
}

type ProfileEducationCareerSectionProps = {
  education?: EducationRecord[] | null
  profession?: Record<string, any> | null
  professionType?: string | null
  isPremiumViewer?: boolean
  compact?: boolean
  className?: string
  titleClassName?: string
}

export function ProfileEducationCareerSection({
  education,
  profession,
  professionType,
  isPremiumViewer = false,
  compact = false,
  className,
  titleClassName,
}: ProfileEducationCareerSectionProps) {
  const collegeEntries = getCollegeEducationEntries(education)
  const highestCollege = getHighestCollegeEducationSummary(education)
  const isEmployee = professionType === "employee"
  const isBusiness = professionType === "business"
  const isStudent = professionType === "student"

  const role =
    profession?.designation ||
    (isStudent ? profession?.course : null) ||
    null

  const organisation =
    isEmployee
      ? profession?.company
      : isBusiness
        ? profession?.business_name
        : isStudent
          ? profession?.institution
          : null

  const organisationLabel = isBusiness ? "Organisation" : isStudent ? "Institution" : "Organisation"

  return (
    <div
      className={cn(
        "bg-white rounded-[18px] p-5 sm:p-6 border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] space-y-4",
        compact && "rounded-[16px] p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#faf8f4] flex items-center justify-center text-[#1F4068]">
          <GraduationCap className="h-4 w-4" />
        </div>
        <h2 className={cn("text-base font-semibold text-[#1F4068]", titleClassName)}>Education & Career</h2>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {collegeEntries.length > 0 ? (
          collegeEntries.map((edu, idx) => (
            <DetailRow
              key={`${formatCollegeEducationSummary(edu)}-${idx}`}
              label={collegeEntries.length > 1 ? `College ${idx + 1}` : "College education"}
              value={formatCollegeEducationDetail(edu)}
              isLocked
              isPremiumViewer={isPremiumViewer}
              compact={compact}
            />
          ))
        ) : highestCollege ? (
          <DetailRow label="Education" value={highestCollege} compact={compact} />
        ) : (
          <DetailRow label="Education" value={null} compact={compact} />
        )}

        {(isEmployee || isBusiness) && (
          <>
            <DetailRow
              label="Role"
              value={role}
              isLocked
              isPremiumViewer={isPremiumViewer}
              compact={compact}
            />
            <DetailRow
              label={organisationLabel}
              value={organisation}
              isLocked
              isPremiumViewer={isPremiumViewer}
              compact={compact}
            />
          </>
        )}

        {isStudent && (
          <>
            <DetailRow label="Course" value={profession?.course} compact={compact} />
            <DetailRow label="Institution" value={profession?.institution} compact={compact} />
          </>
        )}

        {(isEmployee || isBusiness) && (
          <>
            <DetailRow
              label={isBusiness ? "Business type" : "Sector"}
              value={profession?.sector || profession?.business_type}
              compact={compact}
            />
            <DetailRow
              label={isBusiness ? "Annual revenue" : "Annual salary"}
              value={
                profession?.revenue_range ||
                profession?.salary_range ||
                profession?.annual_returns ||
                profession?.salary
              }
              isLocked
              isPremiumViewer={isPremiumViewer}
              compact={compact}
            />
            <DetailRow
              label="Work location"
              value={profession?.work_location || profession?.business_location}
              compact={compact}
            />
          </>
        )}
      </div>
    </div>
  )
}
