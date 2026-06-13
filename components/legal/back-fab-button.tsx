"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export function BackFabButton() {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-hero-fab group/fab fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8"
    >
      <span
        role="tooltip"
        className="pointer-events-none absolute right-full top-1/2 z-10 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#f0ebe3] bg-white px-3 py-1.5 text-xs font-medium text-[#1F4068] opacity-0 shadow-[0_4px_16px_rgba(31,64,104,0.08)] transition-opacity duration-200 group-hover/fab:opacity-100 group-focus-within/fab:opacity-100"
      >
        Go back
      </span>

      <motion.button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        title="Go back"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="scroll-hero-fab-orbit block cursor-pointer border-0 bg-transparent p-0"
      >
        <span className="scroll-hero-fab-float-layer">
          <span className="scroll-hero-fab-shadow" aria-hidden />
          <span className="scroll-hero-fab-ring" aria-hidden />
          <span className="scroll-hero-fab-core" aria-hidden />
          <span className="scroll-hero-fab-face">
            <ArrowLeft className="relative z-10 h-5 w-5 text-[#1F4068]" strokeWidth={2.25} />
          </span>
        </span>
      </motion.button>
    </motion.div>
  )
}
