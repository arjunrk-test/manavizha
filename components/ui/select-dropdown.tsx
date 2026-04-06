import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

interface SelectDropdownProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; value: string }[]
  required?: boolean
  disabled?: boolean
  className?: string
}

export function SelectDropdown({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = "",
}: SelectDropdownProps) {
  return (
    <div className={`space-y-2 flex flex-col ${className}`}>
      <Label htmlFor={id} className="sds-label">{label}</Label>
      <div className="relative group">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`sds-input w-full appearance-none pr-12 cursor-pointer transition-all duration-300 focus:ring-0 ${disabled ? 'opacity-50 cursor-not-allowed bg-black/5' : 'active:scale-[0.99]'}`}
          required={required}
          disabled={disabled}
        >
          <option value="" disabled={required}>Select Position / Value</option>
          {options.map((option) => (
            <option 
              key={option.id} 
              value={option.value}
            >
              {option.value}
            </option>
          ))}
        </select>
        <div className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-500 ${disabled ? 'text-gray-300' : 'text-[#4B0082]/40 group-focus-within:rotate-180'}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}
