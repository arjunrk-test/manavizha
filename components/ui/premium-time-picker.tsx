"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PremiumTimePickerProps {
  time: string // HH:mm format
  onTimeChange: (time: string) => void
  label: string
}

export function PremiumTimePicker({ time, onTimeChange, label }: PremiumTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const [hours, minutes] = time ? time.split(":").map(Number) : [12, 0]
  
  const handleHourSelect = (h: number) => {
    onTimeChange(`${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
  }
  
  const handleMinuteSelect = (m: number) => {
    onTimeChange(`${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <Clock className="h-3 w-3" /> {label}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-8 rounded-lg border-gray-100 bg-gray-50/50 justify-start px-3 font-medium text-[10px] shadow-sm"
          >
            {time || "Time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 border-none shadow-2xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden">
          <div className="flex h-[300px]">
            {/* Hours Column */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-4 border-r border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 text-center uppercase mb-4 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm py-1">Hours</p>
              {Array.from({ length: 24 }, (_, i) => (
                <button
                  key={`h-${i}`}
                  onClick={() => handleHourSelect(i)}
                  className={`
                    w-full py-3 px-3 text-sm font-bold transition-all flex items-center justify-center gap-2
                    ${hours === i ? "text-[#4B0082] bg-purple-50 dark:bg-purple-900/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}
                  `}
                >
                  {i.toString().padStart(2, '0')}
                  {hours === i && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>

            {/* Minutes Column */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-4">
            <p className="text-[10px] font-black text-gray-400 text-center uppercase mb-4 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm py-1">Minutes</p>
              {Array.from({ length: 60 }, (_, i) => (
                <button
                  key={`m-${i}`}
                  onClick={() => handleMinuteSelect(i)}
                  className={`
                    w-full py-3 px-3 text-sm font-bold transition-all flex items-center justify-center gap-2
                    ${minutes === i ? "text-[#FF1493] bg-pink-50 dark:bg-pink-900/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}
                  `}
                >
                  {i.toString().padStart(2, '0')}
                  {minutes === i && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <Button 
              className="w-full bg-gradient-to-r from-[#4B0082] to-[#FF1493] text-white rounded-xl h-10 font-bold"
              onClick={() => setIsOpen(false)}
            >
              Confirm Time
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
