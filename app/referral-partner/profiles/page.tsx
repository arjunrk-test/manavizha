"use client"

import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { ReferralPartnerNavbar } from "@/components/referral-partner-navbar"
import { ReferralPartnerProfilesPanel } from "@/components/referral-partner/referral-partner-profiles-panel"
import { finishAuthRedirect, getUserDashboard } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Suspense, use, useEffect, useState } from "react"

function ProfilesPageContent({ genderFilter }: { genderFilter: string | null }) {
  return <ReferralPartnerProfilesPanel genderFilter={genderFilter} />
}

export default function ReferralPartnerProfilesListPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string }>
}) {
  const router = useRouter()
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const { gender: genderFilter = null } = use(searchParams)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        finishAuthRedirect(router, "/referral-partner", setIsAuthLoading)
        return
      }

      const dashboardPath = await getUserDashboard(user.id)
      if (dashboardPath !== "/referral-partner/dashboard") {
        finishAuthRedirect(router, dashboardPath, setIsAuthLoading)
        return
      }

      setIsAuthLoading(false)
    }

    checkUser()
  }, [router])

  if (isAuthLoading) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <ReferralPartnerNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-10">
          <Suspense
            fallback={
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
              </div>
            }
          >
            <ProfilesPageContent genderFilter={genderFilter} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
