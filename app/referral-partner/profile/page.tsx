"use client"

import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { ReferralPartnerNavbar } from "@/components/referral-partner-navbar"
import { ReferralPartnerAccountPanel } from "@/components/referral-partner/referral-partner-account-panel"
import { finishAuthRedirect, getUserDashboard } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ReferralPartnerProfilePage() {
  const router = useRouter()
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string; partner_id?: string | null } | null>(
    null
  )

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        finishAuthRedirect(router, "/referral-partner", setIsAuthLoading)
        return
      }

      const dashboardPath = await getUserDashboard(authUser.id)
      if (dashboardPath !== "/referral-partner/dashboard") {
        finishAuthRedirect(router, dashboardPath, setIsAuthLoading)
        return
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("user_id, partner_id")
        .eq("user_id", authUser.id)
        .single()

      if (partnerError || !partnerData) {
        await supabase.auth.signOut()
        finishAuthRedirect(router, "/referral-partner", setIsAuthLoading)
        return
      }

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        partner_id: partnerData.partner_id,
      })
      setIsAuthLoading(false)
    }

    checkUser()
  }, [router])

  if (isAuthLoading || !user) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <ReferralPartnerNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-10">
          <ReferralPartnerAccountPanel
            userId={user.id}
            userEmail={user.email}
            partnerId={user.partner_id}
          />
        </div>
      </main>
    </div>
  )
}
