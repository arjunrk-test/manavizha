"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Search, Heart, Verified, MessageCircle, Star, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All profiles are thoroughly verified to ensure authenticity and trust. We verify identity, education, and background.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    iconBg: "bg-blue-500",
  },
  {
    icon: Search,
    title: "Smart Matching",
    description: "Advanced AI-powered algorithm helps you find compatible matches based on your preferences, values, and lifestyle.",
    color: "from-[#4B0082] to-[#1F4068]",
    bgColor: "from-[#4B0082]/10 to-[#1F4068]/10 dark:from-[#4B0082]/30 dark:to-[#1F4068]/30",
    iconBg: "bg-[#4B0082]",
  },
  {
    icon: Heart,
    title: "Privacy First",
    description: "Your data is secure with us. We prioritize your privacy and confidentiality with end-to-end encryption.",
    color: "from-[#FF1493] to-[#4B0082]",
    bgColor: "from-[#FF1493]/10 to-[#4B0082]/10 dark:from-[#FF1493]/30 dark:to-[#4B0082]/30",
    iconBg: "bg-[#FF1493]",
  },
  {
    icon: Verified,
    title: "Trusted Platform",
    description: "Join thousands of families who trust us for finding their perfect matches. 98% satisfaction rate.",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    iconBg: "bg-green-500",
  },
  {
    icon: MessageCircle,
    title: "Easy Communication",
    description: "Connect and communicate with potential matches through our secure, user-friendly messaging platform.",
    color: "from-[#FFA500] to-[#FF1493]",
    bgColor: "from-[#FFA500]/10 to-[#FF1493]/10 dark:from-[#FFA500]/30 dark:to-[#FF1493]/30",
    iconBg: "bg-[#FFA500]",
  },
  {
    icon: Star,
    title: "Premium Experience",
    description: "Enjoy a premium experience with personalized matchmaking services and dedicated support team.",
    color: "from-[#FFA500] to-[#1F4068]",
    bgColor: "from-[#FFA500]/10 to-[#1F4068]/10 dark:from-[#FFA500]/30 dark:to-[#1F4068]/30",
    iconBg: "bg-[#FFA500]",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Animated gradient background - lighter version */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/40 via-[#4B0082]/40 via-[#FF1493]/40 to-[#FFA500]/40 bg-[length:200%_auto] animate-gradient" />
      
      {/* White overlay to lighten */}
      <div className="absolute inset-0 bg-white/60 dark:bg-[#181818]/60" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#1F4068]/20 to-[#4B0082]/20 dark:from-[#1F4068]/50 dark:to-[#4B0082]/50 text-[#1F4068] dark:text-[#4B0082] font-medium mb-6"
          >
            Why Choose Us
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Everything You Need
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Experience the best in matrimonial matchmaking with our comprehensive platform designed for modern families
          </p>
        </motion.div>

        {/* Auto-scrolling carousel container */}
        <div className="relative overflow-hidden">
          <div className="flex gap-6 animate-scroll">
            {/* First set of cards */}
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={`first-${feature.title}`}
                  className="flex-shrink-0 w-[85vw] sm:w-[400px] md:w-[450px] lg:w-[380px] group relative"
                >
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10" />
                  
                  {/* Main card */}
                  <div className="relative h-full rounded-2xl bg-white/80 dark:bg-[#181818]/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-300 group-hover:border-transparent group-hover:shadow-2xl">
                    {/* Animated gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative z-10 p-8">
                      {/* Icon with modern design */}
                      <div className="mb-6">
                        <div className="relative inline-block">
                          {/* Icon glow effect */}
                          <div className={`absolute inset-0 ${feature.iconBg} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300 rounded-2xl`} />
                          {/* Icon container */}
                          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                            <Icon className="h-8 w-8 text-white relative z-10" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-[#1F4068] group-hover:to-[#4B0082] transition-all duration-300">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">
                        {feature.description}
                      </p>
                      
                      {/* Learn more link with modern design */}
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F4068] dark:text-[#4B0082] cursor-pointer group/link">
                        <span className="relative">
                          Learn more
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1F4068] to-[#4B0082] group-hover/link:w-full transition-all duration-300" />
                        </span>
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                    
                    {/* Decorative corner element */}
                    <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-tl-full`} />
                  </div>
                </div>
              )
            })}
            
            {/* Duplicate set for seamless loop */}
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={`second-${feature.title}`}
                  className="flex-shrink-0 w-[85vw] sm:w-[400px] md:w-[450px] lg:w-[380px] group relative"
                >
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10" />
                  
                  {/* Main card */}
                  <div className="relative h-full rounded-2xl bg-white/80 dark:bg-[#181818]/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-300 group-hover:border-transparent group-hover:shadow-2xl">
                    {/* Animated gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative z-10 p-8">
                      {/* Icon with modern design */}
                      <div className="mb-6">
                        <div className="relative inline-block">
                          {/* Icon glow effect */}
                          <div className={`absolute inset-0 ${feature.iconBg} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300 rounded-2xl`} />
                          {/* Icon container */}
                          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                            <Icon className="h-8 w-8 text-white relative z-10" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-[#1F4068] group-hover:to-[#4B0082] transition-all duration-300">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">
                        {feature.description}
                      </p>
                      
                      {/* Learn more link with modern design */}
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F4068] dark:text-[#4B0082] cursor-pointer group/link">
                        <span className="relative">
                          Learn more
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1F4068] to-[#4B0082] group-hover/link:w-full transition-all duration-300" />
                        </span>
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                    
                    {/* Decorative corner element */}
                    <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-tl-full`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
