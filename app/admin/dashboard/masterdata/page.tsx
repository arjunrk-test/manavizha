"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Database, Circle, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

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

  const handleSubmenuClick = (id: string) => {
    setCurrentStep(id)
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
                  {/* Personal Details Menu */}
                  <div>
                    <button
                      onClick={() => setIsPersonalDetailsOpen(!isPersonalDetailsOpen)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isPersonalDetailsOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">Personal Details</div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Submenus */}
                    {isPersonalDetailsOpen && (
                      <div>
                        <div className="pl-4 pt-2 space-y-1">
                          {personalDetailsSubmenus.map((submenu) => {
                            const isActive = currentStep === submenu.id

                            return (
                              <button
                                key={submenu.id}
                                onClick={() => handleSubmenuClick(submenu.id)}
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

                  {/* Educational Details Menu */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsEducationalDetailsOpen(!isEducationalDetailsOpen)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isEducationalDetailsOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">Educational Details</div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Submenus */}
                    {isEducationalDetailsOpen && (
                      <div>
                        <div className="pl-4 pt-2 space-y-1">
                          {educationalDetailsSubmenus.map((submenu) => {
                            const isActive = currentStep === submenu.id

                            return (
                              <button
                                key={submenu.id}
                                onClick={() => handleSubmenuClick(submenu.id)}
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

                  {/* Professional Details Menu */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsProfessionalDetailsOpen(!isProfessionalDetailsOpen)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isProfessionalDetailsOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">Professional Details</div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Submenus */}
                    {isProfessionalDetailsOpen && (
                      <div>
                        <div className="pl-4 pt-2 space-y-1">
                          {professionalDetailsSubmenus.map((submenu) => {
                            const isActive = currentStep === submenu.id

                            return (
                              <button
                                key={submenu.id}
                                onClick={() => handleSubmenuClick(submenu.id)}
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

                  {/* Horoscope Details Menu */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsHoroscopeDetailsOpen(!isHoroscopeDetailsOpen)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isHoroscopeDetailsOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">Horoscope Details</div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Submenus */}
                    {isHoroscopeDetailsOpen && (
                      <div>
                        <div className="pl-4 pt-2 space-y-1">
                          {horoscopeDetailsSubmenus.map((submenu) => {
                            const isActive = currentStep === submenu.id

                            return (
                              <button
                                key={submenu.id}
                                onClick={() => handleSubmenuClick(submenu.id)}
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

                  {/* Interests Menu */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsInterestsOpen(!isInterestsOpen)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isInterestsOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">Interests</div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Submenus */}
                    {isInterestsOpen && (
                      <div>
                        <div className="pl-4 pt-2 space-y-1">
                          {interestsSubmenus.map((submenu) => {
                            const isActive = currentStep === submenu.id

                            return (
                              <button
                                key={submenu.id}
                                onClick={() => handleSubmenuClick(submenu.id)}
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

                  {/* Social Habits Menu */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsSocialHabitsOpen(!isSocialHabitsOpen)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isSocialHabitsOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">Social Habits</div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Submenus */}
                    {isSocialHabitsOpen && (
                      <div>
                        <div className="pl-4 pt-2 space-y-1">
                          {socialHabitsSubmenus.map((submenu) => {
                            const isActive = currentStep === submenu.id

                            return (
                              <button
                                key={submenu.id}
                                onClick={() => handleSubmenuClick(submenu.id)}
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

                  {/* Family Details Menu */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsFamilyDetailsOpen(!isFamilyDetailsOpen)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isFamilyDetailsOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">Family Details</div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Submenus */}
                    {isFamilyDetailsOpen && (
                      <div>
                        <div className="pl-4 pt-2 space-y-1">
                          {familyDetailsSubmenus.map((submenu) => {
                            const isActive = currentStep === submenu.id

                            return (
                              <button
                                key={submenu.id}
                                onClick={() => handleSubmenuClick(submenu.id)}
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
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {!currentStep ? (
                  <div className="flex flex-col items-center justify-center py-16">
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
                    {/* Step Title */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {personalDetailsSubmenus.find((s) => s.id === currentStep)?.title ||
                          educationalDetailsSubmenus.find((s) => s.id === currentStep)?.title ||
                          professionalDetailsSubmenus.find((s) => s.id === currentStep)?.title ||
                          familyDetailsSubmenus.find((s) => s.id === currentStep)?.title ||
                          horoscopeDetailsSubmenus.find((s) => s.id === currentStep)?.title ||
                          interestsSubmenus.find((s) => s.id === currentStep)?.title ||
                          socialHabitsSubmenus.find((s) => s.id === currentStep)?.title ||
                          "Master Data"}
                      </h2>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                    {currentStep === "gender" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Gender management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "skin-colour" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Skin Colour management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "body-type" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Body Type management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "marital-status" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Marital Status management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "food-preferences" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Food Preferences management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "indian-languages" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Indian Languages management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "international-languages" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          International Languages management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "education-level" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Education Level management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "degree-qualification" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Degree/ Qualification management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "status" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Status management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "caste" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Caste management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "subcaste" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Subcaste management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "kulam" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Kulam management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "gotram" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Gotram management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "family-type" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Family Type management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "family-status" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Family Status management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "zodiac-moon-sign" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Zodiac or Moon Sign management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "star" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Star management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "lagnam" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Lagnam management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "hobbies" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Hobbies management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "interests" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Interests management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "smoking" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Smoking management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "drinking" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Drinking management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "parties" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Parties management content will go here...
                        </p>
                      </div>
                    )}
                    {currentStep === "pubs" && (
                      <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                          Pubs management content will go here...
                        </p>
                      </div>
                    )}
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
