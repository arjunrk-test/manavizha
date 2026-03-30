"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, MapPin, Clock, Calendar, Star, Zap, Loader2, CheckCircle2 } from "lucide-react"
import { generateHoroscope, Location } from "@/lib/astrology"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface HoroscopeGeneratorDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSave?: (data: any) => void
}

const MAJOR_CITIES: Record<string, Location> = {
  "Chennai": { latitude: 13.0827, longitude: 80.2707 },
  "Madurai": { latitude: 9.9252, longitude: 78.1198 },
  "Coimbatore": { latitude: 11.0168, longitude: 76.9558 },
  "Trichy": { latitude: 10.7905, longitude: 78.7047 },
  "Salem": { latitude: 11.6643, longitude: 78.1460 },
  "Tirunelveli": { latitude: 8.7139, longitude: 77.7567 },
  "Thanjavur": { latitude: 10.7870, longitude: 79.1378 },
  "Vellore": { latitude: 12.9165, longitude: 79.1325 },
  "Erode": { latitude: 11.3410, longitude: 77.7172 },
  "Tuticorin": { latitude: 8.8053, longitude: 78.1460 },
};

export function HoroscopeGeneratorDialog({ isOpen, onClose, userId, onSave }: HoroscopeGeneratorDialogProps) {
  const [dob, setDob] = useState("")
  const [tob, setTob] = useState("")
  const [pob, setPob] = useState("Chennai")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    if (!dob || !tob) {
      toast.error("Please enter both Date and Time of Birth")
      return
    }

    setIsGenerating(true)
    try {
      const location = MAJOR_CITIES[pob] || MAJOR_CITIES["Chennai"]
      const fullDateTime = `${dob}T${tob}:00`
      const data = await generateHoroscope(fullDateTime, location)
      setResult(data)
      toast.success("Horoscope generated successfully!")
    } catch (err) {
      console.error("Error generating horoscope:", err)
      toast.error("Failed to generate horoscope. Please check your inputs.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!result) return

    setIsSaving(true)
    try {
      const horoscopeData = {
        user_id: userId,
        star: result.star,
        zodiac_sign: result.rashi,
        lagnam: result.lagnam,
        time_of_birth: tob,
        place_of_birth: pob,
        completion_percentage: 100,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("horoscope_details")
        .upsert(horoscopeData, { onConflict: 'user_id' })

      if (error) throw error

      toast.success("Horoscope saved to your profile!")
      if (onSave) onSave(horoscopeData)
      onClose()
    } catch (err) {
      console.error("Error saving horoscope:", err)
      toast.error("Failed to save horoscope to profile.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#4B0082] to-[#FF1493] p-6 text-white text-center relative">
          <Sparkles className="absolute top-4 right-4 h-6 w-6 opacity-30 animate-pulse" />
          <DialogTitle className="text-2xl font-bold font-outfit">Tamil Horoscope Generator</DialogTitle>
          <DialogDescription className="text-white/80 text-sm mt-1">
            Calculate your Star, Rashi, and Lagnam the traditional way.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          {!result ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Date of Birth
                </Label>
                <Input 
                  id="dob" 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)}
                  className="rounded-xl border-gray-200 focus:ring-[#4B0082]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tob" className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Time of Birth
                </Label>
                <Input 
                  id="tob" 
                  type="time" 
                  value={tob} 
                  onChange={(e) => setTob(e.target.value)}
                  className="rounded-xl border-gray-200 focus:ring-[#4B0082]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pob" className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Place of Birth
                </Label>
                <select 
                  id="pob"
                  value={pob}
                  onChange={(e) => setPob(e.target.value)}
                  className="w-full rounded-xl border-gray-200 p-2 text-sm bg-white dark:bg-gray-800 border focus:ring-2 focus:ring-[#4B0082] outline-none"
                >
                  {Object.keys(MAJOR_CITIES).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full h-12 bg-[#4B0082] hover:bg-[#3B0062] rounded-xl font-bold shadow-lg shadow-[#4B0082]/20 gap-2"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {isGenerating ? "Calculating..." : "Generate My Horoscope"}
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/50 text-center">
                  <Star className="h-5 w-5 text-[#4B0082] mx-auto mb-2" />
                  <p className="text-[10px] uppercase font-bold text-gray-400">Your Star</p>
                  <p className="text-xl font-bold text-[#4B0082] dark:text-purple-400">{result.star}</p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-2xl border border-pink-100 dark:border-pink-800/50 text-center">
                  <Sparkles className="h-5 w-5 text-[#FF1493] mx-auto mb-2" />
                  <p className="text-[10px] uppercase font-bold text-gray-400">Your Rashi</p>
                  <p className="text-xl font-bold text-[#FF1493] dark:text-pink-400">{result.rashi}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Lagnam (Ascendant)</p>
                      <p className="font-bold text-gray-900 dark:text-white">{result.lagnam}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Place</p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{pob}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setResult(null)} 
                  className="flex-1 rounded-xl h-11"
                >
                  Recalculate
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-[2] bg-gradient-to-r from-[#4B0082] to-[#FF1493] hover:opacity-90 rounded-xl h-11 font-bold shadow-lg gap-2"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save to Profile"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[9px] text-gray-400 text-center w-full italic">
            * Calculations are based on Drik Panchang rules using the Lahiri Ayanamsha.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
