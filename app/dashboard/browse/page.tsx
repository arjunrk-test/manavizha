"use client"

import { BrowseProfiles } from "@/components/browse-profiles"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const router = useRouter()
  const { category: initialCategory } = use(searchParams)
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

  if (!isInitialized) {
    return <DashboardLoadingScreen />
  }

  if (!userId) return null

  return (
    <BrowseProfiles
      userId={userId}
      initialCategory={initialCategory}
      onBack={() => router.push("/dashboard")}
    />
  )
}
