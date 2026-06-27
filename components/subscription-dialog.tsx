"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, CheckCircle2, Sparkles, Gem, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

interface SubscriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
}

export function SubscriptionDialog({ isOpen, onClose, featureName = "Premium Features" }: SubscriptionDialogProps) {
  const benefits = [
    { icon: Crown, text: "Unlimited Direct Messaging", color: "text-amber-500" },
    { icon: Sparkles, text: "Advanced Horoscope Matching", color: "text-indigo-500" },
    { icon: ShieldCheck, text: "Priority Discovery", color: "text-emerald-500" },
    { icon: Gem, text: "Premium Profile Badge & Visibility", color: "text-primary" }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none sds-glass rounded-[2.5rem] shadow-2xl backdrop-blur-3xl">
        <div className="relative p-8 overflow-hidden">
          {/* Background Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3bb9ac]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#3bb9ac]/10 rounded-full blur-3xl animate-pulse" />

          <DialogHeader className="relative z-10 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-semibold text-zinc-900 tracking-tight leading-tight">
              Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#e87898]">Premium Membership</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-600 text-sm px-4">
              Unlock {featureName} and experience exclusive matching on Manavizha.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-4 relative z-10">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/95 border border-[#eadfce] shadow-sm hover:bg-white transition-all group"
              >
                <div className={`p-2.5 rounded-xl bg-[#fdf6e3] shadow-sm border border-[#eadfce] group-hover:scale-110 transition-transform ${benefit.color}`}>
                  <benefit.icon className="h-4 w-4" />
                </div>
                <span className="text-[13px] font-medium text-zinc-900">{benefit.text}</span>
                <CheckCircle2 className="h-4 w-4 ml-auto text-[#c9a227]/70" />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 space-y-3 relative z-10">
            <Button
              className="w-full h-14 rounded-2xl bg-[#e87898] hover:bg-[#d66686] text-white font-semibold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              onClick={() => {
                onClose();
              }}
            >
              Upgrade Now
            </Button>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-2xl text-sm text-gray-500 hover:text-[#e87898] hover:bg-[#fce8ef]/50"
              onClick={onClose}
            >
              Remind Me Later
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-zinc-500">
              Trusted by 10,000+ families on Manavizha
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
