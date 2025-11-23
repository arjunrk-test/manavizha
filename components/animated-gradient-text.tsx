"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function AnimatedGradientText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-full bg-white/60 dark:bg-gray-900/60 px-4 py-1.5 text-sm font-semibold shadow-lg backdrop-blur-sm transition-shadow duration-500 ease-out hover:shadow-xl border border-gray-200/50 dark:border-gray-800/50",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 block h-full w-full animate-gradient rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-amber-500/20 bg-[length:var(--bg-size)_100%] p-[1px] ![mask-composite:subtract] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
        )}
        style={{ '--bg-size': '300%' } as React.CSSProperties}
      />

      <span className="relative z-10 bg-gradient-to-r from-violet-600 via-purple-600 to-amber-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
        {children}
      </span>
    </motion.div>
  )
}
