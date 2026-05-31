"use client"

import { BrowseProfiles } from "@/components/browse-profiles"
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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    fetchUser()
  }, [])

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f0f0f0] border-t-[#e87898]" />
      </div>
    )
  }

  return (
    <BrowseProfiles 
      userId={userId} 
      initialCategory={initialCategory}
      onBack={() => router.push("/dashboard")}
    />
  )
}
