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
  type LucideIcon,
} from "lucide-react"

export type StageStat = {
  label: string
  count: number
  table: string
}

const STAGE_CONFIG: Record<string, { funnelKey: string; icon: LucideIcon }> = {
  personal_details: { funnelKey: "personal", icon: User },
  contact_details: { funnelKey: "contact", icon: Phone },
  education_details: { funnelKey: "education", icon: GraduationCap },
  profession_employee: { funnelKey: "professional", icon: Briefcase },
  family_details: { funnelKey: "family", icon: Users },
  horoscope_details: { funnelKey: "horoscope", icon: Star },
  interests: { funnelKey: "interests", icon: Heart },
  social_habits: { funnelKey: "social", icon: MessageCircle },
  photos: { funnelKey: "referral", icon: Camera },
}

const GOLD_STAGE_TABLES = new Set([
  "personal_details",
  "contact_details",
  "education_details",
  "profession_employee",
  "family_details",
])

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

export function AdminProfileStagesPanel({ stages, totalUsers }: AdminProfileStagesPanelProps) {
  return (
    <div className="rounded-[1.25rem] border border-[#f0ebe3] bg-white/95 shadow-[0_4px_24px_rgba(31,64,104,0.06)] overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#f0ebe3]/80 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-6">
        <div className="min-w-0">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9a227]">
            Your matrimony journey
          </p>
          <h2 className="font-display text-xl font-semibold leading-tight text-[#1F4068] sm:text-[1.35rem]">
            Profile completion by stage
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            See who has crossed each step so far
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-[#f0ebe3] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(31,64,104,0.04)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf6e3]">
            <Users className="h-5 w-5 text-[#c9a227]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[11px] leading-tight text-gray-500">Total users in journey</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums leading-none text-[#1F4068] sm:text-2xl">
              {formatCount(totalUsers)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-3 px-5 py-5 sm:px-6">
          {stages.map((stage) => {
            const config = STAGE_CONFIG[stage.table]
            const Icon = config?.icon ?? User
            const isGold = GOLD_STAGE_TABLES.has(stage.table)
            const iconBg = isGold ? "bg-[#fdf6e3]" : "bg-[#e6f7f5]"
            const iconColor = isGold ? "text-[#c9a227]" : "text-[#3bb9ac]"
            const countColor = isGold ? "text-[#c9a227]" : "text-[#3bb9ac]"

            return (
              <Link
                key={stage.table}
                href={stageHref(stage.table)}
                className="group flex w-[140px] shrink-0 flex-col rounded-xl border border-[#f0ebe3] bg-white px-3.5 py-3.5 transition-all hover:border-[#c9a227]/30 hover:shadow-[0_4px_16px_rgba(31,64,104,0.08)] sm:w-[152px]"
              >
                <div className="mb-3 flex items-start gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.75} />
                  </div>
                  <span className="pt-0.5 text-[13px] font-semibold leading-snug text-[#1F4068]">
                    {stage.label}
                  </span>
                </div>
                <p className={`text-2xl font-bold tabular-nums leading-none ${countColor}`}>
                  {formatCount(stage.count)}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
