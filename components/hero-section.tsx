"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Heart, Users, ArrowRight, CheckCircle2, Search } from "lucide-react"
import { useState } from "react"

export function HeroSection() {
  const [searchType, setSearchType] = useState("Bride")
  const [location, setLocation] = useState("Any")
  const [minAge, setMinAge] = useState("23")
  const [maxAge, setMaxAge] = useState("30")

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14"
    >
      {/* Animated gradient background - lighter version */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/50 via-[#4B0082]/50 via-[#FF1493]/50 to-[#FFA500]/50 bg-[length:200%_auto] animate-gradient" />
      
      {/* White overlay to lighten */}
      <div className="absolute inset-0 bg-white/50 dark:bg-[#181818]/50" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

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

      {/* Modern grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Geometric shapes for modern look */}
      <div className="absolute top-20 right-10 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border border-[#1F4068]/20 rounded-full blur-xl hidden md:block" />
      <div className="absolute bottom-20 left-10 w-24 h-24 sm:w-32 sm:h-32 border border-[#FF1493]/20 rounded-full blur-xl hidden md:block" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-[#FFA500]/20 rotate-45 blur-lg hidden lg:block" />

      <div 
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1493] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1493]"></span>
            </span>
            Trusted by 10,000+ families
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 md:mb-10 leading-[1.05] tracking-tight"
          >
            <span className="block bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#1F4068] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Find Your Perfect
            </span>
            <span className="block mt-2 sm:mt-3 md:mt-4 bg-gradient-to-r from-[#4B0082] via-[#FF1493] via-[#FFA500] to-[#4B0082] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient" style={{ animationDelay: '1s' }}>
              Life Partner
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8 sm:mb-10 lg:mb-14 max-w-3xl mx-auto font-light leading-relaxed px-4"
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
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center mb-12 sm:mb-16 px-4"
          >
            <Button 
              size="lg"
              className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#1F4068] to-[#4B0082] hover:from-[#1F4068]/90 hover:to-[#4B0082]/90 shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              Start Your Journey
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto rounded-full hover:border-[#1F4068] hover:bg-[#1F4068]/10 dark:hover:bg-[#1F4068]/20 transition-all duration-200 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 border-2"
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
            className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4"
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

          {/* Right Section - Search Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-800/60 shadow-2xl p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF1493] to-[#FFA500] flex items-center justify-center shadow-lg">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Start Your Search Instantly
                </h3>
              </div>

              {/* Search Form */}
              <form className="space-y-4 sm:space-y-5">
                {/* Row 1: Looking for & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      I'm looking for a
                    </label>
                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bride">Bride</SelectItem>
                        <SelectItem value="Groom">Groom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location/Community
                    </label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Min Age & Max Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Min Age (21+)
                    </label>
                    <Input
                      type="number"
                      min="21"
                      max="45"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Age (45)
                    </label>
                    <Input
                      type="number"
                      min="21"
                      max="45"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  type="submit"
                  className="w-full h-14 rounded-lg bg-gradient-to-r from-[#4B0082] to-[#1F4068] hover:from-[#4B0082]/90 hover:to-[#1F4068]/90 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Search Matches ({searchType}s)
                </Button>

                {/* Footer Link */}
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Need a profile?{" "}
                    <a
                      href="#"
                      className="text-[#4B0082] dark:text-[#FF1493] font-semibold underline hover:text-[#1F4068] dark:hover:text-[#FF1493]/80 transition-colors"
                    >
                      Create a Free Profile
                    </a>
                  </span>
                </div>
              </form>
            </div>

            {/* Stats with modern design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 sm:mt-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: "10K+", label: "Active Members", color: "from-[#1F4068] to-[#4B0082]", icon: "👥" },
                  { value: "5K+", label: "Successful Matches", color: "from-[#FF1493] to-[#FFA500]", icon: "💑" },
                  { value: "98%", label: "Satisfaction Rate", color: "from-[#4B0082] to-[#1F4068]", icon: "⭐" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="relative group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1F4068]/20 to-[#4B0082]/20 dark:from-[#1F4068]/30 dark:to-[#4B0082]/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                    <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-gray-200/60 dark:border-gray-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden">
                      {/* Decorative gradient bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{stat.icon}</div>
                      <div className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </section>
  )
}
