"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

const WATCHED_SECTIONS = ["features", "testimonials", "cta"] as const

export function ScrollToHeroButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const visibility: Record<string, boolean> = {
      hero: false,
      features: false,
      testimonials: false,
      cta: false,
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility[entry.target.id] = entry.isIntersecting
        })

        const inTargetSection = WATCHED_SECTIONS.some((id) => visibility[id])
        setVisible(inTargetSection && !visibility.hero)
      },
      {
        threshold: 0.12,
        rootMargin: "-64px 0px 0px 0px",
      }
    )

    ;["hero", ...WATCHED_SECTIONS].forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToHero = () => {
    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="scroll-hero-fab fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8"
        >
          <motion.button
            type="button"
            onClick={scrollToHero}
            aria-label="Back to hero section"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="scroll-hero-fab-orbit block border-0 bg-transparent p-0 cursor-pointer"
          >
            <span className="scroll-hero-fab-float-layer">
              <span className="scroll-hero-fab-shadow" aria-hidden />
              <span className="scroll-hero-fab-ring" aria-hidden />
              <span className="scroll-hero-fab-core" aria-hidden />
              <span className="scroll-hero-fab-face">
                <ArrowUp className="relative z-10 h-5 w-5 text-[#1F4068]" strokeWidth={2.25} />
              </span>
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
