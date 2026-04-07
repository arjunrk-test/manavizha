"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormData } from "@/types/profile"
import { ChevronDown, ChevronUp, Search, Check } from "lucide-react"
import { INDIAN_LANGUAGES, EMPLOYMENT_TYPES, OCCUPATIONS, EDUCATION_LEVELS } from "@/lib/profile-data"
import { useMasterData } from "@/hooks/use-master-data"

interface PartnerPreferencesStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

// ─── Dropdown data ────────────────────────────────────────────────────────────
const COUNTRIES = ["Any", "India", "USA", "UK", "Canada", "Australia", "Singapore", "UAE", "Kuwait", "Qatar", "Malaysia", "Germany", "France", "Italy", "Sri Lanka", "New Zealand", "Others"]
const STATES = ["Any", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "International / Abroad"]
const CITIES = ["Any", "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Tiruppur", "Thoothukkudi", "Kancheepuram", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Kolkata", "Pune", "Ahmedabad", "Surat", "Kochi", "Vishakhapatnam", "Jaipur", "Lucknow", "Chandigarh", "Singapore", "Dubai", "London", "Others"]
const RELIGIONS = ["Any", "Hindu", "Christian", "Muslim", "Jain", "Sikh", "Buddhist", "Others"]
const MOTHER_TONGUES = ["Any", ...INDIAN_LANGUAGES, "English", "Others"]
const STARS = ["Any", "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]
const RAASI = ["Any", "Mesham (Aries)", "Rishabam (Taurus)", "Mithunam (Gemini)", "Katakam (Cancer)", "Simmam (Leo)", "Kanni (Virgo)", "Tulam (Libra)", "Viruchigam (Scorpio)", "Dhanusu (Sagittarius)", "Makaram (Capricorn)", "Kumbam (Aquarius)", "Meenam (Pisces)"]
const INCOME_OPTIONS = ["Any", "Less than Rs.50 thousand", "Rs.50 thousand", "Rs.1 Lakh", "Rs.2 Lakhs", "Rs.3 Lakhs", "Rs.4 Lakhs", "Rs.5 Lakhs", "Rs.6 Lakhs", "Rs.7 Lakhs", "Rs.8 Lakhs", "Rs.9 Lakhs", "Rs.10 Lakhs", "Rs.11 Lakhs", "Rs.12 Lakhs", "Rs.13 Lakhs", "Rs.14 Lakhs", "Rs.15 Lakhs", "Rs.20 Lakhs", "Rs.25 Lakhs", "Rs.30 Lakhs", "Rs.35 Lakhs", "Rs.40 Lakhs", "Rs.45 Lakhs", "Rs.50 Lakhs", "Rs.60 Lakhs", "Rs.70 Lakhs", "Rs.80 Lakhs", "Rs.90 Lakhs", "Rs.1 Crore", "Rs.1 Crore & Above"]
const EMPLOYED_IN_OPTIONS = ["Any", ...EMPLOYMENT_TYPES]
const OCCUPATION_OPTIONS = ["Any", ...OCCUPATIONS]
const EDUCATION_OPTIONS = ["Any", ...EDUCATION_LEVELS]

// ─── Multi-select dropdown ────────────────────────────────────────────────────
function MultiSelectDropdown({ label, options, selected, onChange, searchable = false, placeholder = "Any" }: {
  label: string; options: string[]; selected: string[]
  onChange: (v: string[]) => void; searchable?: boolean; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
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
        className="sds-input w-full h-14 px-5 flex items-center justify-between rounded-2xl border border-indigo-50/60 bg-white/60 hover:bg-white/80 transition-all text-left">
        <div className="min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#4B0082]/40 block leading-none mb-0.5">{label}</span>
          <span className="text-[11px] font-black text-gray-700 truncate block max-w-[220px]">{displayLabel}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-[#4B0082]/40 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#4B0082]/40 flex-shrink-0" />}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-indigo-50/60 bg-white/98 backdrop-blur-2xl shadow-2xl shadow-indigo-300/20 overflow-hidden">
          {searchable && (
            <div className="p-3 border-b border-indigo-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${label}`}
                  className="w-full pl-9 pr-4 py-2.5 text-[11px] font-semibold rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#4B0082]/30 placeholder:text-gray-300" />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-2 space-y-0.5">
            {filtered.map((opt) => {
              const checked = isChecked(opt)
              return (
                <button key={opt} type="button" onClick={() => toggle(opt)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#4B0082]/5 transition-colors text-left group">
                  <div className={`h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${checked ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300 group-hover:border-[#4B0082]/30"}`}>
                    {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700">{opt}</span>
                </button>
              )
            })}
          </div>
          <div className="p-3 border-t border-indigo-50/50 bg-gray-50/50">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
              {selected.length === 0 || selected.includes("Any") ? "Showing all" : `${selected.filter(s => s !== "Any").length} selected`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Single Select helper ─────────────────────────────────────────────────────
function PrefSelect({ label, value, options, onChange, disabled }: { label: string; value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className={`space-y-3 transition-opacity duration-300 ${disabled ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}>
      <Label className="sds-label ml-1">{label}</Label>
      <Select value={value || "Any"} onValueChange={(v) => onChange(v === "Any" ? "" : v)} disabled={disabled}>
        <SelectTrigger className="sds-input w-full h-14 border-indigo-50/50 transition-all focus:border-[#4B0082]"><SelectValue placeholder="Any" /></SelectTrigger>
        <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl max-h-72">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PartnerPreferencesStep({ formData, onChange }: PartnerPreferencesStepProps) {
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
    if (!formData.preferredCaste || formData.preferredCaste === "Any") {
      return ["Any"]
    }
    const filtered = dbSubcastes
      .filter(s => !s.category || s.category === formData.preferredCaste)
      .map(s => s.value)
    return ["Any", ...filtered]
  }, [dbSubcastes, formData.preferredCaste])

  // Fetch education level data from master_education_level table
  const { data: educationLevelData } = useMasterData({ tableName: "master_education_level" })

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
    const selectedLevels = Array.isArray(formData.preferredEducation) ? formData.preferredEducation : []
    
    // If specific levels are selected (and it's not just "Any"), filter degrees by those levels
    if (selectedLevels.length > 0 && !selectedLevels.includes("Any")) {
      filteredData = educationLevelData.filter(item => 
        selectedLevels.includes(item.category?.trim() || "")
      )
    }

    return Array.from(
      new Set(
        filteredData
          .map(item => item.value?.trim())
          .filter((val): val is string => Boolean(val && val.length > 0))
      )
    ).sort()
  }, [educationLevelData, formData.preferredEducation])

  const employedIn: string[] = Array.isArray(formData.preferredEmployedIn) ? formData.preferredEmployedIn : []
  const occupation: string[] = Array.isArray(formData.preferredOccupation) ? formData.preferredOccupation : []
  const education: string[] = Array.isArray(formData.preferredEducation) ? formData.preferredEducation : []
  const degrees: string[] = Array.isArray(formData.preferredDegrees) ? formData.preferredDegrees : []
  const branches: string[] = Array.isArray(formData.preferredBranches) ? formData.preferredBranches : []
  const preferredLanguages: string[] = Array.isArray(formData.preferredLanguages) ? formData.preferredLanguages : []

  const SectionHead = ({ num, sub, title }: { num: string; sub: string; title: string }) => (
    <div className="flex items-center gap-4 mb-2">
      <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
        <span className="text-[#4B0082] font-black text-xs">{num}</span>
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">{sub}</h4>
        <h3 className="text-xl font-light text-gray-900 tracking-tight">{title}</h3>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
    </div>
  )

  const card = "grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50 shadow-[0_20px_50px_-20px_rgba(75,0,130,0.05)]"

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── P1: Basic & Lifestyle ─────────────────────────────────── */}
      <div className="space-y-8">
        <SectionHead num="P1" sub="Basics" title="Basic & Lifestyle Preferences" />
        <div className={card}>
          {/* Age */}
          <div className="space-y-3">
            <Label className="sds-label ml-1">Preferred Age Range</Label>
            <div className="flex items-center gap-3">
              <input type="number" value={formData.preferredAgeMin} onChange={(e) => onChange("preferredAgeMin", e.target.value)} placeholder="Min e.g. 24" min="18"
                className="sds-input flex-1 text-center font-black h-14 rounded-2xl border border-indigo-50/60 px-4 focus:outline-none bg-white/60" />
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest px-2">to</span>
              <input type="number" value={formData.preferredAgeMax} onChange={(e) => onChange("preferredAgeMax", e.target.value)} placeholder="Max e.g. 30" min="18"
                className="sds-input flex-1 text-center font-black h-14 rounded-2xl border border-indigo-50/60 px-4 focus:outline-none bg-white/60" />
            </div>
          </div>

          {/* Height */}
          <div className="space-y-3">
            <Label className="sds-label ml-1">Height (cm)</Label>
            <div className="flex items-center gap-3">
              <input type="number" value={formData.preferredHeightMin} onChange={(e) => onChange("preferredHeightMin", e.target.value)} placeholder="Min e.g. 155"
                className="sds-input flex-1 text-center font-black h-14 rounded-2xl border border-indigo-50/60 px-4 focus:outline-none bg-white/60" />
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest px-2">to</span>
              <input type="number" value={formData.preferredHeightMax} onChange={(e) => onChange("preferredHeightMax", e.target.value)} placeholder="Max e.g. 180"
                className="sds-input flex-1 text-center font-black h-14 rounded-2xl border border-indigo-50/60 px-4 focus:outline-none bg-white/60" />
            </div>
          </div>

          <PrefSelect label="Marital Status" value={formData.preferredMaritalStatus} options={maritalOptions} onChange={(v) => onChange("preferredMaritalStatus", v)} />
          <PrefSelect label="Physical Status" value={formData.preferredPhysicalStatus} options={["Any", "Normal", "Physically Challenged"]} onChange={(v) => onChange("preferredPhysicalStatus", v)} />
          <div className="space-y-3">
            <Label className="sds-label ml-1">Preferred Languages</Label>
            <MultiSelectDropdown label="Languages" options={MOTHER_TONGUES} selected={preferredLanguages} onChange={(v) => onChange("preferredLanguages", v)} searchable placeholder="Any Language" />
          </div>
          <PrefSelect label="Eating Habits" value={formData.preferredEatingHabits} options={foodOptions} onChange={(v) => onChange("preferredEatingHabits", v)} />

          <div className="space-y-3 md:col-span-2">
            <Label className="sds-label ml-1">Social Habits</Label>
            <div className="grid grid-cols-2 gap-8">
              <PrefSelect label="" value={formData.preferredSmokingHabits} options={["Any", "Never", "Occasionally"]} onChange={(v) => onChange("preferredSmokingHabits", v)} />
              <PrefSelect label="" value={formData.preferredDrinkingHabits} options={["Any", "Never", "Occasionally"]} onChange={(v) => onChange("preferredDrinkingHabits", v)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── P2: Religion & Horoscope ──────────────────────────────── */}
      <div className="space-y-8">
        <SectionHead num="P2" sub="Religion" title="Religious & Horoscope Preferences" />
        <div className={card}>
          <PrefSelect label="Religion" value={formData.preferredReligion} options={religionOptions} onChange={(v) => onChange("preferredReligion", v)} />
          <PrefSelect label="Caste" value={formData.preferredCaste} options={casteOptions} onChange={(v) => {
            onChange("preferredCaste", v)
            onChange("preferredSubcaste", "Any") // Reset subcaste when caste changes
          }} />
          <PrefSelect label="Subcaste" value={formData.preferredSubcaste} options={filteredSubcastes} 
            disabled={!formData.preferredCaste || formData.preferredCaste === "Any"}
            onChange={(v) => onChange("preferredSubcaste", v)} />
          <PrefSelect label="Star (Nakshatra)" value={formData.preferredStar} options={STARS} onChange={(v) => onChange("preferredStar", v)} />
          <PrefSelect label="Raasi / Zodiac Sign" value={formData.preferredRaasi} options={RAASI} onChange={(v) => onChange("preferredRaasi", v)} />
          <PrefSelect label="Dhosham" value={formData.preferredDosham} options={["Any", "No", "Yes", "Doesn't Matter"]} onChange={(v) => onChange("preferredDosham", v)} />
        </div>
      </div>

      {/* ── P3: Professional & Location ───────────────────────────── */}
      <div className="space-y-8">
        <SectionHead num="P3" sub="Professional" title="Professional & Location" />
        <div className={card}>

          {/* Education — Level */}
          <div className="space-y-3">
            <Label className="sds-label ml-1">Preferred Education Level</Label>
            <MultiSelectDropdown label="Education Level" options={educationLevelOptions} selected={education} onChange={(v) => onChange("preferredEducation", v)} searchable placeholder="Any Level" />
          </div>

          {/* Education — Degree */}
          <div className="space-y-3">
            <Label className="sds-label ml-1">Preferred Degree</Label>
            <MultiSelectDropdown label="Degree" options={degreeOptions} selected={degrees} onChange={(v) => onChange("preferredDegrees", v)} searchable placeholder="Any Degree" />
          </div>

          {/* Specialization */}
          <div className="space-y-3 md:col-span-2">
            <Label className="sds-label ml-1">Preferred Specialization</Label>
            <MultiSelectDropdown label="Specialization" options={["Any", "Computer Science", "Engineering", "Commerce", "Arts", "Science", "Medicine", "Management", "Law", "Finance", "Others"]} selected={branches} onChange={(v) => onChange("preferredBranches", v)} searchable placeholder="Any Specialization" />
          </div>

          {/* Employed In — multi-select */}
          <div className="space-y-3">
            <Label className="sds-label ml-1">Preferred Employed In</Label>
            <MultiSelectDropdown label="Employed In" options={EMPLOYED_IN_OPTIONS} selected={employedIn} onChange={(v) => onChange("preferredEmployedIn", v)} placeholder="Any" />
          </div>

          {/* Occupation — multi-select with search */}
          <div className="space-y-3">
            <Label className="sds-label ml-1">Preferred Occupation</Label>
            <MultiSelectDropdown label="Occupation" options={OCCUPATION_OPTIONS} selected={occupation} onChange={(v) => onChange("preferredOccupation", v)} searchable placeholder="Any" />
          </div>

          {/* Annual Income — From only */}
          <div className="space-y-3 md:col-span-2">
            <Label className="sds-label ml-1">Preferred Annual Income (From)</Label>
            <Select value={formData.preferredAnnualIncomeMin || "Any"} onValueChange={(v) => onChange("preferredAnnualIncomeMin", v === "Any" ? "" : v)}>
              <SelectTrigger className="sds-input w-full h-14 border-indigo-50/50"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl max-h-72">
                {INCOME_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <PrefSelect label="Country" value={formData.preferredCountry} options={COUNTRIES} onChange={(v) => onChange("preferredCountry", v)} />
          <PrefSelect label="State" value={formData.preferredState} options={STATES} onChange={(v) => onChange("preferredState", v)} />
          <div className="space-y-3 md:col-span-2">
            <PrefSelect label="City" value={formData.preferredCity} options={CITIES} onChange={(v) => onChange("preferredCity", v)} />
          </div>
        </div>
      </div>
    </div>
  )
}
