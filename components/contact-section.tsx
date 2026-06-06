"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-10 sm:py-12 bg-[#faf8f4] border-t border-[#f0ebe3]/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mx-auto text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-2">
            Contact
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#1F4068] tracking-tight mb-6">
            Get in touch
          </h2>

          <div className="flex flex-nowrap items-center justify-center gap-x-4 sm:gap-x-5 overflow-x-auto pb-1 text-xs sm:text-sm text-[#6b7280] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <a
              href="mailto:contact@manavizha.com"
              className="inline-flex shrink-0 items-center gap-2 hover:text-[#3bb9ac] transition-colors whitespace-nowrap"
            >
              <Mail className="h-4 w-4 shrink-0 text-[#e87898]" aria-hidden />
              contact@manavizha.com
            </a>

            <span className="shrink-0 text-[#eadfce]" aria-hidden>·</span>

            <a
              href="tel:+918925554449"
              className="inline-flex shrink-0 items-center gap-2 hover:text-[#3bb9ac] transition-colors whitespace-nowrap"
            >
              <Phone className="h-4 w-4 shrink-0 text-[#3bb9ac]" aria-hidden />
              +91 8925554449
            </a>

            <span className="shrink-0 text-[#eadfce]" aria-hidden>·</span>

            <a
              href="tel:+918925554440"
              className="inline-flex shrink-0 items-center gap-2 hover:text-[#3bb9ac] transition-colors whitespace-nowrap"
            >
              <Phone className="h-4 w-4 shrink-0 text-[#3bb9ac]" aria-hidden />
              +91 8925554440
            </a>

            <span className="shrink-0 text-[#eadfce]" aria-hidden>·</span>

            <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
              <MapPin className="h-4 w-4 shrink-0 text-[#c9a227]" aria-hidden />
              India
            </span>

            <span className="shrink-0 text-[#eadfce]" aria-hidden>·</span>

            <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
              <Clock className="h-4 w-4 shrink-0 text-[#1F4068]" aria-hidden />
              <span>
                <span className="text-[#1F4068] font-medium">Mon–Fri</span> 9 AM – 6 PM
                <span className="mx-1.5 text-[#eadfce]">·</span>
                <span className="text-[#1F4068] font-medium">Sat</span> 10 AM – 4 PM
                <span className="mx-1.5 text-[#eadfce]">·</span>
                <span className="text-[#1F4068] font-medium">Sun</span> Closed
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
