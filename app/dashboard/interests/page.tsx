"use client"

import { LikesView } from "@/components/likes-view"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Suspense } from "react"

function LikesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") as "mutual" | "liked" | "likedme" | null
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
      initialTab={initialTab || "mutual"}
    />
  )
}

export default function LikesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LikesPageContent />
    </Suspense>
  )
}
