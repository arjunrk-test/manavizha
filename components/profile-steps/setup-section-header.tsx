"use client"

import type { LucideIcon } from "lucide-react"

interface SetupSectionHeaderProps {
  title: string
  description?: string
  icon: LucideIcon
}

export function SetupSectionHeader({ title, description, icon: Icon }: SetupSectionHeaderProps) {
  return (
    <div className="border-b border-[#f0ebe3]/80 px-3.5 py-3">
      <h3 className="text-[14px] font-semibold text-[#1F4068] flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fce8ef]">
          <Icon className="h-3.5 w-3.5 text-[#e87898]" />
        </span>
        {title}
      </h3>
      {description && <p className="text-[12px] text-[#6b7280] mt-1 ml-[38px]">{description}</p>}
    </div>
  )
}
