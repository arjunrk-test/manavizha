import { NextResponse } from "next/server"

import { authErrorResponse, requireSuperAdmin } from "@/lib/server/api-auth"
import {
  chunkArray,
  getMasterDataImportProfile,
  isAllowedMasterDataTable,
  isXlsxBuffer,
  isXlsxFile,
  parseStartRow,
  parseXlsxImportRows,
  partitionImportRows,
  toDatabaseRows,
} from "@/lib/server/master-data-import"
import {
  MASTER_DATA_IMPORT_BATCH_SIZE,
  MASTER_DATA_IMPORT_MAX_FILE_BYTES,
  type MasterDataImportResult,
} from "@/lib/master-data-import"
import { supabaseAdmin } from "@/lib/supabase"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await requireSuperAdmin(request)

    const formData = await request.formData()
    const file = formData.get("file")
    const tableName = String(formData.get("tableName") ?? "").trim()
    const startRow = parseStartRow(formData.get("startRow"))

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "An .xlsx file is required" }, { status: 400 })
    }

    if (!tableName || !isAllowedMasterDataTable(tableName)) {
      return NextResponse.json({ error: "Invalid master data table" }, { status: 400 })
    }

    if (!isXlsxFile(file)) {
      return NextResponse.json({ error: "Only .xlsx files are allowed" }, { status: 400 })
    }

    if (file.size > MASTER_DATA_IMPORT_MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File is too large (max 5 MB)" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    if (!isXlsxBuffer(buffer)) {
      return NextResponse.json({ error: "Invalid .xlsx file" }, { status: 400 })
    }

    const profile = getMasterDataImportProfile(tableName)
    const { rows: sheetRows, skippedEmpty, skippedInvalid } = parseXlsxImportRows(buffer, {
      startRow,
      profile,
    })

    if (sheetRows.length === 0) {
      const emptyMessage =
        profile === "value-colour-code"
          ? "No valid rows found. Each row needs a skin colour in column A and a HEX colour code in column B."
          : profile === "value-category"
            ? "No valid rows found. Each row needs a value in column A and a category in column B."
            : "No values found in the sheet from the selected start row"

      return NextResponse.json(
        {
          error: emptyMessage,
          skippedEmpty,
          skippedInvalid,
        },
        { status: 400 }
      )
    }

    let existingForPartition: { value: string; category?: string | null }[]

    if (profile === "value-category") {
      const { data, error } = await supabaseAdmin.from(tableName).select("value, category")
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      existingForPartition = (data ?? []).map((row) => ({
        value: String(row.value ?? ""),
        category: row.category != null ? String(row.category) : null,
      }))
    } else {
      const { data, error } = await supabaseAdmin.from(tableName).select("value")
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      existingForPartition = (data ?? []).map((row) => ({
        value: String(row.value ?? ""),
      }))
    }

    const partition = partitionImportRows(sheetRows, existingForPartition, profile)

    if (partition.toInsert.length > 0) {
      const dbRows = toDatabaseRows(partition.toInsert, profile)
      const batches = chunkArray(dbRows, MASTER_DATA_IMPORT_BATCH_SIZE)
      for (const batch of batches) {
        const { error: insertError } = await supabaseAdmin.from(tableName).insert(batch)
        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
      }
    }

    const result: MasterDataImportResult = {
      imported: partition.toInsert.length,
      skippedExisting: partition.skippedExisting,
      skippedDuplicateInSheet: partition.skippedDuplicateInSheet,
      skippedEmpty,
      skippedInvalid,
      totalRowsRead: partition.totalRowsRead,
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Start row")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return authErrorResponse(error)
  }
}
