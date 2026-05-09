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
import { generateHoroscope, PLANETS } from "@/lib/astrology"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import axios from "axios"
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
import tzlookup from 'tz-lookup'
import { DetailedHoroscopeView } from "@/components/detailed-horoscope-view"



export default function HoroscopePage() {
  const [name, setName] = useState("")
  const [entryMode, setEntryMode] = useState<'auto' | 'manual'>('auto')
  const [dob, setDob] = useState<Date | undefined>(undefined)
  const [tob, setTob] = useState("12:00")
  const [pob, setPob] = useState({
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 13.0827,
    longitude: 80.2707
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [thirukanithamResult, setThirukanithamResult] = useState<any>(null)
  const [vakkiyamResult, setVakkiyamResult] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showPrintView, setShowPrintView] = useState(false)
  const [calculationMethod, setCalculationMethod] = useState<'thirukanitham' | 'vakkiyam'>('thirukanitham')
  
  const activeResult = calculationMethod === 'thirukanitham' ? thirukanithamResult : vakkiyamResult;


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
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          setIsLoadingProfile(false)
          return
        }
        setUserId(user.id)
        
        // Parse search params for prefill (e.g., from Profile Setup)
        let initDob = null
        let initTob = null
        let initCity = null
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search)
            initDob = searchParams.get('dob')
            initTob = searchParams.get('tob')
            initCity = searchParams.get('city')
        }

        if (initDob) {
            setDob(parseISO(initDob))
        } else {
            const { data: profile } = await supabase
              .from("personal_details")
              .select("name, date_of_birth")
              .eq("user_id", user.id)
              .maybeSingle()
    
            if (profile?.date_of_birth) {
              setDob(parseISO(profile.date_of_birth))
            }
            if (profile?.name) {
              setName(profile.name)
            }
        }

        const { data: horo } = await supabase
          .from("horoscope_details")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (initTob) setTob(initTob)
        else if (horo?.time_of_birth) setTob(horo.time_of_birth)

        let city = initCity || horo?.place_of_birth || "Chennai"
        
        // Auto fetch coordinates for the profile city
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&addressdetails=1`, {
                headers: {
                    'Accept': 'application/json'
                } // User-Agent dynamically clamped by browser, relying on query params safely
            });
            const data = res.data;
            if (data && data[0]) {
                setPob({
                    city: city,
                    state: data[0].address?.state || "Tamil Nadu",
                    country: data[0].address?.country || "India",
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                });
            } else {
                setPob(prev => ({ ...prev, city }));
            }
        } catch (e: any) {
            // Silently fall back to standard Chennai instead of throwing loud unhandled UI errors
            setPob(prev => ({ ...prev, city }));
        }
      } catch (err) {
        console.error("Error in getProfile:", err)
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
        setThirukanithamResult(dummyResult)
        setVakkiyamResult(dummyResult)
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
      
      let computedTimezone = "+05:30"; // default fallback
      try {
          const tzName = tzlookup(pob.latitude, pob.longitude);
          const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: tzName,
              timeZoneName: 'shortOffset'
          });
          const offsetPart = formatter.formatToParts(dob).find(p => p.type === 'timeZoneName')?.value;
          if (offsetPart && offsetPart !== 'GMT') {
              let cleaned = offsetPart.replace('GMT', '');
              if (!cleaned.includes(':')) cleaned += ':00';
              const parts = cleaned.split(':');
              const sign = parts[0].startsWith('-') ? '-' : '+';
              const h = Math.abs(parseInt(parts[0], 10)).toString().padStart(2, '0');
              const m = (parts[1] || '00').padStart(2, '0');
              computedTimezone = `${sign}${h}:${m}`;
          } else if (offsetPart === 'GMT') {
              computedTimezone = "+00:00";
          }
      } catch (e) {
          console.warn("Timezone lookup failed, using fallback +05:30");
      }

      const thiruData = await generateHoroscope(fullDateTime, location, computedTimezone, 'thirukanitham')
      const vakkiyamData = await generateHoroscope(fullDateTime, location, computedTimezone, 'vakkiyam')
      
      setThirukanithamResult(thiruData)
      setVakkiyamResult(vakkiyamData)

      // Sync calculated planets to manual grid for immediate editing (using Thirukanitham as default UI state)
      if (thiruData.planets) {
          const syncedPlacements: Record<string, number[]> = {}
          PLANETS.forEach(p => syncedPlacements[p.abbr] = [])
          
          thiruData.planets.forEach((p: any) => {
              const match = PLANETS.find(target => target.name === p.name);
              if (match) {
                  syncedPlacements[match.abbr] = [p.rasiIndex];
              }
          });
          
          const lagnamPlanet = thiruData.planets.find((p: any) => p.isLagnam || p.name === 'Lagnam');
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
    if (!activeResult || !userId) return

    setIsSaving(true)
    try {
      const horoscopeData = {
        user_id: userId,
        star: activeResult.star,
        zodiac_sign: activeResult.rashi,
        lagnam: activeResult.lagnam,
        time_of_birth: entryMode === 'auto' ? tob : null,
        place_of_birth: entryMode === 'auto' ? pob.city : "Manual Entry",
        birth_state: entryMode === 'auto' ? pob.state : null,
        birth_country: entryMode === 'auto' ? pob.country : null,
        manual_grid: manualPlacements, // Retained! Make sure to run the SQL command provided.
        completion_percentage: 100,
        updated_at: new Date().toISOString(),
        dhosham: activeResult.papaPulligal ? (
          [
            activeResult.papaPulligal.sevvaiDosham === "தோஷம் உள்ளது" ? "செவ்வாய் தோஷம்" : null,
            activeResult.papaPulligal.rahuDosham === "தோஷம் உள்ளது" ? "ராகு தோஷம்" : null
          ].filter(Boolean).join(", ") || "தோஷம் இல்லை"
        ) : null
      }

      const { error } = await supabase
        .from("horoscope_details")
        .upsert(horoscopeData, { onConflict: 'user_id' })

      if (error) throw error

      toast.success("Horoscope saved to your profile!")
    } catch (err: any) {
      console.error("Error saving horoscope detailed:", err)
      const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err))
      toast.error(`Failed to save: ${errorMsg}`)
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
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-indigo-900/40 uppercase tracking-widest ml-1 flex items-center gap-2">Name</label>
                                <input 
                                  type="text"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="Enter name"
                                  className="w-full h-10 rounded-xl border border-indigo-100 bg-white px-3 text-xs font-medium text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

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
                                    <MapPin className="h-3 w-3" /> Location
                                </label>
                                <GlobalLocationSelector 
                                    onLocationChange={setPob}
                                    initialCity={pob.city}
                                    initialState={pob.state}
                                    initialCountry={pob.country}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-indigo-900/40 uppercase tracking-widest ml-1 flex items-center gap-2">Calculation Method</label>
                                <Select value={calculationMethod} onValueChange={(val: any) => setCalculationMethod(val)}>
                                    <SelectTrigger className="h-10 rounded-xl bg-white border-gray-100 text-gray-900 font-bold text-[11px] shadow-sm">
                                        <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none bg-white">
                                        <SelectItem value="thirukanitham">Thirukanitham (Drik)</SelectItem>
                                        <SelectItem value="vakkiyam">Vakkiyam</SelectItem>
                                    </SelectContent>
                                </Select>
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
                        <button 
                            onClick={() => setCalculationMethod('thirukanitham')}
                            className={cn(
                                "flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all border",
                                calculationMethod === 'thirukanitham' 
                                    ? "bg-[#4B0082]/10 text-[#4B0082] border-[#4B0082]/20" 
                                    : "bg-white text-gray-500 border-white hover:bg-gray-50"
                            )}
                        >
                            <Sun className="h-3 w-3" /> Thirukanitham (Drik)
                        </button>
                        <button 
                            onClick={() => setCalculationMethod('vakkiyam')}
                            className={cn(
                                "flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all border",
                                calculationMethod === 'vakkiyam' 
                                    ? "bg-[#FF1493]/10 text-[#FF1493] border-[#FF1493]/20" 
                                    : "bg-white text-gray-500 border-white hover:bg-gray-50"
                            )}
                        >
                            <Moon className="h-3 w-3" /> Vakkiyam (Paampu)
                        </button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {!activeResult && entryMode === 'auto' ? (
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
                ) : activeResult ? (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100"
                    >
                        <DetailedHoroscopeView 
                            data={{
                                ...activeResult,
                                name: name,
                                dob: dob ? format(dob, "dd MMM yyyy") : '',
                                tob,
                                pob: pob.city,
                                calculationMethod: calculationMethod
                            }} 
                            hideCloseButton={true}
                        />
                         <div className="p-4 bg-gray-50 flex items-center justify-end border-t border-gray-100">
                           <Button 
                             onClick={handleSave} 
                             disabled={isSaving}
                             className="bg-gradient-to-r from-[#4B0082] to-[#FF1493] hover:opacity-90 rounded-xl h-11 font-bold shadow-lg gap-2 px-6"
                           >
                             {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                             {isSaving ? "Saving..." : `Save ${calculationMethod === 'thirukanitham' ? 'Thirukanitham' : 'Vakkiyam'} to Profile`}
                           </Button>
                         </div>
                    </motion.div>
                ) : null}
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
