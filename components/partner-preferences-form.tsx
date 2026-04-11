"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Save, Heart, ChevronDown, ChevronUp, Search, Check } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { INDIAN_LANGUAGES, EMPLOYMENT_TYPES, OCCUPATIONS as OCCUPATIONS_FROM_LIB, EDUCATION_LEVELS } from "@/lib/profile-data"
import { useMasterData } from "@/hooks/use-master-data"

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
        className="w-full h-11 px-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all text-left">
        <span className="text-sm text-gray-700 truncate max-w-[240px]">{displayLabel}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${label}`}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 border border-gray-100 focus:outline-none placeholder:text-gray-300" />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.map((opt) => {
              const checked = isChecked(opt)
              return (
                <button key={opt} type="button" onClick={() => toggle(opt)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#4B0082]/5 transition-colors text-left group">
                  <div className={`h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${checked ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300"}`}>
                    {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-gray-700">{opt}</span>
                </button>
              )
            })}
          </div>
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {selected.length === 0 || selected.includes("Any") ? "Showing all" : `${selected.filter(s => s !== "Any").length} selected`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ num, sub, title }: { num: string; sub: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-9 h-9 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10 flex-shrink-0">
        <span className="text-[#4B0082] font-black text-[10px]">{num}</span>
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30">{sub}</p>
        <h3 className="text-lg font-light text-gray-900 tracking-tight">{title}</h3>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-2" />
    </div>
  )
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      {label && <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</Label>}
      {children}
    </div>
  )
}

function PrefSelect({ label, value, options, onChange, wide, disabled }: { 
  label: string; value: string; options: string[]; onChange: (v: string) => void; wide?: boolean; disabled?: boolean 
}) {
  return (
    <Field label={label} wide={wide}>
      <div className={`transition-opacity duration-300 ${disabled ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}>
        <Select value={value || "Any"} onValueChange={(v) => onChange(v === "Any" ? "" : v)} disabled={disabled}>
          <SelectTrigger className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#4B0082]/30 transition-all">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] max-h-72">
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white text-[10px] font-black uppercase tracking-widest">{opt}</SelectItem>
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
    preferredSubcaste: "", preferredStar: "", preferredRaasi: "", preferredDosham: "",
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
            preferredMaritalStatus: prefData.preferred_marital_status || "",
            preferredLanguages: Array.isArray(prefData.preferred_languages) ? prefData.preferred_languages : [],
            preferredPhysicalStatus: prefData.preferred_physical_status || "",
            preferredEatingHabits: prefData.preferred_eating_habits || "",
            preferredSmokingHabits: prefData.preferred_smoking_habits || "",
            preferredDrinkingHabits: prefData.preferred_drinking_habits || "",
            preferredReligion: prefData.preferred_religion || "",
            preferredCaste: prefData.preferred_caste || "",
            preferredSubcaste: prefData.preferred_subcaste || "",
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
        preferred_marital_status: fd.preferredMaritalStatus || null,
        preferred_languages: fd.preferredLanguages || [],
        preferred_physical_status: fd.preferredPhysicalStatus || null,
        preferred_eating_habits: fd.preferredEatingHabits || null,
        preferred_smoking_habits: fd.preferredSmokingHabits || null,
        preferred_drinking_habits: fd.preferredDrinkingHabits || null,
        preferred_religion: fd.preferredReligion || null,
        preferred_caste: fd.preferredCaste || null,
        preferred_subcaste: fd.preferredSubcaste || null,
        preferred_star: fd.preferredStar || null,
        preferred_raasi: fd.preferredRaasi || null,
        preferred_dosham: fd.preferredDosham || null,
        preferred_education: fd.preferredEducation || [],
        preferred_degrees: fd.preferredDegrees || [],
        preferred_branches: fd.preferredBranches || [],
        preferred_employed_in: fd.preferredEmployedIn || [],
        preferred_occupation: fd.preferredOccupation || [],
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

  if (isLoading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]" /></div>

  const card = "sds-glass rounded-[2.5rem] p-8 border border-indigo-50/50 shadow-[0_20px_50px_-20px_rgba(75,0,130,0.05)] mb-10"

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button onClick={onBack} variant="ghost" className="mb-3 -ml-3 hover:bg-transparent hover:text-[#4B0082] text-gray-500">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Heart className="h-7 w-7 text-[#FF1493]" fill="currentColor" />
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Partner Preferences</h2>
            <p className="text-sm text-gray-400">Set your criteria — we'll use this to find your best matches.</p>
          </div>
        </div>
      </div>

      <motion.form onSubmit={handleSave} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* P1: Basic */}
        <SectionHeader num="P1" sub="Basics" title="Basic & Lifestyle Preferences" />
        <div className={card}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Age Range">
              <div className="flex items-center gap-2">
                <input type="number" value={fd.preferredAgeMin} onChange={(e) => set("preferredAgeMin", e.target.value)} placeholder="Min (e.g. 24)" min="18" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white" />
                <span className="text-gray-300 flex-shrink-0">—</span>
                <input type="number" value={fd.preferredAgeMax} onChange={(e) => set("preferredAgeMax", e.target.value)} placeholder="Max (e.g. 32)" min="18" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white" />
              </div>
            </Field>
            <Field label="Height Range (cm)">
              <div className="flex items-center gap-2">
                <input type="number" value={fd.preferredHeightMin} onChange={(e) => set("preferredHeightMin", e.target.value)} placeholder="Min" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white" />
                <span className="text-gray-300 flex-shrink-0">—</span>
                <input type="number" value={fd.preferredHeightMax} onChange={(e) => set("preferredHeightMax", e.target.value)} placeholder="Max" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white" />
              </div>
            </Field>
            <PrefSelect label="Marital Status" value={fd.preferredMaritalStatus} options={maritalOptions} onChange={(v) => set("preferredMaritalStatus", v)} />
            <PrefSelect label="Physical Status" value={fd.preferredPhysicalStatus} options={["Any", "Normal", "Physically Challenged"]} onChange={(v) => set("preferredPhysicalStatus", v)} />
            <Field label="Preferred Languages">
              <MultiSelectDropdown label="Languages" options={MOTHER_TONGUES} selected={fd.preferredLanguages} onChange={(v) => set("preferredLanguages", v)} searchable placeholder="Any Language" />
            </Field>
            <PrefSelect label="Eating Habits" value={fd.preferredEatingHabits} options={foodOptions} onChange={(v) => set("preferredEatingHabits", v)} />
            <PrefSelect label="Smoking Habit" value={fd.preferredSmokingHabits} options={["Any", "Never", "Occasionally"]} onChange={(v) => set("preferredSmokingHabits", v)} />
            <PrefSelect label="Drinking Habit" value={fd.preferredDrinkingHabits} options={["Any", "Never", "Occasionally"]} onChange={(v) => set("preferredDrinkingHabits", v)} />
          </div>
        </div>

        {/* P2: Religion */}
        <SectionHeader num="P2" sub="Religion" title="Religious & Horoscope Preferences" />
        <div className={card}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PrefSelect label="Religion" value={fd.preferredReligion} options={religionOptions} onChange={(v) => set("preferredReligion", v)} />
            <PrefSelect label="Caste" value={fd.preferredCaste} options={casteOptions} onChange={(v) => {
              set("preferredCaste", v)
              set("preferredSubcaste", "Any") // Reset subcaste when caste changes
            }} />
            <PrefSelect label="Subcaste" value={fd.preferredSubcaste} options={filteredSubcastes} 
              disabled={!fd.preferredCaste || fd.preferredCaste === "Any"}
              onChange={(v) => set("preferredSubcaste", v)} />
            <PrefSelect label="Star (Nakshatra)" value={fd.preferredStar} options={STARS} onChange={(v) => set("preferredStar", v)} />
            <PrefSelect label="Raasi / Zodiac Sign" value={fd.preferredRaasi} options={RAASI} onChange={(v) => set("preferredRaasi", v)} />
            <PrefSelect label="Dosham" value={fd.preferredDosham} options={["Any", "No", "Yes", "Doesn't Matter"]} onChange={(v) => set("preferredDosham", v)} />
          </div>
        </div>

        {/* P3: Professional */}
        <SectionHeader num="P3" sub="Professional" title="Professional & Location Preferences" />
        <div className={card}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <PrefSelect label="City" value={fd.preferredCity} options={CITIES} onChange={(v) => set("preferredCity", v)} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="h-14 px-12 rounded-[2rem] bg-[#4B0082] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-40">
            <Save className={`mr-3 h-4 w-4 ${isSaving ? "animate-pulse" : ""}`} />
            {isSaving ? "Saving…" : "Save Preferences"}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
