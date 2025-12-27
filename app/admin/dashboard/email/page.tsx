"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminEmailPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin")
        return
      }

      // TODO: Verify user is an admin (add admin check logic here)

      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

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
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-[#4B0082]" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email</h1>
          </div>
          <Button
            onClick={() => router.push("/admin/dashboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm p-8">
            <p className="text-gray-600 dark:text-gray-400">Email management content will go here...</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>© 2024 Manavizha. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="/privacy-policy" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms-of-service" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

