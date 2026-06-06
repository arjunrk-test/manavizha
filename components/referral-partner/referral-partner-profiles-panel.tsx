"use client"

import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  HeartHandshake,
  Search,
  SlidersHorizontal,
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
  sex: string
  profession: string
  zodiac: string
  star: string
}

const EMPTY_FILTERS: Filters = {
  name: "",
  phone: "",
  ageOp: "=",
  ageValue: "",
  sex: "",
  profession: "",
  zodiac: "",
  star: "",
}

const FIELD_INPUT =
  "rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] placeholder:text-gray-400"
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
}: {
  onClick: (e: React.MouseEvent) => void
  icon: React.ComponentType<{ className?: string }>
  title: string
  tone?: "default" | "teal"
}) {
  const styles = {
    default:
      "border-[#f0ebe3] bg-white text-[#1F4068] hover:border-[#c9a227]/40 hover:bg-[#fdf6e3]",
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
      className={`h-8 w-8 shrink-0 rounded-lg p-0 ${styles[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  )
}

export function ReferralPartnerProfilesPanel({ genderFilter }: { genderFilter: string | null }) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"active" | "married">("active")
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selectedProfileForMarriage, setSelectedProfileForMarriage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, filters, genderFilter])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/referral-partner")
        return
      }

      const { data: partnerData, error } = await supabase
        .from("referral_partners")
        .select("partner_id")
        .eq("user_id", user.id)
        .single()

      if (error || !partnerData) {
        await supabase.auth.signOut()
        router.push("/referral-partner")
        return
      }

      await fetchProfiles(partnerData.partner_id)
      setIsLoading(false)
    }
    init()
  }, [router, genderFilter])

  const fetchProfiles = async (pid: string) => {
    const { data: referralData } = await supabase
      .from("referral_details")
      .select("user_id")
      .eq("referral_partner_id", pid)

    if (!referralData || referralData.length === 0) {
      setAllProfiles([])
      return
    }

    const userIds = referralData.map((r: { user_id: string }) => r.user_id).filter(Boolean)

    let query = supabase
      .from("personal_details")
      .select("user_id, name, age, sex, marital_status")
      .in("user_id", userIds)
    if (genderFilter) query = query.ilike("sex", genderFilter)

    const { data: personalData } = await query
    if (!personalData || personalData.length === 0) {
      setAllProfiles([])
      return
    }

    const filteredIds = personalData.map((p: { user_id: string }) => p.user_id)

    const [{ data: contactData }, { data: horoData }, empRes, busRes, stuRes] = await Promise.all([
      supabase.from("contact_details").select("user_id, phone").in("user_id", filteredIds),
      supabase.from("horoscope_details").select("user_id, zodiac_sign, star").in("user_id", filteredIds),
      supabase.from("profession_employee").select("user_id, sector, company, designation").in("user_id", filteredIds),
      supabase.from("profession_business").select("user_id, business_name").in("user_id", filteredIds),
      supabase.from("profession_student").select("user_id, course").in("user_id", filteredIds),
    ])

    const contactMap: Record<string, string> = {}
    contactData?.forEach((c) => {
      contactMap[c.user_id] = c.phone || ""
    })

    const horoMap: Record<string, { zodiac: string; star: string }> = {}
    horoData?.forEach((h) => {
      horoMap[h.user_id] = { zodiac: h.zodiac_sign || "—", star: h.star || "—" }
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
      personalData.map((p: any) => ({
        ...p,
        phone: contactMap[p.user_id] || "N/A",
        profession: profMap[p.user_id] || "—",
        zodiac: horoMap[p.user_id]?.zodiac || "—",
        star: horoMap[p.user_id]?.star || "—",
      }))
    )
  }

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "ageOp") return value !== "="
    return value !== ""
  })

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.name) count++
    if (filters.phone) count++
    if (filters.ageValue) count++
    if (filters.sex) count++
    if (filters.profession) count++
    if (filters.zodiac) count++
    if (filters.star) count++
    return count
  }, [filters])

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
        (!filters.sex || (p.sex || "").toLowerCase() === filters.sex.toLowerCase()) &&
        (!filters.profession ||
          (p.profession || "").toLowerCase().includes(filters.profession.toLowerCase())) &&
        (!filters.zodiac || (p.zodiac || "") === filters.zodiac) &&
        (!filters.star || (p.star || "") === filters.star)
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

  const uniqueZodiacs = Array.from(
    new Set(allProfiles.map((p) => p.zodiac).filter((z) => z && z !== "—"))
  ).sort() as string[]
  const uniqueStars = Array.from(
    new Set(allProfiles.map((p) => p.star).filter((s) => s && s !== "—"))
  ).sort() as string[]
  const uniqueProfessions = Array.from(
    new Set(allProfiles.map((p) => p.profession).filter((p) => p && p !== "—"))
  ).sort() as string[]

  const title =
    genderFilter === "Male"
      ? "Men profiles"
      : genderFilter === "Female"
        ? "Women profiles"
        : "All referred profiles"

  const buildGenderHref = (gender: string | null) => {
    const params = new URLSearchParams()
    if (gender) params.set("gender", gender)
    const qs = params.toString()
    return `/referral-partner/profiles${qs ? `?${qs}` : ""}`
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

  return (
    <>
      <ThemedPanel>
        <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
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
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
                  Referrals
                </p>
                <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                  {title}
                </h1>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Profiles referred through your partner ID
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:justify-end shrink-0">
              {[
                { label: "Total", value: allProfiles.length },
                {
                  label: "Showing",
                  value: filteredProfiles.length,
                  sub: hasFilters ? "filtered" : undefined,
                },
                { label: "Active", value: activeProfiles.length },
                { label: "Married", value: marriedProfiles.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-[#f0ebe3] bg-white/80 px-2 py-1 text-center min-w-[3.25rem]"
                >
                  <p className="text-[8px] font-medium uppercase tracking-wide text-gray-500 leading-none">
                    {stat.label}
                  </p>
                  <p className="font-display text-sm font-semibold text-[#1F4068] leading-tight mt-0.5">
                    {stat.value}
                  </p>
                  {stat.sub && (
                    <p className="text-[8px] text-[#3bb9ac] leading-none mt-0.5">{stat.sub}</p>
                  )}
                </div>
              ))}
              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="h-7 rounded-md border-red-200 bg-white px-2 text-[11px] text-red-600 hover:bg-red-50"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-[#c5d4e4] bg-[#e8eef5] px-4 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All", gender: null },
                { label: "Men", gender: "Male" },
                { label: "Women", gender: "Female" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(buildGenderHref(item.gender))}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                    (genderFilter || null) === item.gender
                      ? "bg-[#1F4068] text-white shadow-sm"
                      : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "active" as const, label: "Active", count: activeProfiles.length },
                { id: "married" as const, label: "Married", count: marriedProfiles.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#1F4068] text-white shadow-sm"
                      : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
                  }`}
                >
                  {tab.id === "married" && <HeartHandshake className="h-3 w-3" />}
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b border-[#f0ebe3]/80 px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={filters.name}
                onChange={(e) => setFilter("name", e.target.value)}
                placeholder="Search by name..."
                className={`h-8 pl-8 text-[12px] ${FIELD_INPUT}`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersOpen(true)}
              className="h-8 shrink-0 rounded-lg border-[#f0ebe3] bg-white px-2.5 text-[11px] text-[#1F4068] hover:bg-[#faf8f4]"
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1F4068] px-1 text-[9px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="h-8 shrink-0 rounded-lg border-red-200 bg-white px-2 text-[11px] text-red-600 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <DialogContent className="max-w-lg rounded-xl border border-[#f0ebe3] bg-[#faf8f4] text-[#1F4068] p-0 gap-0 overflow-hidden">
            <DialogHeader className="border-b border-[#f0ebe3] px-5 py-4 text-left">
              <DialogTitle className="font-display text-base font-semibold text-[#1F4068]">
                Filter profiles
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2 max-h-[min(70vh,28rem)] overflow-y-auto">
              <div className="space-y-1.5 sm:col-span-2">
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
                <Label className="text-[11px] text-gray-500">Gender</Label>
                <select
                  value={filters.sex}
                  onChange={(e) => setFilter("sex", e.target.value)}
                  className={`h-9 w-full px-3 text-[12px] ${FIELD_INPUT}`}
                >
                  <option value="">All genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
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
                <Label className="text-[11px] text-gray-500">Zodiac</Label>
                <select
                  value={filters.zodiac}
                  onChange={(e) => setFilter("zodiac", e.target.value)}
                  className={`h-9 w-full px-3 text-[12px] ${FIELD_INPUT}`}
                >
                  <option value="">All zodiacs</option>
                  {uniqueZodiacs.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[11px] text-gray-500">Star</Label>
                <select
                  value={filters.star}
                  onChange={(e) => setFilter("star", e.target.value)}
                  className={`h-9 w-full px-3 text-[12px] ${FIELD_INPUT}`}
                >
                  <option value="">All stars</option>
                  {uniqueStars.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="border-t border-[#f0ebe3] px-5 py-3 flex-row gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFilters(EMPTY_FILTERS)}
                disabled={!hasFilters}
                className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
              >
                Clear all
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsFiltersOpen(false)}
                className="rounded-lg bg-[#1F4068] text-white hover:bg-[#1F4068]/90"
              >
                Apply filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                      ? "No active referrals yet."
                      : "No married profiles in this view."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                      {(activeTab === "active"
                        ? [
                            "Member",
                            "Phone",
                            "Age",
                            "Gender",
                            "Profession",
                            "Zodiac",
                            "Star",
                            "Actions",
                          ]
                        : ["Member", "Phone", "Age", "Gender", "Profession", "Zodiac", "Star"]
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
                        onClick={() => router.push(`/referral-partner/profiles/${profile.user_id}`)}
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
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              profile.sex?.toLowerCase().includes("female")
                                ? "bg-[#fce8ef] text-[#e87898]"
                                : "bg-[#e6f7f5] text-[#1F4068]"
                            }`}
                          >
                            {profile.sex || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{profile.profession}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{profile.zodiac}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{profile.star}</td>
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
                                  router.push(`/referral-partner/profiles/${profile.user_id}`)
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
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
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
        <AlertDialogContent className="rounded-xl border border-[#f0ebe3] bg-white text-[#1F4068] shadow-xl max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f7f5]">
              <AlertTriangle className="h-6 w-6 text-[#3bb9ac]" />
            </div>
            <AlertDialogTitle className="text-center font-display text-lg">
              Confirm marriage status
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-gray-600">
              Mark this profile as married? They will move to the Married profiles tab and no longer
              count toward active referral metrics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:justify-center">
            <AlertDialogCancel className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkAsMarried}
              className="rounded-lg bg-[#3bb9ac] text-white hover:bg-[#2fa085]"
            >
              Yes, mark as married
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
