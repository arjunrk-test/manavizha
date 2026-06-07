"use client"

import { ReferralPartnerNavbar } from "@/components/referral-partner-navbar"
import { ReferralPartnerAuthDialog } from "@/components/referral-partner-auth-dialog"
import { ReferralPartnerHeroSection } from "@/components/referral-partner/referral-partner-hero-section"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Award,
  Zap,
  ArrowRight,
  Handshake,
  Target,
  BarChart3,
  Mail,
  Phone,
} from "lucide-react"
import Link from "next/link"

const benefits = [
  {
    icon: DollarSign,
    title: "Earn commissions",
    description: "Get rewarded for every successful referral with competitive rates and timely payouts.",
    iconColor: "text-[#c9a227]",
  },
  {
    icon: Users,
    title: "Expand your network",
    description: "Connect with families and build meaningful relationships while helping people find their match.",
    iconColor: "text-[#3bb9ac]",
  },
  {
    icon: TrendingUp,
    title: "Grow your business",
    description: "Scale with our partner program, referral tracking tools, and dedicated support team.",
    iconColor: "text-[#3bb9ac]",
  },
  {
    icon: Shield,
    title: "Trusted platform",
    description: "Partner with a verified, secure platform trusted by thousands of families.",
    iconColor: "text-[#c97a7a]",
  },
  {
    icon: Award,
    title: "Recognition & rewards",
    description: "Earn recognition and exclusive rewards as you reach milestones in your referral journey.",
    iconColor: "text-[#c9a227]",
  },
  {
    icon: Zap,
    title: "Easy process",
    description: "Simple onboarding, an intuitive dashboard, and everything you need to succeed.",
    iconColor: "text-[#c97a7a]",
  },
]

const steps = [
  {
    number: "01",
    title: "Sign up",
    description: "Create your referral partner account and complete your profile verification.",
    icon: Handshake,
  },
  {
    number: "02",
    title: "Get your partner ID",
    description: "Receive a unique partner ID to track referrals and earn commissions.",
    icon: Target,
  },
  {
    number: "03",
    title: "Start referring",
    description: "Share your partner link and track performance in real time from your dashboard.",
    icon: BarChart3,
  },
  {
    number: "04",
    title: "Earn rewards",
    description: "Get paid for successful referrals with transparent commission tracking.",
    icon: DollarSign,
  },
]

export default function ReferralPartnerPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#faf8f4] [&_*]:not-italic">
      <ReferralPartnerNavbar />
      <ReferralPartnerAuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />

      <ReferralPartnerHeroSection onLoginOpen={() => setIsLoginOpen(true)} />

      {/* Benefits */}
      <section
        id="benefits"
        className="relative overflow-hidden py-16 sm:py-20 bg-white scroll-mt-16"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 92% 8%, rgba(255, 182, 193, 0.08) 0%, transparent 28%), radial-gradient(circle at 8% 92%, rgba(59, 185, 172, 0.06) 0%, transparent 32%)",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-10 sm:mb-12 text-center max-w-2xl mx-auto">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold mb-3">
                Partner benefits
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F4068] leading-tight tracking-tight mb-3">
                Why become a partner?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Discover the advantages of joining the Manavizha referral partner program.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.article
                    key={benefit.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group flex gap-4 items-start rounded-xl border border-gray-100/90 bg-[#faf8f4] p-5 sm:p-6 shadow-[0_8px_32px_rgba(31,64,104,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(31,64,104,0.08)] min-h-[7.5rem]"
                  >
                    <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${benefit.iconColor}`} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#1F4068] mb-1.5 leading-tight">
                        {benefit.title}
                      </h3>
                      <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative overflow-hidden py-16 sm:py-20 bg-[#faf8f4] scroll-mt-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-10 sm:mb-12 text-center max-w-2xl mx-auto">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold mb-3">
                How it works
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F4068] leading-tight tracking-tight mb-3">
                Get started in four steps
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                From sign-up to your first commission — a simple, transparent process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_8px_32px_rgba(31,64,104,0.04)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold mb-3">
                      {step.number}
                    </p>
                    <div className="mb-3">
                      <Icon className="h-5 w-5 text-[#3bb9ac]" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-semibold text-[#1F4068] mb-2 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-14 sm:py-16 lg:py-20 relative overflow-hidden scroll-mt-16">
        <div className="absolute inset-0 cta-petal-surface" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_55%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto text-black"
          >
            <p className="text-sm font-medium text-black/70 mb-3">Partner sign-in</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight mb-4">
              Ready to start earning?
            </h2>
            <p className="text-base sm:text-lg text-black/80 leading-relaxed mb-8 max-w-xl mx-auto">
              Sign in to your partner dashboard to track referrals, view earnings, and manage
              your profile.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-white text-black hover:bg-white/90 shadow-lg text-base px-7 py-6 font-semibold"
              onClick={() => setIsLoginOpen(true)}
            >
              Partner login
              <ArrowRight className="h-4 w-4 text-black" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative py-16 sm:py-20 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold mb-3">
              Contact
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F4068] leading-tight tracking-tight mb-3">
              Have questions?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
              Reach out to our partner support team — we&apos;re here to help you get started.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <a
                href="mailto:contact@manavizha.com"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-gray-100 bg-[#faf8f4] px-5 py-3.5 text-sm font-medium text-[#1F4068] shadow-[0_8px_32px_rgba(31,64,104,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(31,64,104,0.08)]"
              >
                <Mail className="h-4 w-4 text-[#3bb9ac]" strokeWidth={1.75} />
                contact@manavizha.com
              </a>
              <a
                href="tel:+918925554449"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-gray-100 bg-[#faf8f4] px-5 py-3.5 text-sm font-medium text-[#1F4068] shadow-[0_8px_32px_rgba(31,64,104,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(31,64,104,0.08)]"
              >
                <Phone className="h-4 w-4 text-[#3bb9ac]" strokeWidth={1.75} />
                +91 8925554449
              </a>
              <a
                href="tel:+918925554440"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-gray-100 bg-[#faf8f4] px-5 py-3.5 text-sm font-medium text-[#1F4068] shadow-[0_8px_32px_rgba(31,64,104,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(31,64,104,0.08)]"
              >
                <Phone className="h-4 w-4 text-[#3bb9ac]" strokeWidth={1.75} />
                +91 8925554440
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-[#f0ebe3]/80 bg-[#faf8f4] py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            <Link href="/" className="text-[#1F4068] font-medium hover:underline">
              Back to Manavizha
            </Link>
            <span className="mx-2 text-gray-300" aria-hidden>
              ·
            </span>
            Partner access for authorized referral partners only
          </p>
        </div>
      </footer>
    </main>
  )
}
