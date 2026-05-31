"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

const TWINKLE_STARS = [
  { top: "6%", left: "10%", size: 10, delay: 0 },
  { top: "14%", left: "88%", size: 8, delay: 0.8 },
  { top: "42%", left: "2%", size: 7, delay: 1.4 },
  { top: "78%", left: "6%", size: 9, delay: 0.4 },
  { top: "88%", left: "82%", size: 8, delay: 1.1 },
  { top: "28%", left: "94%", size: 7, delay: 1.8 },
]

function Planet({ className, size }: { className: string; size: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-9 w-9" : size === "md" ? "h-6 w-6" : "h-4 w-4"
  const drift = size === "lg" ? 10 : size === "md" ? 7 : 5

  return (
    <motion.div
      className={`absolute rounded-full ${dim} ${className}`}
      style={{
        background:
          "radial-gradient(circle at 32% 28%, #e8c896 0%, #c4925a 38%, #8b5e2a 72%, #6b4520 100%)",
        boxShadow:
          "0 4px 14px rgba(139, 94, 42, 0.35), inset -2px -3px 6px rgba(60, 40, 15, 0.25), inset 2px 2px 4px rgba(255, 220, 170, 0.45)",
      }}
      animate={{ y: [0, -drift, 0], x: [0, drift * 0.35, 0] }}
      transition={{ duration: size === "lg" ? 7 : 5.5, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}

export function HoroscopeZodiacWheel() {
  return (
    <div className="relative w-full max-w-[380px] mx-auto aspect-square select-none">
      {/* Cloud backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute bottom-[0%] left-1/2 -translate-x-1/2 w-[118%] h-[68%] rounded-[50%] blur-2xl opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 50% 72%, rgba(255,255,255,0.96) 0%, rgba(255,235,240,0.72) 42%, rgba(255,210,220,0.22) 78%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-[6%] left-[6%] w-[44%] h-[40%] rounded-full blur-xl opacity-75"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.88) 0%, rgba(255,228,235,0.42) 58%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-[8%] right-[4%] w-[50%] h-[42%] rounded-full blur-xl opacity-80"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(255,220,228,0.48) 55%, transparent 100%)",
          }}
        />
      </div>

      {/* Pulsing golden aura behind wheel */}
      <motion.div
        className="absolute inset-[10%] rounded-full pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle, rgba(201,162,39,0.22) 0%, rgba(255,210,220,0.12) 45%, transparent 70%)",
        }}
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.92, 1.06, 0.92] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Slow rotating decorative ring */}
      <motion.div
        className="absolute inset-[4%] rounded-full pointer-events-none border border-dashed border-[#c9a227]/25"
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[2%] rounded-full pointer-events-none border border-[#c9a227]/10"
        aria-hidden
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating planets */}
      <Planet className="top-[4%] right-[12%] z-20" size="lg" />
      <Planet className="bottom-[16%] left-[2%] z-20" size="md" />
      <Planet className="top-[30%] left-[0%] z-20" size="sm" />

      {/* Twinkling stars */}
      {TWINKLE_STARS.map((star, i) => (
        <motion.div
          key={i}
          className="absolute z-20 pointer-events-none text-[#c9a227]"
          style={{ top: star.top, left: star.left }}
          animate={{ opacity: [0.15, 0.75, 0.2], scale: [0.85, 1.15, 0.9] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        >
          <Star
            className="fill-[#c9a227]/30"
            style={{ width: star.size, height: star.size }}
            strokeWidth={1}
          />
        </motion.div>
      ))}

      {/* Main wheel — gentle float + shimmer */}
      <motion.div
        className="relative z-10 w-full h-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/zodiac-wheel.png"
            alt="Decorative Vedic zodiac wheel with twelve signs"
            fill
            priority
            className="object-contain drop-shadow-[0_12px_40px_rgba(201,162,39,0.18)]"
            sizes="(max-width: 768px) 90vw, 380px"
          />

          {/* Light shimmer sweep */}
          <motion.div
            className="absolute inset-[8%] rounded-full overflow-hidden pointer-events-none mix-blend-soft-light"
            aria-hidden
          >
            <motion.div
              className="absolute inset-0 w-[45%]"
              style={{
                background:
                  "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.55) 48%, transparent 100%)",
              }}
              animate={{ x: ["-120%", "280%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
            />
          </motion.div>

          {/* Warm center glow over sun */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-full pointer-events-none"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle, rgba(255,220,140,0.35) 0%, rgba(201,162,39,0.12) 50%, transparent 72%)",
            }}
            animate={{ opacity: [0.5, 1, 0.55], scale: [0.9, 1.12, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  )
}
