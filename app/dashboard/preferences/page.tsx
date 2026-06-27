"use client"

import { PartnerPreferencesForm } from "@/components/partner-preferences-form"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PreferencesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      } else {
        router.replace("/")
      }
      setIsInitialized(true)
    }
    fetchUser()
  }, [router])

  if (!isInitialized) return <DashboardLoadingScreen />
  if (!userId) return null

  return (
    <PartnerPreferencesForm
      userId={userId}
      onBack={() => router.push("/dashboard")}
    />
  )
}
