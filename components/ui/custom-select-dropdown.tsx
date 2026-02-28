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
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem]"
        >
          <span className={`flex-1 text-left ${selectedOption ? "" : "text-gray-500"}`}>
            {selectedOption ? (
              <span className="break-words whitespace-normal">{selectedOption.value}</span>
            ) : (
              "Select"
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => {
              const optionValue = (option.value || "").trim()
              const currentValue = (value || "").trim()
              const isSelected = optionValue === currentValue
              return (
                <button
                  key={option.id}
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent focus loss on the container which might trigger useClickOutside
                    e.preventDefault()
                  }}
                  onClick={() => {
                    handleSelect(option.value)
                  }}
                  className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors ${isSelected ? "bg-gray-100 dark:bg-gray-800" : ""
                    }`}
                >
                  <span className="break-words whitespace-normal text-sm">{option.value}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      {showOtherField && onOtherChange && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
          required={required}
        />
      )}
    </div>
  )
}

