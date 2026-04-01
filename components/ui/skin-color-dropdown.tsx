import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import { useClickOutside } from "@/hooks/use-click-outside"

interface SkinColorOption {
  value: string
  label: string
  color: string
}

interface SkinColorDropdownProps {
  value: string
  onChange: (value: string) => void
  options: SkinColorOption[]
  required?: boolean
}

export function SkinColorDropdown({
  value,
  onChange,
  options,
  required = false,
}: SkinColorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="space-y-3">
      <Label className="sds-label ml-1">
        Tone Specification {required && "*"}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="sds-input w-full h-14 px-6 flex items-center justify-between text-left group transition-all"
        >
          <div className="flex items-center gap-3">
            {selectedOption ? (
              <>
                <div
                  className="w-5 h-5 rounded-lg border border-indigo-100 shadow-sm transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: selectedOption.color }}
                />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#4B0082]">
                  {selectedOption.label}
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-xs font-medium tracking-tight">Select Tone</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-[#4B0082]/40 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-[100] w-full mt-3 sds-glass rounded-3xl shadow-2xl border-indigo-50/50 backdrop-blur-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-5 py-3.5 rounded-2xl flex items-center justify-between gap-4 text-left transition-all duration-300 group ${
                    value === option.value 
                    ? "bg-[#4B0082] text-white shadow-lg shadow-indigo-900/10" 
                    : "hover:bg-indigo-50/50 text-gray-500 hover:text-[#4B0082]"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                  <div
                    className={`w-6 h-6 rounded-lg border shadow-sm transition-all duration-500 group-hover:scale-110 ${
                      value === option.value ? "border-white/40" : "border-indigo-100/50"
                    }`}
                    style={{ backgroundColor: option.color }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

