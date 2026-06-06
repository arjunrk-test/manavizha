"use client"

import Link from "next/link"
import {
  ArrowRight,
  Database,
  Mail,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

type QuickAction = {
  href: string
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  accentColor: string
  verification?: boolean
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    href: "/admin/dashboard/funnel?stage=personal",
    title: "Manage profiles",
    description: "Users who have not completed profile stages",
    icon: User,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    accentColor: "group-hover:text-[#3bb9ac]",
  },
  {
    href: "/admin/dashboard/accounts",
    title: "Accounts",
    description: "User accounts, profiles, and access permissions",
    icon: Users,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    accentColor: "group-hover:text-[#1F4068]",
  },
  {
    href: "/admin/dashboard/masterdata",
    title: "Master data",
    description: "Platform data, lookups, and configurations",
    icon: Database,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    accentColor: "group-hover:text-[#c9a227]",
  },
  {
    href: "/admin/dashboard/email",
    title: "Email",
    description: "Templates, campaigns, and communications",
    icon: Mail,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    accentColor: "group-hover:text-[#e87898]",
  },
  {
    href: "/admin/verification",
    title: "Identity verification",
    description: "Review and approve pending identity checks",
    icon: ShieldCheck,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    accentColor: "group-hover:text-[#3bb9ac]",
    verification: true,
  },
]

interface AdminQuickActionsPanelProps {
  pendingVerifications?: number
}

function ActionCard({
  action,
  pendingVerifications,
}: {
  action: QuickAction
  pendingVerifications: number
}) {
  const Icon = action.icon
  const hasPending = action.verification && pendingVerifications > 0

  return (
    <Link
      href={action.href}
      className={`group flex min-w-0 items-start gap-2.5 rounded-lg border bg-white px-3 py-2.5 transition-all hover:shadow-[0_2px_10px_rgba(31,64,104,0.06)] ${
        hasPending
          ? "border-[#e87898]/35 bg-[#fffafb] hover:border-[#e87898]/50"
          : "border-[#f0ebe3] hover:border-[#c9a227]/30"
      }`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${action.iconBg}`}>
        <Icon className={`h-4 w-4 ${action.iconColor}`} strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[12px] font-semibold leading-tight text-[#1F4068]">{action.title}</p>
              {hasPending && (
                <span className="inline-flex items-center rounded-full bg-[#e87898] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  {pendingVerifications} pending
                </span>
              )}
            </div>
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-gray-500">
              {action.description}
            </p>
          </div>
          <ArrowRight
            className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 ${action.accentColor}`}
          />
        </div>
      </div>
    </Link>
  )
}

export function AdminQuickActionsPanel({ pendingVerifications = 0 }: AdminQuickActionsPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/95 shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
            Operations
          </p>
          <h2 className="font-display text-base font-semibold leading-tight text-[#1F4068] sm:text-lg">
            Quick actions
          </h2>
        </div>
        <p className="mt-0.5 text-[11px] text-gray-500">Jump to common admin tasks</p>
      </div>

      <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <ActionCard
            key={action.href}
            action={action}
            pendingVerifications={pendingVerifications}
          />
        ))}
      </div>
    </div>
  )
}
