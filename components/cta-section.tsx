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
      <div className="absolute inset-0 cta-petal-surface" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_55%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto text-black"
        >
          <p className="text-sm font-medium text-black/70 mb-3">Get started</p>

          <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-semibold leading-[1.15] tracking-tight mb-4">
            Ready to find your perfect match?
          </h2>

          <p className="text-base sm:text-lg text-black/80 leading-relaxed mb-8 max-w-xl mx-auto">
            Create your profile in minutes. Search with your family, on your terms.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-white/90 shadow-lg text-base px-7 py-6 font-semibold"
              onClick={() => openAuth("signup")}
            >
              <Heart className="h-4 w-4 fill-black" />
              Create free profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full border-2 border-black/25 text-black hover:bg-black/5 text-base px-7 py-6 font-semibold"
              onClick={() => openAuth("login")}
            >
              Sign in
              <ArrowRight className="h-4 w-4 text-black" />
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-black/65">
            {trustLine.join(" · ")}
          </p>
        </motion.div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} defaultMode={authMode} />
    </section>
  )
}
