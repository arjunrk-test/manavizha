"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { LogOut, Users, Database, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
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
      // For now, we'll just check if user is authenticated
      // You can add admin table check similar to referral_partners

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
      router.push("/admin")
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
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header with Logout - Sticky */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            {user?.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage your platform from here</p>
          </div>

          {/* Admin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Accounts Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link href="/admin/dashboard/accounts" className="block">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/30 dark:to-cyan-500/30 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all">
                      <Users className="h-8 w-8 text-blue-500 dark:text-cyan-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-2xl mt-4 text-gray-900 dark:text-white">
                    Accounts
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Manage user accounts, profiles, and access permissions
                  </CardDescription>
                </CardHeader>
                </Card>
              </Link>
            </motion.div>

            {/* Master Data Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/admin/dashboard/masterdata" className="block">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#4B0082]/10 to-[#1F4068]/10 dark:from-[#4B0082]/30 dark:to-[#1F4068]/30 group-hover:from-[#4B0082]/20 group-hover:to-[#1F4068]/20 transition-all">
                      <Database className="h-8 w-8 text-[#4B0082] dark:text-[#1F4068]" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#4B0082] group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-2xl mt-4 text-gray-900 dark:text-white">
                    Master Data
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Access and manage all platform data and configurations
                  </CardDescription>
                </CardHeader>
                </Card>
              </Link>
            </motion.div>

            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/admin/dashboard/email" className="block">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF1493]/10 to-[#4B0082]/10 dark:from-[#FF1493]/30 dark:to-[#4B0082]/30 group-hover:from-[#FF1493]/20 group-hover:to-[#4B0082]/20 transition-all">
                      <Mail className="h-8 w-8 text-[#FF1493] dark:text-[#4B0082]" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#FF1493] group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-2xl mt-4 text-gray-900 dark:text-white">
                    Email
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Manage email templates, campaigns, and communications
                  </CardDescription>
                </CardHeader>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
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

