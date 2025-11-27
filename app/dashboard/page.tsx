"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    } else {
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You are successfully logged in!
          </p>
          {user?.email && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Logged in as: {user.email}
            </p>
          )}
        </div>
        
        <Button
          onClick={handleLogout}
          className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm hover:shadow-md transition-all"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}

