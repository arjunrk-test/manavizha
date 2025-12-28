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
    <div className="space-y-2">
      <Label htmlFor="skinColor">
        Skin Color {required && "*"}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem]"
        >
          <div className="flex items-center gap-2">
            {selectedOption ? (
              <>
                <span>{selectedOption.label}</span>
                <div
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: selectedOption.color }}
                />
              </>
            ) : (
              <span className="text-gray-500">Select</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between text-left transition-colors"
              >
                <span>{option.label}</span>
                <div
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: option.color }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

