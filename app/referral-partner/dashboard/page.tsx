"use client"

import { ReferralPartnerNavbar } from "@/components/referral-partner-navbar"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut, User, Settings, Users, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ReferralPartnerDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    men: 0,
    women: 0,
    earnings: 0
  })

  useEffect(() => {
    // Check if user is authenticated and is a referral partner
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/referral-partner")
        return
      }

      // Verify user is a referral partner and get partner data including partner_id
      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("user_id, partner_id")
        .eq("user_id", user.id)
        .single()

      if (partnerError || !partnerData) {
        // User is not a referral partner, redirect to home
        await supabase.auth.signOut()
        router.push("/referral-partner")
        return
      }

      // Merge user data with partner data (including partner_id)
      setUser({
        ...user,
        partner_id: partnerData.partner_id
      })
      await fetchStats(partnerData.partner_id)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const fetchStats = async (partnerId: string) => {
    try {
      // 1. Fetch referral percentage for this partner
      let referralPercentage = 10
      const { data: partnerSettingsData } = await supabase
        .from("referral_partners")
        .select("referral_percentage")
        .eq("partner_id", partnerId)
        .single()

      if (partnerSettingsData && partnerSettingsData.referral_percentage !== null) {
        referralPercentage = Number(partnerSettingsData.referral_percentage)
      }

      // 2. Fetch all user_ids referred by this partner from referral_details table
      const { data: referralData, error: referralError } = await supabase
        .from("referral_details")
        .select("user_id")
        .eq("referral_partner_id", partnerId)

      if (referralError || !referralData || referralData.length === 0) {
        setStats({ total: 0, men: 0, women: 0, earnings: 0 })
        return
      }

      const userIds = referralData.map((r: any) => r.user_id).filter(Boolean)

      // 3. Fetch sex info from personal_details for those users
      const { data: profiles } = await supabase
        .from("personal_details")
        .select("user_id, sex, marital_status")
        .in("user_id", userIds)

      const activeProfiles = (profiles || []).filter(p => (p.marital_status || "").toLowerCase() !== "married")

      const menCount = activeProfiles.filter((p: any) => p.sex && p.sex.toLowerCase().includes("male") && !p.sex.toLowerCase().includes("female")).length
      const womenCount = activeProfiles.filter((p: any) => p.sex && p.sex.toLowerCase().includes("female")).length

      // 4. Fetch earnings from subscriptions
      let totalEarnings = 0
      if (userIds.length > 0) {
        const { data: subscriptions } = await supabase
          .from("subscriptions")
          .select("amount")
          .in("user_id", userIds)

        if (subscriptions) {
          const totalSubscriptionAmount = subscriptions.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0)
          totalEarnings = totalSubscriptionAmount * (referralPercentage / 100)
        }
      }

      setStats({
        total: activeProfiles.length,
        men: menCount,
        women: womenCount,
        earnings: totalEarnings
      })
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    } else {
      router.push("/referral-partner")
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
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />

      {/* White overlay to lighten the gradient */}
      <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />

      {/* Overlay pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

      {/* Modern grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

      {/* Decorative elements */}
      <div className="fixed inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
      </div>

      {/* Animated PNG Background Images */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          "/patterns/pattern1.png",
          "/patterns/pattern2.png",
          "/patterns/pattern3.png",
          "/patterns/pattern4.png",
          "/patterns/pattern5.png",
          "/patterns/pattern6.png",
          "/patterns/pattern7.png",
        ].map((imagePath, i) => {
          const baseX = 5 + (i * 13) % 82
          const baseY = 8 + (i * 15) % 75
          const size = 280 + (i % 3) * 80
          const fadeDuration = 8 + Math.random() * 4
          const rotateDuration = 60 + i * 8
          const moveDuration = 12 + Math.random() * 6

          return (
            <motion.div
              key={`bg-image-${i}`}
              className="absolute"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              initial={{ opacity: 0.15 }}
              animate={{
                opacity: [0.1, 0.25, 0.15, 0.25, 0.1],
                rotate: [0, 360],
                x: [-40, 40, -40],
              }}
              transition={{
                opacity: {
                  duration: fadeDuration,
                  repeat: Infinity,
                  delay: i * 1.2,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: rotateDuration,
                  repeat: Infinity,
                  ease: "linear",
                },
                x: {
                  duration: moveDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.7,
                },
              }}
            >
              <img
                src={imagePath}
                alt={`Background pattern ${i + 1}`}
                className="w-full h-full object-contain"
                style={{
                  filter: "brightness(0) invert(1)",
                  mixBlendMode: "screen",
                }}
                onError={(e) => {
                  console.warn(`Image not found: ${imagePath}`)
                  e.currentTarget.style.display = "none"
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Header with Logout - Sticky */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Partner Dashboard</h1>
            {user?.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.partner_id ? `${user.partner_id} (${user.email})` : user.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/referral-partner/profile")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Account
            </Button>
            <Button
              onClick={() => router.push("/referral-partner/settings")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Profiles Card */}
            <div
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:scale-105 duration-200 cursor-pointer"
              onClick={() => router.push("/referral-partner/profiles")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Profiles</h3>
                <div className="bg-[#4B0082]/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-[#4B0082]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>

            {/* Men Count Card */}
            <div
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:scale-105 duration-200 cursor-pointer"
              onClick={() => router.push("/referral-partner/profiles?gender=Male")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 font-medium">Men</h3>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.men}</p>
            </div>

            {/* Women Count Card */}
            <div
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:scale-105 duration-200 cursor-pointer"
              onClick={() => router.push("/referral-partner/profiles?gender=Female")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 font-medium">Women</h3>
                <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-full">
                  <User className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.women}</p>
            </div>

            {/* Earnings Card */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:scale-105 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 font-medium">Earnings</h3>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{stats.earnings}</p>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm p-8 border border-gray-200/60 dark:border-gray-700/60">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <p className="text-gray-600 dark:text-gray-400">Your recent referrals and network updates will appear here.</p>
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
