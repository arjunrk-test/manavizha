"use client"

import { motion } from "framer-motion"
import { Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

const itemClass =
  "inline-flex shrink-0 items-center gap-1.5 text-xs sm:text-sm text-[#6b7280] transition-colors hover:text-[#3bb9ac] whitespace-nowrap"

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-[#f0ebe3]/80 bg-[#faf8f4] py-8 sm:py-10 scroll-mt-16"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 92% 0%, rgba(255, 182, 193, 0.08) 0%, transparent 24%), radial-gradient(circle at 8% 100%, rgba(59, 185, 172, 0.06) 0%, transparent 28%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
            Contact
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight text-[#1F4068] sm:text-2xl">
            Get in touch
          </h2>

          <div className="mt-5 flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-5">
            <a href="mailto:contact@manavizha.com" className={itemClass}>
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#e87898]" strokeWidth={1.75} aria-hidden />
              contact@manavizha.com
            </a>

            <span className="hidden sm:inline text-[#eadfce]" aria-hidden>
              ·
            </span>

            <a href="tel:+918925554449" className={itemClass}>
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#3bb9ac]" strokeWidth={1.75} aria-hidden />
              +91 8925554449
            </a>

            <span className="hidden sm:inline text-[#eadfce]" aria-hidden>
              ·
            </span>

            <a href="tel:+918925554440" className={itemClass}>
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#3bb9ac]" strokeWidth={1.75} aria-hidden />
              +91 8925554440
            </a>

            <span className="hidden sm:inline text-[#eadfce]" aria-hidden>
              ·
            </span>

            <span className={itemClass}>
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c9a227]" strokeWidth={1.75} aria-hidden />
              India
            </span>
          </div>

          <p className="mt-6 text-[11px] sm:text-xs text-gray-500">
            © 2024 Manavizha
            <span className="mx-2 text-[#eadfce]" aria-hidden>
              ·
            </span>
            <Link href="/privacy-policy" className="text-[#1F4068] hover:text-[#3bb9ac] transition-colors">
              Privacy Policy
            </Link>
            <span className="mx-2 text-[#eadfce]" aria-hidden>
              ·
            </span>
            <Link href="/terms-of-service" className="text-[#1F4068] hover:text-[#3bb9ac] transition-colors">
              Terms of Service
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
