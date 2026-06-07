"use client"

import { updateUserPremiumSubscription } from "@/app/actions/admin"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { getAccessToken } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Gem,
  HeartHandshake,
  Search,
  Shield,
  Star,
  User,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Filters = {
  name: string
  phone: string
  ageOp: string
  ageValue: string
  profession: string
  partnerName: string
  referralPartnerId: string
}

const EMPTY_FILTERS: Filters = {
  name: "",
  phone: "",
  ageOp: "=",
  ageValue: "",
  profession: "",
  partnerName: "",
  referralPartnerId: "",
}

const FIELD_INPUT =
  "rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] placeholder:text-gray-400"
const DIALOG_CONTENT =
  "rounded-xl border border-[#f0ebe3] bg-white text-[#1F4068] shadow-xl"
const DIALOG_TITLE = "font-display text-base font-semibold text-[#1F4068]"
const PROFILES_PAGE_SIZE = 10

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function IconActionButton({
  onClick,
  icon: Icon,
  title,
  tone = "default",
  disabled,
}: {
  onClick: (e: React.MouseEvent) => void
  icon: React.ComponentType<{ className?: string }>
  title: string
  tone?: "default" | "gold" | "teal"
  disabled?: boolean
}) {
  const styles = {
    default:
      "border-[#f0ebe3] bg-white text-[#1F4068] hover:border-[#c9a227]/40 hover:bg-[#fdf6e3]",
    gold: "border-[#c9a227]/30 bg-white text-[#c9a227] hover:border-[#c9a227]/50 hover:bg-[#fdf6e3]",
    teal: "border-[#3bb9ac]/30 bg-white text-[#3bb9ac] hover:border-[#3bb9ac]/50 hover:bg-[#e6f7f5]",
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`h-8 w-8 shrink-0 rounded-lg p-0 ${styles[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  )
}

function getPremiumBadge(
  isPremium: boolean,
  plan: string | null,
  expiresAt: string | null = null
) {
  if (!isPremium) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
        Free
      </span>
    )
  }

  const isExpired = expiresAt && new Date(expiresAt) < new Date()
  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </span>
    )
  }

  if (plan === "till_you_marry") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#3bb9ac] to-[#e87898] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
        <Crown className="h-3 w-3" />
        Lifetime
      </span>
    )
  }
  if (plan === "elite") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#3bb9ac] to-[#2fa085] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
        <Gem className="h-3 w-3" />
        Elite
      </span>
    )
  }
  if (plan === "prime_gold") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
        <Star className="h-3 w-3" />
        Gold
      </span>
    )
  }
  if (plan === "prime" || plan === "3_months") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
        <Shield className="h-3 w-3" />
        Prime
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#3bb9ac] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
      <Crown className="h-3 w-3" />
      Premium
    </span>
  )
}

export function AdminProfilesPanel({
  genderFilter,
  referralPartnerIdFilter,
}: {
  genderFilter: string | null
  referralPartnerIdFilter: string | null
}) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"active" | "married">("active")
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    referralPartnerId: referralPartnerIdFilter || "",
  })
  const [selectedProfileForMarriage, setSelectedProfileForMarriage] = useState<string | null>(null)
  const [isUpdatingPremium, setIsUpdatingPremium] = useState<string | null>(null)
  const [isManageSubOpen, setIsManageSubOpen] = useState(false)
  const [manageSubUserId, setManageSubUserId] = useState<string | null>(null)
  const [subPlan, setSubPlan] = useState<string>("prime")
  const [subDuration, setSubDuration] = useState<string>("3")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (referralPartnerIdFilter) {
      setFilters((prev) => ({ ...prev, referralPartnerId: referralPartnerIdFilter }))
    }
  }, [referralPartnerIdFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, filters, genderFilter])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      let query = supabase
        .from("personal_details")
        .select("user_id, name, age, sex, marital_status")
      if (genderFilter) query = query.ilike("sex", genderFilter)

      const { data: personalData, error: personalError } = await query
      if (personalError || !personalData) {
        setIsLoading(false)
        return
      }

      const userIds = personalData.map((p) => p.user_id)
      if (userIds.length === 0) {
        setAllProfiles([])
        setIsLoading(false)
        return
      }

      const [
        { data: contactData },
        { data: referralData },
        { data: partnersData },
        { data: settingsData },
        empRes,
        busRes,
        stuRes,
      ] = await Promise.all([
        supabase.from("contact_details").select("user_id, phone").in("user_id", userIds),
        supabase.from("referral_details").select("user_id, referral_partner_id").in("user_id", userIds),
        supabase.from("referral_partners").select("partner_id, name"),
        supabase.from("user_settings").select("user_id, is_premium, premium_plan, premium_expires_at").in("user_id", userIds),
        supabase.from("profession_employee").select("user_id, sector, company, designation").in("user_id", userIds),
        supabase.from("profession_business").select("user_id, business_name").in("user_id", userIds),
        supabase.from("profession_student").select("user_id, course").in("user_id", userIds),
      ])

      const contactMap: Record<string, string> = {}
      contactData?.forEach((c) => {
        contactMap[c.user_id] = c.phone || ""
      })

      const referralMap: Record<string, string> = {}
      referralData?.forEach((r) => {
        if (r.referral_partner_id) referralMap[r.user_id] = r.referral_partner_id
      })

      const partnerNameMap: Record<string, string> = {}
      partnersData?.forEach((p) => {
        if (p.partner_id) partnerNameMap[p.partner_id] = p.name
      })

      const settingsMap: Record<
        string,
        { is_premium: boolean; premium_plan: string | null; premium_expires_at: string | null }
      > = {}
      settingsData?.forEach((s) => {
        settingsMap[s.user_id] = {
          is_premium: s.is_premium,
          premium_plan: s.premium_plan,
          premium_expires_at: s.premium_expires_at,
        }
      })

      const profMap: Record<string, string> = {}
      empRes.data?.forEach((e: any) => {
        profMap[e.user_id] = e.designation || e.company || e.sector || "Employee"
      })
      busRes.data?.forEach((b: any) => {
        profMap[b.user_id] = b.business_name || "Business"
      })
      stuRes.data?.forEach((s: any) => {
        profMap[s.user_id] = s.course || "Student"
      })

      setAllProfiles(
        personalData.map((p) => {
          const partnerId = referralMap[p.user_id] || null
          return {
            ...p,
            phone: contactMap[p.user_id] || "N/A",
            profession: profMap[p.user_id] || "Not Specified",
            referralPartnerId: partnerId,
            partnerName: partnerId ? partnerNameMap[partnerId] || "Unknown Partner" : "None",
            isPremium: settingsMap[p.user_id]?.is_premium || false,
            premiumPlan: settingsMap[p.user_id]?.premium_plan || null,
            premiumExpiresAt: settingsMap[p.user_id]?.premium_expires_at || null,
          }
        })
      )
      setIsLoading(false)
    }

    fetchData()
  }, [genderFilter])

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "ageOp") return value !== "="
    return value !== ""
  })

  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((p) => {
      let ageMatches = true
      if (filters.ageValue) {
        const profileAge = Number(p.age || 0)
        const targetAge = Number(filters.ageValue)
        if (filters.ageOp === "=") ageMatches = profileAge === targetAge
        else if (filters.ageOp === ">") ageMatches = profileAge > targetAge
        else if (filters.ageOp === "<") ageMatches = profileAge < targetAge
        else if (filters.ageOp === ">=") ageMatches = profileAge >= targetAge
        else if (filters.ageOp === "<=") ageMatches = profileAge <= targetAge
      }

      return (
        (!filters.name || (p.name || "").toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.phone || (p.phone || "").toLowerCase().includes(filters.phone.toLowerCase())) &&
        ageMatches &&
        (!filters.profession || (p.profession || "") === filters.profession) &&
        (!filters.partnerName ||
          (p.partnerName || "").toLowerCase().includes(filters.partnerName.toLowerCase())) &&
        (!filters.referralPartnerId ||
          (p.referralPartnerId || "")
            .toLowerCase()
            .includes(filters.referralPartnerId.toLowerCase()))
      )
    })
  }, [allProfiles, filters])

  const activeProfiles = filteredProfiles.filter(
    (p) => (p.marital_status || "").toLowerCase() !== "married"
  )
  const marriedProfiles = filteredProfiles.filter(
    (p) => (p.marital_status || "").toLowerCase() === "married"
  )
  const visibleProfiles = activeTab === "active" ? activeProfiles : marriedProfiles
  const totalPages = Math.max(1, Math.ceil(visibleProfiles.length / PROFILES_PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)
  const paginatedProfiles = useMemo(() => {
    const start = (page - 1) * PROFILES_PAGE_SIZE
    return visibleProfiles.slice(start, start + PROFILES_PAGE_SIZE)
  }, [visibleProfiles, page])
  const rangeStart =
    visibleProfiles.length === 0 ? 0 : (page - 1) * PROFILES_PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PROFILES_PAGE_SIZE, visibleProfiles.length)

  const uniqueProfessions = Array.from(
    new Set(allProfiles.map((p) => p.profession).filter((p) => p && p !== "Not Specified"))
  ).sort() as string[]

  const title =
    genderFilter === "Male"
      ? "Men profiles"
      : genderFilter === "Female"
        ? "Women profiles"
        : "All profiles"

  const buildGenderHref = (gender: string | null) => {
    const params = new URLSearchParams()
    if (gender) params.set("gender", gender)
    if (referralPartnerIdFilter) params.set("referralPartnerId", referralPartnerIdFilter)
    const qs = params.toString()
    return `/admin/dashboard/profiles${qs ? `?${qs}` : ""}`
  }

  const confirmMarkAsMarried = async () => {
    if (!selectedProfileForMarriage) return

    const { error } = await supabase
      .from("personal_details")
      .update({ marital_status: "Married" })
      .eq("user_id", selectedProfileForMarriage)

    if (!error) {
      setAllProfiles((prev) =>
        prev.map((p) =>
          p.user_id === selectedProfileForMarriage ? { ...p, marital_status: "Married" } : p
        )
      )
      setSelectedProfileForMarriage(null)
      toast.success("Profile marked as married")
    } else {
      toast.error("Failed to update status")
    }
  }

  const handleSaveSubscription = async () => {
    if (!manageSubUserId) return

    setIsUpdatingPremium(manageSubUserId)
    setIsManageSubOpen(false)

    const isPremium = subPlan !== "none"
    const plan = isPremium ? subPlan : null

    let expiresAt: string | null = null
    if (isPremium && subDuration !== "lifetime") {
      const date = new Date()
      date.setMonth(date.getMonth() + parseInt(subDuration))
      expiresAt = date.toISOString()
    }

    const accessToken = await getAccessToken()
    if (!accessToken) {
      toast.error("Not authenticated")
      setIsUpdatingPremium(null)
      return
    }

    const { success, error } = await updateUserPremiumSubscription(accessToken, {
      userId: manageSubUserId,
      isPremium,
      plan,
      expiresAt,
    })

    if (success) {
      setAllProfiles((prev) =>
        prev.map((p) =>
          p.user_id === manageSubUserId
            ? { ...p, isPremium, premiumPlan: plan, premiumExpiresAt: expiresAt }
            : p
        )
      )
      toast.success("Subscription updated")
    } else {
      toast.error(error || "Failed to update subscription")
    }

    setIsUpdatingPremium(null)
    setManageSubUserId(null)
  }

  const openManageSubscription = (userId: string, currentPlan: string | null) => {
    setManageSubUserId(userId)
    setSubPlan(currentPlan || "prime")
    setSubDuration("3")
    setIsManageSubOpen(true)
  }

  return (
    <>
      <ThemedPanel>
        <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  genderFilter === "Male"
                    ? "bg-[#e6f7f5]"
                    : genderFilter === "Female"
                      ? "bg-[#fce8ef]"
                      : "bg-[#1F4068]/10"
                }`}
              >
                {genderFilter === "Male" ? (
                  <User className="h-5 w-5 text-[#3bb9ac]" strokeWidth={1.75} />
                ) : genderFilter === "Female" ? (
                  <User className="h-5 w-5 text-[#e87898]" strokeWidth={1.75} />
                ) : (
                  <Users className="h-5 w-5 text-[#1F4068]" strokeWidth={1.75} />
                )}
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
                  Members
                </p>
                <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                  {title}
                </h1>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Search, filter, and manage member profiles
                </p>
              </div>
            </div>

            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    ...EMPTY_FILTERS,
                    referralPartnerId: referralPartnerIdFilter || "",
                  })
                }
                className="rounded-lg border-red-200 bg-white text-red-600 hover:bg-red-50"
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Total loaded", value: allProfiles.length },
              { label: "Showing", value: filteredProfiles.length, sub: hasFilters ? "filtered" : "all" },
              { label: "Active", value: activeProfiles.length },
              { label: "Married", value: marriedProfiles.length },
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
            Gender view
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { label: "All profiles", gender: null },
              { label: "Men", gender: "Male" },
              { label: "Women", gender: "Female" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(buildGenderHref(item.gender))}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                  (genderFilter || null) === item.gender
                    ? "bg-[#1F4068] text-white shadow-sm"
                    : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-[#f0ebe3]/80 px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#3bb9ac]" />
            <h2 className="font-display text-sm font-semibold text-[#1F4068]">Filter profiles</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-gray-500">Name</Label>
              <Input
                value={filters.name}
                onChange={(e) => setFilter("name", e.target.value)}
                placeholder="Search name..."
                className={`h-9 text-[12px] ${FIELD_INPUT}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-gray-500">Phone</Label>
              <Input
                value={filters.phone}
                onChange={(e) => setFilter("phone", e.target.value)}
                placeholder="Search phone..."
                className={`h-9 text-[12px] ${FIELD_INPUT}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-gray-500">Age</Label>
              <div className="flex overflow-hidden rounded-lg border border-[#f0ebe3] bg-white">
                <select
                  value={filters.ageOp}
                  onChange={(e) => setFilter("ageOp", e.target.value)}
                  className="h-9 border-none bg-[#faf8f4] px-2 text-[12px] text-[#1F4068] focus:outline-none"
                >
                  <option value="=">=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&ge;</option>
                  <option value="<=">&le;</option>
                </select>
                <div className="w-px bg-[#f0ebe3]" />
                <Input
                  type="number"
                  placeholder="Age"
                  value={filters.ageValue}
                  onChange={(e) => setFilter("ageValue", e.target.value)}
                  className="h-9 border-0 bg-white text-[12px] shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-gray-500">Profession</Label>
              <select
                value={filters.profession}
                onChange={(e) => setFilter("profession", e.target.value)}
                className={`h-9 w-full px-3 text-[12px] ${FIELD_INPUT}`}
              >
                <option value="">All professions</option>
                {uniqueProfessions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-gray-500">Partner name</Label>
              <Input
                value={filters.partnerName}
                onChange={(e) => setFilter("partnerName", e.target.value)}
                placeholder="Referral partner..."
                className={`h-9 text-[12px] ${FIELD_INPUT}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-gray-500">Referral code</Label>
              <Input
                value={filters.referralPartnerId}
                onChange={(e) => setFilter("referralPartnerId", e.target.value)}
                placeholder="Partner ID..."
                className={`h-9 text-[12px] ${FIELD_INPUT}`}
              />
            </div>
          </div>
        </div>

        <div className="border-b border-[#c5d4e4] bg-[#e8eef5] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { id: "active" as const, label: "Active profiles", count: activeProfiles.length },
              { id: "married" as const, label: "Married profiles", count: marriedProfiles.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  setCurrentPage(1)
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#1F4068] text-white shadow-sm"
                    : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
                }`}
              >
                {tab.id === "married" && <HeartHandshake className="h-3.5 w-3.5" />}
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
            <div className="border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
              <h2 className="font-display text-base font-semibold text-[#1F4068]">
                {activeTab === "active" ? "Active profiles" : "Married profiles"}
              </h2>
              <p className="text-[11px] text-gray-500">
                {visibleProfiles.length === 0
                  ? "No profiles in this view"
                  : totalPages > 1
                    ? `Showing ${rangeStart}–${rangeEnd} of ${visibleProfiles.length} profiles`
                    : `${visibleProfiles.length} profile${visibleProfiles.length !== 1 ? "s" : ""} in this view`}
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
                <p className="text-[12px] text-gray-500">Loading profiles...</p>
              </div>
            ) : visibleProfiles.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-[13px] font-medium text-[#1F4068]">No profiles found</p>
                <p className="mt-1 text-[12px] text-gray-500">
                  {hasFilters
                    ? "Try adjusting your filters."
                    : activeTab === "active"
                      ? "No active profiles in this view."
                      : "No married profiles in this view."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                      {(activeTab === "active"
                        ? ["Member", "Phone", "Age", "Profession", "Partner", "Code", "Plan", "Actions"]
                        : ["Member", "Phone", "Age", "Profession", "Partner", "Code", "Plan"]
                      ).map((head) => (
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
                    {paginatedProfiles.map((profile) => (
                      <tr
                        key={profile.user_id}
                        className="cursor-pointer border-b border-[#f0ebe3]/80 hover:bg-[#faf8f4]/60"
                        onClick={() => router.push(`/admin/dashboard/profiles/${profile.user_id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F4068]/10 text-[12px] font-semibold text-[#1F4068]">
                              {(profile.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-[#1F4068]">
                                {profile.name || "Unknown"}
                              </p>
                              {activeTab === "married" && (
                                <span className="mt-0.5 inline-flex rounded-full bg-[#e6f7f5] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#3bb9ac]">
                                  Married
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{profile.phone}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{profile.age || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{profile.profession}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{profile.partnerName}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                          {profile.referralPartnerId || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {getPremiumBadge(
                            profile.isPremium,
                            profile.premiumPlan,
                            profile.premiumExpiresAt
                          )}
                        </td>
                        {activeTab === "active" && (
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconActionButton
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedProfileForMarriage(profile.user_id)
                                }}
                                icon={HeartHandshake}
                                title="Mark as married"
                                tone="teal"
                              />
                              <IconActionButton
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openManageSubscription(profile.user_id, profile.premiumPlan)
                                }}
                                icon={Star}
                                title="Manage subscription"
                                tone="gold"
                                disabled={isUpdatingPremium === profile.user_id}
                              />
                              <IconActionButton
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/admin/dashboard/profiles/${profile.user_id}`)
                                }}
                                icon={Eye}
                                title="View profile"
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && visibleProfiles.length > 0 && totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-[#f0ebe3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-[11px] text-gray-500">
                  Page {page} of {totalPages} · {visibleProfiles.length} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 rounded-lg border-[#f0ebe3] bg-white px-2.5 text-[11px] text-[#1F4068] hover:bg-[#faf8f4] disabled:opacity-50"
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 rounded-lg border-[#f0ebe3] bg-white px-2.5 text-[11px] text-[#1F4068] hover:bg-[#faf8f4] disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ThemedPanel>

      <AlertDialog
        open={!!selectedProfileForMarriage}
        onOpenChange={(open) => !open && setSelectedProfileForMarriage(null)}
      >
        <AlertDialogContent className={DIALOG_CONTENT}>
          <AlertDialogHeader>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f7f5]">
              <AlertTriangle className="h-5 w-5 text-[#3bb9ac]" />
            </div>
            <AlertDialogTitle className={`text-center ${DIALOG_TITLE}`}>
              Confirm marriage status
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[12px] text-gray-500">
              Mark this profile as married? They will be removed from the active matching pool and
              moved to the married profiles tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-center">
            <AlertDialogCancel className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkAsMarried}
              className="rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]"
            >
              Yes, mark as married
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isManageSubOpen} onOpenChange={setIsManageSubOpen}>
        <DialogContent className={`${DIALOG_CONTENT} sm:max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${DIALOG_TITLE}`}>
              <Crown className="h-4 w-4 text-[#c9a227]" />
              Manage subscription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#1F4068]">Plan tier</Label>
              <select
                value={subPlan}
                onChange={(e) => setSubPlan(e.target.value)}
                className={`h-9 w-full px-3 text-[12px] ${FIELD_INPUT}`}
              >
                <option value="none">Free (revoke premium)</option>
                <option value="prime">Prime (₹2,000)</option>
                <option value="prime_gold">Prime Gold (₹6,000)</option>
                <option value="elite">Elite (₹10,000)</option>
                <option value="till_you_marry">Till You Marry (₹10,000)</option>
              </select>
            </div>

            {subPlan !== "none" && subPlan !== "till_you_marry" && (
              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#1F4068]">Duration</Label>
                <select
                  value={subDuration}
                  onChange={(e) => setSubDuration(e.target.value)}
                  className={`h-9 w-full px-3 text-[12px] ${FIELD_INPUT}`}
                >
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">1 year</option>
                  <option value="lifetime">Lifetime access</option>
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 border-t border-[#f0ebe3] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManageSubOpen(false)}
              className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveSubscription}
              className="rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
