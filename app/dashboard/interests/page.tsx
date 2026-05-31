"use client"

import { LikesView } from "@/components/likes-view"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Suspense, use, useEffect, useState } from "react"

function LikesPageContent({
  initialTab,
}: {
  initialTab: "mutual" | "liked" | "likedme"
}) {
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
    <LikesView 
      userId={userId} 
      onBack={() => router.push("/dashboard")}
      initialTab={initialTab}
    />
  )
}

export default function LikesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = use(searchParams)
  const initialTab = (tab as "mutual" | "liked" | "likedme" | undefined) ?? "mutual"

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LikesPageContent initialTab={initialTab} />
    </Suspense>
  )
}
