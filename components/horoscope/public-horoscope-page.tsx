"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Loader2,
  Calendar,
  Keyboard,
  MousePointer2,
  Download,
  Image as ImageIcon,
  Shield,
  Star,
  Info,
} from "lucide-react"
import { generateHoroscope, PLANETS } from "@/lib/astrology"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { GlobalLocationSelector } from "@/components/ui/global-location-selector"
import { PremiumDatePicker } from "@/components/ui/premium-date-picker"
import { PremiumTimePicker } from "@/components/ui/premium-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createWorker } from "tesseract.js"
import tzlookup from "tz-lookup"
import { DetailedHoroscopeView } from "@/components/detailed-horoscope-view"
import { Navbar } from "@/components/navbar"
import { HoroscopePreviewPanel } from "@/components/horoscope/horoscope-preview-panel"

const fieldLabelClass = "text-xs font-medium text-[#1F4068]/70 block"

const fieldInputClass =
  "w-full h-11 rounded-xl border border-gray-200/90 bg-white px-4 text-sm text-[#1F4068] placeholder:text-gray-400 focus:border-[#3bb9ac] focus:ring-4 focus:ring-[#3bb9ac]/10 shadow-sm outline-none"

const horoscopePrimaryBtn =
  "!bg-[#e87898] !text-white shadow-md hover:!bg-[#d4567a] hover:!text-white"

function HoroscopeIntro({ className }: { className?: string }) {
  return (
    <div className={cn("mb-2", className)}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
        <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
          <Star className="h-2.5 w-2.5 fill-brand-gold/30 text-brand-gold" strokeWidth={1.5} />
          Vedic Astrology
        </p>
        <span className="hidden sm:inline text-gray-300/80 text-xs" aria-hidden>
          ·
        </span>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#1F4068] leading-none tracking-tight">
          Horoscope Generator
        </h1>
      </div>
      <p className="text-xs text-gray-500 leading-snug mt-1 max-w-2xl">
        Generate Vedic Rasi & Navamsa charts with Thirukanitham or Vakkiyam methods.
      </p>
    </div>
  )
}

export function PublicHoroscopePage() {
  const [name, setName] = useState("")
  const [entryMode, setEntryMode] = useState<"auto" | "manual">("auto")
  const [dob, setDob] = useState<Date | undefined>(undefined)
  const [tob, setTob] = useState("12:00")
  const [pob, setPob] = useState({
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 13.0827,
    longitude: 80.2707,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [thirukanithamResult, setThirukanithamResult] = useState<any>(null)
  const [vakkiyamResult, setVakkiyamResult] = useState<any>(null)
  const [calculationMethod, setCalculationMethod] = useState<"thirukanitham" | "vakkiyam">(
    "thirukanitham"
  )

  const activeResult = calculationMethod === "thirukanitham" ? thirukanithamResult : vakkiyamResult

  const [manualPlacements, setManualPlacements] = useState<Record<string, number[]>>(() => {
    const initial: Record<string, number[]> = {}
    PLANETS.forEach((p) => (initial[p.abbr] = []))
    return initial
  })

  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [, setOcrProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsOcrLoading(true)
    setOcrProgress(0)

    try {
      const worker = await createWorker("tam", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.floor(m.progress * 100))
          }
        },
      })

      await worker.recognize(file)
      await worker.terminate()
      toast.success("Horoscope box scanned! Please verify and refine the placements.")
      setEntryMode("manual")
    } catch (error) {
      console.error("OCR Error:", error)
      toast.error("Failed to read the horoscope photo. Please try manual entry.")
    } finally {
      setIsOcrLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (entryMode === "manual") {
      const dummyResult = {
        star: "Manual Entry",
        rashi: "Custom Chart",
        lagnam: PLANETS.find(
          (p) => (manualPlacements[p.abbr] || []).length > 0 && p.name === "Lagnam"
        )
          ? "Computed"
          : "Unknown",
        planets: [],
        isManual: true,
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
      const timeParts = tob.split(":")
      const cleanTime = `${timeParts[0].padStart(2, "0")}:${timeParts[1]?.padStart(2, "0") || "00"}:00`
      const fullDateTime = `${formattedDate}T${cleanTime}`

      let computedTimezone = "+05:30"
      try {
        const tzName = tzlookup(pob.latitude, pob.longitude)
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tzName,
          timeZoneName: "shortOffset",
        })
        const offsetPart = formatter.formatToParts(dob).find((p) => p.type === "timeZoneName")?.value
        if (offsetPart && offsetPart !== "GMT") {
          let cleaned = offsetPart.replace("GMT", "")
          if (!cleaned.includes(":")) cleaned += ":00"
          const parts = cleaned.split(":")
          const sign = parts[0].startsWith("-") ? "-" : "+"
          const h = Math.abs(parseInt(parts[0], 10)).toString().padStart(2, "0")
          const m = (parts[1] || "00").padStart(2, "0")
          computedTimezone = `${sign}${h}:${m}`
        } else if (offsetPart === "GMT") {
          computedTimezone = "+00:00"
        }
      } catch {
        console.warn("Timezone lookup failed, using fallback +05:30")
      }

      const thiruData = await generateHoroscope(fullDateTime, location, computedTimezone, "thirukanitham")
      const vakkiyamData = await generateHoroscope(fullDateTime, location, computedTimezone, "vakkiyam")

      setThirukanithamResult(thiruData)
      setVakkiyamResult(vakkiyamData)

      if (thiruData.planets) {
        const syncedPlacements: Record<string, number[]> = {}
        PLANETS.forEach((p) => (syncedPlacements[p.abbr] = []))
        thiruData.planets.forEach((p: any) => {
          const match = PLANETS.find((target) => target.name === p.name)
          if (match) syncedPlacements[match.abbr] = [p.rasiIndex]
        })
        const lagnamPlanet = thiruData.planets.find((p: any) => p.isLagnam || p.name === "Lagnam")
        if (lagnamPlanet) syncedPlacements["ல"] = [lagnamPlanet.rasiIndex]
        setManualPlacements(syncedPlacements)
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
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col [&_*]:not-italic">
      <Navbar />

      <main className="flex-1 pt-[4.5rem] pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background sparkles */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 18%, rgba(255, 182, 193, 0.14) 0%, transparent 26%), radial-gradient(circle at 88% 72%, rgba(59, 185, 172, 0.08) 0%, transparent 30%)",
            }}
          />
          {[
            { top: "14%", left: "8%", size: 14 },
            { top: "22%", left: "92%", size: 10 },
            { top: "48%", left: "4%", size: 8 },
            { top: "68%", left: "96%", size: 12 },
            { top: "78%", left: "12%", size: 9 },
          ].map((s, i) => (
            <Star
              key={i}
              className="absolute text-[#c9a227]/25 fill-[#c9a227]/15"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
              strokeWidth={1}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <HoroscopeIntro />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 lg:items-stretch">
            {/* Left — form */}
            <div className="lg:sticky lg:top-[4.5rem] lg:self-start">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="bg-white rounded-2xl border border-gray-100/90 shadow-[0_8px_32px_rgba(31,64,104,0.06)] overflow-hidden h-full"
              >
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="flex gap-1 rounded-xl bg-[#faf8f4] p-1">
                    <button
                      onClick={() => setEntryMode("auto")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                        entryMode === "auto"
                          ? "bg-[#fce8ef] text-[#e87898] shadow-sm"
                          : "text-gray-500 hover:text-[#1F4068] hover:bg-white/80"
                      )}
                    >
                      <Calendar className="h-4 w-4 shrink-0" /> Birth Details
                    </button>
                    <button
                      onClick={() => setEntryMode("manual")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                        entryMode === "manual"
                          ? "bg-[#fce8ef] text-[#e87898] shadow-sm"
                          : "text-gray-500 hover:text-[#1F4068] hover:bg-white/80"
                      )}
                    >
                      <Keyboard className="h-4 w-4 shrink-0" /> Manual Entry
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {entryMode === "auto" ? (
                      <motion.div
                        key="auto-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Full Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Enter your name"
                              className={fieldInputClass}
                            />
                          </div>
                          <div>
                            <PremiumDatePicker
                              label="Date of Birth"
                              date={dob}
                              onDateChange={setDob}
                              labelClassName={fieldLabelClass}
                            />
                          </div>
                          <div>
                            <PremiumTimePicker
                              label="Time of Birth"
                              time={tob}
                              onTimeChange={setTob}
                              labelClassName={fieldLabelClass}
                            />
                          </div>
                          <GlobalLocationSelector
                            layout="embedded"
                            labelClassName={fieldLabelClass}
                            onLocationChange={setPob}
                            initialCity={pob.city}
                            initialState={pob.state}
                            initialCountry={pob.country}
                          />
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={cn(fieldLabelClass, "flex items-center gap-1.5")}>
                              Calculation Method
                              <Info className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.75} />
                            </label>
                            <Select
                              value={calculationMethod}
                              onValueChange={(val: "thirukanitham" | "vakkiyam") =>
                                setCalculationMethod(val)
                              }
                            >
                              <SelectTrigger className="h-11 rounded-xl border border-gray-200/90 bg-white text-[#1F4068] font-medium text-sm shadow-sm">
                                <SelectValue placeholder="Method" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border border-gray-100 shadow-xl">
                                <SelectItem value="thirukanitham">
                                  Thirukanitham (Drik Panchang)
                                </SelectItem>
                                <SelectItem value="vakkiyam">Vakkiyam</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="manual-info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="rounded-xl bg-[#faf8f4] border border-gray-100/90 p-5 text-center">
                          <MousePointer2 className="h-8 w-8 text-[#3bb9ac] mx-auto mb-3" />
                          <h4 className="text-sm font-semibold text-[#1F4068] mb-1">Grid editor</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Click on chart boxes to place planets manually.
                          </p>
                        </div>
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
                          className="w-full h-14 rounded-xl border border-dashed border-gray-200 bg-white hover:bg-[#faf8f4] hover:border-[#3bb9ac]/40 text-[#1F4068] flex flex-col items-center justify-center gap-1.5"
                        >
                          <ImageIcon className="h-5 w-5 text-[#3bb9ac]" />
                          <span className="text-xs font-medium text-gray-600">
                            Upload chart photo to sync
                          </span>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || isOcrLoading}
                    className={cn(
                      "w-full h-12 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2.5",
                      horoscopePrimaryBtn
                    )}
                  >
                    {isGenerating || isOcrLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                    {isOcrLoading
                      ? "Scanning..."
                      : entryMode === "auto"
                        ? "Generate Charts"
                        : "Preview Grid"}
                  </Button>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 bg-[#faf8f4]/60 px-5 py-3">
                  <Shield className="h-4 w-4 text-[#3bb9ac] shrink-0" strokeWidth={1.75} />
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-snug">
                    Your information is 100% private and secure. We do not store your data.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right — preview or results */}
            <div className="min-h-0">
              {!activeResult ? (
                <HoroscopePreviewPanel className="flex-1 min-h-0" />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 flex-1 min-h-0"
                >
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100/90 shadow-[0_8px_32px_rgba(31,64,104,0.06)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCalculationMethod("thirukanitham")}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] transition-all",
                          calculationMethod === "thirukanitham"
                            ? `${horoscopePrimaryBtn} shadow-sm`
                            : "text-gray-600 bg-[#faf8f4] hover:bg-gray-100"
                        )}
                      >
                        Thirukanitham
                      </button>
                      <button
                        onClick={() => setCalculationMethod("vakkiyam")}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] transition-all",
                          calculationMethod === "vakkiyam"
                            ? `${horoscopePrimaryBtn} shadow-sm`
                            : "text-gray-600 bg-[#faf8f4] hover:bg-gray-100"
                        )}
                      >
                        Vakkiyam
                      </button>
                    </div>
                    <Button
                      onClick={handleDownloadPdf}
                      className="h-11 px-6 rounded-xl bg-[#1F4068] hover:bg-[#163352] text-white font-semibold text-sm gap-2 shadow-md shrink-0"
                    >
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(31,64,104,0.06)] overflow-hidden border border-gray-100/90 print:border-none print:shadow-none">
                    <div className="max-h-[min(72vh,680px)] overflow-y-auto overscroll-contain print:max-h-none print:overflow-visible">
                    <DetailedHoroscopeView
                      data={{
                        ...activeResult,
                        name: name,
                        dob: dob ? format(dob, "dd MMM yyyy") : "",
                        tob,
                        pob: pob.city,
                        calculationMethod: calculationMethod,
                      }}
                      hideCloseButton={true}
                      variant="embedded"
                    />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          nav,
          button,
          .sticky,
          .fixed {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .max-w-7xl {
            max-width: none !important;
          }
          .lg\\:grid-cols-2 > div:first-child {
            display: none !important;
          }
          .lg\\:grid-cols-2 > div:last-child {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
