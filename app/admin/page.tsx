"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Shield,
  Settings,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Lock,
  Database,
  Activity,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Users,
    title: "User management",
    description: "Manage accounts, profiles, and access permissions across the platform.",
    iconColor: "text-[#3bb9ac]",
  },
  {
    icon: ShieldCheck,
    title: "Profile verification",
    description: "Review and approve photo verification requests with side-by-side comparison.",
    iconColor: "text-[#c9a227]",
  },
  {
    icon: Database,
    title: "Data management",
    description: "Access profiles, matches, master data, and system configurations.",
    iconColor: "text-[#3bb9ac]",
  },
  {
    icon: BarChart3,
    title: "Analytics & reports",
    description: "Track platform performance, funnel metrics, and operational reports.",
    iconColor: "text-[#c9a227]",
  },
  {
    icon: Shield,
    title: "Security & access",
    description: "Monitor admin access, security settings, and account integrity.",
    iconColor: "text-[#c97a7a]",
  },
  {
    icon: Settings,
    title: "System settings",
    description: "Configure platform parameters, email tools, and feature controls.",
    iconColor: "text-[#c97a7a]",
  },
]

const capabilities = [
  {
    number: "01",
    title: "Access control",
    description: "Granular permissions over who can view and change platform data.",
    icon: Lock,
  },
  {
    number: "02",
    title: "Data oversight",
    description: "View, edit, and manage user records and verification workflows.",
    icon: Database,
  },
  {
    number: "03",
    title: "Analytics dashboard",
    description: "Real-time insights into sign-ups, activity, and conversion funnels.",
    icon: BarChart3,
  },
  {
    number: "04",
    title: "Activity monitoring",
    description: "Track system events and stay on top of operational health.",
    icon: Activity,
  },
]

const trustPoints = ["Secure access", "Role-based login", "Audit-ready tools"]

export default function AdminPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#faf8f4] [&_*]:not-italic">
      <AdminNavbar />
      <AdminAuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />

      {/* Hero */}
      <section
        id="hero"
        className="home-hero-surface relative overflow-hidden scroll-mt-16 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center lg:max-w-4xl"
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold mb-4">
              Admin portal
            </p>

            <h1 className="font-display text-[2rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-semibold leading-[1.1] tracking-tight mb-4">
              <span className="text-[#1F4068]">Manage the platform</span>
              <br />
              <span className="text-brand-gold">with confidence</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Secure tools for user management, verification, analytics, and system
              configuration — built for the Manavizha operations team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-xl btn-brand-gradient px-7 h-11 text-sm font-semibold"
                onClick={() => setIsLoginOpen(true)}
              >
                Access admin panel
                <ArrowRight className="h-4 w-4 text-black" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white text-[#1F4068] hover:bg-gray-50 px-7 h-11 text-sm font-semibold shadow-sm"
                asChild
              >
                <Link href="/admin/verification">
                  <ShieldCheck className="h-4 w-4" />
                  Verification queue
                </Link>
              </Button>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-2 rounded-xl border border-gray-100/90 bg-white px-4 py-3 sm:px-5 shadow-[0_8px_32px_rgba(31,64,104,0.06)]">
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
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
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
                Admin tools
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F4068] leading-tight tracking-tight mb-3">
                Everything you need in one place
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                From verification to analytics — manage the full platform lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.article
                    key={feature.title}
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
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#1F4068] mb-1.5 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section
        id="capabilities"
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
                Capabilities
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F4068] leading-tight tracking-tight mb-3">
                Built for operational control
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Core workflows that keep the platform secure, accurate, and running smoothly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon
                return (
                  <motion.div
                    key={capability.number}
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
                      {capability.number}
                    </p>
                    <div className="mb-3">
                      <Icon className="h-5 w-5 text-[#3bb9ac]" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-semibold text-[#1F4068] mb-2 leading-tight">
                      {capability.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {capability.description}
                    </p>
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
            <p className="text-sm font-medium text-black/70 mb-3">Admin sign-in</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight mb-4">
              Ready to open the admin panel?
            </h2>
            <p className="text-base sm:text-lg text-black/80 leading-relaxed mb-8 max-w-xl mx-auto">
              Sign in with your admin credentials to manage users, verification, and platform
              settings.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-white text-black hover:bg-white/90 shadow-lg text-base px-7 py-6 font-semibold"
              onClick={() => setIsLoginOpen(true)}
            >
              Access admin panel
              <ArrowRight className="h-4 w-4 text-black" />
            </Button>
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
            Admin access for authorized personnel only
          </p>
        </div>
      </footer>
    </main>
  )
}
