import * as XLSX from "xlsx"

import { masterDataConfig } from "@/constants/master-data"
import {
  MASTER_DATA_IMPORT_DEFAULT_START_ROW,
  MASTER_DATA_IMPORT_MAX_ROWS,
  type MasterDataImportResult,
  normalizeMasterDataValue,
} from "@/lib/master-data-import"

const ALLOWED_TABLES = new Set(
  Object.values(masterDataConfig).map((config) => config.tableName)
)

const XLSX_EXTENSION = ".xlsx"

export function isAllowedMasterDataTable(tableName: string): boolean {
  return ALLOWED_TABLES.has(tableName)
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

export function parseXlsxValues(
  buffer: ArrayBuffer,
  options: { startRow: number; columnIndex?: number }
): { values: string[]; skippedEmpty: number } {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { values: [], skippedEmpty: 0 }
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][]

  const startIndex = Math.max(0, options.startRow - 1)
  const columnIndex = options.columnIndex ?? 0
  const values: string[] = []
  let skippedEmpty = 0

  for (let rowIndex = startIndex; rowIndex < rows.length; rowIndex++) {
    if (values.length + skippedEmpty >= MASTER_DATA_IMPORT_MAX_ROWS) {
      break
    }

    const cell = rows[rowIndex]?.[columnIndex]
    if (cell == null) {
      skippedEmpty++
      continue
    }

    const text = String(cell).trim()
    if (!text) {
      skippedEmpty++
      continue
    }

    values.push(text)
  }

  return { values, skippedEmpty }
}

export function partitionImportValues(
  sheetValues: string[],
  existingValues: string[]
): Pick<
  MasterDataImportResult,
  "imported" | "skippedExisting" | "skippedDuplicateInSheet" | "totalRowsRead"
> & { toInsert: string[] } {
  const existingSet = new Set(existingValues.map(normalizeMasterDataValue))
  const seenInSheet = new Set<string>()
  const toInsert: string[] = []
  let skippedExisting = 0
  let skippedDuplicateInSheet = 0

  for (const value of sheetValues) {
    const normalized = normalizeMasterDataValue(value)
    if (existingSet.has(normalized)) {
      skippedExisting++
      continue
    }
    if (seenInSheet.has(normalized)) {
      skippedDuplicateInSheet++
      continue
    }
    seenInSheet.add(normalized)
    toInsert.push(value.trim())
  }

  return {
    toInsert,
    imported: toInsert.length,
    skippedExisting,
    skippedDuplicateInSheet,
    totalRowsRead: sheetValues.length,
  }
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}
