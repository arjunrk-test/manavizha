"use client"

import { ShieldCheck, Lock, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MatchScoreBadgeProps {
  lifestyleScore: number;
  poruthamScore: number;
  isPremium: boolean;
  onClick?: () => void;
}

export function MatchScoreBadge({ lifestyleScore, poruthamScore, isPremium, onClick }: MatchScoreBadgeProps) {
  if (!isPremium) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-1.5 bg-gray-100/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 cursor-help group transition-all hover:bg-white">
            <Lock className="h-3 w-3 text-gray-400 group-hover:text-amber-600 transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">Premium Stats</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="bg-white p-3 rounded-2xl shadow-2xl border-indigo-100 max-w-[200px] z-[100]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#4B0082]">
              <Sparkles className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-wider">Unlock Compatibility</p>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
              Elite & Premium members can see detailed compatibility and horoscope matches.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100"
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100"
    return "text-rose-600 bg-rose-50 border-rose-100"
  }

  const getPoruthamColor = (score: number) => {
    if (score >= 7) return "text-indigo-600 bg-indigo-50 border-indigo-100"
    if (score >= 5) return "text-purple-600 bg-purple-50 border-purple-100"
    return "text-gray-600 bg-gray-50 border-gray-100"
  }

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer group"
    >
      {/* Lifestyle Score */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 ${getScoreColor(lifestyleScore)}`}>
        <Sparkles className="h-3 w-3" />
        <span className="text-[10px] font-black tracking-widest">{lifestyleScore}%</span>
      </div>

      {/* Porutham Score */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 ${getPoruthamColor(poruthamScore)}`}>
        <ShieldCheck className="h-3 w-3" />
        <span className="text-[10px] font-black tracking-widest">{poruthamScore}/10</span>
      </div>
    </motion.div>
  )
}
