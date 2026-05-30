"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Users, ArrowRight, ShieldCheck, Lock, UserRound } from "lucide-react"
import { useState, useRef } from "react"
import { AuthDialog } from "@/components/auth-dialog"
import { HowItWorksCard } from "@/components/home/how-it-works-card"
import { TrustBar } from "@/components/home/trust-bar"
import { HeroRosePetals } from "@/components/home/hero-rose-petals"

const trustIndicators = [
  { icon: ShieldCheck, text: "Trusted & Verified Profiles" },
  { icon: Lock, text: "Safe & Private Platform" },
  { icon: UserRound, text: "Serious Matrimonial Service" },
]

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <section
      ref={sectionRef}
      className="home-hero-surface relative overflow-hidden lg:h-[calc(100dvh-4rem)] lg:max-h-[900px] lg:min-h-[580px] flex flex-col"
    >
      <HeroRosePetals scrollRef={sectionRef} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0 pt-3 pb-3 lg:pt-4 lg:pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center min-h-0">
            {/* Left column */}
            <div className="lg:col-span-5 text-center lg:text-left relative z-20 py-2 lg:py-0 lg:pl-8 xl:pl-12 2xl:pl-16 lg:pr-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#c9a227]/25 text-xs sm:text-sm text-gray-700 mb-3 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" strokeWidth={1.75} />
                Trusted by 10,000+ families
              </div>

              <h1 className="font-display text-[2rem] sm:text-4xl lg:text-[2.35rem] xl:text-[2.65rem] font-semibold leading-[1.08] mb-2.5">
                <span className="text-[#1F4068]">Find Your Perfect</span>
                <br />
                <span className="text-brand-gold text-[2.15rem] sm:text-[2.75rem] lg:text-[2.5rem] xl:text-[2.85rem]">
                  Life Partner
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-snug mb-3 max-w-md mx-auto lg:mx-0">
                Join thousands of verified profiles and start your journey to a happy and meaningful
                future.
              </p>

              <ul className="hidden sm:flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs text-gray-600 mb-4">
                {trustIndicators.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-brand-gold shrink-0" strokeWidth={1.75} />
                    {text}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center lg:justify-start">
                <Button
                  size="sm"
                  className="rounded-xl btn-brand-gradient px-5 h-10 text-sm font-semibold"
                  onClick={() => openAuth("signup")}
                >
                  Start Your Journey
                  <Heart className="h-3.5 w-3.5 fill-black" />
                  <ArrowRight className="h-3.5 w-3.5 text-black" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border border-gray-200 bg-white text-[#1F4068] hover:bg-gray-50 px-5 h-10 text-sm font-semibold shadow-sm"
                  onClick={() => openAuth("login")}
                >
                  <Users className="h-3.5 w-3.5" />
                  Browse Profiles
                </Button>
              </div>
            </div>

            {/* Right — image + card */}
            <div className="lg:col-span-7 relative min-h-[240px] sm:min-h-[280px] lg:min-h-0 h-full">
              <div className="hero-image-curve absolute inset-0 lg:inset-y-1 lg:right-[-2vw] lg:left-0 overflow-hidden shadow-[0_16px_48px_rgba(31,64,104,0.1)]">
                <img
                  src="/images/hero-couple.jpg"
                  alt="Couple celebrating their wedding"
                  className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#faf8f4]/40 lg:to-[#faf8f4]/55" />
              </div>

              <div className="absolute right-2 sm:right-4 lg:right-5 top-1/2 -translate-y-1/2 z-30 w-[min(100%,17.5rem)] sm:w-[18rem]">
                <HowItWorksCard />
              </div>
            </div>
          </div>

          <div className="shrink-0 pt-2 lg:pt-3">
            <TrustBar />
          </div>
        </motion.div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} defaultMode={authMode} />
    </section>
  )
}
