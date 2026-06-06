"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

interface MasterDataValue {
  id: string
  value: string
  colour_code?: string
  category?: string
  created_at: string
  updated_at: string
}

interface MasterDataManagerProps {
  tableName: string
  title: string
  addButtonText: string
  dialogTitle: string
  dialogDescription: string
  inputPlaceholder?: string
  isAddDialogOpen?: boolean
  onAddDialogChange?: (open: boolean) => void
  showColourCode?: boolean
  showCategory?: boolean
  refreshKey?: number // Key to trigger refresh
}

export function MasterDataManager({
  tableName,
  title,
  addButtonText,
  dialogTitle,
  dialogDescription,
  inputPlaceholder = "Enter value",
  isAddDialogOpen: externalIsDialogOpen,
  onAddDialogChange: externalOnDialogChange,
  showColourCode = false,
  showCategory = false,
  refreshKey = 0,
}: MasterDataManagerProps) {
  const [values, setValues] = useState<MasterDataValue[]>([])
  const [internalIsDialogOpen, setInternalIsDialogOpen] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const isDialogOpen = externalIsDialogOpen !== undefined ? externalIsDialogOpen : internalIsDialogOpen
  const setIsDialogOpen = externalOnDialogChange || setInternalIsDialogOpen
  const [inputValue, setInputValue] = useState("")
  const [colourCodeValue, setColourCodeValue] = useState("")
  const [categoryValue, setCategoryValue] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MasterDataValue | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchValues()
  }, [tableName, refreshKey])

  const fetchValues = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: true })

      if (error) throw error
      setValues(data || [])
    } catch (error) {
      console.error(`Error fetching ${tableName} values:`, error)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setInputValue("")
    setColourCodeValue("")
    setCategoryValue("")
    setIsDialogOpen(true)
  }

  const handleEdit = (item: MasterDataValue) => {
    setEditingId(item.id)
    setInputValue(item.value)
    setColourCodeValue(item.colour_code || "")
    setCategoryValue(item.category || "")
    setIsDialogOpen(true)
  }

  const handleDelete = (item: MasterDataValue) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", itemToDelete.id)

      if (error) throw error
      await fetchValues()
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error(`Error deleting ${tableName} value:`, error)
      alert(`Failed to delete ${title.toLowerCase()} value. Please try again.`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!inputValue.trim()) {
      alert(`Please enter a ${title.toLowerCase()} value`)
      return
    }

    if (showColourCode && !colourCodeValue.trim()) {
      alert("Please enter a colour code (HEX)")
      return
    }

    if (showCategory && !categoryValue.trim()) {
      alert("Please enter a category")
      return
    }

    // Validate HEX color code if provided
    if (showColourCode && colourCodeValue.trim()) {
      const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      if (!hexPattern.test(colourCodeValue.trim())) {
        alert("Please enter a valid HEX color code (e.g., #FF5733 or #F53)")
        return
      }
    }

    setIsSaving(true)
    try {
      const dataToSave: any = {
        value: inputValue.trim(),
      }

      if (showColourCode) {
        dataToSave.colour_code = colourCodeValue.trim().toUpperCase()
      }

      if (showCategory) {
        dataToSave.category = categoryValue.trim()
      }

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from(tableName)
          .update(dataToSave)
          .eq("id", editingId)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase.from(tableName).insert(dataToSave)

        if (error) throw error
      }

      setIsDialogOpen(false)
      setInputValue("")
      setColourCodeValue("")
      setCategoryValue("")
      setEditingId(null)
      await fetchValues()
    } catch (error: any) {
      console.error(`Error saving ${tableName} value:`, error)
      if (error.code === "23505") {
        alert(`This ${title.toLowerCase()} value already exists`)
      } else {
        alert(`Failed to save ${title.toLowerCase()} value. Please try again.`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="h-full flex flex-col min-h-0">
        {/* Scrollable Table Container */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]/95">
                <th className="bg-[#faf8f4]/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] sm:px-5">
                  S.No
                </th>
                {showCategory && (
                  <th className="bg-[#faf8f4]/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] sm:px-5">
                    Category
                  </th>
                )}
                <th className="bg-[#faf8f4]/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] sm:px-5">
                  Value
                </th>
                {showColourCode && (
                  <th className="bg-[#faf8f4]/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] sm:px-5">
                    Colour Code
                  </th>
                )}
                <th className="bg-[#faf8f4]/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] sm:px-5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {values.length === 0 ? (
                <tr>
                  <td
                    colSpan={showCategory ? (showColourCode ? 5 : 4) : showColourCode ? 4 : 3}
                    className="px-5 py-10 text-center text-[12px] text-gray-500"
                  >
                    No {title.toLowerCase()} values found. Click &ldquo;{addButtonText}&rdquo; to add one.
                  </td>
                </tr>
              ) : (
                values.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#f0ebe3]/80 transition-colors hover:bg-[#faf8f4]/60"
                  >
                    <td className="px-4 py-3 text-[13px] tabular-nums text-gray-600 sm:px-5">{index + 1}</td>
                    {showCategory && (
                      <td className="px-4 py-3 text-[13px] text-[#1F4068] sm:px-5">{item.category || "-"}</td>
                    )}
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1F4068] sm:px-5">{item.value}</td>
                    {showColourCode && (
                      <td className="px-4 py-3 text-[13px] sm:px-5">
                        <div className="flex items-center gap-2">
                          {item.colour_code && (
                            <div
                              className="h-7 w-7 rounded-md border border-[#f0ebe3] shadow-sm"
                              style={{ backgroundColor: item.colour_code }}
                            />
                          )}
                          <span className="font-mono text-[12px] text-gray-600">{item.colour_code || "-"}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-[13px] sm:px-5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-lg border-[#f0ebe3] p-0 text-[#1F4068] hover:border-[#c9a227]/40 hover:bg-[#fdf6e3]"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-lg border-[#f0ebe3] p-0 text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-xl border-[#f0ebe3] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? `Edit ${title}` : dialogTitle}</DialogTitle>
            <DialogDescription>
              {editingId
                ? `Update the ${title.toLowerCase()} value below.`
                : dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {showCategory && (
              <div className="grid gap-2">
                <Label htmlFor="category-input">Category</Label>
                <Input
                  id="category-input"
                  value={categoryValue}
                  onChange={(e) => setCategoryValue(e.target.value)}
                  placeholder="Enter category"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSaving) {
                      handleSave()
                    }
                  }}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="value-input">{title} Value</Label>
              <Input
                id="value-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSaving) {
                    handleSave()
                  }
                }}
              />
            </div>
            {showColourCode && (
              <div className="grid gap-2">
                <Label htmlFor="colour-code-input">Colour Code (HEX)</Label>
                <div className="flex items-center gap-2">
                  {colourCodeValue && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colourCodeValue.trim()) && (
                    <div
                      className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: colourCodeValue.trim() }}
                    />
                  )}
                  <Input
                    id="colour-code-input"
                    value={colourCodeValue}
                    onChange={(e) => {
                      let value = e.target.value
                      // Auto-add # if user types without it
                      if (value && !value.startsWith("#")) {
                        value = "#" + value
                      }
                      setColourCodeValue(value.toUpperCase())
                    }}
                    placeholder="#FF5733 or #F53"
                    maxLength={7}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSaving) {
                        handleSave()
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter a valid HEX color code (e.g., #FF5733 or #F53)
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setInputValue("")
                setColourCodeValue("")
                setCategoryValue("")
                setEditingId(null)
              }}
              disabled={isSaving}
              className="rounded-lg border-[#f0ebe3]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !inputValue.trim() || (showColourCode && !colourCodeValue.trim()) || (showCategory && !categoryValue.trim())}
              className="rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]"
            >
              {isSaving ? "Saving..." : editingId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-xl border-[#f0ebe3] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {title} Value</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.value}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setItemToDelete(null)
              }}
              disabled={isDeleting}
              className="rounded-lg border-[#f0ebe3]"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

