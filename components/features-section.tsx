"use client"

import { motion } from "framer-motion"
import { Shield, Search, Heart, Users, MessageCircle, Sparkles, Check } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Verified profiles",
    description: "Identity, education, and background reviewed before a profile goes live.",
  },
  {
    icon: Heart,
    title: "Privacy you control",
    description: "Choose who sees your photos and contact details, on your terms.",
  },
  {
    icon: Search,
    title: "Thoughtful matching",
    description: "Recommendations based on preferences, values, and lifestyle.",
  },
  {
    icon: Sparkles,
    title: "Horoscope compatibility",
    description: "Thirukanitham and Vakkiyam calculations for astrological alignment.",
  },
  {
    icon: Users,
    title: "Family dashboard",
    description: "Parents can browse, shortlist, and discuss profiles with you.",
  },
  {
    icon: MessageCircle,
    title: "Secure messaging",
    description: "Express interest privately without sharing contacts too early.",
  },
]

const trustPoints = [
  "Profiles reviewed",
  "Family dashboards",
  "Horoscope tools",
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-14 sm:py-16 lg:py-20 bg-white dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-8 sm:mb-10 lg:flex lg:items-end lg:justify-between lg:gap-10">
            <div className="max-w-lg">
              <p className="text-sm font-medium text-[#3bb9ac] mb-2">Why Choose Us</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1F4068] dark:text-white leading-tight tracking-tight mb-2">
                Built for trust and compatibility
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                Verification, privacy, and compatibility — designed for individuals and families.
              </p>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-5 lg:mt-0 shrink-0">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <Check className="h-3.5 w-3.5 text-[#3bb9ac]" strokeWidth={2.5} />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="flex gap-3.5 items-start bg-white dark:bg-[#141414] rounded-lg border border-gray-200/70 dark:border-gray-800/70 p-4 transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-[#3bb9ac]/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#3bb9ac]" strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                      {feature.description}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
