"use client"

import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { supabase } from "@/lib/supabase"
import { useCallback, useEffect, useState } from "react"
import {
  BarChart3,
  Crown,
  Download,
  Filter,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const CHART_COLORS = ["#1F4068", "#e87898", "#c9a227", "#3bb9ac", "#c97a7a", "#8b9dc3"]

const PLAN_LABELS: Record<string, string> = {
  elite: "Elite",
  prime_gold: "Gold",
  prime: "Prime",
  "3_months": "Prime (3 mo)",
  till_you_marry: "Lifetime",
  none: "Free",
}

type ChartExportKey =
  | "gender"
  | "profileStatus"
  | "stages"
  | "plans"
  | "verification"
  | "topPartners"

type DateRange = { from: string; to: string }

const DATE_INPUT =
  "h-8 rounded-lg border border-[#f0ebe3] bg-white px-2 text-[11px] text-[#1F4068] outline-none focus:border-[#c9a227]/50"

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getDefaultDateRange(): DateRange {
  const to = new Date()
  return { from: "2025-01-01", to: formatDateInput(to) }
}

function getInitialDateRanges(): Record<ChartExportKey, DateRange> {
  const defaults = getDefaultDateRange()
  return {
    gender: { ...defaults },
    profileStatus: { ...defaults },
    stages: { ...defaults },
    plans: { ...defaults },
    verification: { ...defaults },
    topPartners: { ...defaults },
  }
}

function dateRangeBounds(from: string, to: string) {
  if (!from || !to) throw new Error("Select both from and to dates")
  if (from > to) throw new Error("From date must be on or before to date")
  return {
    fromISO: `${from}T00:00:00.000Z`,
    toISO: `${to}T23:59:59.999Z`,
  }
}

function downloadCsv(filename: string, headers: string[], rows: Record<string, string | number>[]) {
  const escape = (value: string | number) => {
    const s = String(value ?? "")
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
  ]
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function isActiveProfile(maritalStatus: string | null | undefined) {
  return (maritalStatus || "").toLowerCase() !== "married"
}

function formatRangeLabel(from: string, to: string) {
  if (!from || !to) return ""
  const fmt = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  return `${fmt(from)} – ${fmt(to)}`
}

function verificationStatusLabel(status: string | null | undefined) {
  if (status === "pending") return "Pending"
  if (status === "approved") return "Approved"
  if (status === "rejected") return "Rejected"
  if (!status) return "Unknown"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

type ChartViewData = {
  gender: { name: string; value: number }[]
  profileStatus: { name: string; value: number }[]
  stages: { stage: string; count: number }[]
  plans: { plan: string; count: number }[]
  verification: { status: string; count: number }[]
  topPartners: { partner: string; count: number }[]
}

type SummaryStats = {
  totalActive: number
  men: number
  women: number
  married: number
  pendingVerifications: number
  premiumMembers: number
}

const EMPTY_SUMMARY: SummaryStats = {
  totalActive: 0,
  men: 0,
  women: 0,
  married: 0,
  pendingVerifications: 0,
  premiumMembers: 0,
}

const EMPTY_CHART_DATA: ChartViewData = {
  gender: [],
  profileStatus: [],
  stages: [],
  plans: [],
  verification: [],
  topPartners: [],
}

function genderLabel(sex: string | null | undefined) {
  if (!sex) return "Unknown"
  const lower = sex.toLowerCase()
  if (lower.includes("female")) return "Women"
  if (lower.includes("male")) return "Men"
  return sex
}

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function ChartExportToolbar({
  from,
  to,
  appliedFrom,
  appliedTo,
  onFromChange,
  onToChange,
  onApply,
  onDownload,
  isApplying,
  isDownloading,
}: {
  from: string
  to: string
  appliedFrom: string
  appliedTo: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onApply: () => void
  onDownload: () => void
  isApplying: boolean
  isDownloading: boolean
}) {
  const isDirty = from !== appliedFrom || to !== appliedTo

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-end justify-end gap-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-400">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className={DATE_INPUT}
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9px] font-medium uppercase tracking-wide text-gray-400">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className={DATE_INPUT}
          />
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onApply}
          disabled={isApplying || isDownloading}
          className="h-8 rounded-lg border-[#c9a227]/40 bg-[#fdf6e3]/50 px-2.5 text-[11px] text-[#1F4068] hover:bg-[#fdf6e3]"
        >
          <Filter className={`mr-1.5 h-3.5 w-3.5 ${isApplying ? "animate-pulse" : ""}`} />
          Apply filter
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={isApplying || isDownloading}
          className="h-8 rounded-lg border-[#f0ebe3] bg-white px-2.5 text-[11px] text-[#1F4068] hover:bg-[#faf8f4]"
        >
          <Download className={`mr-1.5 h-3.5 w-3.5 ${isDownloading ? "animate-pulse" : ""}`} />
          Download data
        </Button>
      </div>
      <p className="text-[10px] text-gray-500">
        {isDirty ? (
          <span className="text-[#c9a227]">Unapplied changes — click Apply filter to update chart</span>
        ) : (
          <>Showing {formatRangeLabel(appliedFrom, appliedTo)}</>
        )}
      </p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  draftRange,
  appliedRange,
  onDraftFromChange,
  onDraftToChange,
  onApplyFilter,
  onExportDownload,
  isApplying,
  isExporting,
  isChartLoading,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  draftRange: DateRange
  appliedRange: DateRange
  onDraftFromChange: (value: string) => void
  onDraftToChange: (value: string) => void
  onApplyFilter: () => void
  onExportDownload: () => void
  isApplying: boolean
  isExporting: boolean
  isChartLoading: boolean
}) {
  return (
    <div className={`rounded-xl border border-[#f0ebe3] bg-white/85 p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-[#1F4068]">{title}</p>
          {subtitle && <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p>}
        </div>
        <ChartExportToolbar
          from={draftRange.from}
          to={draftRange.to}
          appliedFrom={appliedRange.from}
          appliedTo={appliedRange.to}
          onFromChange={onDraftFromChange}
          onToChange={onDraftToChange}
          onApply={onApplyFilter}
          onDownload={onExportDownload}
          isApplying={isApplying}
          isDownloading={isExporting}
        />
      </div>
      {isChartLoading ? (
        <div className="flex h-[220px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
        </div>
      ) : (
        children
      )}
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#f0ebe3] bg-white px-3 py-2 text-[11px] shadow-md">
      {label && <p className="mb-1 font-semibold text-[#1F4068]">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="text-gray-600">
          <span className="font-medium text-[#1F4068]">{entry.name}:</span> {entry.value}
        </p>
      ))}
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-[12px] text-gray-400">
      {message}
    </div>
  )
}

async function fetchStageCounts(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const stageDefs = [
    { stage: "Personal", table: "personal_details" },
    { stage: "Contact", table: "contact_details" },
    { stage: "Education", table: "education_details" },
    { stage: "Professional", table: "profession_employee", isProfession: true },
    { stage: "Family", table: "family_details" },
    { stage: "Horoscope", table: "horoscope_details" },
    { stage: "Interests", table: "interests" },
    { stage: "Social", table: "social_habits" },
    { stage: "Photos", table: "photos" },
  ]

  const counts = await Promise.all(
    stageDefs.map(async (def) => {
      if (def.isProfession) {
        const [empRes, busRes, stuRes] = await Promise.all([
          supabase
            .from("profession_employee")
            .select("user_id")
            .gte("created_at", fromISO)
            .lte("created_at", toISO),
          supabase
            .from("profession_business")
            .select("user_id")
            .gte("created_at", fromISO)
            .lte("created_at", toISO),
          supabase
            .from("profession_student")
            .select("user_id")
            .gte("created_at", fromISO)
            .lte("created_at", toISO),
        ])
        if (empRes.error) throw empRes.error
        if (busRes.error) throw busRes.error
        if (stuRes.error) throw stuRes.error
        return {
          stage: def.stage,
          count: new Set([
            ...(empRes.data || []).map((r) => r.user_id),
            ...(busRes.data || []).map((r) => r.user_id),
            ...(stuRes.data || []).map((r) => r.user_id),
          ]).size,
        }
      }
      const { data, error } = await supabase
        .from(def.table)
        .select("user_id")
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
      if (error) throw error
      return { stage: def.stage, count: data ? new Set(data.map((r) => r.user_id)).size : 0 }
    })
  )

  return counts
}

async function loadGenderChart(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const { data, error } = await supabase
    .from("personal_details")
    .select("sex, marital_status")
    .gte("created_at", fromISO)
    .lte("created_at", toISO)
  if (error) throw error

  const activeProfiles = (data || []).filter((p) => isActiveProfile(p.marital_status))
  const men = activeProfiles.filter(
    (p) =>
      p.sex &&
      p.sex.toLowerCase().includes("male") &&
      !p.sex.toLowerCase().includes("female")
  ).length
  const women = activeProfiles.filter(
    (p) => p.sex && p.sex.toLowerCase().includes("female")
  ).length

  return [
    { name: "Men", value: men },
    { name: "Women", value: women },
  ].filter((d) => d.value > 0)
}

async function loadProfileStatusChart(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const { data, error } = await supabase
    .from("personal_details")
    .select("marital_status")
    .gte("created_at", fromISO)
    .lte("created_at", toISO)
  if (error) throw error

  const activeCount = (data || []).filter((p) => isActiveProfile(p.marital_status)).length
  const marriedCount = (data || []).length - activeCount

  return [
    { name: "Active", value: activeCount },
    { name: "Married", value: marriedCount },
  ].filter((d) => d.value > 0)
}

async function loadPlansChart(from: string, to: string) {
  dateRangeBounds(from, to)
  const fromTime = new Date(`${from}T00:00:00`).getTime()
  const toTime = new Date(`${to}T23:59:59.999`).getTime()

  const { data, error } = await supabase
    .from("user_settings")
    .select("is_premium, premium_plan, created_at, updated_at")
  if (error) throw error

  const planCounts: Record<string, number> = {}
  for (const s of data || []) {
    const dateStr = s.updated_at || s.created_at
    if (!dateStr) continue
    const t = new Date(dateStr).getTime()
    if (t < fromTime || t > toTime) continue
    const key = s.is_premium ? s.premium_plan || "unknown" : "none"
    planCounts[key] = (planCounts[key] || 0) + 1
  }

  return Object.entries(planCounts)
    .map(([plan, count]) => ({ plan: PLAN_LABELS[plan] || plan, count }))
    .sort((a, b) => b.count - a.count)
}

async function loadVerificationChart(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const { data, error } = await supabase
    .from("photos")
    .select("verification_status")
    .gte("created_at", fromISO)
    .lte("created_at", toISO)
  if (error) throw error

  const verificationCounts: Record<string, number> = {}
  for (const photo of data || []) {
    const label = verificationStatusLabel(photo.verification_status)
    verificationCounts[label] = (verificationCounts[label] || 0) + 1
  }

  return Object.entries(verificationCounts).map(([status, count]) => ({ status, count }))
}

async function loadTopPartnersChart(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const [{ data: referrals, error: refError }, { data: partners, error: partnerError }] =
    await Promise.all([
      supabase
        .from("referral_details")
        .select("referral_partner_id")
        .gte("created_at", fromISO)
        .lte("created_at", toISO),
      supabase.from("referral_partners").select("partner_id, name"),
    ])
  if (refError) throw refError
  if (partnerError) throw partnerError

  const partnerNameMap = new Map(
    (partners || []).map((p) => [p.partner_id, p.name || p.partner_id])
  )
  const partnerCounts: Record<string, number> = {}
  for (const ref of referrals || []) {
    if (!ref.referral_partner_id) continue
    partnerCounts[ref.referral_partner_id] =
      (partnerCounts[ref.referral_partner_id] || 0) + 1
  }

  return Object.entries(partnerCounts)
    .map(([id, count]) => ({ partner: partnerNameMap.get(id) || id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

async function loadSummaryStats() {
  const [profilesRes, pendingVerRes, settingsRes] = await Promise.all([
    supabase.from("personal_details").select("sex, marital_status"),
    supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending"),
    supabase.from("user_settings").select("is_premium"),
  ])

  if (profilesRes.error) throw profilesRes.error
  if (settingsRes.error) throw settingsRes.error

  const profiles = profilesRes.data || []
  const activeProfiles = profiles.filter((p) => isActiveProfile(p.marital_status))
  const men = activeProfiles.filter(
    (p) =>
      p.sex &&
      p.sex.toLowerCase().includes("male") &&
      !p.sex.toLowerCase().includes("female")
  ).length
  const women = activeProfiles.filter(
    (p) => p.sex && p.sex.toLowerCase().includes("female")
  ).length

  return {
    totalActive: activeProfiles.length,
    men,
    women,
    married: profiles.length - activeProfiles.length,
    pendingVerifications: pendingVerRes.count || 0,
    premiumMembers: (settingsRes.data || []).filter((s) => s.is_premium).length,
  }
}

async function loadChartData(key: ChartExportKey, range: DateRange): Promise<Partial<ChartViewData>> {
  switch (key) {
    case "gender":
      return { gender: await loadGenderChart(range.from, range.to) }
    case "profileStatus":
      return { profileStatus: await loadProfileStatusChart(range.from, range.to) }
    case "stages":
      return { stages: await fetchStageCounts(range.from, range.to) }
    case "plans":
      return { plans: await loadPlansChart(range.from, range.to) }
    case "verification":
      return { verification: await loadVerificationChart(range.from, range.to) }
    case "topPartners":
      return { topPartners: await loadTopPartnersChart(range.from, range.to) }
  }
}

async function exportGenderData(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const { data, error } = await supabase
    .from("personal_details")
    .select("user_id, name, sex, marital_status, created_at")
    .gte("created_at", fromISO)
    .lte("created_at", toISO)

  if (error) throw error

  const rows = (data || [])
    .filter((p) => isActiveProfile(p.marital_status))
    .map((p) => ({
      user_id: p.user_id,
      name: p.name || "",
      sex: p.sex || "",
      gender_category: genderLabel(p.sex),
      marital_status: p.marital_status || "",
      created_at: p.created_at || "",
    }))

  downloadCsv(`gender-split_${from}_to_${to}.csv`, [
    "user_id",
    "name",
    "sex",
    "gender_category",
    "marital_status",
    "created_at",
  ], rows)

  return rows.length
}

async function exportProfileStatusData(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const { data, error } = await supabase
    .from("personal_details")
    .select("user_id, name, sex, marital_status, created_at")
    .gte("created_at", fromISO)
    .lte("created_at", toISO)

  if (error) throw error

  const rows = (data || []).map((p) => ({
    user_id: p.user_id,
    name: p.name || "",
    sex: p.sex || "",
    profile_status: isActiveProfile(p.marital_status) ? "Active" : "Married",
    marital_status: p.marital_status || "",
    created_at: p.created_at || "",
  }))

  downloadCsv(`profile-status_${from}_to_${to}.csv`, [
    "user_id",
    "name",
    "sex",
    "profile_status",
    "marital_status",
    "created_at",
  ], rows)

  return rows.length
}

async function exportStagesData(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const stageDefs = [
    { stage: "Personal", table: "personal_details" },
    { stage: "Contact", table: "contact_details" },
    { stage: "Education", table: "education_details" },
    { stage: "Professional", table: "profession_employee", isProfession: true },
    { stage: "Family", table: "family_details" },
    { stage: "Horoscope", table: "horoscope_details" },
    { stage: "Interests", table: "interests" },
    { stage: "Social", table: "social_habits" },
    { stage: "Photos", table: "photos" },
  ]

  const rows: Record<string, string>[] = []

  for (const def of stageDefs) {
    if (def.isProfession) {
      for (const table of ["profession_employee", "profession_business", "profession_student"]) {
        const { data, error } = await supabase
          .from(table)
          .select("user_id, created_at")
          .gte("created_at", fromISO)
          .lte("created_at", toISO)
        if (error) throw error
        for (const row of data || []) {
          rows.push({
            stage: def.stage,
            source_table: table,
            user_id: row.user_id,
            created_at: row.created_at || "",
          })
        }
      }
      continue
    }

    const { data, error } = await supabase
      .from(def.table)
      .select("user_id, created_at")
      .gte("created_at", fromISO)
      .lte("created_at", toISO)
    if (error) throw error
    for (const row of data || []) {
      rows.push({
        stage: def.stage,
        source_table: def.table,
        user_id: row.user_id,
        created_at: row.created_at || "",
      })
    }
  }

  downloadCsv(`profile-funnel_${from}_to_${to}.csv`, [
    "stage",
    "source_table",
    "user_id",
    "created_at",
  ], rows)

  return rows.length
}

async function exportPlansData(from: string, to: string) {
  dateRangeBounds(from, to)
  const fromTime = new Date(`${from}T00:00:00`).getTime()
  const toTime = new Date(`${to}T23:59:59.999`).getTime()

  const { data, error } = await supabase
    .from("user_settings")
    .select("user_id, is_premium, premium_plan, premium_expires_at, created_at, updated_at")

  if (error) throw error

  const rows = (data || [])
    .filter((s) => {
      const dateStr = s.updated_at || s.created_at
      if (!dateStr) return false
      const t = new Date(dateStr).getTime()
      return t >= fromTime && t <= toTime
    })
    .map((s) => {
      const planKey = s.is_premium ? s.premium_plan || "unknown" : "none"
      return {
        user_id: s.user_id,
        is_premium: s.is_premium ? "Yes" : "No",
        premium_plan: PLAN_LABELS[planKey] || planKey,
        premium_expires_at: s.premium_expires_at || "",
        record_date: s.updated_at || s.created_at || "",
      }
    })

  downloadCsv(`membership-plans_${from}_to_${to}.csv`, [
    "user_id",
    "is_premium",
    "premium_plan",
    "premium_expires_at",
    "record_date",
  ], rows)

  return rows.length
}

async function exportVerificationData(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const { data, error } = await supabase
    .from("photos")
    .select("user_id, verification_status, created_at")
    .gte("created_at", fromISO)
    .lte("created_at", toISO)

  if (error) throw error

  const rows = (data || []).map((p) => ({
    user_id: p.user_id,
    verification_status: p.verification_status || "",
    created_at: p.created_at || "",
  }))

  downloadCsv(`photo-verification_${from}_to_${to}.csv`, [
    "user_id",
    "verification_status",
    "created_at",
  ], rows)

  return rows.length
}

async function exportTopPartnersData(from: string, to: string) {
  const { fromISO, toISO } = dateRangeBounds(from, to)
  const [{ data: referrals, error: refError }, { data: partners, error: partnerError }] =
    await Promise.all([
      supabase
        .from("referral_details")
        .select("user_id, referral_partner_id, created_at")
        .gte("created_at", fromISO)
        .lte("created_at", toISO),
      supabase.from("referral_partners").select("partner_id, name"),
    ])

  if (refError) throw refError
  if (partnerError) throw partnerError

  const partnerNameMap = new Map(
    (partners || []).map((p) => [p.partner_id, p.name || p.partner_id])
  )

  const rows = (referrals || []).map((r) => ({
    referral_partner_id: r.referral_partner_id || "",
    partner_name: partnerNameMap.get(r.referral_partner_id) || r.referral_partner_id || "",
    user_id: r.user_id,
    created_at: r.created_at || "",
  }))

  downloadCsv(`referral-partners_${from}_to_${to}.csv`, [
    "referral_partner_id",
    "partner_name",
    "user_id",
    "created_at",
  ], rows)

  return rows.length
}

const EXPORT_HANDLERS: Record<ChartExportKey, (from: string, to: string) => Promise<number>> = {
  gender: exportGenderData,
  profileStatus: exportProfileStatusData,
  stages: exportStagesData,
  plans: exportPlansData,
  verification: exportVerificationData,
  topPartners: exportTopPartnersData,
}

export function AdminAnalyticsPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [summary, setSummary] = useState<SummaryStats>(EMPTY_SUMMARY)
  const [chartData, setChartData] = useState<ChartViewData>(EMPTY_CHART_DATA)
  const [draftRanges, setDraftRanges] = useState(getInitialDateRanges)
  const [appliedRanges, setAppliedRanges] = useState(getInitialDateRanges)
  const [exportingChart, setExportingChart] = useState<ChartExportKey | null>(null)
  const [applyingChart, setApplyingChart] = useState<ChartExportKey | null>(null)
  const [loadingCharts, setLoadingCharts] = useState<Record<ChartExportKey, boolean>>({
    gender: false,
    profileStatus: false,
    stages: false,
    plans: false,
    verification: false,
    topPartners: false,
  })

  const updateDraftRange = (key: ChartExportKey, field: keyof DateRange, value: string) => {
    setDraftRanges((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const loadChart = useCallback(async (key: ChartExportKey, range: DateRange) => {
    setLoadingCharts((prev) => ({ ...prev, [key]: true }))
    try {
      const slice = await loadChartData(key, range)
      setChartData((prev) => ({ ...prev, ...slice }))
    } catch (err) {
      console.error(`Error loading ${key} chart:`, err)
      throw err
    } finally {
      setLoadingCharts((prev) => ({ ...prev, [key]: false }))
    }
  }, [])

  const loadAllCharts = useCallback(
    async (ranges: Record<ChartExportKey, DateRange>) => {
      const keys: ChartExportKey[] = [
        "gender",
        "profileStatus",
        "stages",
        "plans",
        "verification",
        "topPartners",
      ]
      await Promise.all(keys.map((key) => loadChart(key, ranges[key])))
    },
    [loadChart]
  )

  const fetchAnalytics = useCallback(
    async (silent = false) => {
      if (silent) setIsRefreshing(true)
      else setIsLoading(true)

      try {
        const stats = await loadSummaryStats()
        setSummary(stats)
        await loadAllCharts(appliedRanges)
      } catch (err) {
        console.error("Error fetching analytics:", err)
        toast.error("Failed to load analytics")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [appliedRanges, loadAllCharts]
  )

  useEffect(() => {
    fetchAnalytics()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- initial load only

  const handleApplyFilter = async (key: ChartExportKey) => {
    const range = draftRanges[key]
    try {
      dateRangeBounds(range.from, range.to)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid date range")
      return
    }

    setApplyingChart(key)
    setAppliedRanges((prev) => ({ ...prev, [key]: { ...range } }))
    try {
      await loadChart(key, range)
      toast.success(`Updated ${formatRangeLabel(range.from, range.to)}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to apply filter")
    } finally {
      setApplyingChart(null)
    }
  }

  const handleExport = async (key: ChartExportKey) => {
    const range = draftRanges[key]
    setExportingChart(key)
    try {
      dateRangeBounds(range.from, range.to)
      const count = await EXPORT_HANDLERS[key](range.from, range.to)
      toast.success(`Downloaded ${count} row${count !== 1 ? "s" : ""}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to export data"
      toast.error(message)
    } finally {
      setExportingChart(null)
    }
  }

  const chartControlProps = (key: ChartExportKey) => ({
    draftRange: draftRanges[key],
    appliedRange: appliedRanges[key],
    onDraftFromChange: (value: string) => updateDraftRange(key, "from", value),
    onDraftToChange: (value: string) => updateDraftRange(key, "to", value),
    onApplyFilter: () => handleApplyFilter(key),
    onExportDownload: () => handleExport(key),
    isApplying: applyingChart === key,
    isExporting: exportingChart === key,
    isChartLoading: loadingCharts[key],
  })

  return (
    <ThemedPanel>
      <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf6e3]">
              <BarChart3 className="h-5 w-5 text-[#c9a227]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
                Insights
              </p>
              <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                Platform analytics
              </h1>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Profile, membership, verification, and referral metrics — charts use the date range on each card
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(true)}
              disabled={isRefreshing || isLoading}
              className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
            >
              <RefreshCw className={`mr-1.5 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <p className="col-span-full mb-1 text-[10px] text-gray-400">Summary totals (all time)</p>
          {[
            { label: "Active profiles", value: summary.totalActive, icon: Users },
            { label: "Men", value: summary.men, icon: Users },
            { label: "Women", value: summary.women, icon: Users },
            { label: "Married", value: summary.married, icon: Users },
            { label: "Premium", value: summary.premiumMembers, icon: Crown },
            { label: "Pending ID checks", value: summary.pendingVerifications, icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-[#c9a227]" strokeWidth={1.75} />
                <p className="text-[10px] font-medium text-gray-500">{label}</p>
              </div>
              <p className="font-display text-lg font-semibold text-[#1F4068]">
                {isLoading ? "—" : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              title="Gender split"
              subtitle="Active profiles by gender"
              {...chartControlProps("gender")}
            >
              {chartData.gender.length === 0 ? (
                <EmptyChart message="No data in this date range" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={chartData.gender}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {chartData.gender.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Profile status"
              subtitle="Active vs married members"
              {...chartControlProps("profileStatus")}
            >
              {chartData.profileStatus.length === 0 ? (
                <EmptyChart message="No data in this date range" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={chartData.profileStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {chartData.profileStatus.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Profile completion funnel"
              subtitle="Members who reached each onboarding stage"
              className="lg:col-span-2"
              {...chartControlProps("stages")}
            >
              {chartData.stages.every((s) => s.count === 0) ? (
                <EmptyChart message="No data in this date range" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData.stages} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" vertical={false} />
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={{ stroke: "#f0ebe3" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Members" radius={[6, 6, 0, 0]}>
                      {chartData.stages.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Membership plans"
              subtitle="Distribution across all users"
              {...chartControlProps("plans")}
            >
              {chartData.plans.length === 0 ? (
                <EmptyChart message="No data in this date range" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData.plans}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={{ stroke: "#f0ebe3" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="plan"
                      width={72}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Users" fill="#1F4068" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Photo verification"
              subtitle="Status breakdown across uploaded photos"
              {...chartControlProps("verification")}
            >
              {chartData.verification.length === 0 ? (
                <EmptyChart message="No data in this date range" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={chartData.verification.map((v) => ({
                        name: v.status,
                        value: v.count,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {chartData.verification.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Top referral partners"
              subtitle="Members referred by each partner"
              className="lg:col-span-2"
              {...chartControlProps("topPartners")}
            >
              {chartData.topPartners.length === 0 ? (
                <EmptyChart message="No data in this date range" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData.topPartners}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" vertical={false} />
                    <XAxis
                      dataKey="partner"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={{ stroke: "#f0ebe3" }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Referrals" fill="#c9a227" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        )}
      </div>
    </ThemedPanel>
  )
}
