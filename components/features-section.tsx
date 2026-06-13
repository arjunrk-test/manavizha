"use client"

import { motion } from "framer-motion"
import { Shield, Search, Heart, Users, MessageCircle, Sparkles, Check } from "lucide-react"
import TiltedCard from "@/components/ui/tilted-card"

const features = [
  {
    icon: Shield,
    title: "Verified profiles",
    description: "Identity, education, and background reviewed before a profile goes live.",
    iconColor: "text-[#3bb9ac]",
    iconBg: "bg-[#3bb9ac]/10",
  },
  {
    icon: Heart,
    title: "Privacy you control",
    description: "Choose who sees your photos and contact details, on your terms.",
    iconColor: "text-[#e87898]",
    iconBg: "bg-[#fce8ef]",
  },
  {
    icon: Search,
    title: "Thoughtful matching",
    description: "Recommendations based on preferences, values, and lifestyle.",
    iconColor: "text-[#c9a227]",
    iconBg: "bg-[#fdf6e3]",
  },
  {
    icon: Sparkles,
    title: "Horoscope compatibility",
    description: "Thirukanitham and Vakkiyam calculations for astrological alignment.",
    iconColor: "text-[#3bb9ac]",
    iconBg: "bg-[#3bb9ac]/10",
  },
  {
    icon: Users,
    title: "Family dashboard",
    description: "Parents can browse, shortlist, and discuss profiles with you.",
    iconColor: "text-[#c9a227]",
    iconBg: "bg-[#fdf6e3]",
  },
  {
    icon: MessageCircle,
    title: "Secure messaging",
    description: "Express interest privately without sharing contacts too early.",
    iconColor: "text-[#e87898]",
    iconBg: "bg-[#fce8ef]",
  },
]

const trustPoints = [
  "Profiles reviewed",
  "Family dashboards",
  "Horoscope tools",
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-0 lg:min-h-[calc(100dvh-4rem)] lg:flex lg:flex-col lg:justify-center bg-[#faf8f4]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 92% 8%, rgba(255, 182, 193, 0.1) 0%, transparent 28%), radial-gradient(circle at 8% 92%, rgba(59, 185, 172, 0.07) 0%, transparent 32%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-10 sm:mb-12 lg:mb-14 lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold mb-3">
                Why Choose Us
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#1F4068] leading-[1.12] tracking-tight mb-3">
                Built for trust and compatibility
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Verification, privacy, and compatibility — designed for individuals and families.
              </p>
            </div>

            <div className="mt-6 lg:mt-0 shrink-0">
              <div className="inline-flex flex-wrap items-center gap-x-1 gap-y-2 rounded-xl border border-gray-100/90 bg-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_8px_32px_rgba(31,64,104,0.06)]">
                {trustPoints.map((point, index) => (
                  <span key={point} className="flex items-center">
                    {index > 0 && (
                      <span className="text-gray-300/80 text-sm px-2.5 select-none" aria-hidden>
                        |
                      </span>
                    )}
                    <span className="flex items-center gap-2 text-sm font-medium text-[#1F4068]">
                      <Check className="h-4 w-4 text-[#3bb9ac]" strokeWidth={2.5} />
                      {point}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <TiltedCard
                    containerHeight="auto"
                    containerWidth="100%"
                    rotateAmplitude={15}
                    scaleOnHover={1.1}
                    showMobileWarning={false}
                    showTooltip={false}
                  >
                    <article className="flex min-h-[7.5rem] gap-4 rounded-xl border border-gray-100/90 bg-white p-5 shadow-[0_8px_32px_rgba(31,64,104,0.06)] sm:min-h-[8rem] sm:p-6">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${feature.iconBg}`}
                      >
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} strokeWidth={1.75} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1.5 text-base font-semibold leading-tight text-[#1F4068]">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-500 sm:text-[15px]">
                          {feature.description}
                        </p>
                      </div>
                    </article>
                  </TiltedCard>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
