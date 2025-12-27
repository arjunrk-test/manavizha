"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Database, Circle, ChevronDown, ChevronRight, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { MasterDataManager } from "@/components/master-data-manager"
import { masterDataConfig } from "@/constants/master-data"
import { extractDataFromExcel, filterDuplicates, columnLetterToNumber } from "@/utils/excel-utils"
import { toast } from "sonner"

const personalDetailsSubmenus = [
  { id: "gender", title: "Gender" },
  { id: "skin-colour", title: "Skin Colour" },
  { id: "body-type", title: "Body Type" },
  { id: "marital-status", title: "Marital Status" },
  { id: "food-preferences", title: "Food Preferences" },
  { id: "indian-languages", title: "Indian Languages" },
  { id: "international-languages", title: "International Languages" },
]

const educationalDetailsSubmenus = [
  { id: "education-level", title: "Education Level" },
  { id: "degree-qualification", title: "Degree/ Qualification" },
  { id: "status", title: "Status" },
]

const professionalDetailsSubmenus = [
  { id: "employment-type", title: "Employment Type" },
  { id: "sector", title: "Sector" },
  { id: "type-of-business", title: "Type of Business" },
  { id: "course-degree", title: "Course/ Degree" },
  { id: "year-of-study", title: "Year of Study" },
]

const familyDetailsSubmenus = [
  { id: "caste", title: "Caste" },
  { id: "subcaste", title: "Subcaste" },
  { id: "kulam", title: "Kulam" },
  { id: "gotram", title: "Gotram" },
  { id: "family-type", title: "Family Type" },
  { id: "family-status", title: "Family Status" },
]

const horoscopeDetailsSubmenus = [
  { id: "zodiac-moon-sign", title: "Zodiac or Moon Sign" },
  { id: "star", title: "Star" },
  { id: "lagnam", title: "Lagnam" },
]

const interestsSubmenus = [
  { id: "hobbies", title: "Hobbies" },
  { id: "interests", title: "Interests" },
]

const socialHabitsSubmenus = [
  { id: "smoking", title: "Smoking" },
  { id: "drinking", title: "Drinking" },
  { id: "parties", title: "Parties" },
  { id: "pubs", title: "Pubs" },
]

interface MenuSectionProps {
  title: string
  submenus: { id: string; title: string }[]
  isOpen: boolean
  onToggle: () => void
  currentStep: string
  onSubmenuClick: (id: string) => void
}

function MenuSection({ title, submenus, isOpen, onToggle, currentStep, onSubmenuClick }: MenuSectionProps) {
  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{title}</div>
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div>
          <div className="pl-4 pt-2 space-y-1">
            {submenus.map((submenu) => {
              const isActive = currentStep === submenu.id

              return (
                <button
                  key={submenu.id}
                  onClick={() => onSubmenuClick(submenu.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    isActive
                      ? "bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] text-white shadow-lg"
                      : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <Circle className="h-4 w-4 fill-white text-white" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{submenu.title}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminMasterDataPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false)
  const [isEducationalDetailsOpen, setIsEducationalDetailsOpen] = useState(false)
  const [isProfessionalDetailsOpen, setIsProfessionalDetailsOpen] = useState(false)
  const [isFamilyDetailsOpen, setIsFamilyDetailsOpen] = useState(false)
  const [isHoroscopeDetailsOpen, setIsHoroscopeDetailsOpen] = useState(false)
  const [isInterestsOpen, setIsInterestsOpen] = useState(false)
  const [isSocialHabitsOpen, setIsSocialHabitsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("")
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [startRow, setStartRow] = useState<string>("2")
  const [fromColumn, setFromColumn] = useState<string>("A")
  const [toColumn, setToColumn] = useState<string>("B")
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [showAppendReplaceDialog, setShowAppendReplaceDialog] = useState(false)
  const [importMode, setImportMode] = useState<"append" | "replace" | null>(null)
  const [extractedData, setExtractedData] = useState<any[]>([])

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin")
        return
      }

      // TODO: Verify user is an admin (add admin check logic here)

      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const getCurrentStepConfig = () => {
    return currentStep ? masterDataConfig[currentStep] : null
  }

  const getTitleForCurrentStep = () => {
    const allSubmenus = [
      ...personalDetailsSubmenus,
      ...educationalDetailsSubmenus,
      ...professionalDetailsSubmenus,
      ...familyDetailsSubmenus,
      ...horoscopeDetailsSubmenus,
      ...interestsSubmenus,
      ...socialHabitsSubmenus,
    ]
    return allSubmenus.find((s) => s.id === currentStep)?.title || "Master Data"
  }

  const handleSubmenuClick = (id: string) => {
    setCurrentStep(id)
  }

  const extractDataFromExcelFile = async () => {
    if (!excelFile) {
      setImportError("Please select an Excel file")
      return false
    }

    const startRowNum = parseInt(startRow)
    if (isNaN(startRowNum) || startRowNum < 1) {
      setImportError("Please enter a valid starting row number (1 or greater)")
      return false
    }

    const showCategoryForStep = currentStep === "education-level"
    const result = await extractDataFromExcel({
      file: excelFile,
      startRow: startRowNum,
      fromColumn: fromColumn,
      toColumn: toColumn,
      hasCategory: showCategoryForStep,
    })

    if (!result.success) {
      setImportError(result.error || "Failed to extract data from Excel")
      return false
    }

    setExtractedData(result.data)
    return true
  }

  const handleImport = async () => {
    setImportError(null)

    // First, extract data from Excel
    const extractionSuccess = await extractDataFromExcelFile()
    if (!extractionSuccess) {
      return
    }

    const currentStepConfig = getCurrentStepConfig()
    const tableName = currentStepConfig?.tableName
    if (!tableName) {
      setImportError("Invalid table configuration")
      return
    }

    // Check if data already exists in the table
    const { data: existingData, error: fetchError } = await supabase
      .from(tableName)
      .select("*")

    if (fetchError) {
      setImportError("Failed to check existing data: " + fetchError.message)
      return
    }

    // If data exists, ask user to append or replace
    if (existingData && existingData.length > 0) {
      setShowAppendReplaceDialog(true)
      return
    }

    // If no existing data, proceed with import
    await performImport("append")
  }

  const performImport = async (mode: "append" | "replace") => {
    setIsImporting(true)
    setImportError(null)
    setShowAppendReplaceDialog(false)

    try {
      const currentStepConfig = getCurrentStepConfig()
      const tableName = currentStepConfig?.tableName
      if (!tableName) {
        throw new Error("Invalid table configuration")
      }

      // If replace mode, delete all existing data first
      if (mode === "replace") {
        const { error: deleteError } = await supabase.from(tableName).delete().neq("id", "00000000-0000-0000-0000-000000000000")
        if (deleteError) {
          throw deleteError
        }
      }

      // Fetch existing data to filter duplicates
      const { data: existingData, error: fetchError } = await supabase
        .from(tableName)
        .select("*")

      if (fetchError) {
        throw fetchError
      }

      // Filter out duplicates
      const showCategoryForStep = currentStep === "education-level"
      const uniqueDataToImport = filterDuplicates(extractedData, existingData || [], showCategoryForStep)

      if (uniqueDataToImport.length === 0) {
        setIsImportDialogOpen(false)
        setExcelFile(null)
        setStartRow("2")
        setFromColumn("A")
        setToColumn("B")
        toast.info("No new data to import", {
          description: "All entries in the Excel file already exist in the database.",
          style: {
            background: "#dbeafe",
            border: "1px solid #3b82f6",
            color: "#1e40af",
          },
        })
        
        // Refresh the table
        const tempStep = currentStep
        setCurrentStep("")
        setTimeout(() => setCurrentStep(tempStep), 100)
        setIsImporting(false)
        return
      }

      // Insert in batches to avoid overwhelming the database
      const batchSize = 50
      let successCount = 0

      for (let i = 0; i < uniqueDataToImport.length; i += batchSize) {
        const batch = uniqueDataToImport.slice(i, i + batchSize)
        const { error } = await supabase.from(tableName).insert(batch)

        if (error) {
          throw error
        } else {
          successCount += batch.length
        }
      }

      const skippedCount = extractedData.length - uniqueDataToImport.length

      // Close dialog and refresh
      setIsImportDialogOpen(false)
      setExcelFile(null)
      setStartRow("2")
      setFromColumn("A")
      setToColumn("B")
      
      // Show success message
      toast.success("Data imported successfully!", {
        description:
          `Successfully imported ${successCount} record(s).` +
          (skippedCount > 0 ? ` ${skippedCount} duplicate(s) were skipped.` : ""),
        style: {
          background: "#dcfce7",
          border: "1px solid #22c55e",
          color: "#166534",
        },
      })
      
      // Refresh the table by triggering a re-render
      const tempStep = currentStep
      setCurrentStep("")
      setTimeout(() => setCurrentStep(tempStep), 100)
    } catch (error: any) {
      console.error("Error importing data:", error)
      setImportError(error.message || "Failed to import data. Please check the file format and try again.")
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-[#4B0082]" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Data</h1>
          </div>
          <Button
            onClick={() => router.push("/admin/dashboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
                <div className="mb-6 flex-shrink-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Master Data</h3>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  <MenuSection
                    title="Personal Details"
                    submenus={personalDetailsSubmenus}
                    isOpen={isPersonalDetailsOpen}
                    onToggle={() => setIsPersonalDetailsOpen(!isPersonalDetailsOpen)}
                    currentStep={currentStep}
                    onSubmenuClick={handleSubmenuClick}
                  />

                  <MenuSection
                    title="Educational Details"
                    submenus={educationalDetailsSubmenus}
                    isOpen={isEducationalDetailsOpen}
                    onToggle={() => setIsEducationalDetailsOpen(!isEducationalDetailsOpen)}
                    currentStep={currentStep}
                    onSubmenuClick={handleSubmenuClick}
                  />

                  <MenuSection
                    title="Professional Details"
                    submenus={professionalDetailsSubmenus}
                    isOpen={isProfessionalDetailsOpen}
                    onToggle={() => setIsProfessionalDetailsOpen(!isProfessionalDetailsOpen)}
                    currentStep={currentStep}
                    onSubmenuClick={handleSubmenuClick}
                  />

                  <MenuSection
                    title="Horoscope Details"
                    submenus={horoscopeDetailsSubmenus}
                    isOpen={isHoroscopeDetailsOpen}
                    onToggle={() => setIsHoroscopeDetailsOpen(!isHoroscopeDetailsOpen)}
                    currentStep={currentStep}
                    onSubmenuClick={handleSubmenuClick}
                  />

                  <MenuSection
                    title="Interests"
                    submenus={interestsSubmenus}
                    isOpen={isInterestsOpen}
                    onToggle={() => setIsInterestsOpen(!isInterestsOpen)}
                    currentStep={currentStep}
                    onSubmenuClick={handleSubmenuClick}
                  />

                  <MenuSection
                    title="Social Habits"
                    submenus={socialHabitsSubmenus}
                    isOpen={isSocialHabitsOpen}
                    onToggle={() => setIsSocialHabitsOpen(!isSocialHabitsOpen)}
                    currentStep={currentStep}
                    onSubmenuClick={handleSubmenuClick}
                  />

                  <MenuSection
                    title="Family Details"
                    submenus={familyDetailsSubmenus}
                    isOpen={isFamilyDetailsOpen}
                    onToggle={() => setIsFamilyDetailsOpen(!isFamilyDetailsOpen)}
                    currentStep={currentStep}
                    onSubmenuClick={handleSubmenuClick}
                  />
                </div>
              </div>
            </div>

                  {/* Right Content Area */}
                  <div className="lg:col-span-3">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col h-[calc(100vh-8rem)]">
                      {!currentStep ? (
                        <div className="flex flex-col items-center justify-center py-16 flex-1">
                          <Database className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                            Select a category to manage
                          </h2>
                          <p className="text-gray-500 dark:text-gray-500">
                            Choose a menu item from the sidebar to get started
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Step Title - Fixed */}
                          <div className="flex items-center justify-between p-8 pb-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                              {getTitleForCurrentStep()}
                            </h2>
                            {getCurrentStepConfig() && (
                              <div className="flex items-center gap-3">
                                <Button
                                  onClick={() => setIsImportDialogOpen(true)}
                                  variant="outline"
                                  className="flex items-center gap-2"
                                >
                                  <Upload className="h-4 w-4" />
                                  Import
                                </Button>
                                <Button
                                  onClick={() => setIsAddDialogOpen(true)}
                                  className="flex items-center gap-2 bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white"
                                >
                                  <Plus className="h-4 w-4" />
                                  {getCurrentStepConfig()?.addButtonText}
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Scrollable Content */}
                          <div className="flex-1 min-h-0">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                              >
                                {getCurrentStepConfig() ? (
                                  <MasterDataManager
                                    tableName={getCurrentStepConfig()!.tableName}
                                    title={getCurrentStepConfig()!.title}
                                    addButtonText={getCurrentStepConfig()!.addButtonText}
                                    dialogTitle={getCurrentStepConfig()!.dialogTitle}
                                    dialogDescription={getCurrentStepConfig()!.dialogDescription}
                                    inputPlaceholder={getCurrentStepConfig()!.inputPlaceholder}
                                    isAddDialogOpen={isAddDialogOpen}
                                    onAddDialogChange={setIsAddDialogOpen}
                                    showColourCode={currentStep === "skin-colour"}
                                    showCategory={currentStep === "education-level"}
                                  />
                                ) : null}
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          setIsImportDialogOpen(open)
          if (!open) {
            setExcelFile(null)
            setImportError(null)
            setExtractedData([])
            setStartRow("2")
            setFromColumn("A")
            setToColumn("B")
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file and specify the row and column range to import data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="excel-file">Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setExcelFile(file)
                    setImportError(null)
                  }
                }}
              />
              {excelFile && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selected: {excelFile.name}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start-row">Start Row</Label>
              <Input
                id="start-row"
                type="number"
                min="1"
                value={startRow}
                onChange={(e) => setStartRow(e.target.value)}
                placeholder="e.g., 2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Row number where data starts (1-based, e.g., 2 means skip header row)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from-column">From Column</Label>
                <Input
                  id="from-column"
                  type="text"
                  value={fromColumn}
                  onChange={(e) => setFromColumn(e.target.value.toUpperCase())}
                  placeholder="e.g., A"
                  maxLength={3}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Starting column (A, B, C, etc.)
                  {getCurrentStepConfig() && currentStep === "education-level" && " - This will be used as Category"}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="to-column">To Column</Label>
                <Input
                  id="to-column"
                  type="text"
                  value={toColumn}
                  onChange={(e) => setToColumn(e.target.value.toUpperCase())}
                  placeholder="e.g., B"
                  maxLength={3}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ending column (A, B, C, etc.)
                  {getCurrentStepConfig() && currentStep === "education-level" && " - This will be used as Value"}
                </p>
              </div>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false)
                setExcelFile(null)
                setImportError(null)
              }}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !excelFile}
              className="bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white"
            >
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Append/Replace Confirmation Dialog */}
      <Dialog open={showAppendReplaceDialog} onOpenChange={setShowAppendReplaceDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Data Already Exists</DialogTitle>
            <DialogDescription>
              There is already data in this table. How would you like to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>Append:</strong> Add new data to existing records (duplicates will be skipped)
              <br />
              <strong>Replace:</strong> Delete all existing data and import fresh data
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAppendReplaceDialog(false)
                setImportError(null)
              }}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => performImport("append")}
              disabled={isImporting}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Append
            </Button>
            <Button
              onClick={() => performImport("replace")}
              disabled={isImporting}
              className="bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white"
            >
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
