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
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToHero}
          aria-label="Back to hero section"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gray-100/90 bg-white text-[#1F4068] shadow-[0_8px_32px_rgba(31,64,104,0.14)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(31,64,104,0.18)] sm:bottom-8 sm:right-8"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
