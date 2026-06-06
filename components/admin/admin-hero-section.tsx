"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { AdminHeroVisual } from "@/components/admin/admin-hero-visual"

const trustPoints = ["Secure access", "Role-based login", "Audit-ready tools"]

interface AdminHeroSectionProps {
  onLoginOpen: () => void
}

export function AdminHeroSection({ onLoginOpen }: AdminHeroSectionProps) {
  return (
    <section
      id="hero"
      className="admin-hero-surface relative overflow-x-hidden scroll-mt-16 lg:min-h-[calc(100dvh-4rem)] lg:flex lg:flex-col"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center pt-20 pb-6 sm:pt-24 lg:pt-28 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 text-center lg:text-left lg:pl-4 xl:pl-8 mb-12 lg:mb-0"
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold mb-4">
              Admin portal
            </p>

            <h1 className="font-display text-[2rem] sm:text-4xl lg:text-[2.5rem] xl:text-[2.85rem] font-semibold leading-[1.08] tracking-tight mb-4">
              <span className="text-[#1F4068]">Manage the platform</span>
              <br />
              <span className="text-brand-gold">with confidence</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              Secure tools for user management, verification, analytics, and system configuration
              — built for the Manavizha operations team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-stretch sm:items-center mb-8">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full btn-brand-gradient px-8 h-11 text-sm font-semibold shadow-[0_8px_24px_rgba(232,120,152,0.25)]"
                onClick={onLoginOpen}
              >
                Access admin panel
                <ArrowRight className="h-4 w-4 text-black" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full border border-gray-200 bg-white text-[#1F4068] hover:bg-gray-50 px-7 h-11 text-sm font-semibold shadow-sm"
                asChild
              >
                <Link href="/admin/verification">
                  <ShieldCheck className="h-4 w-4" />
                  Verification queue
                </Link>
              </Button>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-1 gap-y-2 rounded-full border border-gray-100/90 bg-white/90 px-4 py-3 sm:px-5 shadow-[0_8px_32px_rgba(31,64,104,0.06)]">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative"
          >
            <AdminHeroVisual />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 border-t border-[#f0ebe3]/90 pt-6 pb-8"
      >
        <div className="flex items-center justify-center gap-3 px-4 text-sm">
          <ChevronLeft className="h-4 w-4 text-[#e87898]/70" aria-hidden />
          <Heart className="h-3.5 w-3.5 fill-[#e87898]/50 text-[#e87898]/50" aria-hidden />
          <span className="text-center font-medium text-[#1F4068]/70">
            Empowering meaningful relationships, built on trust.
          </span>
          <Heart className="h-3.5 w-3.5 fill-[#e87898]/50 text-[#e87898]/50" aria-hidden />
          <ChevronRight className="h-4 w-4 text-[#e87898]/70" aria-hidden />
        </div>
      </motion.div>
    </section>
  )
}
