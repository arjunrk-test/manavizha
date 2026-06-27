import { NextResponse } from "next/server"

import { authErrorResponse, requireSuperAdmin } from "@/lib/server/api-auth"
import {
  chunkArray,
  isAllowedMasterDataTable,
  isXlsxBuffer,
  isXlsxFile,
  parseStartRow,
  parseXlsxValues,
  partitionImportValues,
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

    const { values: sheetValues, skippedEmpty } = parseXlsxValues(buffer, { startRow })

    if (sheetValues.length === 0) {
      return NextResponse.json(
        {
          error: "No values found in the sheet from the selected start row",
          skippedEmpty,
        },
        { status: 400 }
      )
    }

    const { data: existingRows, error: fetchError } = await supabaseAdmin
      .from(tableName)
      .select("value")

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const existingValues = (existingRows ?? []).map((row) => String(row.value ?? ""))
    const partition = partitionImportValues(sheetValues, existingValues)

    if (partition.toInsert.length > 0) {
      const batches = chunkArray(partition.toInsert, MASTER_DATA_IMPORT_BATCH_SIZE)
      for (const batch of batches) {
        const rows = batch.map((value) => ({ value }))
        const { error: insertError } = await supabaseAdmin.from(tableName).insert(rows)
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
