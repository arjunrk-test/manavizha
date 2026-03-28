"use client"

import { PartnerPreferencesForm } from "@/components/partner-preferences-form"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PreferencesPage() {
  const router = useRouter()
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
    <PartnerPreferencesForm 
      userId={userId} 
      onBack={() => router.push("/dashboard")}
    />
  )
}
