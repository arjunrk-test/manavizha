import { FileText, Grid3x3, Orbit, Sparkles } from "lucide-react"
import { HoroscopeZodiacWheel } from "@/components/horoscope/horoscope-zodiac-wheel"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Grid3x3,
    label: "Rasi Chart",
    sub: "South Indian",
    bg: "bg-[#fce8ef]",
    color: "text-[#e87898]",
  },
  {
    icon: Orbit,
    label: "Navamsa Chart",
    sub: "D9 Divisional",
    bg: "bg-[#c9a227]/12",
    color: "text-[#c9a227]",
  },
  {
    icon: FileText,
    label: "Detailed Report",
    sub: "Full Analysis",
    bg: "bg-[#3bb9ac]/12",
    color: "text-[#3bb9ac]",
  },
  {
    icon: Sparkles,
    label: "Planetary Positions",
    sub: "Precise Data",
    bg: "bg-[#9b7bd4]/12",
    color: "text-[#9b7bd4]",
  },
]

export function HoroscopePreviewPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100/90 shadow-[0_8px_32px_rgba(31,64,104,0.06)] overflow-hidden flex flex-col h-full",
        className
      )}
    >
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 shrink-0">
          <p className="text-[11px] font-semibold text-[#e87898] mb-1">What you will get</p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#1F4068] leading-tight">
            Your Personalized Horoscope
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {features.map(({ icon: Icon, label, sub, bg, color }) => (
              <div key={label} className="text-center">
                <div
                  className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.75} />
                </div>
                <p className="text-[11px] font-semibold text-[#1F4068] leading-tight">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>

      <div className="relative px-4 sm:px-6 pt-2 pb-6 sm:pb-8 overflow-hidden flex-1 min-h-[220px] flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,252,253,0.2) 0%, rgba(255,236,242,0.45) 55%, rgba(255,225,232,0.55) 100%)",
              }}
            />
          </div>
          <div className="relative w-full">
            <HoroscopeZodiacWheel />
          </div>
        </div>
    </div>
  )
}
