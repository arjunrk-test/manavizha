"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { UserLandingPage } from "@/components/user-landing-page"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profileProgress, setProfileProgress] = useState(0)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  if (!user) return null

  return (
    <UserLandingPage
      userEmail={user.email || ""}
      userId={user.id}
      onNavigateToProfileSetup={() => router.push("/dashboard/setup")}
      onNavigateToBrowse={() => router.push("/dashboard/browse")}
      onNavigateToParents={() => router.push("/dashboard/parents")}
      onNavigateToSelections={() => router.push("/dashboard/selections")}
      onNavigateToPartnerPreferences={() => router.push("/dashboard/preferences")}
      onNavigateToLikes={() => router.push("/dashboard/likes?tab=mutual")}
      onNavigateToMutualMatches={() => router.push("/dashboard/likes?tab=mutual")}
      onNavigateToILiked={() => router.push("/dashboard/likes?tab=liked")}
      onNavigateToLikedMe={() => router.push("/dashboard/likes?tab=likedme")}
      onProgressChange={setProfileProgress}
    />
  )
}
