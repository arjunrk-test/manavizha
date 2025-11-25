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
    <section id="features" className="py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F4068]/5 to-transparent dark:via-[#1F4068]/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#1F4068]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4B0082]/10 rounded-full blur-3xl" />

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-200 bg-white/90 dark:bg-gray-800/90 overflow-hidden relative">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <CardHeader className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold relative z-10">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center text-sm font-medium text-[#1F4068] dark:text-[#4B0082] cursor-pointer group/link"
                    >
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
