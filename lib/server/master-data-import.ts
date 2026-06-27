import * as XLSX from "xlsx"

import { masterDataConfig } from "@/constants/master-data"
import {
  MASTER_DATA_IMPORT_DEFAULT_START_ROW,
  MASTER_DATA_IMPORT_MAX_ROWS,
  type MasterDataImportProfile,
  type MasterDataImportResult,
  normalizeHexColourCode,
  normalizeMasterDataValue,
} from "@/lib/master-data-import"

const ALLOWED_TABLES = new Set(
  Object.values(masterDataConfig).map((config) => config.tableName)
)

const XLSX_EXTENSION = ".xlsx"

export type MasterDataImportRow = {
  value: string
  colourCode?: string
  category?: string
}

export function isAllowedMasterDataTable(tableName: string): boolean {
  return ALLOWED_TABLES.has(tableName)
}

export function getMasterDataImportProfile(tableName: string): MasterDataImportProfile {
  const config = Object.values(masterDataConfig).find((entry) => entry.tableName === tableName)
  return config?.importProfile ?? "value"
}

export function isXlsxFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return name.endsWith(XLSX_EXTENSION)
}

export function isXlsxBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false
  const bytes = new Uint8Array(buffer.slice(0, 4))
  return bytes[0] === 0x50 && bytes[1] === 0x4b
}

export function parseStartRow(value: FormDataEntryValue | null): number {
  if (value == null || String(value).trim() === "") {
    return MASTER_DATA_IMPORT_DEFAULT_START_ROW
  }
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error("Start row must be a whole number of 1 or greater")
  }
  return parsed
}

function readSheetRows(buffer: ArrayBuffer): unknown[][] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []

  const sheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][]
}

export function parseXlsxImportRows(
  buffer: ArrayBuffer,
  options: { startRow: number; profile: MasterDataImportProfile }
): { rows: MasterDataImportRow[]; skippedEmpty: number; skippedInvalid: number } {
  const sheetRows = readSheetRows(buffer)
  const startIndex = Math.max(0, options.startRow - 1)
  const parsedRows: MasterDataImportRow[] = []
  let skippedEmpty = 0
  let skippedInvalid = 0

  for (let rowIndex = startIndex; rowIndex < sheetRows.length; rowIndex++) {
    if (parsedRows.length + skippedEmpty + skippedInvalid >= MASTER_DATA_IMPORT_MAX_ROWS) {
      break
    }

    const row = sheetRows[rowIndex] ?? []
    const rawValue = row[0]
    const valueText = rawValue == null ? "" : String(rawValue).trim()

    if (!valueText) {
      skippedEmpty++
      continue
    }

    if (options.profile === "value-colour-code") {
      const rawColour = row[1]
      const colourText = rawColour == null ? "" : String(rawColour).trim()
      const colourCode = normalizeHexColourCode(colourText)
      if (!colourCode) {
        skippedInvalid++
        continue
      }
      parsedRows.push({ value: valueText, colourCode })
      continue
    }

    if (options.profile === "value-category") {
      const rawCategory = row[1]
      const categoryText = rawCategory == null ? "" : String(rawCategory).trim()
      if (!categoryText) {
        skippedInvalid++
        continue
      }
      parsedRows.push({ value: valueText, category: categoryText })
      continue
    }

    parsedRows.push({ value: valueText })
  }

  return { rows: parsedRows, skippedEmpty, skippedInvalid }
}

function importRowKey(row: MasterDataImportRow, profile: MasterDataImportProfile): string {
  if (profile === "value-category") {
    return `${normalizeMasterDataValue(row.value)}\0${normalizeMasterDataValue(row.category ?? "")}`
  }
  return normalizeMasterDataValue(row.value)
}

function existingRowKey(
  row: { value: string; category?: string | null },
  profile: MasterDataImportProfile
): string {
  if (profile === "value-category") {
    return `${normalizeMasterDataValue(row.value)}\0${normalizeMasterDataValue(row.category ?? "")}`
  }
  return normalizeMasterDataValue(row.value)
}

export function partitionImportRows(
  sheetRows: MasterDataImportRow[],
  existingRows: { value: string; category?: string | null }[],
  profile: MasterDataImportProfile
): Pick<
  MasterDataImportResult,
  "imported" | "skippedExisting" | "skippedDuplicateInSheet" | "totalRowsRead"
> & { toInsert: MasterDataImportRow[] } {
  const existingSet = new Set(existingRows.map((row) => existingRowKey(row, profile)))
  const seenInSheet = new Set<string>()
  const toInsert: MasterDataImportRow[] = []
  let skippedExisting = 0
  let skippedDuplicateInSheet = 0

  for (const row of sheetRows) {
    const key = importRowKey(row, profile)
    if (existingSet.has(key)) {
      skippedExisting++
      continue
    }
    if (seenInSheet.has(key)) {
      skippedDuplicateInSheet++
      continue
    }
    seenInSheet.add(key)
    toInsert.push({
      value: row.value.trim(),
      ...(row.colourCode ? { colourCode: row.colourCode } : {}),
      ...(row.category ? { category: row.category.trim() } : {}),
    })
  }

  return {
    toInsert,
    imported: toInsert.length,
    skippedExisting,
    skippedDuplicateInSheet,
    totalRowsRead: sheetRows.length,
  }
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export function toDatabaseRows(
  toInsert: MasterDataImportRow[],
  profile: MasterDataImportProfile
): Record<string, string>[] {
  if (profile === "value-colour-code") {
    return toInsert.map((row) => ({
      value: row.value,
      colour_code: row.colourCode ?? "",
    }))
  }
  if (profile === "value-category") {
    return toInsert.map((row) => ({
      value: row.value,
      category: row.category ?? "",
    }))
  }
  return toInsert.map((row) => ({ value: row.value }))
}
