import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import { useClickOutside } from "@/hooks/use-click-outside"

interface LanguageDropdownProps {
  label: string
  languages: string[]
  selectedLanguages: string[]
  onToggle: (lang: string) => void
  placeholder?: string
}

export function LanguageDropdown({
  label,
  languages,
  selectedLanguages,
  onToggle,
  placeholder = "Select languages",
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const selectedCount = selectedLanguages.filter((lang) => languages.includes(lang)).length

  return (
    <div className="space-y-3">
      <Label className="sds-label ml-1">{label}</Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="sds-input w-full h-14 px-6 flex items-center justify-between text-left group transition-all"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCount > 0 ? (
              <span className="text-[11px] font-black uppercase tracking-widest text-[#4B0082]">
                {selectedCount} DESIGNATED
              </span>
            ) : (
              <span className="text-gray-400 text-xs font-medium tracking-tight">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-[#4B0082]/40 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-[100] w-full mt-3 sds-glass rounded-3xl shadow-2xl border-indigo-50/50 backdrop-blur-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onToggle(lang)}
                  className={`w-full px-5 py-3.5 rounded-2xl flex items-center gap-4 text-left transition-all duration-300 group ${
                    selectedLanguages.includes(lang) 
                    ? "bg-[#4B0082] text-white shadow-lg shadow-indigo-900/10" 
                    : "hover:bg-indigo-50/50 text-gray-500 hover:text-[#4B0082]"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    selectedLanguages.includes(lang) 
                    ? "border-white/40 bg-white/20" 
                    : "border-indigo-100 group-hover:border-indigo-300"
                  }`}>
                    {selectedLanguages.includes(lang) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-100" />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

