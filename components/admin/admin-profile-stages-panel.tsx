"use client"

import Link from "next/link"
import {
  User,
  Phone,
  GraduationCap,
  Briefcase,
  Users,
  Star,
  Heart,
  MessageCircle,
  Camera,
  ArrowRight,
  GitBranch,
  type LucideIcon,
} from "lucide-react"

export type StageStat = {
  label: string
  count: number
  table: string
}

const STAGE_CONFIG: Record<
  string,
  { funnelKey: string; icon: LucideIcon; iconBg: string; iconColor: string; countColor: string }
> = {
  personal_details: {
    funnelKey: "personal",
    icon: User,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    countColor: "text-[#e87898]",
  },
  contact_details: {
    funnelKey: "contact",
    icon: Phone,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    countColor: "text-[#3bb9ac]",
  },
  education_details: {
    funnelKey: "education",
    icon: GraduationCap,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    countColor: "text-[#c9a227]",
  },
  profession_employee: {
    funnelKey: "professional",
    icon: Briefcase,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    countColor: "text-[#1F4068]",
  },
  family_details: {
    funnelKey: "family",
    icon: Users,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    countColor: "text-[#e87898]",
  },
  horoscope_details: {
    funnelKey: "horoscope",
    icon: Star,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    countColor: "text-[#c9a227]",
  },
  interests: {
    funnelKey: "interests",
    icon: Heart,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    countColor: "text-[#e87898]",
  },
  social_habits: {
    funnelKey: "social",
    icon: MessageCircle,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    countColor: "text-[#3bb9ac]",
  },
  photos: {
    funnelKey: "referral",
    icon: Camera,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    countColor: "text-[#1F4068]",
  },
}

function stageHref(table: string) {
  const key = STAGE_CONFIG[table]?.funnelKey ?? "personal"
  return `/admin/dashboard/funnel?stage=${key}`
}

function formatCount(value: number) {
  return value.toLocaleString()
}

interface AdminProfileStagesPanelProps {
  stages: StageStat[]
  totalUsers: number
}

function StageCard({ stage }: { stage: StageStat }) {
  const config = STAGE_CONFIG[stage.table] ?? STAGE_CONFIG.personal_details
  const Icon = config.icon

  return (
    <Link
      href={stageHref(stage.table)}
      className="group flex min-w-0 items-center gap-2 rounded-lg border border-[#f0ebe3] bg-white px-2.5 py-2 transition-all hover:border-[#c9a227]/30 hover:shadow-[0_2px_10px_rgba(31,64,104,0.06)]"
    >
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold leading-tight text-[#1F4068]">{stage.label}</p>
        <p className={`text-base font-bold tabular-nums leading-none ${config.countColor}`}>
          {formatCount(stage.count)}
        </p>
      </div>
    </Link>
  )
}

function FunnelViewButton() {
  return (
    <Link
      href="/admin/dashboard/funnel?stage=personal"
      className="group flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#c9a227]/45 bg-gradient-to-br from-[#fdf6e3]/70 to-white px-2.5 py-2 text-center transition-all hover:border-[#c9a227]/70 hover:shadow-[0_2px_10px_rgba(201,162,39,0.1)]"
    >
      <GitBranch className="h-3.5 w-3.5 shrink-0 text-[#1F4068]" strokeWidth={1.75} />
      <span className="text-[11px] font-semibold leading-tight text-[#1F4068]">Full funnel</span>
      <ArrowRight className="h-3 w-3 shrink-0 text-[#3bb9ac] transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export function AdminProfileStagesPanel({ stages, totalUsers }: AdminProfileStagesPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/95 shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <div className="flex flex-col gap-2 border-b border-[#f0ebe3]/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
              Journey
            </p>
            <h2 className="font-display text-base font-semibold leading-tight text-[#1F4068] sm:text-lg">
              Profile completion by stage
            </h2>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-500">See who has crossed each step so far</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#f0ebe3] bg-[#faf8f4]/80 px-2.5 py-1.5">
          <Users className="h-3.5 w-3.5 text-[#3bb9ac]" strokeWidth={1.75} />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-gray-500">Total</span>
            <span className="text-sm font-bold tabular-nums text-[#1F4068]">
              {formatCount(totalUsers)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3 sm:px-5">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 md:grid-cols-5">
          {stages.slice(0, 5).map((stage) => (
            <StageCard key={stage.table} stage={stage} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 md:grid-cols-5">
          {stages.slice(5).map((stage) => (
            <StageCard key={stage.table} stage={stage} />
          ))}
          <FunnelViewButton />
        </div>
      </div>
    </div>
  )
}
