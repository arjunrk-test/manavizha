"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminAnalyticsPanel } from "@/components/admin/admin-analytics-panel"
import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { finishAuthRedirect, getUserDashboard } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        finishAuthRedirect(router, "/admin", setIsLoading)
        return
      }

      const dashboardPath = await getUserDashboard(user.id)
      if (dashboardPath !== "/admin/dashboard") {
        finishAuthRedirect(router, dashboardPath, setIsLoading)
        return
      }

      setIsLoading(false)
    }

    checkUser()
  }, [router])

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <AdminNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-10">
          <AdminAnalyticsPanel />
        </div>
      </main>
    </div>
  )
}
