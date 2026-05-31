"use client"

import { Heart } from "lucide-react"
import { useEffect, useState } from "react"

const LOADING_MESSAGES = [
  "Preparing your sacred match journey...",
  "Aligning stars for meaningful connections...",
  "Curating profiles crafted just for you...",
]

function MandalaBackdrop() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="dashboard-loading-mandala absolute inset-[-18px] h-[calc(100%+36px)] w-[calc(100%+36px)] text-[#e87898]"
      aria-hidden
      fill="none"
    >
      <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="0.9" opacity="0.28" />
      <circle cx="60" cy="60" r="24" stroke="currentColor" strokeWidth="0.9" opacity="0.22" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="60"
          y1="8"
          x2="60"
          y2="20"
          stroke="currentColor"
          strokeWidth="0.85"
          opacity="0.2"
          transform={`rotate(${angle} 60 60)`}
        />
      ))}
    </svg>
  )
}

function MatrimonialRingsLoader() {
  return (
    <div className="relative mx-auto h-[92px] w-[92px]">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fce8ef] via-[#fdf6e3] to-[#e6f7f5] blur-2xl opacity-75 dashboard-loading-glow" />
      <MandalaBackdrop />
      <div className="relative h-full w-full">
        <div className="dashboard-loading-ring-left absolute left-0 top-1/2 h-[54px] w-[54px] rounded-full border-[3px] border-[#e87898] shadow-[0_2px_12px_rgba(232,120,152,0.25),inset_0_0_10px_rgba(232,120,152,0.12)]" />
        <div className="dashboard-loading-ring-right absolute right-0 top-1/2 h-[54px] w-[54px] rounded-full border-[3px] border-[#c9a227] shadow-[0_2px_12px_rgba(201,162,39,0.2),inset_0_0_10px_rgba(201,162,39,0.1)]" />
        <Heart className="dashboard-loading-heart absolute left-1/2 top-1/2 z-10 h-5 w-5 text-[#e87898] fill-[#fce8ef]" />
      </div>
    </div>
  )
}

export function DashboardLoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length)
        setVisible(true)
      }, 280)
    }, 3200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf8f4]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "url(/images/dashboard-mandala.png)",
          backgroundSize: "480px auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        aria-hidden
        className="dashboard-journey-static-grid pointer-events-none absolute inset-0 opacity-40"
      />
      <div
        aria-hidden
        className="dashboard-journey-static-dots pointer-events-none absolute inset-0 opacity-35"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="dashboard-journey-glow absolute -left-10 top-[18%] h-36 w-36 bg-[#fce8ef] opacity-55"
          style={{ animation: "float-blob 16s ease-in-out infinite" }}
        />
        <div
          className="dashboard-journey-glow absolute -right-8 bottom-[20%] h-32 w-32 bg-[#fdf6e3] opacity-50"
          style={{ animation: "float-blob 20s ease-in-out infinite -4s" }}
        />
        <div
          className="dashboard-journey-glow absolute left-[35%] top-[8%] h-24 w-24 bg-[#e6f7f5] opacity-45"
          style={{ animation: "float-blob 18s ease-in-out infinite -8s" }}
        />
        <div className="absolute left-[12%] top-[62%] h-3 w-3 rounded-full bg-[#e87898]/30 blur-[2px] dashboard-loading-petal" />
        <div
          className="absolute right-[18%] top-[28%] h-2.5 w-2.5 rounded-full bg-[#c9a227]/35 blur-[1px] dashboard-loading-petal"
          style={{ animationDelay: "-1.2s" }}
        />
        <div
          className="absolute bottom-[18%] left-[42%] h-2 w-2 rounded-full bg-[#3bb9ac]/30 blur-[1px] dashboard-loading-petal"
          style={{ animationDelay: "-2.4s" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-sm px-6 text-center">
        <MatrimonialRingsLoader />

        <p className="mt-8 text-[17px] font-semibold tracking-tight text-[#1F4068]">Manavizha</p>
        <p
          className={`mt-2 min-h-[20px] text-[13px] text-[#6b7280] transition-all duration-300 ease-in-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="dashboard-loading-dot h-1.5 w-1.5 rounded-full bg-[#e87898]"
              style={{ animationDelay: `${dot * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
