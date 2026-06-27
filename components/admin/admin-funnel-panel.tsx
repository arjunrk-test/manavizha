"use client"

import { getAllParentIds } from "@/app/actions/admin"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { getAccessToken } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Briefcase,
  Camera,
  ChevronRight,
  Eye,
  GitBranch,
  GraduationCap,
  Heart,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Star,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LucideIcon } from "lucide-react"

type StageConfig = {
  key: string
  label: string
  shortLabel: string
  presentTable: string
  absentTable: string | null
  idCol: "id" | "user_id"
  isProfession?: boolean
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

const STAGES: StageConfig[] = [
  {
    key: "signed_up",
    label: "Just Signed Up",
    shortLabel: "Signed up",
    presentTable: "users",
    absentTable: "personal_details",
    idCol: "id",
    icon: UserPlus,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
  },
  {
    key: "personal",
    label: "Personal Details",
    shortLabel: "Personal",
    presentTable: "personal_details",
    absentTable: "contact_details",
    idCol: "user_id",
    icon: User,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
  },
  {
    key: "contact",
    label: "Contact Details",
    shortLabel: "Contact",
    presentTable: "contact_details",
    absentTable: "education_details",
    idCol: "user_id",
    icon: Phone,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
  },
  {
    key: "education",
    label: "Educational Details",
    shortLabel: "Education",
    presentTable: "education_details",
    absentTable: "family_details",
    idCol: "user_id",
    icon: GraduationCap,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
  },
  {
    key: "professional",
    label: "Professional Details",
    shortLabel: "Professional",
    presentTable: "profession_employee",
    absentTable: "family_details",
    idCol: "user_id",
    isProfession: true,
    icon: Briefcase,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
  },
  {
    key: "family",
    label: "Family Details",
    shortLabel: "Family",
    presentTable: "family_details",
    absentTable: "horoscope_details",
    idCol: "user_id",
    icon: Users,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
  },
  {
    key: "horoscope",
    label: "Horoscope Details",
    shortLabel: "Horoscope",
    presentTable: "horoscope_details",
    absentTable: "interests",
    idCol: "user_id",
    icon: Star,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
  },
  {
    key: "interests",
    label: "Interests",
    shortLabel: "Interests",
    presentTable: "interests",
    absentTable: "social_habits",
    idCol: "user_id",
    icon: Heart,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
  },
  {
    key: "social",
    label: "Social Habits",
    shortLabel: "Social",
    presentTable: "social_habits",
    absentTable: "photos",
    idCol: "user_id",
    icon: MessageCircle,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
  },
  {
    key: "referral",
    label: "Photos (Referral Yet to be Given)",
    shortLabel: "Photos",
    presentTable: "photos",
    absentTable: "referral_details",
    idCol: "user_id",
    icon: Camera,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
  },
]

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function AdminFunnelPanel({ stage }: { stage: string }) {
  const router = useRouter()
  const stageConfig = STAGES.find((s) => s.key === stage) ?? STAGES[1]
  const StageIcon = stageConfig.icon

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const fetchSegment = async (silent = false) => {
    if (silent) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      let presentIds = new Set<string>()
      let absentIds = new Set<string>()

      if (stageConfig.isProfession) {
        const [emp, bus, stu] = await Promise.all([
          supabase.from("profession_employee").select("user_id"),
          supabase.from("profession_business").select("user_id"),
          supabase.from("profession_student").select("user_id"),
        ])
        ;[...(emp.data || []), ...(bus.data || []), ...(stu.data || [])].forEach((r) =>
          presentIds.add(r.user_id)
        )
      } else if (stageConfig.idCol === "id") {
        const { data } = await supabase.from(stageConfig.presentTable).select("id")
        if (data) data.forEach((r) => presentIds.add(r.id))
      } else {
        const { data } = await supabase.from(stageConfig.presentTable).select("user_id")
        if (data) data.forEach((r) => presentIds.add(r.user_id))
      }

      if (stageConfig.absentTable) {
        const { data } = await supabase.from(stageConfig.absentTable).select("user_id")
        if (data) data.forEach((r) => absentIds.add(r.user_id))
      }

      const accessToken = await getAccessToken()
      const parentDataRes = accessToken
        ? await getAllParentIds(accessToken)
        : { success: false, ids: [] as string[] }
      if (parentDataRes.success && parentDataRes.ids) {
        parentDataRes.ids.forEach((id: string) => absentIds.add(id))
      }

      const stoppedIds = [...presentIds].filter((id) => !absentIds.has(id))

      if (stoppedIds.length === 0) {
        setUsers([])
        return
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id, email, name, phone")
        .in("id", stoppedIds)

      setUsers(userData || [])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSegment()
  }, [stage])

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return users
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    )
  }, [users, searchQuery])

  const stageIndex = STAGES.findIndex((s) => s.key === stageConfig.key)

  return (
    <ThemedPanel>
      <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stageConfig.iconBg}`}>
              <GitBranch className="h-5 w-5 text-[#1F4068]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">Journey</p>
              <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">Profile funnel</h1>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Members who stopped at a stage and have not moved forward
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchSegment(true)}
            disabled={isRefreshing}
            className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: "Stopped at stage", value: users.length },
            {
              label: "Showing",
              value: searchQuery ? filteredUsers.length : users.length,
              sub: searchQuery ? "filtered results" : stageConfig.shortLabel,
            },
            {
              label: "Current stage",
              value: `${stageIndex + 1}/${STAGES.length}`,
              sub: stageConfig.shortLabel,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2.5"
            >
              <p className="text-[10px] font-medium text-gray-500">{stat.label}</p>
              <p className="font-display text-lg font-semibold text-[#1F4068]">{stat.value}</p>
              {stat.sub && <p className="text-[9px] text-gray-400">{stat.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-[#c5d4e4] bg-[#e8eef5] px-4 py-3 text-center sm:px-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
          Funnel stage
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                setSearchQuery("")
                router.push(`/admin/dashboard/funnel?stage=${s.key}`)
              }}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                s.key === stageConfig.key
                  ? "bg-[#1F4068] text-white shadow-sm"
                  : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
              }`}
            >
              <span className="opacity-70">{i + 1}.</span>
              {s.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${stageConfig.iconBg}`}>
              <StageIcon className={`h-4 w-4 ${stageConfig.iconColor}`} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1F4068]">{stageConfig.label}</p>
              <p className="text-[11px] text-gray-500">
                {users.length} member{users.length !== 1 ? "s" : ""} stopped here
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone..."
              className="h-9 rounded-lg border-[#c5d4e4] bg-white pl-9 pr-9 text-[12px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
          <div className="border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
            <h2 className="font-display text-base font-semibold text-[#1F4068]">Stopped members</h2>
            <p className="text-[11px] text-gray-500">
              Users present in this stage but not yet in the next
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
              <p className="text-[12px] text-gray-500">Loading funnel segment...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${stageConfig.iconBg}`}>
                <StageIcon className={`h-7 w-7 ${stageConfig.iconColor}`} />
              </div>
              <h3 className="font-display text-base font-semibold text-[#1F4068]">No members stopped here</h3>
              <p className="mt-1 max-w-sm text-[12px] text-gray-500">
                {searchQuery
                  ? "No members match your search at this stage."
                  : `Everyone has moved past ${stageConfig.shortLabel.toLowerCase()}.`}
              </p>
              {searchQuery ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-[#3bb9ac]"
                >
                  Clear search
                </Button>
              ) : stageIndex < STAGES.length - 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/dashboard/funnel?stage=${STAGES[stageIndex + 1].key}`)}
                  className="mt-4 rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
                >
                  Next stage
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                    {["#", "Member", "Email", "Phone", "Stage", "Actions"].map((head) => (
                      <th
                        key={head}
                        className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] ${
                          head === "Actions" ? "text-right" : "text-left"
                        }`}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className="border-b border-[#f0ebe3]/80 hover:bg-[#faf8f4]/60">
                      <td className="px-4 py-3 text-[12px] text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F4068]/10 text-[12px] font-semibold text-[#1F4068]">
                            {(u.name || u.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#1F4068]">{u.name || "—"}</p>
                            <p className="font-mono text-[10px] text-gray-400">{u.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{u.email || "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-[#fdf6e3] px-2 py-0.5 text-[10px] font-semibold text-[#c9a227]">
                          {stageConfig.shortLabel}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/dashboard/profiles/${u.id}`)}
                          title="View profile"
                          aria-label="View profile"
                          className="h-8 w-8 rounded-lg border-[#f0ebe3] bg-white p-0 text-[#1F4068] hover:border-[#c9a227]/40 hover:bg-[#fdf6e3]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ThemedPanel>
  )
}
