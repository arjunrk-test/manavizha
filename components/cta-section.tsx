"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, ArrowRight } from "lucide-react"
import { useState } from "react"
import { AuthDialog } from "@/components/auth-dialog"

const trustLine = ["Free to join", "Verified profiles", "Family-friendly"]

export function CTASection() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <section className="py-14 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Brand gradient — kept as the section anchor */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F4068] via-[#3bb9ac] to-[#2fa085]" />

      {/* Soft light wash */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-sm font-medium text-white/80 mb-3">Get started</p>

          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold mb-4 text-white leading-[1.15] tracking-tight">
            Ready to find your perfect match?
          </h2>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto">
            Create your profile in minutes. Search with your family, on your terms.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full bg-white text-[#1F4068] hover:bg-white/90 shadow-lg text-base px-7 py-6 font-semibold"
              onClick={() => openAuth("signup")}
            >
              <Heart className="h-4 w-4 fill-[#1F4068]" />
              Create free profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full border-2 border-white/80 text-white hover:bg-white/10 text-base px-7 py-6 font-semibold"
              onClick={() => openAuth("login")}
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-white/70">
            {trustLine.join(" · ")}
          </p>
        </motion.div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} defaultMode={authMode} />
    </section>
  )
}
