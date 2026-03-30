"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { 
  Shield, 
  Settings, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  Activity,
  Mail,
  Phone,
  ShieldCheck
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "User Management",
    description: "Manage all user accounts, profiles, and access permissions with comprehensive admin controls.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    iconBg: "bg-blue-500",
  },
  {
    icon: ShieldCheck,
    title: "Profile Verification",
    description: "Review and approve photo verification requests from users via side-by-side comparison.",
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30",
    iconBg: "bg-amber-500",
  },
  {
    icon: Database,
    title: "Data Management",
    description: "Access and manage all platform data, including profiles, matches, and system configurations.",
    color: "from-[#4B0082] to-[#1F4068]",
    bgColor: "from-[#4B0082]/10 to-[#1F4068]/10 dark:from-[#4B0082]/30 dark:to-[#1F4068]/30",
    iconBg: "bg-[#4B0082]",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "View detailed analytics, generate reports, and track platform performance metrics.",
    color: "from-[#FF1493] to-[#4B0082]",
    bgColor: "from-[#FF1493]/10 to-[#4B0082]/10 dark:from-[#FF1493]/30 dark:to-[#4B0082]/30",
    iconBg: "bg-[#FF1493]",
  },
  {
    icon: Shield,
    title: "Security & Access",
    description: "Control security settings, manage admin access, and monitor system security.",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    iconBg: "bg-green-500",
  },
  {
    icon: Settings,
    title: "System Settings",
    description: "Configure platform settings, manage system parameters, and control feature toggles.",
    color: "from-[#FFA500] to-[#FF1493]",
    bgColor: "from-[#FFA500]/10 to-[#FF1493]/10 dark:from-[#FFA500]/30 dark:to-[#FF1493]/30",
    iconBg: "bg-[#FFA500]",
  },
  {
    icon: Activity,
    title: "Activity Monitoring",
    description: "Monitor real-time platform activity, track user actions, and system events.",
    color: "from-[#FFA500] to-[#1F4068]",
    bgColor: "from-[#FFA500]/10 to-[#1F4068]/10 dark:from-[#FFA500]/30 dark:to-[#1F4068]/30",
    iconBg: "bg-[#FFA500]",
  },
]

const capabilities = [
  {
    number: "01",
    title: "Access Control",
    description: "Manage user permissions and access levels with granular control over platform features.",
    icon: Lock,
  },
  {
    number: "02",
    title: "Data Management",
    description: "View, edit, and manage all user data, profiles, and platform content efficiently.",
    icon: Database,
  },
  {
    number: "03",
    title: "Analytics Dashboard",
    description: "Access comprehensive analytics and generate detailed reports on platform usage.",
    icon: BarChart3,
  },
  {
    number: "04",
    title: "System Configuration",
    description: "Configure system settings, manage features, and control platform behavior.",
    icon: Settings,
  },
]

export default function AdminPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <main className="min-h-screen relative">
      <AdminNavbar />
      <AdminAuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
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

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 text-sm font-medium text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1493] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1493]"></span>
              </span>
              Admin Access Only
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Admin Panel
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Manage Your Platform
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Comprehensive admin tools to manage users, data, analytics, and system settings. 
              Secure access to all platform administration features.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:from-[#4B0082] hover:via-[#FF1493] hover:to-[#1F4068] text-white border-0 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold group"
              >
                Access Admin Panel
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/50 via-[#4B0082]/50 via-[#FF1493]/50 to-[#FFA500]/50 bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/50 dark:bg-[#181818]/50" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Admin Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful tools to manage and control your platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.bgColor} mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.iconBg} text-white rounded-lg p-1.5`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/40 dark:bg-[#181818]/40" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Admin Capabilities
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage your platform effectively
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon
              return (
                <motion.div
                  key={capability.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {capability.number}
                      </div>
                    </div>
                    <div className="mt-6 mb-4 flex justify-center">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#4B0082]/10 to-[#FF1493]/10 dark:from-[#4B0082]/30 dark:to-[#FF1493]/30">
                        <Icon className="h-8 w-8 text-[#4B0082] dark:text-[#FF1493]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {capability.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                  {index < capabilities.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#4B0082] to-[#FF1493] -translate-y-1/2 z-0" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/40 dark:bg-[#181818]/40" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 lg:p-16 border border-gray-200/50 dark:border-gray-800/50 shadow-2xl"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to Access Admin Panel?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Secure admin access to manage your platform. 
              Login with your admin credentials to get started.
            </p>
            <Button
              size="lg"
              onClick={() => setIsLoginOpen(true)}
              className="rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:from-[#4B0082] hover:via-[#FF1493] hover:to-[#1F4068] text-white border-0 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold group"
            >
              Access Admin Panel
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

