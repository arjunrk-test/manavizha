"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Save, 
  Printer, 
  Info,
  History,
  Languages,
  ArrowRight,
  Globe,
  Loader2,
  Star,
  Moon,
  Wind,
  Zap,
  Sunrise,
  Sunset,
  CheckCircle2,
  Share2,
  MapPin,
  Clock,
  Calendar
} from "lucide-react"
import { generateHoroscope, Location } from "@/lib/astrology"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GlobalLocationSelector } from "@/components/ui/global-location-selector"
import { PremiumDatePicker } from "@/components/ui/premium-date-picker"
import { PremiumTimePicker } from "@/components/ui/premium-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { parseISO, format } from "date-fns"
import { cn } from "@/lib/utils"

export default function HoroscopePage() {
  const [dob, setDob] = useState<Date | undefined>(undefined)
  const [tob, setTob] = useState("12:00")
  const [timezone, setTimezone] = useState("+05:30")
  const [pob, setPob] = useState({
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 13.0827,
    longitude: 80.2707
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    // Helper to render the South Indian square chart
    const VedicChart = ({ title, planets, type }: { title: string, planets: any[], type: 'rasi' | 'amsam' }) => {
        const gridPositions = [
            { id: 11, label: "Meenam" }, { id: 0, label: "Mesham" }, { id: 1, label: "Rishabam" }, { id: 2, label: "Midhunam" },
            { id: 10, label: "Kumbham" }, { id: -1, label: "CENTER" }, { id: -1, label: "CENTER" }, { id: 3, label: "Kadagam" },
            { id: 9, label: "Magaram" }, { id: -1, label: "CENTER" }, { id: -1, label: "CENTER" }, { id: 4, label: "Simmam" },
            { id: 8, label: "Dhanusu" }, { id: 7, label: "Viruchigam" }, { id: 6, label: "Thulam" }, { id: 5, label: "Kanni" }
        ];

        return (
            <div className="bg-white/95 dark:bg-gray-900/95 rounded-[1.5rem] p-3 border border-white shadow-xl overflow-hidden ring-1 ring-[#4B0082]/10 h-full flex flex-col">
                <h3 className="text-[9px] font-black text-[#4B0082]/40 mb-2 uppercase tracking-[0.4em] text-center">{title}</h3>
                <div className="grid grid-cols-4 border-2 border-[#4B0082]/10 rounded-[1rem] overflow-hidden relative shadow-inner bg-white flex-1">
                    {gridPositions.map((pos, idx) => {
                        if (pos.id === -1) return (
                            <div key={idx} className="bg-[#4B0082]/5 flex items-center justify-center p-1">
                                {idx === 5 && (
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-[#4B0082]/20 uppercase tracking-[0.3em]">{type === 'rasi' ? "இராசி" : "அம்சம்"}</p>
                                        <Star className="h-4 w-4 text-[#4B0082]/5 mx-auto mt-1" />
                                    </div>
                                )}
                            </div>
                        )
                        
                        const occupants = planets.filter(p => (type === 'rasi' ? p.rasiIndex : p.navamsamIndex) === pos.id);
                        
                        return (
                            <div key={idx} className="border border-[#4B0082]/10 p-1 flex flex-col items-center justify-center min-h-[70px] relative group hover:bg-[#4B0082]/5 transition-all">
                                <span className="absolute top-1 left-1 text-[7px] text-[#4B0082]/20 font-black uppercase tracking-tighter">
                                    {pos.label}
                                </span>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5 w-full">
                                    {occupants.map((p, pIdx) => (
                                        <motion.span 
                                            key={pIdx}
                                            initial={{ scale: 0, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                            className={cn(
                                                "text-sm font-black px-1.5 py-0.5 rounded-md shadow-sm border",
                                                p.isLagnam 
                                                    ? "bg-amber-100/80 text-amber-700 border-amber-200" 
                                                    : p.name === 'Moon'
                                                        ? "bg-blue-100/80 text-blue-700 border-blue-200"
                                                        : "bg-gray-50/80 text-[#4B0082] border-gray-100"
                                            )}
                                        >
                                            {p.tamilAbbr}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
        // Fetch existing birth details if available
        const { data: profile } = await supabase
          .from("personal_details")
          .select("date_of_birth")
          .eq("user_id", user.id)
          .maybeSingle()

        if (profile?.date_of_birth) {
          setDob(parseISO(profile.date_of_birth))
        }

        const { data: horo } = await supabase
          .from("horoscope_details")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (horo) {
            setTob(horo.time_of_birth || "12:00")
            setPob(prev => ({
              ...prev,
              city: horo.place_of_birth || "Chennai"
            }))
        }
      }
      setIsLoadingProfile(false)
    }
    getProfile()
  }, [])

  const handleGenerate = async () => {
    if (!dob || !tob) {
      toast.error("Please enter both Date and Time of Birth")
      return
    }

    if (!pob.latitude || !pob.longitude || isNaN(pob.latitude) || isNaN(pob.longitude)) {
        toast.error("Invalid location. Please re-select your city to get coordinates.")
        return
    }

    setIsGenerating(true)
    try {
      const location = { latitude: pob.latitude, longitude: pob.longitude }
      const formattedDate = format(dob, "yyyy-MM-dd")
      
      // FIX: Robustly normalize the time string and ensure exactly HH:mm:00
      const timeParts = tob.split(':')
      const cleanTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1]?.padStart(2, '0') || '00'}:00`
      const fullDateTime = `${formattedDate}T${cleanTime}`
      
      console.log("[UI] Generating horoscope with inputs:", { fullDateTime, location, timezone });
      
      const data = await generateHoroscope(fullDateTime, location, timezone)
      setResult(data)
      toast.success("Horoscope calculated successfully!")
    } catch (err: any) {
      console.error("[UI] Error generating horoscope:", err)
      // Provide more specific feedback
      const errorMsg = err.message || "Unknown error"
      toast.error(`Calculation Failed: ${errorMsg}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!result || !userId) return

    setIsSaving(true)
    try {
      const horoscopeData = {
        user_id: userId,
        star: result.star,
        zodiac_sign: result.rashi,
        lagnam: result.lagnam,
        time_of_birth: tob,
        place_of_birth: pob.city,
        completion_percentage: 100,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("horoscope_details")
        .upsert(horoscopeData, { onConflict: 'user_id' })

      if (error) throw error

      toast.success("Horoscope saved to your profile!")
    } catch (err) {
      console.error("Error saving horoscope:", err)
      toast.error("Failed to save horoscope to profile.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingProfile) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#4B0082]" />
          </div>
      )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Page Header (Minimal) */}
      <div className="mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[8px] font-black uppercase tracking-widest mb-3"
          >
            <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            Vedic Astrology System
          </motion.div>
          <h1 className="text-3xl md:text-3xl font-black text-white mb-1 tracking-tighter">Horoscope Generator</h1>
          <p className="text-white/40 text-[10px] max-w-2xl mx-auto font-medium">Sidereal Traditional Tamil Calculations (Drik Panchang)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Sidebar: Inputs */}
        <div className="md:col-span-4 lg:col-span-3 xl:col-span-2">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-3xl rounded-lg p-3 border border-white/20 shadow-xl sticky top-4"
            >
                <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="h-3 w-3 text-pink-500" />
                    <h2 className="text-xs font-black text-white uppercase tracking-wider">Birth Data</h2>
                </div>

                <div className="space-y-2">
                    <PremiumDatePicker 
                        label="Date" 
                        date={dob} 
                        onDateChange={setDob} 
                    />

                    <PremiumTimePicker 
                        label="Time" 
                        time={tob} 
                        onTimeChange={setTob} 
                    />

                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Timezone</label>
                        <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger className="h-8 rounded-md bg-white/5 border-white/10 text-white font-bold text-[10px]">
                                <SelectValue placeholder="GMT" />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border-white/10 bg-gray-900 text-white">
                                <SelectItem value="+05:30">IST (+5:30)</SelectItem>
                                <SelectItem value="+00:00">UTC (+0:00)</SelectItem>
                                <SelectItem value="-05:00">EST (-5:00)</SelectItem>
                                <SelectItem value="+08:00">SGT (+8:00)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <GlobalLocationSelector 
                        onLocationChange={setPob}
                        initialCity={pob.city}
                    />

                    <Button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="w-full h-9 bg-gradient-to-r from-[#4B0082] to-[#FF1493] text-white rounded-md font-black text-[10px] uppercase shadow-lg transition-all"
                    >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Calculate"}
                    </Button>
                </div>
            </motion.div>
        </div>

        {/* Right Content: Results */}
        <div className="md:col-span-8 lg:col-span-9 xl:col-span-10">
            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-[2rem] border border-white/10 border-dashed"
                    >
                        <Star className="h-10 w-10 text-white/5 mb-4" />
                        <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.4em]">Awaiting Input</h3>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-5"
                    >
                        {/* Summary Header Card */}
                        <div className="bg-gradient-to-br from-[#4B0082] to-[#FF1493] rounded-[1.5rem] p-6 text-white shadow-xl relative overflow-hidden flex items-center justify-between">
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-0.5 text-white/40">Computed Profile</p>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
                                    {result.star} <span className="text-white/40 mx-1.5">/</span> {result.rashi}
                                </h2>
                            </div>
                            <div className="flex gap-6 relative z-10 text-right">
                                <div>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Lagnam</p>
                                    <p className="text-xs font-black text-amber-300 uppercase">{result.lagnam}</p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Born at</p>
                                    <p className="text-xs font-black text-white/80 uppercase">{pob.city}</p>
                                </div>
                            </div>
                            <Star className="absolute top-1/2 right-4 -translate-y-1/2 h-24 w-24 opacity-5" />
                        </div>

                        {/* Main Interaction Area (9/3 split) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Charts Section (9/12) */}
                            <div className="lg:col-span-9 flex flex-col gap-5">
                                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
                                    <VedicChart 
                                        title="Rasi Chart (இராசி)" 
                                        planets={result.planets} 
                                        type="rasi"
                                    />
                                    <VedicChart 
                                        title="Amsam Chart (அம்சம்)" 
                                        planets={result.planets} 
                                        type="amsam"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border border-[#4B0082]/10 rounded-[1.5rem] shadow-sm">
                                    <div className="flex flex-col gap-0.5 mb-3 sm:mb-0">
                                        <p className="text-[9px] text-[#4B0082]/40 uppercase font-black tracking-widest leading-none">Record Details</p>
                                        <p className="text-[10px] font-black text-[#4B0082] tracking-tight">
                                           {dob ? format(dob, "PP") : ""} / {tob} hrs / {pob.latitude.toFixed(2)}°N, {pob.longitude.toFixed(2)}°E
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="h-10 px-4 rounded-lg border-[#4B0082]/20 text-[#4B0082] font-black uppercase text-[9px] tracking-widest hover:bg-[#4B0082]/5 gap-2 transition-all">
                                            <Printer className="h-4 w-4" /> Print
                                        </Button>
                                        <Button variant="outline" className="h-10 px-4 rounded-lg border-[#4B0082]/20 text-[#4B0082] font-black uppercase text-[9px] tracking-widest hover:bg-[#4B0082]/5 gap-2 transition-all">
                                            <Share2 className="h-4 w-4" /> Share
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Panchang Section (3/12) */}
                            <div className="lg:col-span-3">
                                <Card className="h-full bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden shadow-xl">
                                    <CardHeader className="bg-gradient-to-br from-[#4B0082] to-[#6A5ACD] text-white p-5 py-6 border-b border-white/10">
                                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/90">Detailed Panchang</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-gray-50">
                                            {[
                                                { label: "Star", value: result.star },
                                                { label: "Sign", value: result.rashi },
                                                { label: "Lag", value: result.lagnam },
                                                { label: "Yoga", value: result.yoga },
                                                { label: "Kar", value: result.karana },
                                                { label: "Rise", value: result.sunrise },
                                                { label: "Set", value: result.sunset },
                                            ].map((item, idx) => (
                                                <div key={idx} className="p-3 px-6 hover:bg-[#4B0082]/5 transition-colors group">
                                                    <span className="block text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-0.5">{item.label}</span>
                                                    <span className="block text-[10px] font-black text-[#4B0082] uppercase truncate tracking-tight">{item.value || "---"}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-5">
                                            <Button 
                                                onClick={handleSave} 
                                                disabled={isSaving}
                                                className="w-full h-10 bg-gradient-to-r from-[#4B0082] to-[#6A5ACD] text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg"
                                            >
                                                {isSaving ? "Saving..." : "Save to Profile"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
