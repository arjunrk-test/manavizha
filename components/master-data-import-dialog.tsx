"use client"

import { useRef, useState } from "react"
import { FileSpreadsheet, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { authFetch } from "@/lib/api-client"
import { MASTER_DATA_IMPORT_DEFAULT_START_ROW, type MasterDataImportProfile } from "@/lib/master-data-import"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MasterDataImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  title: string
  importProfile?: MasterDataImportProfile
  onImported?: () => void
}

type ImportSummary = {
  imported: number
  skippedExisting: number
  skippedDuplicateInSheet: number
  skippedEmpty: number
  skippedInvalid: number
  totalRowsRead: number
}

const IMPORT_DESCRIPTIONS: Record<MasterDataImportProfile, string> = {
  value:
    "Upload an Excel file (.xlsx). Values are read from column A. Only new values not already in the table will be added.",
  "value-colour-code":
    "Upload an Excel file (.xlsx). Column A is the skin colour name and column B is the HEX colour code (e.g. #FF5733). Only new names not already in the table will be added.",
}

export function MasterDataImportDialog({
  open,
  onOpenChange,
  tableName,
  title,
  importProfile = "value",
  onImported,
}: MasterDataImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [startRow, setStartRow] = useState(String(MASTER_DATA_IMPORT_DEFAULT_START_ROW))
  const [isImporting, setIsImporting] = useState(false)
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const resetState = () => {
    setFile(null)
    setStartRow(String(MASTER_DATA_IMPORT_DEFAULT_START_ROW))
    setSummary(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isImporting) {
      resetState()
    }
    onOpenChange(nextOpen)
  }

  const handleFileChange = (selected: File | null) => {
    if (!selected) {
      setFile(null)
      return
    }

    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Only .xlsx files are allowed")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setFile(selected)
    setSummary(null)
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("Choose an .xlsx file to import")
      return
    }

    const parsedStartRow = Number.parseInt(startRow, 10)
    if (!Number.isFinite(parsedStartRow) || parsedStartRow < 1) {
      toast.error("Start row must be 1 or greater")
      return
    }

    setIsImporting(true)
    setSummary(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tableName", tableName)
      formData.append("startRow", String(parsedStartRow))

      const response = await authFetch("/api/admin/master-data/import", {
        method: "POST",
        body: formData,
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || "Import failed")
      }

      const result: ImportSummary = {
        imported: payload.imported ?? 0,
        skippedExisting: payload.skippedExisting ?? 0,
        skippedDuplicateInSheet: payload.skippedDuplicateInSheet ?? 0,
        skippedEmpty: payload.skippedEmpty ?? 0,
        skippedInvalid: payload.skippedInvalid ?? 0,
        totalRowsRead: payload.totalRowsRead ?? 0,
      }

      setSummary(result)
      onImported?.()

      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} new ${title.toLowerCase()} value${result.imported === 1 ? "" : "s"}`)
      } else {
        toast.message("No new values to import", {
          description: "Every value in the sheet already exists in the table.",
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed"
      toast.error(message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-xl border-[#f0ebe3] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Import {title}</DialogTitle>
          <DialogDescription>{IMPORT_DESCRIPTIONS[importProfile]}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="master-import-start-row">Start row</Label>
            <Input
              id="master-import-start-row"
              type="number"
              min={1}
              value={startRow}
              onChange={(e) => setStartRow(e.target.value)}
              disabled={isImporting}
              className="h-9"
            />
            <p className="text-xs text-gray-500">
              Row 1 is usually the header. Default is row 2 so data starts below the header.
              {importProfile === "value-colour-code" && (
                <> Use columns A (name) and B (HEX code, with or without #).</>
              )}
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Excel file (.xlsx)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              disabled={isImporting}
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />

            {!file ? (
              <button
                type="button"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#eadfce] bg-[#faf8f4]/80 px-4 py-8 text-center transition-colors hover:border-[#c9a227]/40 hover:bg-[#fdf6e3]/40 disabled:opacity-50"
              >
                <Upload className="h-6 w-6 text-[#c9a227]" />
                <span className="text-sm font-medium text-[#1F4068]">Choose .xlsx file</span>
                <span className="text-xs text-gray-500">Max 5 MB</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-[#f0ebe3] bg-white px-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fdf6e3]">
                  <FileSpreadsheet className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1F4068]">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={isImporting}
                  onClick={() => handleFileChange(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {summary && (
            <div className="rounded-xl border border-[#f0ebe3] bg-[#faf8f4] px-4 py-3 text-sm text-[#374151]">
              <p className="font-medium text-[#1F4068]">Import summary</p>
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                <li>{summary.imported} imported</li>
                <li>{summary.skippedExisting} skipped (already in table)</li>
                <li>{summary.skippedDuplicateInSheet} skipped (duplicate in sheet)</li>
                {summary.skippedEmpty > 0 && <li>{summary.skippedEmpty} empty rows skipped</li>}
                {summary.skippedInvalid > 0 && (
                  <li>{summary.skippedInvalid} skipped (missing or invalid HEX code)</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
            className="rounded-lg border-[#f0ebe3]"
          >
            {summary ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || !file}
            className="rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]"
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
