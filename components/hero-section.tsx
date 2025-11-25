"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Users, ArrowRight, CheckCircle2 } from "lucide-react"

export function HeroSection() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F4068]/10 via-white via-95% to-[#4B0082]/10 dark:from-[#181818] dark:via-[#000000] dark:to-[#181818]" />
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(31,64,104,0.3),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,165,0,0.3),transparent_50%)]" />
      </div>

      {/* Floating orbs - optimized for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-[#1F4068]/30 to-[#4B0082]/30 rounded-full mix-blend-multiply filter blur-2xl will-change-transform" 
          style={{
            animation: 'float 20s ease-in-out infinite',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
        <div className="absolute top-40 right-[15%] w-72 h-72 bg-gradient-to-br from-[#FF1493]/30 to-[#FFA500]/30 rounded-full mix-blend-multiply filter blur-2xl will-change-transform"
          style={{
            animation: 'float 25s ease-in-out infinite 2s',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div 
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight"
          >
            <span className="block bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#1F4068] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Find Your Perfect
            </span>
            <span className="block mt-2 bg-gradient-to-r from-[#4B0082] via-[#FF1493] via-[#FFA500] to-[#4B0082] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient" style={{ animationDelay: '1s' }}>
              Life Partner
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Join thousands of verified profiles and start your journey to forever.
            <span className="block mt-2 text-gray-600 dark:text-gray-400 text-lg md:text-xl">
              Your perfect match is just a click away.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button 
              className="rounded-full bg-gradient-to-r from-[#1F4068] to-[#4B0082] hover:from-[#1F4068]/90 hover:to-[#4B0082]/90 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Heart className="h-4 w-4" />
              Start Your Journey
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full hover:border-[#1F4068] hover:bg-[#1F4068]/10 dark:hover:bg-[#1F4068]/20 transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              Browse Profiles
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-16 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>100% Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Free Registration</span>
            </div>
          </motion.div>

          {/* Stats with better design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: "10K+", label: "Active Members", color: "from-[#1F4068] to-[#4B0082]" },
              { value: "5K+", label: "Successful Matches", color: "from-[#FF1493] to-[#FFA500]" },
              { value: "98%", label: "Satisfaction Rate", color: "from-[#4B0082] to-[#1F4068]" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1F4068]/20 to-[#4B0082]/20 dark:from-[#1F4068]/30 dark:to-[#4B0082]/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-200" />
                <div className="relative bg-white/90 dark:bg-gray-900/90 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                  <div className={`text-5xl font-bold mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  )
}
