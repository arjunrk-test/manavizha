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
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem]"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCount > 0 ? (
              <span className="text-sm">{selectedCount} selected</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto language-dropdown-scroll">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  onToggle(lang)
                }}
                className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-left transition-colors ${
                  selectedLanguages.includes(lang) ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang)}
                  onChange={() => {}}
                  className="rounded border-gray-300"
                  readOnly
                />
                <span>{lang}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

