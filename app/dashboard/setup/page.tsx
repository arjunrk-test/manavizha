"use client"

import { ProfileSetupForm } from "@/components/profile-setup-form"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function SetupPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f0f0f0] border-t-[#e87898]" />
      </div>
    )
  }

  if (!userId) return null

  return <ProfileSetupForm userId={userId} />
}
