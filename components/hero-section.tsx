"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Users, ArrowRight, ShieldCheck, Lock, UserRound } from "lucide-react"
import { useState } from "react"
import { AuthDialog } from "@/components/auth-dialog"
import { HowItWorksCard } from "@/components/home/how-it-works-card"
import { TrustBar } from "@/components/home/trust-bar"

const trustIndicators = [
  { icon: ShieldCheck, text: "Trusted & Verified Profiles" },
  { icon: Lock, text: "Safe & Private Platform" },
  { icon: UserRound, text: "Serious Matrimonial Service" },
]

const petals = [
  { className: "hero-petal w-3 h-4 top-[18%] left-[42%] rotate-[25deg] opacity-60" },
  { className: "hero-petal w-2.5 h-3.5 top-[32%] left-[48%] rotate-[-15deg] opacity-40" },
  { className: "hero-petal w-4 h-5 top-[55%] right-[8%] rotate-[40deg] opacity-50 hidden lg:block" },
  { className: "hero-petal w-3 h-4 bottom-[28%] left-[38%] rotate-[10deg] opacity-35 hidden lg:block" },
]

export function HeroSection() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <section className="home-hero-surface relative overflow-hidden pt-[4.5rem] pb-10 sm:pb-14 lg:pb-16">
      {petals.map((petal, i) => (
        <div key={i} className={petal.className} aria-hidden />
      ))}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative lg:min-h-[620px]">
            {/* Left column */}
            <div className="max-w-xl lg:max-w-[34rem] text-center lg:text-left lg:pt-8 lg:pb-32 relative z-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#c9a227]/25 text-sm text-gray-700 mb-6 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-brand-gold" strokeWidth={1.75} />
                Trusted by 10,000+ families
              </div>

              <h1 className="font-display text-[2.35rem] sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.1] mb-5">
                <span className="text-[#1F4068]">Find Your Perfect</span>
                <br />
                <span className="text-brand-gold text-[2.6rem] sm:text-[3.2rem] lg:text-[3.6rem]">
                  Life Partner
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
                Join thousands of verified profiles and start your journey to a happy and meaningful
                future.
              </p>

              <ul className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2.5 text-sm text-gray-600 mb-8">
                {trustIndicators.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-brand-gold shrink-0" strokeWidth={1.75} />
                    {text}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="rounded-xl bg-[#1F4068] hover:bg-[#1a3558] text-white px-7 h-12 text-base font-semibold shadow-md"
                  onClick={() => openAuth("signup")}
                >
                  Start Your Journey
                  <Heart className="h-4 w-4 fill-white" />
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl border border-gray-200 bg-white text-[#1F4068] hover:bg-gray-50 px-7 h-12 text-base font-semibold shadow-sm"
                  onClick={() => openAuth("login")}
                >
                  <Users className="h-4 w-4" />
                  Browse Profiles
                </Button>
              </div>
            </div>

            {/* Right — curved image + card on right */}
            <div className="relative mt-10 lg:mt-0 lg:absolute lg:inset-y-0 lg:right-[-4vw] lg:w-[58vw] lg:max-w-[780px]">
              <div className="hero-image-curve relative h-[340px] sm:h-[420px] lg:h-full min-h-[480px] overflow-hidden shadow-[0_24px_64px_rgba(31,64,104,0.12)]">
                <img
                  src="/images/hero-couple.jpg"
                  alt="Couple celebrating their wedding"
                  className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#faf8f4]/30 lg:to-[#faf8f4]/50" />
              </div>

              <div className="relative lg:absolute lg:right-6 xl:right-10 lg:top-1/2 lg:-translate-y-1/2 lg:w-[min(100%,19.5rem)] mt-5 lg:mt-0 z-30 mx-auto max-w-sm lg:max-w-none">
                <HowItWorksCard />
              </div>
            </div>
          </div>

          <div className="relative z-20 mt-8 lg:-mt-6">
            <TrustBar />
          </div>
        </motion.div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} defaultMode={authMode} />
    </section>
  )
}
