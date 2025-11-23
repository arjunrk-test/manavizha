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
    color: "from-purple-500 to-violet-500",
    bgColor: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
    iconBg: "bg-purple-500",
  },
  {
    icon: Heart,
    title: "Privacy First",
    description: "Your data is secure with us. We prioritize your privacy and confidentiality with end-to-end encryption.",
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
    iconBg: "bg-violet-500",
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
    color: "from-orange-500 to-amber-500",
    bgColor: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    iconBg: "bg-orange-500",
  },
  {
    icon: Star,
    title: "Premium Experience",
    description: "Enjoy a premium experience with personalized matchmaking services and dedicated support team.",
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30",
    iconBg: "bg-yellow-500",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/50 to-transparent dark:via-violet-950/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

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
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-950/50 dark:to-purple-950/50 text-violet-700 dark:text-violet-400 font-medium mb-6"
          >
            Why Choose Us
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-purple-600 to-amber-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden relative">
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
                      className="inline-flex items-center text-sm font-medium text-violet-600 dark:text-violet-400 cursor-pointer group/link"
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
