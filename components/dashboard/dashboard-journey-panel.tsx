"use client"

import {
  Camera,
  CheckCircle2,
  CreditCard,
  SlidersHorizontal,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardJourneyPatterns } from "./dashboard-journey-patterns"

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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] rounded-[20px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.04)] p-5 h-full flex flex-col min-w-0">
      <DashboardJourneyPatterns />

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
      <h3 className="text-base font-semibold text-[#e87898] mb-5 shrink-0">Your Journey</h3>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Profile completion */}
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#fce8ef] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-[#e87898]" />
            </div>
            <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
              <span className="text-[13px] text-[#374151]">Profile Completed</span>
              <span className="text-[13px] font-semibold text-[#1F4068]">{completionPercentage}%</span>
            </div>
          </div>
          <div className="ml-[42px] h-[6px] bg-[#f3f4f6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e87898] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Checklist items */}
        <div className="space-y-3.5">
          <JourneyRow
            icon={Camera}
            iconBg="bg-[#fdf6e3]"
            iconColor="text-[#c9a227]"
            label="Photos Added"
            trailing={
              <span className="text-[13px] font-medium text-[#6b7280]">
                {photoCount}/{maxPhotos}
              </span>
            }
          />
          <JourneyRow
            icon={Smartphone}
            iconBg="bg-[#e6f7f5]"
            iconColor="text-[#3bb9ac]"
            label="Mobile Verified"
            trailing={<JourneyStatus verified={mobileVerified} />}
          />
          <JourneyRow
            icon={CreditCard}
            iconBg="bg-[#fce8ef]"
            iconColor="text-[#e87898]"
            label="ID Verified"
            trailing={<JourneyStatus verified={idVerified} />}
          />
        </div>

        {/* Add photos CTA */}
        {needsMorePhotos && (
          <div className="mt-auto pt-5">
            <div className="rounded-[14px] bg-[#faf8f4] border border-[#f0ebe3] p-4">
              <div className="flex items-start gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#fce8ef] flex items-center justify-center shrink-0">
                  <Camera className="h-4 w-4 text-[#e87898]" />
                </div>
                <p className="text-[12px] text-[#6b7280] leading-snug pt-1">
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
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

function JourneyRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  trailing,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  trailing: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-[13px] text-[#374151]">{label}</span>
      </div>
      {trailing}
    </div>
  )
}

function JourneyStatus({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#3bb9ac]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    )
  }

  return <span className="text-[12px] text-[#9ca3af]">Pending</span>
}
