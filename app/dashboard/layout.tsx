"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut, ArrowLeft, Edit } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push("/")
        return
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("user_id")
        .eq("user_id", authUser.id)
        .single()

      if (!partnerError && partnerData) {
        await supabase.auth.signOut()
        router.push("/")
        return
      }

      setUser(authUser)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push("/")
  }

  const getViewName = () => {
    if (pathname.includes("/setup")) return "Profile Setup"
    if (pathname.includes("/browse")) return "Browse Profiles"
    if (pathname.includes("/parents")) return "Manage Parents"
    if (pathname.includes("/selections")) return "Parent Selections"
    if (pathname.includes("/preferences")) return "Partner Preferences"
    if (pathname.includes("/likes")) return "My Likes"
    return ""
  }

  const isLanding = pathname === "/dashboard"
  const viewName = getViewName()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
      <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

      {/* Animated Patterns */}
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
          return (
            <motion.div
              key={`bg-image-${i}`}
              className="absolute"
              style={{ left: `${baseX}%`, top: `${baseY}%`, width: `${size}px`, height: `${size}px` }}
              initial={{ opacity: 0.15 }}
              animate={{ opacity: [0.1, 0.25, 0.15, 0.25, 0.1], rotate: [0, 360], x: [-40, 40, -40] }}
              transition={{
                opacity: { duration: 8 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 60 + i * 8, repeat: Infinity, ease: "linear" },
                x: { duration: 12 + Math.random() * 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }
              }}
            >
              <img src={imagePath} alt="" className="w-full h-full object-contain brightness-0 invert opacity-20" />
            </motion.div>
          )
        })}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/dashboard")}>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-[#4B0082] via-[#FF1493] to-[#4B0082] bg-clip-text text-transparent">
              Manavizha
            </h1>
            {!isLanding && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B0082]/60 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#FF1493]"></span>
                {viewName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isLanding && (
              <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm" className="h-8 gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <Button 
                onClick={() => router.push("/dashboard/setup")} 
                variant="outline" 
                size="sm" 
                className="h-8 gap-2 border-[#4B0082]/20 hover:bg-[#4B0082]/10 text-[#4B0082] dark:text-purple-400"
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Update Profile</span>
              <span className="sm:hidden text-[10px]">Update</span>
            </Button>
            <Button onClick={handleLogout} size="sm" className="h-8 bg-red-400 hover:bg-red-500 text-white border-0 shadow-sm transition-all active:scale-95">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden text-[10px]">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col">
        {user && children}
      </main>

      {/* Footer */}
      <footer className="mt-auto sticky bottom-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60 py-1">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>© 2024 Manavizha. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="/privacy-policy" className="hover:text-[#4B0082] transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-[#4B0082] transition-colors">Terms of Service</a>
              <a href="/contact" className="hover:text-[#4B0082] transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
