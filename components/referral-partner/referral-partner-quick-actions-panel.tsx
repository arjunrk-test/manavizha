"use client"

import Link from "next/link"
import { ArrowRight, Settings, User, Users, type LucideIcon } from "lucide-react"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"

type QuickAction = {
  href: string
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  accentColor: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    href: "/referral-partner/profiles",
    title: "Referred profiles",
    description: "View and manage profiles referred through your partner ID",
    icon: Users,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    accentColor: "group-hover:text-[#1F4068]",
  },
  {
    href: "/referral-partner/profile",
    title: "Account",
    description: "Your partner profile and contact information",
    icon: User,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    accentColor: "group-hover:text-[#3bb9ac]",
  },
  {
    href: "/referral-partner/settings",
    title: "Settings",
    description: "Password, notifications, and account preferences",
    icon: Settings,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    accentColor: "group-hover:text-[#c9a227]",
  },
]

function ActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon

  return (
    <Link
      href={action.href}
      className="group relative flex flex-col rounded-[1.15rem] border border-white/90 bg-white/90 p-5 sm:p-6 shadow-[0_12px_40px_rgba(31,64,104,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(31,64,104,0.1)] min-h-[9.5rem]"
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${action.iconBg}`}>
        <Icon className={`h-5 w-5 ${action.iconColor}`} strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold text-[#1F4068] mb-1.5 leading-tight">{action.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{action.description}</p>
      <span
        className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-400 ${action.accentColor} transition-colors`}
      >
        Open <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

export function ReferralPartnerQuickActionsPanel() {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-[#eadfce] bg-gradient-to-br from-[#fffdf8] via-white to-[#fef8ee] shadow-[0_12px_40px_rgba(31,64,104,0.06)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-2">
            Quick actions
          </p>
          <h2 className="font-display text-2xl sm:text-[1.65rem] font-semibold text-[#1F4068] tracking-tight">
            Manage your partner hub
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {QUICK_ACTIONS.map((action) => (
            <ActionCard key={action.href} action={action} />
          ))}
        </div>
      </div>
    </div>
  )
}
