"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUserDashboard } from "@/lib/auth"
import { Users, Database, Mail, ArrowRight, User, ShieldCheck } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

const statCardClass =
  "rounded-2xl border border-gray-100/90 bg-white p-6 sm:p-8 shadow-[0_8px_32px_rgba(31,64,104,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(31,64,104,0.1)] h-full relative overflow-hidden group"

const actionCardClass =
  "bg-white border border-gray-100/90 shadow-[0_8px_32px_rgba(31,64,104,0.06)] group cursor-pointer transition-all duration-200 rounded-2xl hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(31,64,104,0.1)]"

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
    { label: "Personal Details", count: 0, table: "personal_details" },
    { label: "Contact Details", count: 0, table: "contact_details" },
    { label: "Educational Details", count: 0, table: "education_details" },
    { label: "Professional Details", count: 0, table: "profession_employee" },
    { label: "Family Details", count: 0, table: "family_details" },
    { label: "Horoscope Details", count: 0, table: "horoscope_details" },
    { label: "Interests", count: 0, table: "interests" },
    { label: "Social Habits", count: 0, table: "social_habits" },
    { label: "Photos", count: 0, table: "photos" },
    { label: "Referral", count: 0, table: "referral_details" },
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
        "referral_details",
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#fce8ef] border-t-[#e87898] mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#faf8f4]">
      <AdminNavbar />

      <main className="relative flex-1 flex flex-col pt-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
          {/* Page header */}
          <div className="mb-8 sm:mb-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-2">
                Admin portal
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F4068] tracking-tight mb-2">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                Manage profiles, accounts, verification, and platform settings from one place.
              </p>
            </div>
          </div>

          {/* Profile statistics */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400 mb-5">
              Profile statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Link href="/admin/dashboard/profiles" className="block">
                <div className={statCardClass}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#3bb9ac]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#3bb9ac]/10 transition-colors" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Total profiles
                    </h3>
                    <div className="bg-[#3bb9ac]/10 p-2.5 rounded-xl">
                      <Users className="h-5 w-5 text-[#3bb9ac]" strokeWidth={1.75} />
                    </div>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-[#1F4068]">{stats.total}</p>
                </div>
              </Link>

              <Link href="/admin/dashboard/profiles?gender=Male" className="block">
                <div className={statCardClass}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#1F4068]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#1F4068]/10 transition-colors" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Men
                    </h3>
                    <div className="bg-[#1F4068]/8 p-2.5 rounded-xl">
                      <User className="h-5 w-5 text-[#1F4068]" strokeWidth={1.75} />
                    </div>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-[#1F4068]">{stats.men}</p>
                </div>
              </Link>

              <Link href="/admin/dashboard/profiles?gender=Female" className="block">
                <div className={statCardClass}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#e87898]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#e87898]/10 transition-colors" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Women
                    </h3>
                    <div className="bg-[#fce8ef] p-2.5 rounded-xl">
                      <User className="h-5 w-5 text-[#e87898]" strokeWidth={1.75} />
                    </div>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-[#1F4068]">{stats.women}</p>
                </div>
              </Link>
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400 mb-5">
              Quick actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-12 sm:pb-16">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <Link href="/admin/dashboard/funnel?stage=personal" className="block">
                  <Card className={`${actionCardClass} hover:border-[#3bb9ac]/25`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-[#3bb9ac]/10 group-hover:bg-[#3bb9ac]/15 transition-colors">
                          <User className="h-7 w-7 text-[#3bb9ac]" strokeWidth={1.75} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#3bb9ac] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <CardTitle className="font-display text-xl mt-4 text-[#1F4068]">
                        Manage profiles
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 text-gray-500">
                        View users who have not completed their profile stages
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Link href="/admin/dashboard/accounts" className="block">
                  <Card className={`${actionCardClass} hover:border-[#1F4068]/20`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-[#1F4068]/8 group-hover:bg-[#1F4068]/12 transition-colors">
                          <Users className="h-7 w-7 text-[#1F4068]" strokeWidth={1.75} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#1F4068] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <CardTitle className="font-display text-xl mt-4 text-[#1F4068]">
                        Accounts
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 text-gray-500">
                        Manage user accounts, profiles, and access permissions
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Link href="/admin/dashboard/masterdata" className="block">
                  <Card className={`${actionCardClass} hover:border-[#c9a227]/30`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-[#fdf6e3] group-hover:bg-[#f5ebc8] transition-colors">
                          <Database className="h-7 w-7 text-[#c9a227]" strokeWidth={1.75} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#c9a227] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <CardTitle className="font-display text-xl mt-4 text-[#1F4068]">
                        Master data
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 text-gray-500">
                        Access and manage all platform data and configurations
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link href="/admin/dashboard/email" className="block">
                  <Card className={`${actionCardClass} hover:border-[#e87898]/25`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-[#fce8ef] group-hover:bg-[#f9d4df] transition-colors">
                          <Mail className="h-7 w-7 text-[#e87898]" strokeWidth={1.75} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#e87898] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <CardTitle className="font-display text-xl mt-4 text-[#1F4068]">
                        Email
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 text-gray-500">
                        Manage email templates, campaigns, and communications
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <Link href="/admin/verification" className="block">
                  <Card
                    className={`${actionCardClass} ${
                      stats.pendingVerifications > 0
                        ? "border-[#e87898]/40 ring-2 ring-[#fce8ef] hover:border-[#e87898]/50"
                        : "hover:border-[#3bb9ac]/25"
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-[#3bb9ac]/10 group-hover:bg-[#3bb9ac]/15 transition-colors">
                          <ShieldCheck className="h-7 w-7 text-[#3bb9ac]" strokeWidth={1.75} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#3bb9ac] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <CardTitle className="font-display text-xl mt-4 text-[#1F4068] flex flex-wrap items-center gap-2">
                        Identity verification
                        {stats.pendingVerifications > 0 && (
                          <span className="inline-flex items-center rounded-full bg-[#e87898] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            {stats.pendingVerifications} pending
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 text-gray-500">
                        Review and approve pending identity status for users
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </section>
        </div>

        <footer className="w-full border-t border-[#f0ebe3]/80 bg-[#faf8f4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Manavizha. All rights reserved.</p>
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
