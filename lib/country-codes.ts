export const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+1", flag: "🇺🇸", country: "USA" },
  { code: "+44", flag: "🇬🇧", country: "UK" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+971", flag: "🇦🇪", country: "UAE" },
  { code: "+65", flag: "🇸🇬", country: "Singapore" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "+49", flag: "🇩🇪", country: "Germany" },
  { code: "+33", flag: "🇫🇷", country: "France" },
  { code: "+81", flag: "🇯🇵", country: "Japan" },
  { code: "+86", flag: "🇨🇳", country: "China" },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", country: "Qatar" },
  { code: "+968", flag: "🇴🇲", country: "Oman" },
  { code: "+973", flag: "🇧🇭", country: "Bahrain" },
  { code: "+64", flag: "🇳🇿", country: "New Zealand" },
  { code: "+27", flag: "🇿🇦", country: "South Africa" },
] as const

export const DEFAULT_COUNTRY_CODE = "+91"

const codesByLength = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)

export function parsePhoneWithCountryCode(phone: string): {
  countryCode: string
  nationalNumber: string
} {
  if (!phone) {
    return { countryCode: DEFAULT_COUNTRY_CODE, nationalNumber: "" }
  }

  for (const { code } of codesByLength) {
    if (phone.startsWith(code)) {
      return {
        countryCode: code,
        nationalNumber: phone.slice(code.length).replace(/[^0-9]/g, ""),
      }
    }
  }

  const digits = phone.replace(/[^0-9+]/g, "")
  if (digits.startsWith("+")) {
    return { countryCode: DEFAULT_COUNTRY_CODE, nationalNumber: digits.replace(/\D/g, "") }
  }

  return { countryCode: DEFAULT_COUNTRY_CODE, nationalNumber: digits.replace(/\D/g, "") }
}

export function buildPhoneNumber(countryCode: string, nationalNumber: string): string {
  const digits = nationalNumber.replace(/[^0-9]/g, "")
  if (!digits) return countryCode
  return `${countryCode}${digits}`
}

export function getMaxNationalDigits(countryCode: string): number {
  if (countryCode === "+91") return 10
  return 15
}

export function getMinNationalDigits(countryCode: string): number {
  if (countryCode === "+91") return 10
  return 6
}

export function hasValidPhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return false
  const parsed = parsePhoneWithCountryCode(phone)
  if (!parsed.nationalNumber) return false
  const len = parsed.nationalNumber.length
  return len >= getMinNationalDigits(parsed.countryCode) && len <= getMaxNationalDigits(parsed.countryCode)
}

export function normalizePhoneForStorage(phone: string | null | undefined): string | null {
  if (!phone) return null
  const parsed = parsePhoneWithCountryCode(phone)
  if (!parsed.nationalNumber) return null
  return buildPhoneNumber(parsed.countryCode, parsed.nationalNumber)
}
