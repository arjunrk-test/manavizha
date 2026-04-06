"use client"

import { CheckCircle2, Sparkles, Target, Heart, Shield, X, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface CompatibilityBreakdown {
  category: string;
  score: number;
  label: string;
  details: string[];
  icon: any;
}

interface CompatibilitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  lifestyleScore: number;
  poruthamScore: number;
  breakdown: CompatibilityBreakdown[];
  poruthamDetails?: Record<string, boolean>;
  isPremium?: boolean;
}

const iconMap: Record<string, any> = {
  Shield: Shield,
  Heart: Heart,
  Target: Target,
  Sparkles: Sparkles
}

export function CompatibilitySheet({ 
  isOpen, 
  onClose, 
  userName, 
  lifestyleScore, 
  poruthamScore, 
  breakdown,
  poruthamDetails,
  isPremium = false
}: CompatibilitySheetProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-t-[3rem] sm:rounded-[3rem] bg-gray-50 border-none shadow-2xl flex flex-col">
        <VisuallyHidden>
          <DialogTitle>AI Compatibility Breakdown</DialogTitle>
        </VisuallyHidden>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-200/50 rounded-full z-50 sm:hidden" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 md:p-12 space-y-10">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/50 rounded-full border border-indigo-100/50 mb-2">
                <Sparkles className="h-4 w-4 text-[#4B0082]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#4B0082]">AI Compatibility Engine</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Why we picked <span className="text-[#4B0082]">{userName}</span></h2>
              <p className="text-gray-500 text-sm font-medium">Our algorithm analyzed 142 data points to find your match.</p>
            </div>

            {/* Main Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-8 bg-gradient-to-br from-[#4B0082] to-indigo-800 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-900/20 text-center space-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Lifestyle Match</p>
                <div className="text-5xl font-black tracking-tighter">{lifestyleScore}%</div>
              </div>
              <div className="p-8 bg-white rounded-[2.5rem] border-2 border-indigo-100 text-center space-y-2 shadow-xl shadow-indigo-900/10 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Horoscope Porutham</p>
                {isPremium ? (
                  <div className="text-5xl font-black tracking-tighter text-[#4B0082]">{poruthamScore}/10</div>
                ) : (
                  <div className="mt-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Premium Only</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lifestyle Breakdown */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Match Breakdown</h3>
                <div className="h-px bg-gray-100 flex-1 ml-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {breakdown.map((item, idx) => {
                  const Icon = iconMap[item.category === "Future" ? "Target" : item.category === "Dealbreakers" ? "Shield" : "Heart"] || Sparkles
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-white/80 rounded-3xl border border-indigo-50 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-none border border-indigo-100">
                          <Icon className="h-6 w-6 text-[#4B0082]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                          <p className="text-sm font-black text-gray-900">{item.score}% Match</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {item.details.map((detail, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-gray-600 leading-tight">{detail}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Horoscope Section */}
            {poruthamDetails && isPremium && (
              <div className="p-8 bg-indigo-50 rounded-[3rem] border-2 border-indigo-100/50 space-y-6 shadow-inner">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#4B0082]" />
                  <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[#4B0082]">Traditional Porutham Analysis</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(poruthamDetails).map(([name, matched], idx) => (
                    <Badge 
                      key={idx} 
                      variant={matched ? "default" : "outline"}
                      className={`h-8 px-4 border shadow-none font-bold uppercase tracking-wider text-[9px] ${matched ? 'bg-[#4B0082] text-white border-[#4B0082]' : 'bg-white text-gray-300 border-gray-100'}`}
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-indigo-900/40 font-bold uppercase tracking-widest text-center italic mt-4">
                   Calculated using Vedic Algorithms (Tamil Standard)
                </p>
              </div>
            )}

            {poruthamDetails && !isPremium && (
              <div className="p-8 bg-amber-50 rounded-[3rem] border-2 border-amber-100/50 space-y-4 shadow-inner text-center flex flex-col items-center">
                 <Shield className="h-6 w-6 text-amber-500 mb-2" />
                 <h3 className="text-sm font-black uppercase tracking-[0.1em] text-amber-700">Detailed Porutham Analysis</h3>
                 <p className="text-xs font-medium text-amber-600/70 max-w-sm">Unlock full horoscope matching details to see how compatible your stars truly are.</p>
                 <Button className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-transform h-10 px-6 shadow-xl shadow-amber-500/20">
                    Subscribe to See
                 </Button>
              </div>
            )}

            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-[#4B0082] text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-900/20">
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
