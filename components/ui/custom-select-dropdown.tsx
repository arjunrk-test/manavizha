import { useState, useRef, useMemo, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import { useClickOutside } from "@/hooks/use-click-outside"

interface CustomSelectDropdownProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; value: string }[]
  required?: boolean
  className?: string
  showOtherInput?: boolean
  otherValue?: string
  onOtherChange?: (value: string) => void
  otherPlaceholder?: string
}

export function CustomSelectDropdown({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  className = "",
  showOtherInput = false,
  otherValue = "",
  onOtherChange,
  otherPlaceholder = "Please specify",
}: CustomSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside<HTMLDivElement>(dropdownRef, () => setIsOpen(false))

  const selectedOption = useMemo(() => {
    if (!value || !options.length) return undefined
    const trimmedValue = (value || "").trim()
    if (!trimmedValue) return undefined
    const found = options.find((opt) => {
      const optValue = (opt.value || "").trim()
      return optValue === trimmedValue
    })
    return found
  }, [value, options])

  const handleSelect = (optionValue: string) => {
    // Pass the exact value from the option (don't trim here to preserve exact match)
    onChange(optionValue)
    setIsOpen(false)
    if (showOtherInput && optionValue.toLowerCase().trim() !== "other") {
      onOtherChange?.("")
    }
  }

  const showOtherField = showOtherInput && value && options.some(
    (opt) => opt.value.toLowerCase() === "other" && value.toLowerCase() === "other"
  )

  return (
    <div className={`space-y-2 flex flex-col ${className}`}>
      <Label htmlFor={id} className="sds-label">
        {label}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`sds-input w-full flex items-center justify-between text-left group transition-all duration-300 active:scale-[0.98] ${isOpen ? "border-[#4B0082] bg-white" : ""}`}
        >
          <span className={`flex-1 truncate ${selectedOption ? "text-gray-900" : "text-gray-300 transition-colors"}`}>
            {selectedOption ? (
              <span className="font-bold">{selectedOption.value}</span>
            ) : (
              "Select Position / Area"
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-[#4B0082]/40 transition-transform duration-500 ml-2 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-3 sds-glass rounded-3xl shadow-2xl border-indigo-50/50 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="overflow-y-auto max-h-60 p-2 space-y-1 custom-scrollbar">
              {options.map((option) => {
                const optionValue = (option.value || "").trim()
                const currentValue = (value || "").trim()
                const isSelected = optionValue === currentValue
                return (
                  <button
                    key={option.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                    }}
                    onClick={() => {
                      handleSelect(option.value)
                    }}
                    className={`w-full px-5 py-3.5 rounded-2xl text-left text-xs font-bold transition-all duration-300 ${
                      isSelected 
                      ? "bg-[#4B0082] text-white shadow-lg shadow-indigo-900/20" 
                      : "hover:bg-indigo-50/50 text-gray-500 hover:text-[#4B0082]"
                    }`}
                  >
                    {option.value}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {showOtherField && onOtherChange && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="sds-input mt-3 w-full animate-in slide-in-from-top-2 duration-300"
          required={required}
        />
      )}
    </div>
  )
}

