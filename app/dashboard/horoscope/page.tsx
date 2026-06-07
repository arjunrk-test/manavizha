"use client"

import { PublicHoroscopePage } from "@/components/horoscope/public-horoscope-page"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function DashboardHoroscopePage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    fetchUser()
  }, [])

  if (!userId) return <DashboardLoadingScreen />

  return <PublicHoroscopePage variant="dashboard" userId={userId} />
}
