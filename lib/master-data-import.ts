export const MASTER_DATA_IMPORT_BATCH_SIZE = 500
export const MASTER_DATA_IMPORT_MAX_ROWS = 10_000
export const MASTER_DATA_IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024
export const MASTER_DATA_IMPORT_DEFAULT_START_ROW = 2

export type MasterDataImportResult = {
  imported: number
  skippedExisting: number
  skippedDuplicateInSheet: number
  skippedEmpty: number
  skippedInvalid: number
  totalRowsRead: number
}

export type MasterDataImportProfile = "value" | "value-colour-code" | "value-category"

export const HEX_COLOUR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export function normalizeMasterDataValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function normalizeHexColourCode(raw: string): string | null {
  let value = raw.trim()
  if (!value) return null
  if (!value.startsWith("#")) {
    value = `#${value}`
  }
  value = value.toUpperCase()
  return HEX_COLOUR_PATTERN.test(value) ? value : null
}
