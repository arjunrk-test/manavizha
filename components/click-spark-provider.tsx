"use client"

import { useRef, useEffect, useCallback } from "react"

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

const SPARK_COLOR = "#FFE566"
const SPARK_HALO = "rgba(255, 243, 180, 0.95)"
const SPARK_SIZE = 8
const SPARK_RADIUS = 20
const SPARK_COUNT = 8
const SPARK_DURATION = 400
const EXTRA_SCALE = 1

export function ClickSparkProvider() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const dprRef = useRef(1)

  const easeOut = useCallback((t: number) => t * (2 - t), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let resizeTimeout: ReturnType<typeof setTimeout>

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      const { innerWidth, innerHeight } = window
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resizeCanvas, 100)
    }

    resizeCanvas()
    window.addEventListener("resize", handleResize)

    let animationId: number

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width / dprRef.current, canvas.height / dprRef.current)

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= SPARK_DURATION) return false

        const progress = elapsed / SPARK_DURATION
        const eased = easeOut(progress)

        const distance = eased * SPARK_RADIUS * EXTRA_SCALE
        const lineLength = SPARK_SIZE * (1 - eased)

        const x1 = spark.x + distance * Math.cos(spark.angle)
        const y1 = spark.y + distance * Math.sin(spark.angle)
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)

        ctx.strokeStyle = SPARK_HALO
        ctx.lineWidth = 5
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = SPARK_COLOR
        ctx.lineWidth = 2.5
        ctx.stroke()

        return true
      })

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    const handleClick = (e: MouseEvent) => {
      const now = performance.now()
      const newSparks: Spark[] = Array.from({ length: SPARK_COUNT }, (_, i) => ({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / SPARK_COUNT,
        startTime: now,
      }))
      sparksRef.current.push(...newSparks)
    }

    document.addEventListener("click", handleClick, true)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("click", handleClick, true)
      clearTimeout(resizeTimeout)
    }
  }, [easeOut])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] block select-none"
    />
  )
}
