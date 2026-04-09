"use client"

import { BrowseProfiles } from "@/components/browse-profiles"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function BrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || undefined
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    fetchUser()
  }, [])

  if (!userId) return null

  return (
    <BrowseProfiles 
      userId={userId} 
      initialCategory={initialCategory}
      onBack={() => router.push("/dashboard")}
    />
  )
}
