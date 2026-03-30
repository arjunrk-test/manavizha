"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfDay } from "date-fns"

interface PremiumDatePickerProps {
  date?: Date
  onDateChange: (date: Date) => void
  label: string
}

export function PremiumDatePicker({ date, onDateChange, label }: PremiumDatePickerProps) {
  const [viewDate, setViewDate] = useState(date || new Date())
  const [isOpen, setIsOpen] = useState(false)

  const days = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate)
  })

  // Add padding days from previous month
  const firstDayOfMonth = startOfMonth(viewDate).getDay()
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1))
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1))

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <CalendarIcon className="h-3 w-3" /> {label}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-8 rounded-lg border-gray-100 bg-gray-50/50 justify-start px-3 font-medium text-[10px] shadow-sm"
          >
            {date ? format(date, "PP") : "Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 border-none shadow-2xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden">
          <div className="flex items-center justify-between mb-4 gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-full shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 overflow-hidden">
                <select 
                    value={viewDate.getMonth()} 
                    onChange={(e) => {
                        const newDate = new Date(viewDate)
                        newDate.setMonth(parseInt(e.target.value))
                        setViewDate(newDate)
                    }}
                    className="bg-transparent font-bold text-[11px] uppercase tracking-widest text-[#4B0082] border-none outline-none cursor-pointer hover:text-pink-500 transition-colors"
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i} className="text-gray-900 bg-white">{format(new Date(2000, i, 1), "MMM")}</option>
                    ))}
                </select>

                <select 
                    value={viewDate.getFullYear()} 
                    onChange={(e) => {
                        const newDate = new Date(viewDate)
                        newDate.setFullYear(parseInt(e.target.value))
                        setViewDate(newDate)
                    }}
                    className="bg-transparent font-bold text-[11px] uppercase tracking-widest text-[#4B0082] border-none outline-none cursor-pointer hover:text-pink-500 transition-colors"
                >
                    {Array.from({ length: 101 }, (_, i) => 2026 - i).map(year => (
                        <option key={year} value={year} className="text-gray-900 bg-white">{year}</option>
                    ))}
                </select>
            </div>

            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-full shrink-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
              <div key={d} className="text-[10px] font-black text-gray-400 text-center uppercase py-2">
                {d}
              </div>
            ))}
            {paddingDays.map(i => <div key={`pad-${i}`} />)}
            {days.map(day => (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onDateChange(day)
                  setIsOpen(false)
                }}
                className={`
                  h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all
                  ${isSameDay(day, date || new Date(0)) 
                    ? "bg-gradient-to-br from-[#4B0082] to-[#FF1493] text-white shadow-lg" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}
                `}
              >
                {format(day, "d")}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-bold uppercase tracking-widest text-pink-500"
                onClick={() => {
                    const today = startOfDay(new Date())
                    onDateChange(today)
                    setViewDate(today)
                    setIsOpen(false)
                }}
            >
                Set to Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
