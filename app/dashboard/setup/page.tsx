"use client"

import { ProfileSetupForm } from "@/components/profile-setup-form"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function SetupPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    fetchUser()
  }, [])

  if (!userId) return null

  return <ProfileSetupForm userId={userId} />
}
