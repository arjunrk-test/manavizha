"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Sparkles, Heart } from "lucide-react"
import { motion } from "framer-motion"

interface MatchBreakdownDialogProps {
  isOpen: boolean
  onClose: () => void
  compatibility: any
  otherName: string
}

export function MatchBreakdownDialog({ isOpen, onClose, compatibility, otherName }: MatchBreakdownDialogProps) {
  if (!compatibility) return null

  const { breakdown, score, status } = compatibility

  const poruthamLabels: Record<string, string> = {
    dina: "Dina Porutham (Health & Longevity)",
    gana: "Gana Porutham (Temperament)",
    mahendra: "Mahendra Porutham (Children)",
    streeDeergha: "Stree Deergha (Prosperity)",
    yoni: "Yoni Porutham (Physical Affinity)",
    rasi: "Rasi Porutham (Family Growth)",
    rasiAdhipathi: "Rasi Adhipathi (Friendship)",
    vasya: "Vasya Porutham (Mutual Attraction)",
    rajju: "Rajju Porutham (Marital Bond)",
    vedha: "Vedha Porutham (Obstacles)"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-[#4B0082] to-[#6A5ACD] p-6 text-white text-center">
          <Heart className="h-10 w-10 text-pink-400 mx-auto mb-3 animate-pulse" />
          <DialogTitle className="text-2xl font-bold font-outfit">Detailed Compatibility</DialogTitle>
          <DialogDescription className="text-white/80 text-sm mt-1">
            Matching your profile with <span className="font-bold text-white">{otherName}</span>
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Match Score</p>
              <p className="text-3xl font-black text-[#4B0082] dark:text-purple-400">{score}<span className="text-lg text-gray-400">/10</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400">Overall Result</p>
              <Badge className={`mt-1 font-bold ${
                status === "Uthamam" ? "bg-green-500 hover:bg-green-600" :
                status === "Madhyamam" ? "bg-amber-500 hover:bg-amber-600" :
                "bg-gray-500 hover:bg-gray-600"
              }`}>
                {status}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            {Object.entries(breakdown).map(([key, matched], index) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-sm transition-shadow"
              >
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {poruthamLabels[key] || key}
                </span>
                {matched ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl flex gap-3 items-start border border-amber-100 dark:border-amber-800/30">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed italic">
              Note: This automated matching is based on standard 10-Porutham rules. Traditional matching should also consider other factors like Dosha Samyam and Dasa Sandhi.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
