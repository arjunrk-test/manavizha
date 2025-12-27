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
}: MasterDataManagerProps) {
  const [values, setValues] = useState<MasterDataValue[]>([])
  const [internalIsDialogOpen, setInternalIsDialogOpen] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const isDialogOpen = externalIsDialogOpen !== undefined ? externalIsDialogOpen : internalIsDialogOpen
  const setIsDialogOpen = externalOnDialogChange || setInternalIsDialogOpen
  const [inputValue, setInputValue] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MasterDataValue | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchValues()
  }, [tableName])

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
    setIsDialogOpen(true)
  }

  const handleEdit = (item: MasterDataValue) => {
    setEditingId(item.id)
    setInputValue(item.value)
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

    setIsSaving(true)
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from(tableName)
          .update({ value: inputValue.trim() })
          .eq("id", editingId)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase.from(tableName).insert({
          value: inputValue.trim(),
        })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setInputValue("")
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
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-200 dark:border-gray-600">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  S.No
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Value
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {values.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No {title.toLowerCase()} values found. Click "{addButtonText}" to add one.
                  </td>
                </tr>
              ) : (
                values.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.value}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? `Edit ${title}` : dialogTitle}</DialogTitle>
            <DialogDescription>
              {editingId
                ? `Update the ${title.toLowerCase()} value below.`
                : dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setInputValue("")
                setEditingId(null)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !inputValue.trim()}
              className="bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white"
            >
              {isSaving ? "Saving..." : editingId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

