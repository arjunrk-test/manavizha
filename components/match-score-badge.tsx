"use client"

import type { MouseEventHandler } from "react"
import { ShieldCheck, Lock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MatchScoreBadgeProps {
  lifestyleScore: number
  poruthamScore: number
  isPremium: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}

function getLifestyleStyles(score: number) {
  if (score >= 80) return "bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]/60"
  if (score >= 60) return "bg-[#fdf6e3] text-[#c9a227] border-[#eadfce]"
  if (score >= 40) return "bg-[#fce8ef] text-[#e87898] border-[#f5c6d6]/60"
  return "bg-[#faf8f4] text-[#6b7280] border-[#f0ebe3]"
}

function getPoruthamStyles(score: number) {
  if (score >= 7) return "bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]/60"
  if (score >= 5) return "bg-[#e6f7f5] text-[#3bb9ac] border-[#b8e8e2]/60"
  return "bg-[#faf8f4] text-[#6b7280] border-[#f0ebe3]"
}

export function MatchScoreBadge({ lifestyleScore, poruthamScore, isPremium, onClick }: MatchScoreBadgeProps) {
  if (!isPremium) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-[#f0ebe3] bg-[#faf8f4] px-2.5 py-1 transition-colors hover:bg-white hover:border-[#eadfce]"
          >
            <Lock className="h-3 w-3 text-[#c9a227]" />
            <span className="text-[10px] font-medium text-[#9ca3af]">Match score</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[220px] rounded-[16px] border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] p-3 shadow-[0_8px_24px_rgba(31,64,104,0.12)] z-[100]"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#e87898]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <p className="text-[12px] font-semibold text-[#1F4068]">Unlock compatibility</p>
            </div>
            <p className="text-[11px] text-[#6b7280] leading-relaxed">
              Premium members see lifestyle and horoscope match scores for every profile.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick(e as unknown as React.MouseEvent<HTMLDivElement>) : undefined}
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-full border border-[#f0ebe3] bg-white shadow-[0_1px_4px_rgba(31,64,104,0.06)]",
        onClick && "cursor-pointer transition-all hover:shadow-[0_2px_8px_rgba(232,120,152,0.12)] hover:border-[#e87898]/25 active:scale-[0.98]"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1 border-r border-[#f0ebe3]/80 px-2.5 py-1",
          getLifestyleStyles(lifestyleScore)
        )}
        title="Lifestyle match"
      >
        <Sparkles className="h-3 w-3 shrink-0 opacity-80" />
        <span className="text-[11px] font-semibold tabular-nums">{lifestyleScore}%</span>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 px-2.5 py-1",
          getPoruthamStyles(poruthamScore)
        )}
        title="Horoscope porutham"
      >
        <ShieldCheck className="h-3 w-3 shrink-0 opacity-80" />
        <span className="text-[11px] font-semibold tabular-nums">{poruthamScore}/10</span>
      </div>
    </div>
  )
}
