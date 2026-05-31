"use client"

import { motion, useScroll, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

interface ScrollProgressProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  keyof MotionProps
> {
  ref?: React.Ref<HTMLDivElement>
  containerRef?: React.RefObject<HTMLElement | null>
}

export function ScrollProgress({
  className,
  ref,
  containerRef,
  ...props
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined
  )

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none h-px w-full origin-left", className)}
      style={{
        scaleX: scrollYProgress,
        background: "linear-gradient(to right, #1F4068, #e87898, #c9a227, #3bb9ac)",
      }}
      {...props}
    />
  )
}
