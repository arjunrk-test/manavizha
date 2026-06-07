import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error"
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  if (typeof error === "object") {
    const record = error as { message?: string; details?: string; hint?: string; code?: string }
    return record.message || record.details || record.hint || record.code || "Unknown error"
  }
  return "Unknown error"
}

