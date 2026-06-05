"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUserDashboard } from "@/lib/auth"
import {
  Users,
  Database,
  Mail,
  ArrowRight,
  User,
  ShieldCheck,
  Sparkles,
  Heart,
  TrendingUp,
} from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

const STAGE_FUNNEL_KEYS: Record<string, string> = {
  personal_details: "personal",
  contact_details: "contact",
  education_details: "education",
  profession_employee: "professional",
  family_details: "family",
  horoscope_details: "horoscope",
  interests: "interests",
  social_habits: "social",
  photos: "referral",
}

const quickActions = [
  {
    href: "/admin/dashboard/funnel?stage=personal",
    title: "Manage profiles",
    description: "View users who have not completed their profile stages",
    icon: User,
    accent: "teal" as const,
    hoverBorder: "hover:border-[#3bb9ac]/30",
    iconBg: "bg-[#3bb9ac]/10 group-hover:bg-[#3bb9ac]/18",
    iconColor: "text-[#3bb9ac]",
    arrowHover: "group-hover:text-[#3bb9ac]",
  },
  {
    href: "/admin/dashboard/accounts",
    title: "Accounts",
    description: "Manage user accounts, profiles, and access permissions",
    icon: Users,
    accent: "navy" as const,
    hoverBorder: "hover:border-[#1F4068]/25",
    iconBg: "bg-[#1F4068]/8 group-hover:bg-[#1F4068]/14",
    iconColor: "text-[#1F4068]",
    arrowHover: "group-hover:text-[#1F4068]",
  },
  {
    href: "/admin/dashboard/masterdata",
    title: "Master data",
    description: "Access and manage all platform data and configurations",
    icon: Database,
    accent: "gold" as const,
    hoverBorder: "hover:border-[#c9a227]/35",
    iconBg: "bg-[#fdf6e3] group-hover:bg-[#f5ebc8]",
    iconColor: "text-[#c9a227]",
    arrowHover: "group-hover:text-[#c9a227]",
  },
  {
    href: "/admin/dashboard/email",
    title: "Email",
    description: "Manage email templates, campaigns, and communications",
    icon: Mail,
    accent: "rose" as const,
    hoverBorder: "hover:border-[#e87898]/30",
    iconBg: "bg-[#fce8ef] group-hover:bg-[#f9d4df]",
    iconColor: "text-[#e87898]",
    arrowHover: "group-hover:text-[#e87898]",
  },
  {
    href: "/admin/verification",
    title: "Identity verification",
    description: "Review and approve pending identity status for users",
    icon: ShieldCheck,
    accent: "teal" as const,
    hoverBorder: "hover:border-[#3bb9ac]/30",
    iconBg: "bg-[#3bb9ac]/10 group-hover:bg-[#3bb9ac]/18",
    iconColor: "text-[#3bb9ac]",
    arrowHover: "group-hover:text-[#3bb9ac]",
    verification: true,
  },
]

const statCards = [
  {
    href: "/admin/dashboard/profiles",
    label: "Total profiles",
    key: "total" as const,
    icon: Users,
    glow: "bg-[#3bb9ac]/8 group-hover:bg-[#3bb9ac]/14",
    iconWrap: "bg-[#3bb9ac]/12",
    iconColor: "text-[#3bb9ac]",
    orb: "bg-[#3bb9ac]/10",
  },
  {
    href: "/admin/dashboard/profiles?gender=Male",
    label: "Men",
    key: "men" as const,
    icon: User,
    glow: "bg-[#1F4068]/6 group-hover:bg-[#1F4068]/10",
    iconWrap: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    orb: "bg-[#1F4068]/8",
  },
  {
    href: "/admin/dashboard/profiles?gender=Female",
    label: "Women",
    key: "women" as const,
    icon: User,
    glow: "bg-[#e87898]/8 group-hover:bg-[#e87898]/14",
    iconWrap: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    orb: "bg-[#e87898]/10",
  },
]

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="text-3xl sm:text-4xl font-bold text-[#1F4068] tabular-nums"
    >
      {value.toLocaleString()}
    </motion.span>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<{ total: number; men: number; women: number; pendingVerifications: number }>({
    total: 0,
    men: 0,
    women: 0,
    pendingVerifications: 0,
  })
  const [stageStats, setStageStats] = useState([
    { label: "Personal", count: 0, table: "personal_details" },
    { label: "Contact", count: 0, table: "contact_details" },
    { label: "Education", count: 0, table: "education_details" },
    { label: "Professional", count: 0, table: "profession_employee" },
    { label: "Family", count: 0, table: "family_details" },
    { label: "Horoscope", count: 0, table: "horoscope_details" },
    { label: "Interests", count: 0, table: "interests" },
    { label: "Social", count: 0, table: "social_habits" },
    { label: "Photos", count: 0, table: "photos" },
  ])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/admin")
        return
      }

      const dashboardPath = await getUserDashboard(authUser.id)
      if (dashboardPath !== "/admin/dashboard") {
        router.push(dashboardPath)
        return
      }

      setIsLoading(false)
    }

    const fetchStats = async () => {
      const { data: profiles, error } = await supabase
        .from("personal_details")
        .select("sex, marital_status")

      if (!error && profiles) {
        const activeProfiles = profiles.filter(p => (p.marital_status || "").toLowerCase() !== "married")

        const men = activeProfiles.filter(p => p.sex && p.sex.toLowerCase().includes("male") && !p.sex.toLowerCase().includes("female")).length
        const women = activeProfiles.filter(p => p.sex && p.sex.toLowerCase().includes("female")).length

        const { count } = await supabase
          .from("photos")
          .select("*", { count: "exact", head: true })
          .eq("verification_status", "pending")

        setStats({
          total: activeProfiles.length,
          men,
          women,
          pendingVerifications: count || 0,
        })
      }
    }

    const fetchStageStats = async () => {
      const tables = [
        "personal_details",
        "contact_details",
        "education_details",
        "profession_employee",
        "family_details",
        "horoscope_details",
        "interests",
        "social_habits",
        "photos",
      ]

      const counts = await Promise.all(
        tables.map(async (table) => {
          if (table === "profession_employee") {
            const [empRes, busRes, stuRes] = await Promise.all([
              supabase.from("profession_employee").select("user_id"),
              supabase.from("profession_business").select("user_id"),
              supabase.from("profession_student").select("user_id"),
            ])
            const allUserIds = new Set([
              ...(empRes.data || []).map(r => r.user_id),
              ...(busRes.data || []).map(r => r.user_id),
              ...(stuRes.data || []).map(r => r.user_id),
            ])
            return allUserIds.size
          }
          const { data } = await supabase.from(table).select("user_id")
          return data ? new Set(data.map(r => r.user_id)).size : 0
        })
      )

      setStageStats(prev => prev.map((stage, i) => ({ ...stage, count: counts[i] })))
    }

    checkUser()
    fetchStats()
    fetchStageStats()
  }, [router])

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  const completionBase = stats.total || 1

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <AdminNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
          {/* Welcome hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-10 sm:mb-12 overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/75 backdrop-blur-md shadow-[0_20px_60px_rgba(31,64,104,0.1),0_4px_20px_rgba(232,120,152,0.06)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#fce8ef]/40 via-white/20 to-[#e6f7f5]/35 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#c9a227]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#e87898]/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

            <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#fce8ef] bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-[#c9a227]" />
                  Sacred matchmaking · Admin control
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold text-[#1F4068] tracking-tight leading-[1.1] mb-3">
                  Welcome to your
                  <span className="block text-brand-gold">matrimonial command center</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Oversee profiles, verifications, and family journeys — every decision here shapes
                  meaningful connections on Manavizha.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                {stats.pendingVerifications > 0 && (
                  <Link
                    href="/admin/verification"
                    className="group flex items-center gap-3 rounded-xl border border-[#e87898]/30 bg-gradient-to-r from-[#fce8ef]/80 to-white/90 px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-[#e87898]/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e87898] text-white shrink-0">
                      <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1F4068]">
                        {stats.pendingVerifications} verification{stats.pendingVerifications !== 1 ? "s" : ""} awaiting
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-[#e87898] transition-colors flex items-center gap-1">
                        Review now <ArrowRight className="h-3 w-3" />
                      </p>
                    </div>
                  </Link>
                )}
                <div className="flex items-center gap-3 rounded-xl border border-gray-100/90 bg-white/70 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf6e3] shrink-0">
                    <Heart className="h-5 w-5 text-[#e87898] fill-[#fce8ef]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Active profiles</p>
                    <p className="text-lg font-bold text-[#1F4068]">{stats.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Profile statistics */}
          <section className="mb-10 sm:mb-12">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1">
                  Community snapshot
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#1F4068]">
                  Profile statistics
                </h2>
              </div>
              <TrendingUp className="h-5 w-5 text-[#3bb9ac]/60 hidden sm:block" strokeWidth={1.75} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {statCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.08 + index * 0.06 }}
                  >
                    <Link href={card.href} className="block group">
                      <div className="admin-dashboard-card-shine relative rounded-2xl border border-white/90 bg-white/85 backdrop-blur-sm p-6 sm:p-8 shadow-[0_10px_40px_rgba(31,64,104,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(31,64,104,0.12)] h-full overflow-hidden">
                        <div className={`absolute top-0 right-0 w-28 h-28 ${card.orb} rounded-full -mr-14 -mt-14 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="flex items-center justify-between mb-4 relative">
                          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                            {card.label}
                          </h3>
                          <div className={`${card.iconWrap} p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110`}>
                            <Icon className={`h-5 w-5 ${card.iconColor}`} strokeWidth={1.75} />
                          </div>
                        </div>
                        <AnimatedNumber value={stats[card.key]} />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Profile completion pipeline */}
          <section className="mb-10 sm:mb-12">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1">
                Journey progress
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#1F4068]">
                Profile completion by stage
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Tap a stage to see members who stopped there
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-white/80 bg-white/75 backdrop-blur-sm p-4 sm:p-6 shadow-[0_10px_40px_rgba(31,64,104,0.06)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stageStats.map((stage, index) => {
                  const pct = Math.round((stage.count / completionBase) * 100)
                  const funnelKey = STAGE_FUNNEL_KEYS[stage.table]
                  const href = funnelKey
                    ? `/admin/dashboard/funnel?stage=${funnelKey}`
                    : "/admin/dashboard/funnel?stage=personal"

                  return (
                    <motion.div
                      key={stage.table}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.04 * index }}
                    >
                      <Link
                        href={href}
                        className="group block rounded-xl border border-gray-100/90 bg-[#faf8f4]/60 p-3.5 transition-all hover:bg-white hover:border-[#e87898]/25 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#1F4068]">{stage.label}</span>
                          <span className="text-xs font-semibold text-[#3bb9ac]">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-200/80 overflow-hidden mb-2">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#e87898] via-[#c9a227] to-[#3bb9ac]"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {stage.count.toLocaleString()} profile{stage.count !== 1 ? "s" : ""}
                        </p>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1">
                Operations
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#1F4068]">
                Quick actions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-12 sm:pb-16">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                const isVerification = action.verification
                const hasPending = isVerification && stats.pendingVerifications > 0

                return (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 + index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link href={action.href} className="block">
                      <Card
                        className={`admin-dashboard-card-shine group cursor-pointer transition-all duration-300 rounded-2xl border bg-white/85 backdrop-blur-sm shadow-[0_10px_40px_rgba(31,64,104,0.07)] hover:shadow-[0_16px_48px_rgba(31,64,104,0.12)] ${
                          hasPending
                            ? "border-[#e87898]/35 ring-2 ring-[#fce8ef]/80"
                            : `border-white/90 ${action.hoverBorder}`
                        }`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-105 ${action.iconBg}`}>
                              <Icon className={`h-7 w-7 ${action.iconColor}`} strokeWidth={1.75} />
                            </div>
                            <ArrowRight
                              className={`h-5 w-5 text-gray-300 transition-all group-hover:translate-x-0.5 ${action.arrowHover}`}
                            />
                          </div>
                          <CardTitle className="font-display text-xl mt-4 text-[#1F4068] flex flex-wrap items-center gap-2">
                            {action.title}
                            {hasPending && (
                              <span className="inline-flex items-center rounded-full bg-[#e87898] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                                {stats.pendingVerifications} pending
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm mt-2 text-gray-500">
                            {action.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </div>

        <footer className="relative z-10 w-full border-t border-white/60 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-[#e87898]" fill="#fce8ef" />
                © {new Date().getFullYear()} Manavizha. Nurturing sacred unions.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy-policy" className="hover:text-[#1F4068] transition-colors font-medium">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="hover:text-[#1F4068] transition-colors font-medium">
                  Terms of Service
                </Link>
                <Link href="/" className="hover:text-[#1F4068] transition-colors font-medium">
                  Main site
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
