"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { AdminFunnelPanel } from "@/components/admin/admin-funnel-panel"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { finishAuthRedirect, getUserDashboard } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Suspense, use, useEffect, useState } from "react"

function FunnelPageContent({ stage }: { stage: string }) {
  return <AdminFunnelPanel stage={stage} />
}

export default function AdminFunnelSegmentPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const router = useRouter()
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const { stage = "personal" } = use(searchParams)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        finishAuthRedirect(router, "/admin", setIsAuthLoading)
        return
      }

      const dashboardPath = await getUserDashboard(user.id)
      if (dashboardPath !== "/admin/dashboard") {
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
      <AdminNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-10">
          <Suspense
            fallback={
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
              </div>
            }
          >
            <FunnelPageContent stage={stage} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
