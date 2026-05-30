"use client"

import { Camera, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardJourneyPanelProps {
  completionPercentage: number
  photoCount: number
  maxPhotos?: number
  mobileVerified: boolean
  idVerified: boolean
  onAddPhotos: () => void
}

export function DashboardJourneyPanel({
  completionPercentage,
  photoCount,
  maxPhotos = 6,
  mobileVerified,
  idVerified,
  onAddPhotos,
}: DashboardJourneyPanelProps) {
  const needsMorePhotos = photoCount < maxPhotos

  return (
    <div className="bg-white rounded-[20px] border border-[#f0f0f0] shadow-[0_2px_12px_rgba(31,64,104,0.04)] p-5 h-fit">
      <h3 className="text-base font-semibold text-[#1F4068] mb-5">Your Journey</h3>

      {/* Profile completion */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-[#6b7280]">Profile Completed</span>
          <span className="text-[13px] font-semibold text-[#1F4068]">{completionPercentage}%</span>
        </div>
        <div className="h-[6px] bg-[#f3f4f6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e87898] rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3.5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fdf6e3] flex items-center justify-center">
              <Camera className="h-4 w-4 text-[#c9a227]" />
            </div>
            <span className="text-[13px] text-[#374151]">Photos Added</span>
          </div>
          <span className="text-[13px] font-medium text-[#6b7280]">
            {photoCount}/{maxPhotos}
          </span>
        </div>

        <JourneyCheck label="Mobile Verified" verified={mobileVerified} />
        <JourneyCheck label="ID Verified" verified={idVerified} />
      </div>

      {/* Add photos CTA */}
      {needsMorePhotos && (
        <div className="rounded-[14px] bg-[#faf8f4] border border-[#f0ebe3] p-4">
          <div className="flex items-start gap-2.5 mb-3">
            <Camera className="h-[18px] w-[18px] text-[#e87898] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#6b7280] leading-snug">
              Add more photos to get <span className="font-semibold text-[#1F4068]">5× more matches</span>
            </p>
          </div>
          <Button
            onClick={onAddPhotos}
            className="w-full h-9 rounded-[10px] bg-[#e87898] hover:bg-[#d66686] text-white text-[13px] font-medium shadow-none"
          >
            Add Photos
          </Button>
        </div>
      )}
    </div>
  )
}

function JourneyCheck({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[#374151]">{label}</span>
      {verified ? (
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#3bb9ac]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </span>
      ) : (
        <span className="text-[12px] text-[#9ca3af]">Pending</span>
      )}
    </div>
  )
}
