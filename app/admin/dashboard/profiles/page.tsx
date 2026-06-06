"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { AdminProfilesPanel } from "@/components/admin/admin-profiles-panel"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { getUserDashboard } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Suspense, use, useEffect, useState } from "react"

function ProfilesPageContent({
  genderFilter,
  referralPartnerIdFilter,
}: {
  genderFilter: string | null
  referralPartnerIdFilter: string | null
}) {
  return (
    <AdminProfilesPanel
      genderFilter={genderFilter}
      referralPartnerIdFilter={referralPartnerIdFilter}
    />
  )
}

export default function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; referralPartnerId?: string }>
}) {
  const router = useRouter()
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const { gender: genderFilter = null, referralPartnerId: referralPartnerIdFilter = null } =
    use(searchParams)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin")
        return
      }

      const dashboardPath = await getUserDashboard(user.id)
      if (dashboardPath !== "/admin/dashboard") {
        router.push(dashboardPath)
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
            <ProfilesPageContent
              genderFilter={genderFilter}
              referralPartnerIdFilter={referralPartnerIdFilter}
            />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
