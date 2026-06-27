"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Navbar } from "@/components/navbar"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { BackFabButton } from "@/components/legal/back-fab-button"

interface LegalPageShellProps {
  title: string
  eyebrow?: string
  lastUpdated?: string
  relatedLink?: { href: string; label: string }
  children: ReactNode
}

export function LegalPageShell({
  title,
  eyebrow = "Legal",
  lastUpdated,
  relatedLink = { href: "/terms-of-service", label: "Terms of Service" },
  children,
}: LegalPageShellProps) {
  const updatedLabel =
    lastUpdated ??
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <main className="relative min-h-screen bg-[#faf8f4] [&_*]:not-italic">
      <Navbar />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 92% 8%, rgba(255, 182, 193, 0.1) 0%, transparent 28%), radial-gradient(circle at 8% 92%, rgba(59, 185, 172, 0.07) 0%, transparent 32%)",
        }}
      />

      <div className="relative z-10 pb-16 pt-20 sm:pt-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 sm:mb-10"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
              {eyebrow}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1F4068] sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>
            <p className="mt-3 text-sm text-gray-500">Last updated: {updatedLabel}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[1.25rem] border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_8px_32px_rgba(31,64,104,0.06)]"
          >
            <DashboardJourneyPatterns />

            <div className="relative z-10 p-6 sm:p-8 lg:p-10 xl:p-12">{children}</div>
          </motion.div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Questions?{" "}
            <Link href="/#contact" className="font-medium text-[#1F4068] hover:text-[#3bb9ac] transition-colors">
              Contact us
            </Link>
            {" · "}
            <Link
              href={relatedLink.href}
              className="font-medium text-[#1F4068] hover:text-[#3bb9ac] transition-colors"
            >
              {relatedLink.label}
            </Link>
          </p>
        </div>
      </div>

      <BackFabButton />
    </main>
  )
}
