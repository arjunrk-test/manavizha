"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  UserPlus,
  HeartHandshake,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { AuthDialog } from "@/components/auth-dialog"

const journeySteps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Add photos, details, and partner preferences in just a few minutes.",
    color: "from-[#1F4068] to-[#3bb9ac]",
  },
  {
    icon: Sparkles,
    title: "Discover Compatible Matches",
    description: "Get AI-powered recommendations with horoscope compatibility scores.",
    color: "from-[#3bb9ac] to-[#FFA500]",
  },
  {
    icon: HeartHandshake,
    title: "Connect with Confidence",
    description: "Express interest and communicate securely with verified profiles.",
    color: "from-[#FFA500] to-[#1F4068]",
  },
]

export function HeroSection() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <section 
      className="relative min-h-screen overflow-hidden pt-14 pb-24 sm:pb-28 lg:pb-36"
    >
      {/* Animated gradient background - lighter version */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/50 via-[#3bb9ac]/50 via-[#3bb9ac]/50 to-[#FFA500]/50 bg-[length:200%_auto] animate-gradient" />
      
      {/* White overlay to lighten */}
      <div className="absolute inset-0 bg-white/50 dark:bg-[#181818]/50" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

      {/* Floating orbs - optimized for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-[#1F4068]/30 to-[#3bb9ac]/30 rounded-full mix-blend-multiply filter blur-2xl will-change-transform" 
          style={{
            animation: 'float 20s ease-in-out infinite',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
        <div className="absolute top-40 right-[15%] w-72 h-72 bg-gradient-to-br from-[#3bb9ac]/30 to-[#FFA500]/30 rounded-full mix-blend-multiply filter blur-2xl will-change-transform"
          style={{
            animation: 'float 25s ease-in-out infinite 2s',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      </div>

      {/* Modern grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Geometric shapes for modern look */}
      <div className="absolute top-20 right-10 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border border-[#1F4068]/20 rounded-full blur-xl hidden md:block" />
      <div className="absolute bottom-20 left-10 w-24 h-24 sm:w-32 sm:h-32 border border-[#3bb9ac]/20 rounded-full blur-xl hidden md:block" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-[#FFA500]/20 rotate-45 blur-lg hidden lg:block" />

      <div 
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-16 pb-4 sm:pb-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start max-w-7xl mx-auto">
          {/* Left Section - Content */}
          <div className="text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 text-sm font-medium text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3bb9ac] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3bb9ac]"></span>
            </span>
            Trusted by 10,000+ families
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 md:mb-10 leading-[1.05] tracking-tight"
          >
            <span className="block bg-gradient-to-r from-[#1F4068] via-[#3bb9ac] via-[#3bb9ac] to-[#1F4068] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Find Your Perfect
            </span>
            <span className="block mt-2 sm:mt-3 md:mt-4 bg-gradient-to-r from-[#3bb9ac] via-[#3bb9ac] via-[#FFA500] to-[#3bb9ac] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient" style={{ animationDelay: '1s' }}>
              Life Partner
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8 sm:mb-10 lg:mb-14 max-w-3xl mx-auto lg:mx-0 font-light leading-relaxed px-4 lg:px-0"
          >
            Join thousands of verified profiles and start your journey to forever.
            <span className="block mt-3 sm:mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl">
              Your perfect match is just a click away.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center mb-12 sm:mb-16 px-4 lg:px-0"
          >
            <Button 
              size="lg"
              className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#1F4068] to-[#3bb9ac] hover:from-[#1F4068]/90 hover:to-[#3bb9ac]/90 shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7"
              onClick={() => openAuth("signup")}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              Start Your Journey
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto rounded-full hover:border-[#1F4068] hover:bg-[#1F4068]/10 dark:hover:bg-[#1F4068]/20 transition-all duration-200 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 border-2"
              onClick={() => openAuth("login")}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Browse Profiles
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mb-12 sm:mb-16 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4 lg:px-0"
          >
            <div className="flex items-center gap-2 bg-white/60 dark:bg-[#181818]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-800/50">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <span>100% Verified</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-[#181818]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-800/50">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-[#181818]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-800/50">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <span>Free Registration</span>
            </div>
          </motion.div>

          </div>

          {/* Right Section - Journey Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-800/60 shadow-2xl p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#3bb9ac] mb-1">
                  Simple & Trusted
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  How Manavizha Works
                </h3>
              </div>

              {/* Journey Steps */}
              <div className="relative mb-8">
                {/* Vertical rail */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200/80 dark:bg-gray-700/80 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-gradient-to-b from-[#1F4068] via-[#3bb9ac] to-[#FFA500]"
                  />
                </div>

                <div className="space-y-9">
                  {journeySteps.map((step, index) => {
                    const Icon = step.icon

                    return (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.35 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex gap-5 items-start"
                      >
                        {/* Node */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.45 + index * 0.12, type: "spring", stiffness: 320, damping: 22 }}
                          className={`relative z-10 shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center ring-[3px] ring-white dark:ring-gray-900`}
                        >
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3bb9ac] mb-1.5">
                            Step {index + 1}
                          </p>
                          <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {step.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* CTA */}
              <Button
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1F4068] via-[#3bb9ac] to-[#1F4068] bg-[length:200%_auto] animate-gradient text-white font-bold uppercase tracking-[0.2em] text-sm shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-[0.98]"
                onClick={() => openAuth("signup")}
              >
                Create a Free Profile
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>

              <p className="text-center mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Already a member?{" "}
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="text-[#3bb9ac] hover:text-[#1F4068] transition-colors border-b border-[#3bb9ac]/30"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} defaultMode={authMode} />
    </section>
  )
}
