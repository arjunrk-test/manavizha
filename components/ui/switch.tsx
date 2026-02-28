"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
    id?: string
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
    className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ id, checked = false, onCheckedChange, disabled = false, className }, ref) => {
        return (
            <button
                id={id}
                ref={ref}
                role="switch"
                type="button"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onCheckedChange?.(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B0082] focus-visible:ring-offset-2",
                    checked
                        ? "bg-[#4B0082]"
                        : "bg-gray-200 dark:bg-gray-700",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
            >
                <span
                    className={cn(
                        "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                        checked ? "translate-x-[18px]" : "translate-x-[2px]"
                    )}
                />
            </button>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
