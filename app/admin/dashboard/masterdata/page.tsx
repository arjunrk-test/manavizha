"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AdminDashboardBackground } from "@/components/admin/admin-dashboard-background"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { supabase } from "@/lib/supabase"
import { getUserDashboard } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Database, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { MasterDataManager } from "@/components/master-data-manager"
import { masterDataConfig } from "@/constants/master-data"
import Link from "next/link"

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
  { id: "status", title: "Status" },
]

const professionalDetailsSubmenus = [
  { id: "employment-type", title: "Employment Type" },
  { id: "sector", title: "Sector" },
  { id: "type-of-business", title: "Type of Business" },
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
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2.5 text-left transition-colors hover:border-[#c9a227]/35 hover:bg-[#fdf6e3]/50"
      >
        <span className="text-[12px] font-semibold text-[#1F4068]">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#c9a227]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 border-l-2 border-[#f0ebe3] pl-2.5 pt-1.5 ml-2">
              {submenus.map((submenu) => {
                const isActive = currentStep === submenu.id

                return (
                  <button
                    key={submenu.id}
                    type="button"
                    onClick={() => onSubmenuClick(submenu.id)}
                    className={`w-full rounded-md px-2.5 py-2 text-left text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-[#1F4068] text-white shadow-sm"
                        : "text-gray-600 hover:bg-[#faf8f4] hover:text-[#1F4068]"
                    }`}
                  >
                    {submenu.title}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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

export default function AdminMasterDataPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false)
  const [isEducationalDetailsOpen, setIsEducationalDetailsOpen] = useState(false)
  const [isProfessionalDetailsOpen, setIsProfessionalDetailsOpen] = useState(false)
  const [isFamilyDetailsOpen, setIsFamilyDetailsOpen] = useState(false)
  const [isHoroscopeDetailsOpen, setIsHoroscopeDetailsOpen] = useState(false)
  const [isInterestsOpen, setIsInterestsOpen] = useState(false)
  const [isSocialHabitsOpen, setIsSocialHabitsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin")
        return
      }

      const dashboardPath = await getUserDashboard(user.id)
      if (dashboardPath !== "/admin/dashboard") {
        router.push(dashboardPath)
        return
      }

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

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AdminDashboardBackground />
      <AdminNavbar variant="dashboard" />

      <main className="relative z-10 flex-1 flex flex-col pt-[4.75rem]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-10">
          <ThemedPanel className="mb-4 sm:mb-5">
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf6e3]">
                  <Database className="h-5 w-5 text-[#c9a227]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
                    Operations
                  </p>
                  <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                    Master data
                  </h1>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Manage platform lookups and profile configurations
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 rounded-lg border-[#f0ebe3] bg-white/80 text-[#1F4068] hover:bg-[#faf8f4] hover:text-[#1F4068]"
              >
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </ThemedPanel>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
            <ThemedPanel className="lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100vh-7rem)] lg:self-start">
              <div className="flex max-h-[calc(100vh-7rem)] flex-col px-3 py-3 sm:px-4 sm:py-4">
                <p className="mb-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Categories
                </p>
                <div className="space-y-2 overflow-y-auto pr-1">
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
            </ThemedPanel>

            <ThemedPanel className="flex min-h-[420px] flex-col lg:min-h-[calc(100vh-7rem)]">
              {!currentStep ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf6e3]">
                    <Database className="h-7 w-7 text-[#c9a227]" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-[#1F4068]">
                    Select a category to manage
                  </h2>
                  <p className="mt-1 max-w-sm text-[12px] text-gray-500">
                    Choose a menu item from the sidebar to view and edit lookup values
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex shrink-0 flex-col gap-3 border-b border-[#f0ebe3]/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#c9a227]">
                        Editing
                      </p>
                      <h2 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                        {getTitleForCurrentStep()}
                      </h2>
                    </div>
                    {getCurrentStepConfig() && (
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        size="sm"
                        className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f] shadow-sm"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        {getCurrentStepConfig()?.addButtonText}
                      </Button>
                    )}
                  </div>

                  <div className="min-h-0 flex-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="h-full min-h-[320px] lg:min-h-0"
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
                            showCategory={currentStep === "education-level" || currentStep === "subcaste"}
                            refreshKey={refreshKey}
                          />
                        ) : null}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </>
              )}
            </ThemedPanel>
          </div>
        </div>
      </main>
    </div>
  )
}
