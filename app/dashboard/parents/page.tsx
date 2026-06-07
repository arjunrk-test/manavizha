"use client"

import { ManageParents } from "@/components/manage-parents"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function ParentsPage() {
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

  return <ManageParents userId={userId} />
}
