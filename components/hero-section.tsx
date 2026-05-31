"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Users, ArrowRight } from "lucide-react"
import { useState, useRef } from "react"
import { AuthDialog } from "@/components/auth-dialog"
import { HowItWorksCard } from "@/components/home/how-it-works-card"
import { TrustBar } from "@/components/home/trust-bar"
import { HeroRosePetals } from "@/components/home/hero-rose-petals"

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
      id="hero"
      ref={sectionRef}
      className="home-hero-surface relative overflow-hidden scroll-mt-16 lg:h-[calc(100dvh-4rem)] lg:max-h-[900px] lg:min-h-[580px] flex flex-col"
    >
      <HeroRosePetals scrollRef={sectionRef} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0 pt-3 pb-3 lg:pt-4 lg:pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_auto] gap-4 lg:gap-x-6 lg:gap-y-0 min-h-0 lg:items-stretch">
            {/* Left column */}
            <div className="lg:col-span-5 lg:row-start-1 text-center lg:text-left relative z-20 py-2 lg:py-0 lg:pl-8 xl:pl-12 2xl:pl-16 lg:pr-4 lg:flex lg:flex-col lg:justify-center">
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

              <div className="mb-4 max-w-md mx-auto lg:mx-0">
                <HowItWorksCard />
              </div>

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

            {/* Right — photo */}
            <div className="lg:col-span-7 lg:row-start-1 relative min-h-[240px] sm:min-h-[280px] lg:min-h-0 h-full">
              <div className="hero-image-curve absolute inset-0 lg:right-[-2vw] lg:left-0 overflow-hidden shadow-[0_16px_48px_rgba(31,64,104,0.1)]">
                <img
                  src="/images/hero-couple.jpg"
                  alt="Couple celebrating their wedding"
                  className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#faf8f4]/40 lg:to-[#faf8f4]/55" />
              </div>
            </div>

            <div className="lg:col-span-12 lg:row-start-2 shrink-0 pt-3 lg:-mt-3">
              <TrustBar />
            </div>
          </div>
        </motion.div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} defaultMode={authMode} />
    </section>
  )
}
