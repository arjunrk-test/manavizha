"use client"

import { useId } from "react"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"

type PetalConfig = {
  top: string
  left: string
  size: number
  blur: number
  opacity: number
  parallaxY: number
  parallaxX: number
  rotateDrift: number
  rotateX: number
  rotateY: number
  rotateZ: number
  floatDuration: number
  floatDelay: number
  floatAmp: number
  tint: "rose" | "blush" | "gold"
}

const PETALS: PetalConfig[] = [
  { top: "4%", left: "2%", size: 56, blur: 8, opacity: 0.72, parallaxY: -280, parallaxX: 120, rotateDrift: 95, rotateX: 32, rotateY: -22, rotateZ: 18, floatDuration: 5.5, floatDelay: 0, floatAmp: 1.4, tint: "rose" },
  { top: "14%", left: "22%", size: 38, blur: 3, opacity: 0.68, parallaxY: -340, parallaxX: -80, rotateDrift: -110, rotateX: 18, rotateY: 38, rotateZ: -28, floatDuration: 4.8, floatDelay: 0.6, floatAmp: 1.2, tint: "blush" },
  { top: "6%", left: "52%", size: 48, blur: 6, opacity: 0.65, parallaxY: -300, parallaxX: 40, rotateDrift: 75, rotateX: -14, rotateY: 28, rotateZ: 42, floatDuration: 5.2, floatDelay: 1.1, floatAmp: 1.3, tint: "rose" },
  { top: "2%", left: "78%", size: 70, blur: 12, opacity: 0.58, parallaxY: -260, parallaxX: -140, rotateDrift: 85, rotateX: -28, rotateY: 16, rotateZ: 55, floatDuration: 6.5, floatDelay: 0.3, floatAmp: 1.5, tint: "rose" },
  { top: "22%", left: "88%", size: 42, blur: 5, opacity: 0.7, parallaxY: -380, parallaxX: -160, rotateDrift: -70, rotateX: 40, rotateY: -32, rotateZ: -15, floatDuration: 4.5, floatDelay: 1.8, floatAmp: 1.1, tint: "blush" },
  { top: "32%", left: "6%", size: 44, blur: 4, opacity: 0.74, parallaxY: -420, parallaxX: 150, rotateDrift: 120, rotateX: -20, rotateY: 24, rotateZ: 35, floatDuration: 5.8, floatDelay: 0.9, floatAmp: 1.35, tint: "gold" },
  { top: "38%", left: "35%", size: 34, blur: 2, opacity: 0.62, parallaxY: -360, parallaxX: -50, rotateDrift: -90, rotateX: 14, rotateY: -18, rotateZ: -42, floatDuration: 4.2, floatDelay: 2.2, floatAmp: 1.0, tint: "blush" },
  { top: "44%", left: "62%", size: 52, blur: 7, opacity: 0.66, parallaxY: -440, parallaxX: -90, rotateDrift: 65, rotateX: 26, rotateY: 30, rotateZ: 20, floatDuration: 5.4, floatDelay: 1.4, floatAmp: 1.25, tint: "rose" },
  { top: "48%", left: "92%", size: 36, blur: 4, opacity: 0.64, parallaxY: -400, parallaxX: -180, rotateDrift: -105, rotateX: 35, rotateY: -40, rotateZ: 48, floatDuration: 4.6, floatDelay: 0.2, floatAmp: 1.15, tint: "gold" },
  { top: "55%", left: "14%", size: 60, blur: 10, opacity: 0.6, parallaxY: -480, parallaxX: 110, rotateDrift: 130, rotateX: -32, rotateY: 20, rotateZ: -55, floatDuration: 6.2, floatDelay: 1.6, floatAmp: 1.45, tint: "rose" },
  { top: "58%", left: "44%", size: 40, blur: 3, opacity: 0.7, parallaxY: -520, parallaxX: 30, rotateDrift: -85, rotateX: 22, rotateY: -26, rotateZ: 30, floatDuration: 5.0, floatDelay: 2.5, floatAmp: 1.2, tint: "blush" },
  { top: "62%", left: "74%", size: 46, blur: 6, opacity: 0.63, parallaxY: -460, parallaxX: -120, rotateDrift: 100, rotateX: -18, rotateY: 34, rotateZ: -38, floatDuration: 5.6, floatDelay: 0.7, floatAmp: 1.3, tint: "gold" },
  { top: "68%", left: "96%", size: 32, blur: 3, opacity: 0.67, parallaxY: -500, parallaxX: -200, rotateDrift: -115, rotateX: 30, rotateY: -14, rotateZ: 62, floatDuration: 4.4, floatDelay: 1.0, floatAmp: 1.05, tint: "blush" },
  { top: "72%", left: "28%", size: 54, blur: 9, opacity: 0.58, parallaxY: -560, parallaxX: 80, rotateDrift: 88, rotateX: 28, rotateY: -36, rotateZ: -22, floatDuration: 6.0, floatDelay: 1.9, floatAmp: 1.4, tint: "rose" },
  { top: "76%", left: "56%", size: 38, blur: 4, opacity: 0.69, parallaxY: -540, parallaxX: -60, rotateDrift: -95, rotateX: -24, rotateY: 42, rotateZ: 18, floatDuration: 4.9, floatDelay: 0.4, floatAmp: 1.18, tint: "gold" },
  { top: "80%", left: "82%", size: 50, blur: 8, opacity: 0.61, parallaxY: -580, parallaxX: -150, rotateDrift: 105, rotateX: 16, rotateY: -28, rotateZ: -48, floatDuration: 5.7, floatDelay: 2.0, floatAmp: 1.32, tint: "rose" },
  { top: "10%", left: "42%", size: 28, blur: 2, opacity: 0.55, parallaxY: -320, parallaxX: 20, rotateDrift: 60, rotateX: 10, rotateY: 15, rotateZ: -12, floatDuration: 3.8, floatDelay: 2.8, floatAmp: 0.95, tint: "blush" },
  { top: "26%", left: "68%", size: 30, blur: 2, opacity: 0.57, parallaxY: -350, parallaxX: -70, rotateDrift: -55, rotateX: -12, rotateY: 20, rotateZ: 25, floatDuration: 4.0, floatDelay: 3.1, floatAmp: 1.0, tint: "gold" },
  { top: "50%", left: "24%", size: 26, blur: 1, opacity: 0.52, parallaxY: -390, parallaxX: 60, rotateDrift: 70, rotateX: 8, rotateY: -10, rotateZ: -20, floatDuration: 3.6, floatDelay: 1.3, floatAmp: 0.9, tint: "blush" },
  { top: "84%", left: "4%", size: 34, blur: 5, opacity: 0.56, parallaxY: -600, parallaxX: 170, rotateDrift: -125, rotateX: -30, rotateY: 18, rotateZ: 40, floatDuration: 5.3, floatDelay: 2.4, floatAmp: 1.22, tint: "rose" },
]

const TINTS = {
  rose: ["#f4a4b8", "#e87898", "#d4567a"],
  blush: ["#ffc8d4", "#ffb3c6", "#ff9eb8"],
  gold: ["#f0d48a", "#e8c060", "#d4a843"],
}

function RosePetalShape({ tint }: { tint: PetalConfig["tint"] }) {
  const id = useId()
  const [c1, c2, c3] = TINTS[tint]

  return (
    <svg viewBox="0 0 48 64" className="h-full w-full drop-shadow-md" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.98" />
          <stop offset="55%" stopColor={c2} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c3} stopOpacity="0.78" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 C24 2 46 18 44 36 C42 50 24 62 24 62 C24 62 6 50 4 36 C2 18 24 2 24 2 Z"
        fill={`url(#${id})`}
      />
      <path
        d="M24 8 C24 8 38 20 36 34 C34 44 24 52 24 52 C24 52 14 44 12 34 C10 20 24 8 24 8 Z"
        fill="white"
        fillOpacity="0.2"
      />
    </svg>
  )
}

function ScrollPetal({
  config,
  scrollY,
  sectionProgress,
}: {
  config: PetalConfig
  scrollY: MotionValue<number>
  sectionProgress: MotionValue<number>
}) {
  const pageY = useTransform(scrollY, [0, 500], [0, config.parallaxY * 0.55])
  const pageX = useTransform(scrollY, [0, 500], [0, config.parallaxX * 0.55])
  const pageRotate = useTransform(
    scrollY,
    [0, 500],
    [config.rotateZ, config.rotateZ + config.rotateDrift * 0.6]
  )
  const pageRotateX = useTransform(
    scrollY,
    [0, 500],
    [config.rotateX, config.rotateX + 35]
  )
  const pageRotateY = useTransform(
    scrollY,
    [0, 500],
    [config.rotateY, config.rotateY - 40]
  )

  const exitY = useTransform(sectionProgress, [0, 1], [0, config.parallaxY * 0.45])
  const exitX = useTransform(sectionProgress, [0, 1], [0, config.parallaxX * 0.45])
  const exitRotate = useTransform(
    sectionProgress,
    [0, 1],
    [0, config.rotateDrift * 0.4]
  )
  const scale = useTransform(sectionProgress, [0, 0.6, 1], [1, 1.12, 1.25])
  const opacity = useTransform(
    sectionProgress,
    [0, 0.7, 1],
    [config.opacity, config.opacity * 0.75, 0]
  )

  const combinedY = useTransform([pageY, exitY], ([py, ey]) => (py as number) + (ey as number))
  const combinedX = useTransform([pageX, exitX], ([px, ex]) => (px as number) + (ex as number))
  const combinedRotate = useTransform(
    [pageRotate, exitRotate],
    ([pr, er]) => (pr as number) + (er as number)
  )

  return (
    <motion.div
      className="hero-petal-3d absolute pointer-events-none"
      style={{
        top: config.top,
        left: config.left,
        width: config.size,
        height: config.size * 1.33,
        y: combinedY,
        x: combinedX,
        rotate: combinedRotate,
        rotateX: pageRotateX,
        rotateY: pageRotateY,
        scale,
        opacity,
        filter: `blur(${config.blur}px)`,
        zIndex: config.blur > 7 ? 1 : 3,
      }}
    >
      <div
        className="hero-petal-float h-full w-full"
        style={
          {
            "--float-duration": `${config.floatDuration}s`,
            "--float-delay": `${config.floatDelay}s`,
            "--float-amp": config.floatAmp,
          } as React.CSSProperties
        }
      >
        <RosePetalShape tint={config.tint} />
      </div>
    </motion.div>
  )
}

interface HeroRosePetalsProps {
  scrollRef: React.RefObject<HTMLElement | null>
}

export function HeroRosePetals({ scrollRef }: HeroRosePetalsProps) {
  const { scrollY } = useScroll()
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  })

  return (
    <div className="hero-petals-layer absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {PETALS.map((petal, index) => (
        <ScrollPetal
          key={index}
          config={petal}
          scrollY={scrollY}
          sectionProgress={scrollYProgress}
        />
      ))}
    </div>
  )
}
