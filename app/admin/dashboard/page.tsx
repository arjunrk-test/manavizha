"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { LogOut, Users, Database, Mail, ArrowRight, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, men: 0, women: 0 })
  const [stageStats, setStageStats] = useState([
    { label: "Personal Details", count: 0, table: "personal_details" },
    { label: "Contact Details", count: 0, table: "contact_details" },
    { label: "Educational Details", count: 0, table: "education_details" },
    { label: "Professional Details", count: 0, table: "profession_employee" }, // combined below
    { label: "Family Details", count: 0, table: "family_details" },
    { label: "Horoscope Details", count: 0, table: "horoscope_details" },
    { label: "Interests", count: 0, table: "interests" },
    { label: "Social Habits", count: 0, table: "social_habits" },
    { label: "Photos", count: 0, table: "photos" },
    { label: "Referral", count: 0, table: "referral_details" },
  ])

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

    const fetchStats = async () => {
      const { data: profiles, error } = await supabase
        .from("personal_details")
        .select("sex, marital_status")

      if (!error && profiles) {
        const activeProfiles = profiles.filter(p => (p.marital_status || "").toLowerCase() !== "married")

        const men = activeProfiles.filter(p => p.sex && p.sex.toLowerCase().includes("male") && !p.sex.toLowerCase().includes("female")).length
        const women = activeProfiles.filter(p => p.sex && p.sex.toLowerCase().includes("female")).length
        setStats({
          total: activeProfiles.length,
          men,
          women
        })
      }
    }

    const fetchStageStats = async () => {
      const tables = [
        "personal_details",
        "contact_details",
        "education_details",
        "profession_employee",
        "family_details",
        "horoscope_details",
        "interests",
        "social_habits",
        "photos",
        "referral_details",
      ]

      const counts = await Promise.all(
        tables.map(async (table, i) => {
          if (table === "profession_employee") {
            // Combine all 3 profession variants
            const [empRes, busRes, stuRes] = await Promise.all([
              supabase.from("profession_employee").select("user_id"),
              supabase.from("profession_business").select("user_id"),
              supabase.from("profession_student").select("user_id"),
            ])
            const allUserIds = new Set([
              ...(empRes.data || []).map(r => r.user_id),
              ...(busRes.data || []).map(r => r.user_id),
              ...(stuRes.data || []).map(r => r.user_id),
            ])
            return allUserIds.size
          }
          const { data } = await supabase.from(table).select("user_id")
          // Use a Set to count unique users (some tables like education_details have multiple rows per user)
          return data ? new Set(data.map(r => r.user_id)).size : 0
        })
      )

      setStageStats(prev => prev.map((stage, i) => ({ ...stage, count: counts[i] })))
    }

    checkUser()
    fetchStats()
    fetchStageStats()
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
      <AdminNavbar />
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage your platform from here</p>
          </div>

          {/* Matrimonial Profiles Stats Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Matrimonial Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Profiles */}
              <Link href="/admin/dashboard/profiles" className="block">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:scale-105 duration-200 cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Profiles</h3>
                    <div className="bg-[#4B0082]/10 p-3 rounded-full">
                      <Users className="h-6 w-6 text-[#4B0082]" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </Link>

              {/* Men */}
              <Link href="/admin/dashboard/profiles?gender=Male" className="block">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:scale-105 duration-200 cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 dark:text-gray-400 font-medium">Men</h3>
                    <div className="bg-blue-500/10 dark:bg-blue-500/20 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.men}</p>
                </div>
              </Link>

              {/* Women */}
              <Link href="/admin/dashboard/profiles?gender=Female" className="block">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:scale-105 duration-200 cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 dark:text-gray-400 font-medium">Women</h3>
                    <div className="bg-pink-500/10 dark:bg-pink-500/20 p-3 rounded-full">
                      <User className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.women}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Admin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Manage Profiles Funnel Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <Link href="/admin/dashboard/funnel?stage=personal" className="block">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl group cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/30 dark:to-pink-500/30 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all">
                        <User className="h-8 w-8 text-[#4B0082] dark:text-purple-400" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#4B0082] group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="text-2xl mt-4 text-gray-900 dark:text-white">
                      Manage Profiles
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      View users who have not completed their profile stages
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

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

            {/* Identity Verification Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Link href="/admin/verification" className="block">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-purple-200/60 dark:border-purple-700/60 shadow-xl group cursor-pointer ring-4 ring-purple-500/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#4B0082]/10 to-blue-500/10 dark:from-[#4B0082]/30 dark:to-blue-500/30 group-hover:from-[#4B0082]/20 group-hover:to-blue-500/20 transition-all">
                        <ShieldCheck className="h-8 w-8 text-[#4B0082] dark:text-purple-400" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#4B0082] group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="text-2xl mt-4 text-gray-900 dark:text-white flex items-center gap-2">
                      Identity Verification
                      <div className="px-2 py-0.5 rounded-full bg-red-500 text-[10px] text-white animate-pulse">New Requests</div>
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Review and approve pending identity status for users
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

