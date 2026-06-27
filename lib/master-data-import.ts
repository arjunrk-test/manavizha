export const MASTER_DATA_IMPORT_BATCH_SIZE = 500
export const MASTER_DATA_IMPORT_MAX_ROWS = 10_000
export const MASTER_DATA_IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024
export const MASTER_DATA_IMPORT_DEFAULT_START_ROW = 2

export type MasterDataImportResult = {
  imported: number
  skippedExisting: number
  skippedDuplicateInSheet: number
  skippedEmpty: number
  totalRowsRead: number
}

export function normalizeMasterDataValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}
