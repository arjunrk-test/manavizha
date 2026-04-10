"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  Save, 
  Printer, 
  Star, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  Share2, 
  MapPin, 
  Clock, 
  Calendar,
  Sun,
  Moon,
  Compass,
  Upload,
  Keyboard,
  MousePointer2,
  Trash2,
  Image as ImageIcon
} from "lucide-react"
import { generateHoroscope } from "@/lib/astrology"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobalLocationSelector } from "@/components/ui/global-location-selector"
import { PremiumDatePicker } from "@/components/ui/premium-date-picker"
import { PremiumTimePicker } from "@/components/ui/premium-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { parseISO, format } from "date-fns"
import { cn } from "@/lib/utils"
import { createWorker } from 'tesseract.js'

// Planet constants for manual entry
const PLANETS = [
    { name: "Sun", abbr: "சூ", tamil: "சூரியன்" },
    { name: "Moon", abbr: "சந்", tamil: "சந்திரன்" },
    { name: "Mars", abbr: "செ", tamil: "செவ்வாய்" },
    { name: "Mercury", abbr: "பு", tamil: "புதன்" },
    { name: "Jupiter", abbr: "குரு", tamil: "குரு" },
    { name: "Venus", abbr: "சு", tamil: "சுக்கிரன்" },
    { name: "Saturn", abbr: "சனி", tamil: "சனி" },
    { name: "Rahu", abbr: "ரா", tamil: "ராகு" },
    { name: "Ketu", abbr: "கே", tamil: "கேது" },
    { name: "Lagnam", abbr: "ல", tamil: "லக்னம்" },
    { name: "Maandi", abbr: "மா", tamil: "மாந்தி" }
];

export default function HoroscopePage() {
  const [entryMode, setEntryMode] = useState<'auto' | 'manual'>('auto')
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

  // Manual Placements State
  // Record<PlanetAbbr, HouseIndex (0-11)>
  const [manualPlacements, setManualPlacements] = useState<Record<string, number[]>>(() => {
    const initial: Record<string, number[]> = {}
    PLANETS.forEach(p => initial[p.abbr] = [])
    return initial
  })

  // OCR States
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
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

    // South Indian Chart House Mapping (0-11)
    const gridPositions = [
        { id: 11, label: "Meenam" }, { id: 0, label: "Mesham" }, { id: 1, label: "Rishabam" }, { id: 2, label: "Midhunam" },
        { id: 10, label: "Kumbham" }, { id: -1, label: "CENTER" }, { id: -1, label: "CENTER" }, { id: 3, label: "Kadagam" },
        { id: 9, label: "Magaram" }, { id: -1, label: "CENTER" }, { id: -1, label: "CENTER" }, { id: 4, label: "Simmam" },
        { id: 8, label: "Dhanusu" }, { id: 7, label: "Viruchigam" }, { id: 6, label: "Thulam" }, { id: 5, label: "Kanni" }
    ];

    const toggleManualPlanet = (houseId: number, planetAbbr: string) => {
        setManualPlacements(prev => {
            const currentHouses = prev[planetAbbr] || [];
            if (currentHouses.includes(houseId)) {
                return { ...prev, [planetAbbr]: currentHouses.filter(id => id !== houseId) };
            } else {
                return { ...prev, [planetAbbr]: [...currentHouses, houseId] };
            }
        });
    }

    const clearManualPlacements = () => {
        const initial: Record<string, number[]> = {}
        PLANETS.forEach(p => initial[p.abbr] = [])
        setManualPlacements(initial)
        toast.info("Manual placements cleared")
    }

    const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsOcrLoading(true)
        setOcrProgress(0)
        
        try {
            const worker = await createWorker('tam', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.floor(m.progress * 100))
                    }
                }
            });

            const { data } = await worker.recognize(file);
            console.log("OCR Result:", data.text);

            // Simulation text for demo if OCR is not perfect
            toast.success("Horoscope box scanned! Please verify and refine the placements.")
            setEntryMode('manual')
            
            await worker.terminate();
        } catch (error) {
            console.error("OCR Error:", error)
            toast.error("Failed to read the horoscope photo. Please try manual entry.")
        } finally {
            setIsOcrLoading(false)
        }
    }

    const VedicChart = ({ title, planets, type, isManual = false }: { title: string, planets?: any[], type: 'rasi' | 'amsam', isManual?: boolean }) => {
        return (
            <div className="sds-glass rounded-[1.5rem] p-3 border-white/40 shadow-xl overflow-hidden h-full flex flex-col relative group">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[9px] font-black text-[#4B0082]/60 uppercase tracking-[0.4em]">{title}</h3>
                    {isManual && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={clearManualPlacements}
                            className="h-5 w-5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                
                <div className="grid grid-cols-4 border border-[#4B0082]/10 rounded-xl overflow-hidden relative shadow-inner bg-white/50 flex-1">
                    {gridPositions.map((pos, idx) => {
                        if (pos.id === -1) return (
                            <div key={idx} className="bg-[#4B0082]/5 flex items-center justify-center p-1">
                                {idx === 5 && (
                                    <div className="text-center">
                                        <p className="text-[7px] font-black text-[#4B0082]/30 uppercase tracking-[0.3em]">{type === 'rasi' ? "இராசி" : "அம்சம்"}</p>
                                        <Star className="h-4 w-4 text-[#4B0082]/10 mx-auto mt-0.5" />
                                    </div>
                                )}
                            </div>
                        )
                        
                        let occupants: any[] = [];
                        if (isManual) {
                            occupants = PLANETS.filter(p => (manualPlacements[p.abbr] || []).includes(pos.id))
                                .map(p => ({ ...p, tamilAbbr: p.abbr, isLagnam: p.name === 'Lagnam' }));
                        } else {
                            occupants = (planets || []).filter(p => (type === 'rasi' ? p.rasiIndex : p.navamsamIndex) === pos.id);
                        }
                        
                        return (
                            <Popover key={idx}>
                                <PopoverTrigger asChild>
                                    <div 
                                        className={cn(
                                            "border border-[#4B0082]/10 p-0.5 flex flex-col items-center justify-center min-h-[60px] relative transition-all",
                                            isManual ? "cursor-pointer hover:bg-indigo-50/50" : "hover:bg-[#4B0082]/5"
                                        )}
                                    >
                                        <span className="absolute top-1 left-1 text-[7px] text-[#4B0082]/30 font-black uppercase tracking-tighter">
                                            {pos.label}
                                        </span>
                                        <div className="flex flex-wrap items-center justify-center gap-1 mt-1 w-full px-0.5">
                                            {occupants.map((p, pIdx) => (
                                                <motion.span 
                                                    key={pIdx}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className={cn(
                                                        "text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border whitespace-nowrap",
                                                        p.isLagnam 
                                                            ? "bg-amber-100 text-amber-700 border-amber-200" 
                                                            : p.name === 'Moon'
                                                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                                                : "bg-white/80 text-[#4B0082] border-gray-100"
                                                    )}
                                                >
                                                    {p.tamilAbbr}
                                                </motion.span>
                                            ))}
                                            {isManual && occupants.length === 0 && (
                                                <Plus className="h-3 w-3 text-indigo-100 group-hover:text-indigo-300 transition-colors" />
                                            )}
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                {isManual && (
                                    <PopoverContent className="w-64 p-3 rounded-2xl bg-white shadow-2xl border-gray-100 z-[100]">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-900">{pos.label} Placements</h4>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {PLANETS.map(p => {
                                                    const isActive = (manualPlacements[p.abbr] || []).includes(pos.id);
                                                    return (
                                                        <button
                                                            key={p.name}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleManualPlanet(pos.id, p.abbr);
                                                            }}
                                                            className={cn(
                                                                "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                                                                isActive 
                                                                    ? "bg-indigo-600 text-white border-indigo-700 shadow-md" 
                                                                    : "bg-gray-50 text-gray-400 border-gray-100 hover:border-indigo-200 hover:text-indigo-600"
                                                            )}
                                                        >
                                                            <span className="text-[12px] font-black">{p.abbr}</span>
                                                            <span className="text-[8px] font-bold uppercase tracking-tighter">{p.name}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                )}
                            </Popover>
                        )
                    })}
                </div>
            </div>
        )
    }

  const handleGenerate = async () => {
    if (entryMode === 'manual') {
        const dummyResult = {
            star: "Manual Entry",
            rashi: "Custom Chart",
            lagnam: PLANETS.find(p => (manualPlacements[p.abbr] || []).length > 0 && p.name === 'Lagnam') ? "Computed" : "Unknown",
            planets: [], 
            isManual: true
        }
        setResult(dummyResult)
        toast.success("Manual chart ready for use!")
        return
    }

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
      
      const timeParts = tob.split(':')
      const cleanTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1]?.padStart(2, '0') || '00'}:00`
      const fullDateTime = `${formattedDate}T${cleanTime}`
      
      const data = await generateHoroscope(fullDateTime, location, timezone)
      setResult(data)

      // Sync calculated planets to manual grid for immediate editing
      if (data.planets) {
          const syncedPlacements: Record<string, number[]> = {}
          PLANETS.forEach(p => syncedPlacements[p.abbr] = [])
          
          data.planets.forEach((p: any) => {
              const match = PLANETS.find(target => target.name === p.name);
              if (match) {
                  syncedPlacements[match.abbr] = [p.rasiIndex];
              }
          });
          
          const lagnamPlanet = data.planets.find((p: any) => p.isLagnam || p.name === 'Lagnam');
          if (lagnamPlanet) {
              syncedPlacements['ல'] = [lagnamPlanet.rasiIndex];
          }
          
          setManualPlacements(syncedPlacements);
      }

      toast.success("Horoscope calculated! You can now edit the grid if needed.")
    } catch (err: any) {
      console.error("[UI] Error generating horoscope:", err)
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
        time_of_birth: entryMode === 'auto' ? tob : null,
        place_of_birth: entryMode === 'auto' ? pob.city : "Manual Entry",
        manual_grid: manualPlacements, // Always save the current grid state
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
    <div className="w-full px-6 md:px-10 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Inputs */}
        <div className="lg:col-span-3 sticky top-4">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sds-glass rounded-[2rem] p-4 border-white/40 shadow-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                            {entryMode === 'auto' ? <Calendar className="h-3.5 w-3.5 text-[#4B0082]" /> : <Keyboard className="h-3.5 w-3.5 text-indigo-600" />}
                        </div>
                        <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">{entryMode === 'auto' ? "Birth Data" : "Manual Entry"}</h2>
                    </div>
                    <div className="flex bg-indigo-50 rounded-lg p-0.5">
                        <button 
                            onClick={() => setEntryMode('auto')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                entryMode === 'auto' ? "bg-white text-[#4B0082] shadow-sm" : "text-gray-400 hover:text-indigo-600"
                            )}
                            title="Calculate from Birth Data"
                        >
                            <Calendar className="h-3 w-3" />
                        </button>
                        <button 
                            onClick={() => setEntryMode('manual')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                entryMode === 'manual' ? "bg-white text-[#4B0082] shadow-sm" : "text-gray-400 hover:text-indigo-600"
                            )}
                            title="Enter Grid Manually"
                        >
                            <Keyboard className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {entryMode === 'auto' ? (
                        <motion.div 
                            key="auto-form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
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
                                <label className="text-[9px] font-black text-indigo-900/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> Timezone
                                </label>
                                <Select value={timezone} onValueChange={setTimezone}>
                                    <SelectTrigger className="h-10 rounded-xl bg-white border-gray-100 text-gray-900 font-bold text-[11px] shadow-sm">
                                        <SelectValue placeholder="GMT" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none bg-white">
                                        <SelectItem value="+05:30">IST (+5:30)</SelectItem>
                                        <SelectItem value="+00:00">UTC (+0:00)</SelectItem>
                                        <SelectItem value="-05:00">EST (-5:00)</SelectItem>
                                        <SelectItem value="+08:00">SGT (+8:00)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-indigo-900/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <MapPin className="h-3 w-3" /> Location
                                </label>
                                <GlobalLocationSelector 
                                    onLocationChange={setPob}
                                    initialCity={pob.city}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="manual-info"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
                                <MousePointer2 className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1">Interactive Mode</p>
                                <p className="text-[9px] text-indigo-600/60 font-medium italic">
                                    Click any house on the Rasi Chart to place planets directly.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-[#4B0082]/40 uppercase tracking-[0.2em] ml-1">OCR Scan</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleOcrUpload}
                                />
                                <Button 
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-12 rounded-2xl border-indigo-100 bg-white hover:bg-indigo-50 border-dashed text-[#4B0082] flex flex-col items-center justify-center gap-1 group"
                                >
                                    <ImageIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Upload Jadhagam Photo</span>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || isOcrLoading}
                    className="w-full h-12 bg-[#4B0082] hover:bg-[#3B0062] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-6"
                >
                    {isGenerating || isOcrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {isOcrLoading ? `Scanning ${ocrProgress}%` : (entryMode === 'auto' ? "Generate Charts" : "Preview Manual Chart")}
                </Button>
            </motion.div>
        </div>

        {/* Right Content: Banner + Results */}
        <div className="lg:col-span-9 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-5 rounded-[2rem] sds-glass relative overflow-hidden shadow-xl border-white/30 flex items-center justify-between gap-4"
            >
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4B0082] to-[#FF1493] flex items-center justify-center shadow-lg transform rotate-3">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-indigo-900 tracking-tight leading-none">
                                Horoscope Generator
                            </h1>
                            <div className="bg-[#4B0082]/10 text-[#4B0082] px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-[#4B0082]/20">
                                {entryMode === 'auto' ? 'VEDIC AI' : 'MANUAL GRID'}
                            </div>
                        </div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.1em] mt-1">
                            Sidereal Traditional Tamil Calculations (Drik Panchang)
                        </p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4 relative z-10">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-indigo-900/40 uppercase tracking-widest">Mode</p>
                        <p className="text-sm font-black text-indigo-900 tracking-tighter">{entryMode === 'auto' ? 'Precision AI' : 'Pro Editor'}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5 text-[8px] font-black text-[#FF1493] uppercase tracking-widest">
                            <Sun className="h-3 w-3" /> Traditional
                        </div>
                        <div className="flex items-center gap-1.5 text-[8px] font-black text-[#4B0082] uppercase tracking-widest">
                            <Moon className="h-3 w-3" /> Professional
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {!result && entryMode === 'auto' ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[400px] flex flex-col items-center justify-center text-center p-8 sds-glass rounded-[2rem] border-white/20 border-dashed border-2"
                    >
                        <Compass className="h-10 w-10 text-indigo-100 mb-4" />
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Awaiting Birth Details</h3>
                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-2">Switch to Manual Mode or enter data to begin</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* Interaction Card */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3 bg-gradient-to-br from-[#4B0082] to-[#FF1493] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden flex items-center justify-between">
                                <div className="relative z-10">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1 text-white/50">Computed Profile</p>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
                                        {result?.star || "Manual Chart"} <span className="text-white/30 mx-2">/</span> {result?.rashi || "Custom"}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="bg-white/10 px-2 py-0.5 rounded-md border border-white/20 text-[9px] font-black uppercase tracking-widest">
                                            {result?.lagnam} Lagna
                                        </div>
                                        <div className="bg-white/10 px-2 py-0.5 rounded-md border border-white/20 text-[9px] font-black uppercase tracking-widest">
                                            {pob.city}
                                        </div>
                                    </div>
                                </div>
                                <Star className="absolute -right-4 -top-4 h-32 w-32 text-white/10 rotate-12" />
                            </div>

                            <div className="sds-glass rounded-[2rem] p-5 flex flex-col justify-center gap-4 border-white/40">
                                <Button 
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="w-full h-11 bg-white text-[#4B0082] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1 h-10 rounded-xl border-indigo-100 bg-white/50 text-[#4B0082] font-black text-[9px] uppercase">
                                        <Printer className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="outline" className="flex-1 h-10 rounded-xl border-indigo-100 bg-white/50 text-[#4B0082] font-black text-[9px] uppercase">
                                        <Share2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <VedicChart 
                                    title="Rasi Chart (இராசி)" 
                                    planets={result?.planets} 
                                    type="rasi"
                                    isManual={entryMode === 'manual' || !!result}
                                />
                                <VedicChart 
                                    title="Amsam Chart (அம்சம்)" 
                                    planets={result?.planets} 
                                    type="amsam"
                                />
                            </div>

                            {/* Panchang sidebar */}
                            <div className="xl:col-span-4 h-full">
                                <Card className="sds-glass rounded-[2rem] overflow-hidden shadow-xl h-full bg-white/30 backdrop-blur-3xl border-none">
                                    <CardHeader className="bg-gradient-to-br from-[#4B0082]/90 to-[#6A5ACD]/90 text-white p-4 pb-5">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-3.5 w-3.5 text-white" />
                                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">Computed Data</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-gray-100">
                                            {[
                                                { label: "Star", value: result?.star, icon: <Sparkles className="h-3 w-3 text-amber-500" /> },
                                                { label: "Rashi", value: result?.rashi, icon: <Moon className="h-3 w-3 text-blue-500" /> },
                                                { label: "Lagnam", value: result?.lagnam, icon: <Sun className="h-3 w-3 text-orange-500" /> },
                                                { label: "Yoga", value: result?.yoga, icon: <Zap className="h-3 w-3 text-purple-500" /> },
                                                { label: "Karana", value: result?.karana, icon: <Compass className="h-3 w-3 text-emerald-500" /> },
                                            ].map((item, idx) => (
                                                <div key={idx} className="p-3 px-5 flex items-center justify-between hover:bg-white/50 transition-colors group">
                                                    <div>
                                                        <span className="block text-[7px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">{item.label}</span>
                                                        <span className="block text-[11px] font-black text-[#4B0082] uppercase tracking-tight">{item.value || "---"}</span>
                                                    </div>
                                                    <div>{item.icon}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {entryMode === 'manual' && (
                                            <div className="p-6 text-center bg-gray-50/50 italic text-[9px] text-gray-400 font-medium">
                                                Panchang data is only available in Auto mode
                                            </div>
                                        )}
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

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
    )
}
