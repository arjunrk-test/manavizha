import * as XLSX from "xlsx"

/**
 * Convert Excel column letter to number (A=1, B=2, etc.)
 */
export const columnLetterToNumber = (letter: string): number => {
  let result = 0
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64)
  }
  return result
}

/**
 * Convert Excel column number to letter (1=A, 2=B, etc.)
 */
export const columnNumberToLetter = (num: number): string => {
  let result = ""
  while (num > 0) {
    num--
    result = String.fromCharCode(65 + (num % 26)) + result
    num = Math.floor(num / 26)
  }
  return result
}

export interface ExcelExtractionOptions {
  file: File
  startRow: number
  fromColumn: string
  toColumn: string
  hasCategory?: boolean // If true, fromColumn = category, toColumn = value
}

export interface ExtractedData {
  category?: string
  value: string
}

/**
 * Extract data from Excel file based on row and column range
 */
export const extractDataFromExcel = async (
  options: ExcelExtractionOptions
): Promise<{ success: boolean; data: ExtractedData[]; error?: string }> => {
  const { file, startRow, fromColumn, toColumn, hasCategory = false } = options

  // Validate inputs
  if (startRow < 1) {
    return {
      success: false,
      data: [],
      error: "Please enter a valid starting row number (1 or greater)",
    }
  }

  const fromColNum = columnLetterToNumber(fromColumn.toUpperCase())
  const toColNum = columnLetterToNumber(toColumn.toUpperCase())

  if (fromColNum > toColNum) {
    return {
      success: false,
      data: [],
      error: "From column must be before or equal to To column",
    }
  }

  try {
    // Read Excel file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][]

    // Extract data based on row and column range
    const valuesToImport: ExtractedData[] = []

    for (let rowIndex = startRow - 1; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row || row.length === 0) continue

      if (hasCategory) {
        // For tables with category, fromColumn is category, toColumn is value
        const category = row[fromColNum - 1] !== undefined ? String(row[fromColNum - 1]).trim() : ""
        const value = row[toColNum - 1] !== undefined ? String(row[toColNum - 1]).trim() : ""
        if (value) {
          valuesToImport.push({ category, value })
        }
      } else {
        // For other tables, use the first column in range as value
        for (let colIndex = fromColNum - 1; colIndex < toColNum && colIndex < row.length; colIndex++) {
          const cellValue = String(row[colIndex]).trim()
          if (cellValue) {
            valuesToImport.push({ value: cellValue })
            break // Take only the first non-empty value in the range
          }
        }
      }
    }

    if (valuesToImport.length === 0) {
      return {
        success: false,
        data: [],
        error: "No data found in the specified range",
      }
    }

    return {
      success: true,
      data: valuesToImport,
    }
  } catch (error: any) {
    console.error("Error extracting data from Excel:", error)
    return {
      success: false,
      data: [],
      error: error.message || "Failed to read Excel file. Please check the file format.",
    }
  }
}

/**
 * Filter out duplicate entries from extracted data by comparing with existing data
 */
export const filterDuplicates = (
  extractedData: ExtractedData[],
  existingData: any[],
  hasCategory: boolean = false
): ExtractedData[] => {
  return extractedData.filter((newItem) => {
    if (hasCategory) {
      // For tables with category, check both category and value
      return !existingData.some(
        (existing: any) =>
          existing.category?.toLowerCase().trim() === newItem.category?.toLowerCase().trim() &&
          existing.value?.toLowerCase().trim() === newItem.value?.toLowerCase().trim()
      )
    } else {
      // For other tables, check only value
      return !existingData.some(
        (existing: any) => existing.value?.toLowerCase().trim() === newItem.value?.toLowerCase().trim()
      )
    }
  })
}

