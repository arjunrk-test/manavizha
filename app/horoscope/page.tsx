"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  Printer, 
  Zap, 
  Loader2, 
  MapPin, 
  Clock, 
  Calendar,
  Sun,
  Moon,
  Compass,
  Keyboard,
  MousePointer2,
  Trash2,
  Download,
  Image as ImageIcon
} from "lucide-react"
import { generateHoroscope, PLANETS } from "@/lib/astrology"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { GlobalLocationSelector } from "@/components/ui/global-location-selector"
import { PremiumDatePicker } from "@/components/ui/premium-date-picker"
import { PremiumTimePicker } from "@/components/ui/premium-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createWorker } from 'tesseract.js'
import tzlookup from 'tz-lookup'
import { DetailedHoroscopeView } from "@/components/detailed-horoscope-view"
import { Navbar } from "@/components/navbar"

export default function PublicHoroscopePage() {
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [thirukanithamResult, setThirukanithamResult] = useState<any>(null)
  const [vakkiyamResult, setVakkiyamResult] = useState<any>(null)
  const [calculationMethod, setCalculationMethod] = useState<'thirukanitham' | 'vakkiyam'>('thirukanitham')
  
  const activeResult = calculationMethod === 'thirukanitham' ? thirukanithamResult : vakkiyamResult;

  // Manual Placements State
  const [manualPlacements, setManualPlacements] = useState<Record<string, number[]>>(() => {
    const initial: Record<string, number[]> = {}
    PLANETS.forEach(p => initial[p.abbr] = [])
    return initial
  })

  // OCR States
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      await worker.terminate();
      toast.success("Horoscope box scanned! Please verify and refine the placements.")
      setEntryMode('manual')
    } catch (error) {
      console.error("OCR Error:", error)
      toast.error("Failed to read the horoscope photo. Please try manual entry.")
    } finally {
      setIsOcrLoading(false)
    }
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

      if (thiruData.planets) {
        const syncedPlacements: Record<string, number[]> = {}
        PLANETS.forEach(p => syncedPlacements[p.abbr] = [])
        thiruData.planets.forEach((p: any) => {
          const match = PLANETS.find(target => target.name === p.name);
          if (match) syncedPlacements[match.abbr] = [p.rasiIndex];
        });
        const lagnamPlanet = thiruData.planets.find((p: any) => p.isLagnam || p.name === 'Lagnam');
        if (lagnamPlanet) syncedPlacements['ல'] = [lagnamPlanet.rasiIndex];
        setManualPlacements(syncedPlacements);
      }
      toast.success("Horoscope calculated! You can now edit the grid if needed.")
    } catch (err: any) {
      console.error("[UI] Error generating horoscope:", err)
      toast.error(`Calculation Failed: ${err.message || "Unknown error"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPdf = () => {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
             <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#4B0082] flex items-center justify-center shadow-2xl rotate-3">
                   <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-indigo-950 tracking-tight leading-none mb-2">Free Horoscope Generator</h1>
                  <p className="text-indigo-600/70 text-xs font-bold uppercase tracking-[0.2em]">Generate and download your Vedic detailed charts instantly</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Inputs */}
            <div className="lg:col-span-4 sticky top-24">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-6 border border-indigo-50 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between p-1 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <button 
                    onClick={() => setEntryMode('auto')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.25rem] transition-all font-black text-[10px] uppercase tracking-widest",
                      entryMode === 'auto' ? "bg-white text-[#4B0082] shadow-md" : "text-gray-400 hover:text-indigo-600"
                    )}
                  >
                    <Calendar className="h-4 w-4" /> Birth Data
                  </button>
                  <button 
                    onClick={() => setEntryMode('manual')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.25rem] transition-all font-black text-[10px] uppercase tracking-widest",
                      entryMode === 'manual' ? "bg-white text-[#4B0082] shadow-md" : "text-gray-400 hover:text-indigo-600"
                    )}
                  >
                    <Keyboard className="h-4 w-4" /> Manual Entry
                  </button>
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
                        <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest ml-1">Name</label>
                        <input 
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter name"
                          className="w-full h-12 rounded-xl border border-indigo-100 bg-white px-4 text-xs font-medium text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <PremiumDatePicker label="Date of Birth" date={dob} onDateChange={setDob} />
                      <PremiumTimePicker label="Time of Birth" time={tob} onTimeChange={setTob} />
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest ml-1">Birth Location</label>
                        <GlobalLocationSelector 
                          onLocationChange={setPob}
                          initialCity={pob.city}
                          initialState={pob.state}
                          initialCountry={pob.country}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest ml-1 flex items-center gap-2">Calculation Method</label>
                        <Select value={calculationMethod} onValueChange={(val: any) => setCalculationMethod(val)}>
                          <SelectTrigger className="h-12 rounded-xl border-indigo-50 bg-indigo-50/10 text-gray-900 font-bold text-[11px]">
                            <SelectValue placeholder="Method" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
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
                      className="space-y-6"
                    >
                      <div className="p-6 rounded-[1.5rem] bg-amber-50 border border-amber-100 text-center">
                        <MousePointer2 className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                        <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Grid Editor</h4>
                        <p className="text-[10px] text-amber-700/60 font-medium">Click on chart boxes to place planets manually.</p>
                      </div>
                      
                      <div className="space-y-3">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleOcrUpload} />
                        <Button 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-14 rounded-2xl border-indigo-100 border-dashed hover:bg-indigo-50 text-[#4B0082] flex flex-col items-center justify-center gap-1 group"
                        >
                          <ImageIcon className="h-5 w-5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Upload Chart Photo (Sync)</span>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || isOcrLoading}
                  className="w-full h-14 bg-[#4B0082] hover:bg-[#1F4068] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                  {isGenerating || isOcrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                  {isOcrLoading ? "Scanning..." : (entryMode === 'auto' ? "Generate Charts" : "Preview Grid")}
                </Button>
              </motion.div>
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-8 space-y-8">
              {!activeResult ? (
                <div className="h-[600px] bg-white rounded-[3rem] border-2 border-dashed border-indigo-100 flex flex-col items-center justify-center text-center p-12 opacity-60">
                  <Compass className="h-16 w-16 text-indigo-100 mb-6 animate-pulse" />
                  <h3 className="text-lg font-black text-indigo-950 uppercase tracking-[0.4em] mb-3">Begin Calculation</h3>
                  <p className="max-w-xs text-sm text-indigo-500/60 font-medium">Enter your birth details to generate your detailed Rasi and Navamsa charts.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-4 rounded-[2.5rem] border border-indigo-50 shadow-xl flex items-center justify-between">
                    <div className="flex gap-2">
                       <button onClick={() => setCalculationMethod('thirukanitham')} className={cn("px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", calculationMethod === 'thirukanitham' ? "bg-indigo-600 text-white shadow-lg" : "text-indigo-400 hover:bg-indigo-50")}>Thirukanitham</button>
                       <button onClick={() => setCalculationMethod('vakkiyam')} className={cn("px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", calculationMethod === 'vakkiyam' ? "bg-rose-600 text-white shadow-lg" : "text-rose-400 hover:bg-rose-50")}>Vakkiyam</button>
                    </div>
                    <Button onClick={handleDownloadPdf} className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-green-500/20">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                  </div>

                  <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-indigo-50 print:border-none print:shadow-none">
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
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-indigo-50 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-xl font-black text-indigo-900 tracking-tighter">Manavizha</p>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Accurate Vedic Astrology & Matrimonial Services</p>
          <div className="pt-8 text-[10px] text-gray-400 font-medium">© 2024 Manavizha. Traditional Calculations by Drik Panchang.</div>
        </div>
      </footer>

      <style jsx global>{`
        @media print {
          nav, footer, button, .sticky, .fixed {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .max-w-7xl {
            max-width: none !important;
          }
          .lg\\:col-span-4 {
            display: none !important;
          }
          .lg\\:col-span-8 {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
  )
}
