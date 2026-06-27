"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { AdminQuickActionsPanel } from "@/components/admin/admin-quick-actions-panel"
import { AdminProfileStatsPanel } from "@/components/admin/admin-profile-stats-panel"
import { AdminProfileStagesPanel } from "@/components/admin/admin-profile-stages-panel"
import { DashboardHeroPatterns } from "@/components/dashboard/dashboard-hero-patterns"
import { DashboardHeroStaticPatterns } from "@/components/dashboard/dashboard-hero-static-patterns"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { finishAuthRedirect, getAdminRole, getUserDashboard } from "@/lib/auth"
import {
  ArrowRight,
  BarChart3,
  Heart,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [stats, setStats] = useState({
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
        finishAuthRedirect(router, "/admin", setIsLoading)
        return
      }

      const dashboardPath = await getUserDashboard(authUser.id)
      if (dashboardPath !== "/admin/dashboard") {
        finishAuthRedirect(router, dashboardPath, setIsLoading)
        return
      }

      setAdminRole(await getAdminRole(authUser.id))
      setIsLoading(false)
    }

    const fetchStats = async () => {
      const [
        { count: totalCount, error: e1 },
        { count: menCount, error: e2 },
        { count: womenCount, error: e3 },
        { count: pendingCount, error: e4 },
      ] = await Promise.all([
        supabase.from("personal_details").select("*", { count: "exact", head: true }).not("marital_status", "ilike", "married"),
        supabase.from("personal_details").select("*", { count: "exact", head: true }).ilike("sex", "%male%").not("sex", "ilike", "%female%").not("marital_status", "ilike", "married"),
        supabase.from("personal_details").select("*", { count: "exact", head: true }).ilike("sex", "%female%").not("marital_status", "ilike", "married"),
        supabase.from("photos").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
      ])
      if (e1 || e2 || e3 || e4) throw new Error("Stats fetch failed")

      setStats({
        total: totalCount || 0,
        men: menCount || 0,
        women: womenCount || 0,
        pendingVerifications: pendingCount || 0,
      })
    }

    const fetchStageStats = async () => {
      // Use count-only queries — no row data fetched to the client
      const [
        pdCount, cdCount, edCount,
        empCount, busCount, stuCount,
        fdCount, hdCount, inCount, shCount, phCount,
      ] = await Promise.all([
        supabase.from("personal_details").select("*", { count: "exact", head: true }),
        supabase.from("contact_details").select("*", { count: "exact", head: true }),
        supabase.from("education_details").select("*", { count: "exact", head: true }),
        supabase.from("profession_employee").select("*", { count: "exact", head: true }),
        supabase.from("profession_business").select("*", { count: "exact", head: true }),
        supabase.from("profession_student").select("*", { count: "exact", head: true }),
        supabase.from("family_details").select("*", { count: "exact", head: true }),
        supabase.from("horoscope_details").select("*", { count: "exact", head: true }),
        supabase.from("interests").select("*", { count: "exact", head: true }),
        supabase.from("social_habits").select("*", { count: "exact", head: true }),
        supabase.from("photos").select("*", { count: "exact", head: true }),
      ])

      const professionCount = (empCount.count || 0) + (busCount.count || 0) + (stuCount.count || 0)
      const counts = [
        pdCount.count || 0, cdCount.count || 0, edCount.count || 0,
        professionCount, fdCount.count || 0, hdCount.count || 0,
        inCount.count || 0, shCount.count || 0, phCount.count || 0,
      ]

      setStageStats(prev => prev.map((stage, i) => ({ ...stage, count: counts[i] })))
    }

    checkUser()
    Promise.all([fetchStats(), fetchStageStats()]).catch(() => setStatsError(true))
  }, [router])

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <AdminNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
          {statsError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Could not load dashboard statistics. Please refresh the page.
            </div>
          )}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-10 sm:mb-12 overflow-hidden rounded-[1.35rem] border border-[#eadfce] bg-gradient-to-br from-[#fffdf8] via-[#fef8ee] to-[#fdf3e4] shadow-[0_20px_60px_rgba(31,64,104,0.1),0_4px_20px_rgba(232,120,152,0.06)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#fce8ef]/40 via-white/20 to-[#e6f7f5]/35 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#c9a227]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#e87898]/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />
            <DashboardHeroStaticPatterns />
            <DashboardHeroPatterns />

            <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-8 lg:gap-10 items-start">
              <div className="max-w-2xl">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold text-[#1F4068] tracking-tight leading-[1.1] mb-3">
                  Welcome to your
                  <span className="block text-brand-gold">matrimonial command center</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Oversee profiles, verifications, and family journeys — every decision here shapes
                  meaningful connections on Manavizha.
                </p>

                <div className="mt-6 flex flex-wrap items-stretch gap-3">
                  {stats.pendingVerifications > 0 && (
                    <Link
                      href="/admin/verification"
                      className="group inline-flex items-center gap-3 rounded-xl border border-[#e87898]/30 bg-gradient-to-r from-[#fce8ef]/80 to-white/90 px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-[#e87898]/50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e87898] text-white shrink-0">
                        <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F4068]">
                          {stats.pendingVerifications} verification{stats.pendingVerifications !== 1 ? "s" : ""} awaiting review
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-[#e87898] transition-colors flex items-center gap-1">
                          Open queue <ArrowRight className="h-3 w-3" />
                        </p>
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/admin/dashboard/analytics"
                    className="group inline-flex items-center gap-3 rounded-xl border border-[#c9a227]/30 bg-gradient-to-r from-[#fdf6e3]/80 to-white/90 px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-[#c9a227]/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a227] text-white shrink-0">
                      <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1F4068]">Analytics</p>
                      <p className="text-xs text-gray-500 group-hover:text-[#c9a227] transition-colors flex items-center gap-1">
                        View insights <ArrowRight className="h-3 w-3" />
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              <AdminProfileStatsPanel stats={stats} />
            </div>
          </motion.section>

          <section className="mb-6 sm:mb-8">
            <AdminProfileStagesPanel stages={stageStats} totalUsers={stats.total} />
          </section>

          <section className="pb-10 sm:pb-12">
            <AdminQuickActionsPanel
              pendingVerifications={stats.pendingVerifications}
              adminRole={adminRole}
            />
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
