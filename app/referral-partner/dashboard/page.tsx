"use client"

import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { DashboardHeroPatterns } from "@/components/dashboard/dashboard-hero-patterns"
import { DashboardHeroStaticPatterns } from "@/components/dashboard/dashboard-hero-static-patterns"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { ReferralPartnerNavbar } from "@/components/referral-partner-navbar"
import { ReferralPartnerProfileStatsPanel } from "@/components/referral-partner/referral-partner-profile-stats-panel"
import { ReferralPartnerQuickActionsPanel } from "@/components/referral-partner/referral-partner-quick-actions-panel"
import { finishAuthRedirect, getUserDashboard } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { ArrowRight, Copy, Heart, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ReferralPartnerDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    men: 0,
    women: 0,
    earnings: 0,
  })

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        finishAuthRedirect(router, "/referral-partner", setIsLoading)
        return
      }

      const dashboardPath = await getUserDashboard(authUser.id)
      if (dashboardPath !== "/referral-partner/dashboard") {
        finishAuthRedirect(router, dashboardPath, setIsLoading)
        return
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("user_id, partner_id")
        .eq("user_id", authUser.id)
        .single()

      if (partnerError || !partnerData) {
        finishAuthRedirect(router, dashboardPath, setIsLoading)
        return
      }

      setPartnerId(partnerData.partner_id)
      await fetchStats(partnerData.partner_id)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const fetchStats = async (id: string) => {
    try {
      let referralPercentage = 10
      const { data: partnerSettingsData } = await supabase
        .from("referral_partners")
        .select("referral_percentage")
        .eq("partner_id", id)
        .single()

      if (partnerSettingsData?.referral_percentage != null) {
        referralPercentage = Number(partnerSettingsData.referral_percentage)
      }

      const { data: referralData, error: referralError } = await supabase
        .from("referral_details")
        .select("user_id")
        .eq("referral_partner_id", id)

      if (referralError || !referralData || referralData.length === 0) {
        setStats({ total: 0, men: 0, women: 0, earnings: 0 })
        return
      }

      const userIds = referralData.map((r: { user_id: string }) => r.user_id).filter(Boolean)

      const { data: profiles } = await supabase
        .from("personal_details")
        .select("user_id, sex, marital_status")
        .in("user_id", userIds)

      const activeProfiles = (profiles || []).filter(
        (p) => (p.marital_status || "").toLowerCase() !== "married"
      )

      const menCount = activeProfiles.filter(
        (p) =>
          p.sex &&
          p.sex.toLowerCase().includes("male") &&
          !p.sex.toLowerCase().includes("female")
      ).length
      const womenCount = activeProfiles.filter(
        (p) => p.sex && p.sex.toLowerCase().includes("female")
      ).length

      let totalEarnings = 0
      if (userIds.length > 0) {
        const { data: subscriptions } = await supabase
          .from("subscriptions")
          .select("amount")
          .in("user_id", userIds)

        if (subscriptions) {
          const totalSubscriptionAmount = subscriptions.reduce(
            (sum, sub) => sum + (Number(sub.amount) || 0),
            0
          )
          totalEarnings = totalSubscriptionAmount * (referralPercentage / 100)
        }
      }

      setStats({
        total: activeProfiles.length,
        men: menCount,
        women: womenCount,
        earnings: totalEarnings,
      })
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const copyPartnerId = async () => {
    if (!partnerId) return
    try {
      await navigator.clipboard.writeText(partnerId)
      toast.success("Partner ID copied")
    } catch {
      toast.error("Could not copy partner ID")
    }
  }

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <ReferralPartnerNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-3">
                  Partner dashboard
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold text-[#1F4068] tracking-tight leading-[1.1] mb-3">
                  Your referral
                  <span className="block text-brand-gold">performance at a glance</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Track referred profiles, monitor gender split, and view estimated earnings — all
                  from your partner hub.
                </p>

                <div className="mt-6 flex flex-wrap items-stretch gap-3">
                  {partnerId && (
                    <button
                      type="button"
                      onClick={copyPartnerId}
                      className="group inline-flex items-center gap-3 rounded-xl border border-[#c9a227]/30 bg-gradient-to-r from-[#fdf6e3]/80 to-white/90 px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-[#c9a227]/50 text-left"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a227] text-white shrink-0">
                        <Copy className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F4068]">Partner ID · {partnerId}</p>
                        <p className="text-xs text-gray-500 group-hover:text-[#c9a227] transition-colors">
                          Tap to copy
                        </p>
                      </div>
                    </button>
                  )}

                  <Link
                    href="/referral-partner/profiles"
                    className="group inline-flex items-center gap-3 rounded-xl border border-[#3bb9ac]/30 bg-gradient-to-r from-[#e6f7f5]/80 to-white/90 px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-[#3bb9ac]/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3bb9ac] text-white shrink-0">
                      <Users className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1F4068]">View all referrals</p>
                      <p className="text-xs text-gray-500 group-hover:text-[#3bb9ac] transition-colors flex items-center gap-1">
                        Open profiles <ArrowRight className="h-3 w-3" />
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              <ReferralPartnerProfileStatsPanel stats={stats} />
            </div>
          </motion.section>

          <section className="pb-10 sm:pb-12">
            <ReferralPartnerQuickActionsPanel />
          </section>
        </div>

        <footer className="relative z-10 w-full border-t border-white/60 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-[#e87898]" fill="#fce8ef" />
                © {new Date().getFullYear()} Manavizha. Growing together.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy-policy" className="hover:text-[#1F4068] transition-colors font-medium">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="hover:text-[#1F4068] transition-colors font-medium">
                  Terms of Service
                </Link>
                <Link href="/referral-partner" className="hover:text-[#1F4068] transition-colors font-medium">
                  Partner home
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
