import { NAKSHATRA_TAMIL, RASHI_TAMIL } from "@/lib/astrology"

const TAMIL_RE = /[\u0B80-\u0BFF]/

function containsTamil(text: string): boolean {
  return TAMIL_RE.test(text)
}

function englishKey(label: string): string {
  return label.replace(/\([^)]*\)/, "").trim().toLowerCase()
}

const CANONICAL_BY_ENGLISH: Record<string, string> = {}
for (const label of [...Object.values(RASHI_TAMIL), ...Object.values(NAKSHATRA_TAMIL)]) {
  CANONICAL_BY_ENGLISH[englishKey(label)] = label
}

const ENGLISH_ALIASES: Record<string, string> = {
  tulam: "thulam",
  thulam: "thulam",
  katakam: "kadagam",
  kadagam: "kadagam",
  mithunam: "midhunam",
  midhunam: "midhunam",
  makaram: "magaram",
  magaram: "magaram",
  mesham: "mesham",
  rishabam: "rishabam",
  simmam: "simmam",
  kanni: "kanni",
  viruchigam: "viruchigam",
  dhanusu: "dhanusu",
  kumbam: "kumbam",
  meenam: "meenam",
}

function lookupCanonical(englishPart: string): string | undefined {
  const raw = englishPart.trim().toLowerCase()
  const key = ENGLISH_ALIASES[raw] ?? raw
  if (CANONICAL_BY_ENGLISH[key]) return CANONICAL_BY_ENGLISH[key]
  if (CANONICAL_BY_ENGLISH[raw]) return CANONICAL_BY_ENGLISH[raw]

  const normalized = raw.replace(/[^a-z]/g, "")
  for (const [canonicalKey, label] of Object.entries(CANONICAL_BY_ENGLISH)) {
    if (canonicalKey.replace(/[^a-z]/g, "") === normalized) return label
  }

  return undefined
}

function tamilPartBroken(tamilPart: string): boolean {
  const part = tamilPart.trim()
  if (!part) return true
  if (part.includes("\uFFFD")) return true
  if (!containsTamil(part) && /[\u0080-\u00FF]/.test(part)) return true
  return false
}

function fixUtf8Mojibake(text: string): string {
  if (containsTamil(text)) return text
  if (!/[\u0080-\u00FF]/.test(text)) return text

  try {
    const bytes = Uint8Array.from([...text].map((char) => char.charCodeAt(0) & 0xff))
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes)
    if (containsTamil(decoded)) return decoded
  } catch {
    // keep original
  }

  return text
}

/** Normalize bilingual master labels so Tamil renders reliably in the UI. */
export function normalizeTamilMasterLabel(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "—"

  const text = fixUtf8Mojibake(String(value).trim())
  const parenMatch = text.match(/^(.+?)\s*\(([^)]*)\)\s*$/)

  if (parenMatch) {
    const [, englishPart, tamilPart] = parenMatch
    if (tamilPartBroken(tamilPart)) {
      const canonical = lookupCanonical(englishPart)
      if (canonical) return canonical
    }
    return text
  }

  const canonical = lookupCanonical(text)
  if (canonical && !containsTamil(text)) return canonical

  return text
}

export function containsTamilScript(text: string): boolean {
  return containsTamil(text)
}
