"use client"

import { useRef } from "react"
import { motion, useScroll } from "motion/react"

interface DashboardScrollProgressProps {
  scrollContainer: HTMLElement | null
}

export function DashboardScrollProgress({
  scrollContainer,
}: DashboardScrollProgressProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  containerRef.current = scrollContainer

  const { scrollYProgress } = useScroll({
    container: containerRef,
  })

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-[60] h-px bg-[#eadfce]"
    >
      <motion.div
        className="h-full w-full origin-left"
        style={{
          scaleX: scrollYProgress,
          background: "linear-gradient(to right, #1F4068, #e87898, #c9a227, #3bb9ac)",
        }}
      />
    </div>
  )
}
