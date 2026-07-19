"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { supabase } from "@/lib/supabase"
import { finishAuthRedirect, getUserDashboard, isSuperAdmin } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Database,
  GraduationCap,
  Heart,
  MessageCircle,
  Plus,
  Star,
  Upload,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { MasterDataManager } from "@/components/master-data-manager"
import { MasterDataImportDialog } from "@/components/master-data-import-dialog"
import { masterDataConfig } from "@/constants/master-data"
import { useMasterData } from "@/hooks/use-master-data"

type MasterDataItem = { id: string; title: string }

type MasterDataCategory = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  hoverBorder: string
  items: MasterDataItem[]
}

const MASTER_DATA_CATEGORIES: MasterDataCategory[] = [
  {
    id: "personal",
    title: "Personal Details",
    description: "Gender, appearance, languages, and lifestyle basics",
    icon: User,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    hoverBorder: "hover:border-[#e87898]/30",
    items: [
      { id: "gender", title: "Gender" },
      { id: "skin-colour", title: "Skin Colour" },
      { id: "body-type", title: "Body Type" },
      { id: "marital-status", title: "Marital Status" },
      { id: "food-preferences", title: "Food Preferences" },
      { id: "indian-languages", title: "Indian Languages" },
      { id: "international-languages", title: "International Languages" },
    ],
  },
  {
    id: "education",
    title: "Educational Details",
    description: "Education levels and academic status options",
    icon: GraduationCap,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    hoverBorder: "hover:border-[#c9a227]/35",
    items: [
      { id: "education-level", title: "Education Level" },
      { id: "status", title: "Status" },
    ],
  },
  {
    id: "professional",
    title: "Professional Details",
    description: "Employment, sector, and career-related lookups",
    icon: Briefcase,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    hoverBorder: "hover:border-[#1F4068]/25",
    items: [
      { id: "employment-type", title: "Employment Type" },
      { id: "sector", title: "Sector" },
      { id: "type-of-business", title: "Type of Business" },
      { id: "year-of-study", title: "Year of Study" },
    ],
  },
  {
    id: "horoscope",
    title: "Horoscope Details",
    description: "Stars, signs, and horoscope-related fields",
    icon: Star,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    hoverBorder: "hover:border-[#c9a227]/35",
    items: [
      { id: "zodiac-moon-sign", title: "Zodiac or Moon Sign" },
      { id: "star", title: "Star" },
      { id: "lagnam", title: "Lagnam" },
    ],
  },
  {
    id: "interests",
    title: "Interests",
    description: "Hobbies and personal interest options",
    icon: Heart,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    hoverBorder: "hover:border-[#e87898]/30",
    items: [
      { id: "hobbies", title: "Hobbies" },
      { id: "interests", title: "Interests" },
    ],
  },
  {
    id: "social",
    title: "Social Habits",
    description: "Smoking, drinking, and social preference values",
    icon: MessageCircle,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    hoverBorder: "hover:border-[#3bb9ac]/30",
    items: [
      { id: "smoking", title: "Smoking" },
      { id: "drinking", title: "Drinking" },
      { id: "parties", title: "Parties" },
      { id: "pubs", title: "Pubs" },
    ],
  },
  {
    id: "family",
    title: "Family Details",
    description: "Caste, community, and family background fields",
    icon: Users,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    hoverBorder: "hover:border-[#e87898]/30",
    items: [
      { id: "caste", title: "Caste" },
      { id: "subcaste", title: "Subcaste" },
      { id: "kulam", title: "Kulam" },
      { id: "gotram", title: "Gotram" },
      { id: "family-type", title: "Family Type" },
      { id: "family-status", title: "Family Status" },
    ],
  },
]

function ThemedPanel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)] ${className}`}
    >
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function CategoryCard({
  category,
  onSelect,
}: {
  category: MasterDataCategory
  onSelect: () => void
}) {
  const Icon = category.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-xl border border-[#f0ebe3] bg-white/85 px-4 py-4 text-left transition-all hover:shadow-[0_4px_16px_rgba(31,64,104,0.08)] ${category.hoverBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${category.iconBg}`}>
          <Icon className={`h-5 w-5 ${category.iconColor}`} strokeWidth={1.75} />
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#c9a227]" />
      </div>
      <h3 className="mt-3 text-[13px] font-semibold text-[#1F4068]">{category.title}</h3>
      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500">{category.description}</p>
      <p className="mt-2 text-[10px] font-medium text-[#c9a227]">
        {category.items.length} lookup{category.items.length !== 1 ? "s" : ""}
      </p>
    </button>
  )
}

export default function AdminMasterDataPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const activeCategory = useMemo(
    () => MASTER_DATA_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? null,
    [selectedCategoryId]
  )

  const activeItem = useMemo(() => {
    if (!activeCategory || !currentStep) return null
    return activeCategory.items.find((item) => item.id === currentStep) ?? null
  }, [activeCategory, currentStep])

  const stepConfig = currentStep ? masterDataConfig[currentStep] ?? null : null

  // Parent-caste options for the subcaste editor
  const { data: casteData, refetch: refetchCastes } = useMasterData({ tableName: "master_caste" })
  const casteValues = useMemo(() => casteData.map((c) => c.value), [casteData])
  useEffect(() => { refetchCastes() }, [refreshKey, refetchCastes])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        finishAuthRedirect(router, "/admin", setIsLoading)
        return
      }

      const dashboardPath = await getUserDashboard(user.id)
      if (dashboardPath !== "/admin/dashboard") {
        finishAuthRedirect(router, dashboardPath, setIsLoading)
        return
      }

      if (!(await isSuperAdmin(user.id))) {
        finishAuthRedirect(router, "/admin/dashboard", setIsLoading)
        return
      }

      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const handleCategorySelect = (categoryId: string) => {
    const category = MASTER_DATA_CATEGORIES.find((entry) => entry.id === categoryId)
    if (!category) return
    setSelectedCategoryId(categoryId)
    setCurrentStep(category.items[0].id)
    setIsAddDialogOpen(false)
    setIsImportDialogOpen(false)
  }

  const handleBackToCategories = () => {
    setSelectedCategoryId(null)
    setCurrentStep(null)
    setIsAddDialogOpen(false)
    setIsImportDialogOpen(false)
  }

  const handleItemSelect = (itemId: string) => {
    setCurrentStep(itemId)
    setIsAddDialogOpen(false)
    setIsImportDialogOpen(false)
  }

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <AdminNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-10">
          <ThemedPanel className={`flex flex-col ${selectedCategoryId ? "min-h-[calc(100vh-7rem)]" : ""}`}>
            {/* Page header */}
            <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf6e3]">
                  <Database className="h-5 w-5 text-[#c9a227]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
                    Operations
                  </p>
                  <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                    Master data
                  </h1>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {selectedCategoryId
                      ? "Choose a lookup type, then manage its values"
                      : "Pick a profile section to manage its lookup values"}
                  </p>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!selectedCategoryId ? (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-4 sm:px-5 sm:py-5"
                >
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Choose a section
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {MASTER_DATA_CATEGORIES.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onSelect={() => handleCategorySelect(category.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                activeCategory && (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    {/* Step 2 header */}
                    <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activeCategory.iconBg}`}
                          >
                            {(() => {
                              const Icon = activeCategory.icon
                              return <Icon className={`h-4 w-4 ${activeCategory.iconColor}`} strokeWidth={1.75} />
                            })()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-500">
                              Master data
                              <span className="mx-1.5 text-gray-300">/</span>
                              <span className="font-medium text-[#c9a227]">{activeCategory.title}</span>
                            </p>
                            <h2 className="font-display text-base font-semibold text-[#1F4068] sm:text-lg">
                              {activeCategory.title}
                            </h2>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleBackToCategories}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2 text-[11px] font-medium text-gray-600 transition-colors hover:border-[#c9a227]/35 hover:bg-[#faf8f4] hover:text-[#1F4068]"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          All categories
                        </button>
                      </div>
                    </div>

                    {/* Lookup chips */}
                    <div className="border-b border-[#c5d4e4] bg-[#e8eef5] px-4 py-3 text-center sm:px-5">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F4068]/60">
                        Lookup type
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {activeCategory.items.map((item) => {
                          const isActive = currentStep === item.id

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleItemSelect(item.id)}
                              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                                isActive
                                  ? "bg-[#1F4068] text-white shadow-sm"
                                  : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
                              }`}
                            >
                              {item.title}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Table header */}
                    {activeItem && (
                      <div className="flex shrink-0 flex-col gap-3 border-b border-[#f0ebe3]/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                            {activeItem.title}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            Manage values for {activeItem.title.toLowerCase()}
                          </p>
                        </div>
                        {stepConfig && (
                          <div className="flex flex-wrap items-center gap-2">
                            {stepConfig.importEnabled && (
                              <Button
                                onClick={() => setIsImportDialogOpen(true)}
                                size="sm"
                                variant="outline"
                                className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4] shadow-sm"
                              >
                                <Upload className="mr-1.5 h-4 w-4" />
                                Import
                              </Button>
                            )}
                            <Button
                              onClick={() => setIsAddDialogOpen(true)}
                              size="sm"
                              className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f] shadow-sm"
                            >
                              <Plus className="mr-1.5 h-4 w-4" />
                              {stepConfig.addButtonText}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Table */}
                    <div className="min-h-0 flex-1">
                      <AnimatePresence mode="wait">
                        {currentStep && (
                          <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full min-h-[320px] lg:min-h-[400px]"
                          >
                            {stepConfig ? (
                              <MasterDataManager
                                tableName={stepConfig.tableName}
                                title={stepConfig.title}
                                addButtonText={stepConfig.addButtonText}
                                dialogTitle={stepConfig.dialogTitle}
                                dialogDescription={stepConfig.dialogDescription}
                                inputPlaceholder={stepConfig.inputPlaceholder}
                                isAddDialogOpen={isAddDialogOpen}
                                onAddDialogChange={setIsAddDialogOpen}
                                showColourCode={currentStep === "skin-colour"}
                                showCategory={
                                  currentStep === "education-level" || currentStep === "subcaste"
                                }
                                categoryLabel={currentStep === "subcaste" ? "Parent Caste" : "Category"}
                                categoryOptions={currentStep === "subcaste" ? casteValues : undefined}
                                refreshKey={refreshKey}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center px-6 py-12 text-center">
                                <p className="text-sm text-gray-500">
                                  No configuration found for this lookup type.
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </ThemedPanel>
        </div>
      </main>

      {stepConfig?.importEnabled && (
        <MasterDataImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          tableName={stepConfig.tableName}
          title={stepConfig.title}
          importProfile={stepConfig.importProfile}
          onImported={() => setRefreshKey((key) => key + 1)}
        />
      )}
    </div>
  )
}
