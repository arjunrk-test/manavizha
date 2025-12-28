import { Label } from "@/components/ui/label"

interface SelectDropdownProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; value: string }[]
  required?: boolean
  className?: string
}

const SELECT_BASE_CLASSES = "w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"

export function SelectDropdown({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  className = "",
}: SelectDropdownProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${SELECT_BASE_CLASSES} ${className}`}
        required={required}
      >
        <option value="" disabled>Select</option>
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  )
}

