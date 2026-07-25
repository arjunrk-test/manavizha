"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Save, ChevronDown, ChevronUp, Search, Check, SlidersHorizontal, Moon, Briefcase } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { INDIAN_LANGUAGES, EMPLOYMENT_TYPES, OCCUPATIONS as OCCUPATIONS_FROM_LIB, EDUCATION_LEVELS } from "@/lib/profile-data"
import { useMasterData } from "@/hooks/use-master-data"
import { Switch } from "@/components/ui/switch"
import {
  SETUP_SECTION_BODY,
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"

interface PartnerPreferencesFormProps {
  userId: string
  onBack: () => void
}

// ─── Data ────────────────────────────────────────────────────────────────────
const COUNTRIES = ["Any", "India", "USA", "UK", "Canada", "Australia", "Singapore", "UAE", "Kuwait", "Qatar", "Malaysia", "Germany", "France", "Italy", "Sri Lanka", "New Zealand", "Others"]
const STATES = ["Any", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "International / Abroad"]
const CITIES = ["Any", "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Tiruppur", "Thoothukkudi", "Kancheepuram", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Kolkata", "Pune", "Ahmedabad", "Surat", "Kochi", "Vishakhapatnam", "Jaipur", "Lucknow", "Singapore", "Dubai", "London", "Others"]
const RELIGIONS = ["Any", "Hindu", "Christian", "Muslim", "Jain", "Sikh", "Buddhist", "Others"]
const MOTHER_TONGUES = ["Any", ...INDIAN_LANGUAGES, "English", "Others"]
const STARS = ["Any", "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]
const RAASI = ["Any", "Mesham (Aries)", "Rishabam (Taurus)", "Mithunam (Gemini)", "Katakam (Cancer)", "Simmam (Leo)", "Kanni (Virgo)", "Tulam (Libra)", "Viruchigam (Scorpio)", "Dhanusu (Sagittarius)", "Makaram (Capricorn)", "Kumbam (Aquarius)", "Meenam (Pisces)"]
const INCOME_OPTIONS = ["Any", "Less than Rs.50 thousand", "Rs.50 thousand", "Rs.1 Lakh", "Rs.2 Lakhs", "Rs.3 Lakhs", "Rs.4 Lakhs", "Rs.5 Lakhs", "Rs.6 Lakhs", "Rs.7 Lakhs", "Rs.8 Lakhs", "Rs.9 Lakhs", "Rs.10 Lakhs", "Rs.11 Lakhs", "Rs.12 Lakhs", "Rs.13 Lakhs", "Rs.14 Lakhs", "Rs.15 Lakhs", "Rs.20 Lakhs", "Rs.25 Lakhs", "Rs.30 Lakhs", "Rs.35 Lakhs", "Rs.40 Lakhs", "Rs.45 Lakhs", "Rs.50 Lakhs", "Rs.60 Lakhs", "Rs.70 Lakhs", "Rs.80 Lakhs", "Rs.90 Lakhs", "Rs.1 Crore", "Rs.1 Crore & Above"]
const EMPLOYED_IN = ["Any", ...EMPLOYMENT_TYPES]
const OCCUPATIONS = ["Any", ...OCCUPATIONS_FROM_LIB]
const EDUCATION = ["Any", ...EDUCATION_LEVELS]

// ─── Multi-select checkbox dropdown ──────────────────────────────────────────
function MultiSelectDropdown({ label, options, selected, onChange, searchable = false, placeholder = "Any" }: {
  label: string; options: string[]; selected: string[]
  onChange: (v: string[]) => void; searchable?: boolean; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [])
  const filtered = searchable ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase())) : options
  const toggle = (val: string) => {
    if (val === "Any") { onChange(["Any"]); return }
    let next = selected.includes(val) ? selected.filter((s) => s !== val) : [...selected.filter((s) => s !== "Any"), val]
    if (next.length === 0) next = ["Any"]
    onChange(next)
  }
  const isChecked = (val: string) => val === "Any" ? selected.length === 0 || selected.includes("Any") : selected.includes(val)
  const displayLabel = selected.length === 0 || selected.includes("Any") ? placeholder : selected.join(", ")
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="sds-input w-full h-11 px-4 flex items-center justify-between rounded-xl border border-[#f0ebe3] bg-white hover:bg-[#faf8f4] transition-all text-left">
        <span className="text-sm text-[#1F4068] truncate max-w-[240px]">{displayLabel}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#9ca3af] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#9ca3af] shrink-0" />}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#f0ebe3] bg-white shadow-[0_8px_30px_rgba(31,64,104,0.12)] overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-[#f0ebe3]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ca3af]" />
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${label}`}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-[#faf8f4] border border-[#f0ebe3] focus:outline-none focus:border-[#e87898] placeholder:text-[#9ca3af]" />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.map((opt) => {
              const checked = isChecked(opt)
              return (
                <button key={opt} type="button" onClick={() => toggle(opt)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#fce8ef] transition-colors text-left group">
                  <div className={`h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${checked ? "bg-[#e87898] border-[#e87898]" : "bg-white border-[#f0ebe3] group-hover:border-[#e87898]/40"}`}>
                    {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-[#4b5563]">{opt}</span>
                </button>
              )
            })}
          </div>
          <div className="px-3 py-2 border-t border-[#f0ebe3] bg-[#faf8f4]">
            <span className="text-xs text-[#9ca3af]">
              {selected.length === 0 || selected.includes("Any") ? "Showing all" : `${selected.filter(s => s !== "Any").length} selected`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      {label && <Label className="text-sm font-medium text-[#1F4068]">{label}</Label>}
      {children}
    </div>
  )
}

const inputClass = "w-full h-11 px-4 rounded-xl border border-[#f0ebe3] bg-white text-sm text-[#1F4068] focus:outline-none focus:border-[#e87898] focus:ring-2 focus:ring-[#e87898]/20"

function PrefSelect({ label, value, options, onChange, wide, disabled }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; wide?: boolean; disabled?: boolean
}) {
  return (
    <Field label={label} wide={wide}>
      <div className={`transition-opacity duration-300 ${disabled ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}>
        <Select value={value || "Any"} onValueChange={(v) => onChange(v === "Any" ? "" : v)} disabled={disabled}>
          <SelectTrigger className={`${inputClass} transition-all`}>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-[#f0ebe3] bg-white shadow-lg p-1 z-[100] max-h-72">
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="rounded-lg p-2.5 focus:bg-[#fce8ef] focus:text-[#e87898] text-sm">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Field>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PartnerPreferencesForm({ userId, onBack }: PartnerPreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fd, setFd] = useState({
    preferredAgeMin: "", preferredAgeMax: "",
    preferredHeightMin: "", preferredHeightMax: "",
    preferredMaritalStatus: "",
    preferredLanguages: [] as string[],
    preferredPhysicalStatus: "", preferredEatingHabits: "",
    preferredSmokingHabits: "", preferredDrinkingHabits: "",
    preferredReligion: "", preferredCaste: "",
    preferredSubcaste: "", casteCompulsory: false, preferredStar: "", preferredRaasi: "", preferredDosham: "",
    preferredEducation: [] as string[],
    preferredDegrees: [] as string[],
    preferredBranches: [] as string[],
    preferredEmployedIn: [] as string[],
    preferredOccupation: [] as string[],
    preferredAnnualIncomeMin: "",
    preferredCountry: "", preferredState: "", preferredCity: "",
  })

  // Fetch education level data from master_education_level table
  const { data: educationLevelData } = useMasterData({ tableName: "master_education_level" })

  // Fetch master data for Caste, Subcaste, Marital Status, Food, and Religion
  const { data: dbCastes } = useMasterData({ tableName: "master_caste" })
  const { data: dbSubcastes } = useMasterData({ tableName: "master_subcaste" })
  const { data: dbMaritalStatus } = useMasterData({ tableName: "master_marital_status" })
  const { data: dbFoodPreferences } = useMasterData({ tableName: "master_food_preferences" })
  const { data: dbReligions } = useMasterData({ tableName: "master_religion" })

  const casteOptions = useMemo(() => ["Any", ...dbCastes.map(c => c.value)], [dbCastes])
  const maritalOptions = useMemo(() => ["Any", ...dbMaritalStatus.map(m => m.value)], [dbMaritalStatus])
  const foodOptions = useMemo(() => ["Any", ...dbFoodPreferences.map(f => f.value)], [dbFoodPreferences])
  const religionOptions = useMemo(() => ["Any", ...dbReligions.map(r => r.value)], [dbReligions])
  
  const filteredSubcastes = useMemo(() => {
    if (!fd.preferredCaste || fd.preferredCaste === "Any") {
      return ["Any"]
    }
    const filtered = dbSubcastes
      .filter(s => !s.category || s.category === fd.preferredCaste)
      .map(s => s.value)
    return ["Any", ...filtered]
  }, [dbSubcastes, fd.preferredCaste])

  // Process education levels and degrees
  const educationLevelOptions = useMemo(() => {
    return Array.from(
      new Set(
        educationLevelData
          .map(item => item.category?.trim())
          .filter((category): category is string => Boolean(category && category.length > 0))
      )
    ).sort()
  }, [educationLevelData])

  const degreeOptions = useMemo(() => {
    let filteredData = educationLevelData
    
    // If specific levels are selected (and it's not just "Any"), filter degrees by those levels
    if (fd.preferredEducation.length > 0 && !fd.preferredEducation.includes("Any")) {
      filteredData = educationLevelData.filter(item => 
        fd.preferredEducation.includes(item.category?.trim() || "")
      )
    }

    return Array.from(
      new Set(
        filteredData
          .map(item => item.value?.trim())
          .filter((val): val is string => Boolean(val && val.length > 0))
      )
    ).sort()
  }, [educationLevelData, fd.preferredEducation])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        
        // 1. Fetch existing preferences
        const { data: prefData } = await supabase.from("partner_preferences").select("*").eq("user_id", userId).maybeSingle()
        
        // 2. Fetch user's own profile for defaults
        const [
          { data: profile },
          { data: horoscope },
          { data: education }
        ] = await Promise.all([
          supabase.from("personal_details").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("horoscope_details").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("education_details").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()
        ])

        if (prefData) {
          // Use existing data if available
          setFd({
            preferredAgeMin: prefData.preferred_age_min?.toString() || "",
            preferredAgeMax: prefData.preferred_age_max?.toString() || "",
            preferredHeightMin: prefData.preferred_height_min?.toString() || "",
            preferredHeightMax: prefData.preferred_height_max?.toString() || "",
            preferredMaritalStatus: Array.isArray(prefData.preferred_marital_status) ? prefData.preferred_marital_status[0] || "" : prefData.preferred_marital_status || "",
            preferredLanguages: Array.isArray(prefData.preferred_languages) ? prefData.preferred_languages : [],
            preferredPhysicalStatus: prefData.preferred_physical_status || "",
            preferredEatingHabits: Array.isArray(prefData.preferred_eating_habits) ? prefData.preferred_eating_habits[0] || "" : prefData.preferred_eating_habits || "",
            preferredSmokingHabits: Array.isArray(prefData.preferred_smoking_habits) ? prefData.preferred_smoking_habits[0] || "" : prefData.preferred_smoking_habits || "",
            preferredDrinkingHabits: Array.isArray(prefData.preferred_drinking_habits) ? prefData.preferred_drinking_habits[0] || "" : prefData.preferred_drinking_habits || "",
            preferredReligion: prefData.preferred_religion || "",
            preferredCaste: prefData.preferred_caste || "",
            preferredSubcaste: prefData.preferred_subcaste || "",
            casteCompulsory: !!prefData.caste_compulsory,
            preferredStar: prefData.preferred_star || "",
            preferredRaasi: prefData.preferred_raasi || "",
            preferredDosham: prefData.preferred_dosham || "",
            preferredEducation: Array.isArray(prefData.preferred_education) ? prefData.preferred_education : [],
            preferredDegrees: Array.isArray(prefData.preferred_degrees) ? prefData.preferred_degrees : [],
            preferredBranches: Array.isArray(prefData.preferred_branches) ? prefData.preferred_branches : [],
            preferredEmployedIn: Array.isArray(prefData.preferred_employed_in) ? prefData.preferred_employed_in : [],
            preferredOccupation: Array.isArray(prefData.preferred_occupation) ? prefData.preferred_occupation : [],
            preferredAnnualIncomeMin: prefData.preferred_annual_income_min || "",
            preferredCountry: prefData.preferred_country || "",
            preferredState: prefData.preferred_state || "",
            preferredCity: prefData.preferred_city || "",
          })
        } else if (profile) {
          // Apply smart defaults from profile if no preferences exist
          const userAge = profile.age ? parseInt(profile.age) : 25
          const userHeight = profile.height ? parseInt(profile.height) : 165
          
          setFd(prev => ({
            ...prev,
            preferredAgeMin: Math.max(18, userAge - 5).toString(),
            preferredAgeMax: (userAge + 5).toString(),
            preferredHeightMin: Math.max(120, userHeight - 15).toString(),
            preferredHeightMax: (userHeight + 15).toString(),
            preferredMaritalStatus: profile.marital_status || "Never Married",
            preferredReligion: profile.religion || "",
            preferredCaste: profile.caste || "",
            preferredSubcaste: profile.subcaste || "Any",
            preferredEatingHabits: profile.food_preference || "Any",
            preferredLanguages: profile.languages || [],
            preferredStar: horoscope?.star || "Any",
            preferredRaasi: horoscope?.zodiac_sign || "Any",
            preferredDosham: horoscope?.dhosham || "Any",
            preferredEducation: education?.education ? [education.education] : [],
          }))
          
          toast.info("We've pre-filled some preferences based on your profile!")
        }
      } catch (e) { 
        console.error("Error loading preferences/profile:", e) 
      } finally { 
        setIsLoading(false) 
      }
    }
    load()
  }, [userId])

  const set = (k: string, v: any) => setFd((p) => ({ ...p, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true)
    try {
      const { error } = await supabase.from("partner_preferences").upsert({
        user_id: userId,
        preferred_age_min: fd.preferredAgeMin ? parseInt(fd.preferredAgeMin) : null,
        preferred_age_max: fd.preferredAgeMax ? parseInt(fd.preferredAgeMax) : null,
        preferred_height_min: fd.preferredHeightMin ? parseInt(fd.preferredHeightMin) : null,
        preferred_height_max: fd.preferredHeightMax ? parseInt(fd.preferredHeightMax) : null,
        preferred_marital_status: fd.preferredMaritalStatus ? [fd.preferredMaritalStatus] : ["Any"],
        preferred_languages: Array.isArray(fd.preferredLanguages) ? fd.preferredLanguages : (fd.preferredLanguages ? [fd.preferredLanguages] : []),
        preferred_physical_status: fd.preferredPhysicalStatus || null,
        preferred_eating_habits: fd.preferredEatingHabits ? [fd.preferredEatingHabits] : ["Any"],
        preferred_smoking_habits: fd.preferredSmokingHabits ? [fd.preferredSmokingHabits] : ["Any"],
        preferred_drinking_habits: fd.preferredDrinkingHabits ? [fd.preferredDrinkingHabits] : ["Any"],
        preferred_religion: fd.preferredReligion || null,
        preferred_caste: fd.preferredCaste || null,
        preferred_subcaste: fd.preferredSubcaste || null,
        preferred_star: fd.preferredStar || null,
        preferred_raasi: fd.preferredRaasi || null,
        preferred_dosham: fd.preferredDosham || null,
        preferred_education: Array.isArray(fd.preferredEducation) ? fd.preferredEducation : (fd.preferredEducation ? [fd.preferredEducation] : []),
        preferred_degrees: Array.isArray(fd.preferredDegrees) ? fd.preferredDegrees : (fd.preferredDegrees ? [fd.preferredDegrees] : []),
        preferred_branches: Array.isArray(fd.preferredBranches) ? fd.preferredBranches : (fd.preferredBranches ? [fd.preferredBranches] : []),
        preferred_employed_in: Array.isArray(fd.preferredEmployedIn) ? fd.preferredEmployedIn : (fd.preferredEmployedIn ? [fd.preferredEmployedIn] : []),
        preferred_occupation: Array.isArray(fd.preferredOccupation) ? fd.preferredOccupation : (fd.preferredOccupation ? [fd.preferredOccupation] : []),
        preferred_annual_income_min: fd.preferredAnnualIncomeMin || null,
        preferred_country: fd.preferredCountry || null,
        preferred_state: fd.preferredState || null,
        preferred_city: fd.preferredCity || null,
      }, { onConflict: "user_id" })
      if (error) throw error
      toast.success("Partner preferences saved successfully!")
      onBack()
    } catch (err: any) { console.error(err); toast.error("Failed to save. Please try again.") }
    finally { setIsSaving(false) }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f0ebe3] border-t-[#e87898]" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="mb-4 rounded-xl border-[#f0ebe3] bg-white text-[#4b5563] hover:text-[#1F4068] hover:bg-[#faf8f4] h-9 px-4 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-[#1F4068]">Partner Preferences</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Set your criteria — we use this to find your best matches.
        </p>
      </div>

      <motion.form onSubmit={handleSave} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={SlidersHorizontal}
            title="Basic & lifestyle preferences"
            description="Age, height, marital status, and lifestyle habits"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2 p-4 sm:p-5`}>
            <Field label="Age range">
              <div className="flex items-center gap-2">
                <input type="number" value={fd.preferredAgeMin} onChange={(e) => set("preferredAgeMin", e.target.value)} placeholder="Min" min="18" className={inputClass} />
                <span className="text-[#9ca3af] shrink-0 text-sm">to</span>
                <input type="number" value={fd.preferredAgeMax} onChange={(e) => set("preferredAgeMax", e.target.value)} placeholder="Max" min="18" className={inputClass} />
              </div>
            </Field>
            <Field label="Height range (cm)">
              <div className="flex items-center gap-2">
                <input type="number" value={fd.preferredHeightMin} onChange={(e) => set("preferredHeightMin", e.target.value)} placeholder="Min" className={inputClass} />
                <span className="text-[#9ca3af] shrink-0 text-sm">to</span>
                <input type="number" value={fd.preferredHeightMax} onChange={(e) => set("preferredHeightMax", e.target.value)} placeholder="Max" className={inputClass} />
              </div>
            </Field>
            <PrefSelect label="Marital Status" value={fd.preferredMaritalStatus} options={maritalOptions} onChange={(v) => set("preferredMaritalStatus", v)} />
            <PrefSelect label="Physical Status" value={fd.preferredPhysicalStatus} options={["Any", "Normal", "Physically Challenged"]} onChange={(v) => set("preferredPhysicalStatus", v)} />
            <Field label="Preferred Languages">
              <MultiSelectDropdown label="Languages" options={MOTHER_TONGUES} selected={fd.preferredLanguages} onChange={(v) => set("preferredLanguages", v)} searchable placeholder="Any Language" />
            </Field>
            <PrefSelect label="Eating Habits" value={fd.preferredEatingHabits} options={foodOptions} onChange={(v) => set("preferredEatingHabits", v)} />
            <PrefSelect label="Smoking Habit" value={fd.preferredSmokingHabits} options={["Any", "Never", "Occasionally"]} onChange={(v) => set("preferredSmokingHabits", v)} />
            <PrefSelect label="Drinking habit" value={fd.preferredDrinkingHabits} options={["Any", "Never", "Occasionally"]} onChange={(v) => set("preferredDrinkingHabits", v)} />
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Moon}
            title="Religious & horoscope preferences"
            description="Religion, caste, and astrological details"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2 p-4 sm:p-5`}>
            <PrefSelect label="Religion" value={fd.preferredReligion} options={religionOptions} onChange={(v) => set("preferredReligion", v)} />
            <PrefSelect label="Caste" value={fd.preferredCaste} options={casteOptions} onChange={(v) => {
              set("preferredCaste", v)
              set("preferredSubcaste", "Any")
              if (v === "Any") set("casteCompulsory", false)
            }} />
            <PrefSelect label="Subcaste" value={fd.preferredSubcaste} options={filteredSubcastes} 
              disabled={!fd.preferredCaste || fd.preferredCaste === "Any"}
              onChange={(v) => set("preferredSubcaste", v)} />

            <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-xl border border-[#f0ebe3] bg-white/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1F4068]">Caste is compulsory for matches</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  When enabled, only profiles matching your caste and subcaste preferences are shown.
                </p>
              </div>
              <Switch
                checked={fd.casteCompulsory}
                onCheckedChange={(checked) => set("casteCompulsory", checked)}
                disabled={!fd.preferredCaste || fd.preferredCaste === "Any"}
              />
            </div>

            <PrefSelect label="Star (Nakshatra)" value={fd.preferredStar} options={STARS} onChange={(v) => set("preferredStar", v)} />
            <PrefSelect label="Raasi / Zodiac Sign" value={fd.preferredRaasi} options={RAASI} onChange={(v) => set("preferredRaasi", v)} />
            <PrefSelect label="Dosham" value={fd.preferredDosham} options={["Any", "No", "Yes", "Doesn't Matter"]} onChange={(v) => set("preferredDosham", v)} />
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Briefcase}
            title="Professional & location"
            description="Education, career, income, and location preferences"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2 p-4 sm:p-5`}>
            <Field label="Preferred Education Level">
              <MultiSelectDropdown label="Education Level" options={educationLevelOptions} selected={fd.preferredEducation} onChange={(v) => {
                set("preferredEducation", v)
                // If any degree was selected that's no longer in the filtered list, we could either keep it or clear it.
                // Keeping it for now as users might want "Bachelor's" OR "A specific Master's degree".
              }} searchable placeholder="Any Level" />
            </Field>
            <Field label="Preferred Degree / Qualification">
              <MultiSelectDropdown label="Degree" options={degreeOptions} selected={fd.preferredDegrees} onChange={(v) => set("preferredDegrees", v)} searchable placeholder="Any Degree" />
            </Field>
            <Field label="Preferred Specialization" wide>
              <MultiSelectDropdown label="Specialization" options={["Any", "Computer Science", "Engineering", "Commerce", "Arts", "Science", "Medicine", "Management", "Law", "Finance", "Others"]} selected={fd.preferredBranches} onChange={(v) => set("preferredBranches", v)} searchable placeholder="Any Specialization" />
            </Field>
            <Field label="Preferred Employed In">
              <MultiSelectDropdown label="Employed In" options={EMPLOYED_IN} selected={fd.preferredEmployedIn} onChange={(v) => set("preferredEmployedIn", v)} placeholder="Any" />
            </Field>
            <Field label="Preferred Occupation">
              <MultiSelectDropdown label="Occupation" options={OCCUPATIONS} selected={fd.preferredOccupation} onChange={(v) => set("preferredOccupation", v)} searchable placeholder="Any" />
            </Field>
            <PrefSelect label="Preferred Annual Income (From)" value={fd.preferredAnnualIncomeMin} options={INCOME_OPTIONS} onChange={(v) => set("preferredAnnualIncomeMin", v)} wide />
            <PrefSelect label="Country" value={fd.preferredCountry} options={COUNTRIES} onChange={(v) => set("preferredCountry", v)} />
            <PrefSelect label="State" value={fd.preferredState} options={STATES} onChange={(v) => set("preferredState", v)} />
            <PrefSelect label="City" value={fd.preferredCity} options={CITIES} onChange={(v) => set("preferredCity", v)} wide />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 px-6 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium disabled:opacity-50"
          >
            <Save className={`mr-2 h-4 w-4 ${isSaving ? "animate-pulse" : ""}`} />
            {isSaving ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
