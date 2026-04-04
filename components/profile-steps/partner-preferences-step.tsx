import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormData } from "@/types/profile"

interface PartnerPreferencesStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PartnerPreferencesStep({ formData, onChange }: PartnerPreferencesStepProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Basic & Lifestyle Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">P1</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Basics</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Basic & Lifestyle Preferences</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50 shadow-[0_20px_50px_-20px_rgba(75,0,130,0.05)]">
          <div className="space-y-3">
            <Label className="sds-label ml-1">Preferred Age Range</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={formData.preferredAgeMin}
                onChange={(e) => onChange("preferredAgeMin", e.target.value)}
                placeholder="Min"
                min="18"
                className="sds-input flex-1 text-center font-black"
              />
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest px-2">to</span>
              <Input
                type="number"
                value={formData.preferredAgeMax}
                onChange={(e) => onChange("preferredAgeMax", e.target.value)}
                placeholder="Max"
                min="18"
                className="sds-input flex-1 text-center font-black"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="sds-label ml-1">Height (cm)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={formData.preferredHeightMin}
                onChange={(e) => onChange("preferredHeightMin", e.target.value)}
                placeholder="Min"
                className="sds-input flex-1 text-center font-black"
              />
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest px-2">to</span>
              <Input
                type="number"
                value={formData.preferredHeightMax}
                onChange={(e) => onChange("preferredHeightMax", e.target.value)}
                placeholder="Max"
                className="sds-input flex-1 text-center font-black"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="sds-label ml-1">Marital Status</Label>
            <Select value={formData.preferredMaritalStatus} onValueChange={(v) => onChange("preferredMaritalStatus", v)}>
              <SelectTrigger className="sds-input w-full h-14 border-indigo-50/50">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                {["Any", "Never Married", "Divorced", "Widowed", "Awaiting Divorce"].map(val => (
                  <SelectItem key={val} value={val} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="sds-label ml-1">Physical Status</Label>
            <Select value={formData.preferredPhysicalStatus} onValueChange={(v) => onChange("preferredPhysicalStatus", v)}>
              <SelectTrigger className="sds-input w-full h-14 border-indigo-50/50">
                <SelectValue placeholder="Select Form" />
              </SelectTrigger>
              <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                {["Normal", "Physically Challenged", "Any"].map(val => (
                  <SelectItem key={val} value={val} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="sds-label ml-1">Mother Tongue</Label>
            <Input
              value={formData.preferredMotherTongue}
              onChange={(e) => onChange("preferredMotherTongue", e.target.value)}
              placeholder="e.g. Tamil"
              className="sds-input w-full px-6"
            />
          </div>

          <div className="space-y-3">
            <Label className="sds-label ml-1">Eating Habits</Label>
            <Select value={formData.preferredEatingHabits} onValueChange={(v) => onChange("preferredEatingHabits", v)}>
              <SelectTrigger className="sds-input w-full h-14 border-indigo-50/50">
                <SelectValue placeholder="Select Diet" />
              </SelectTrigger>
              <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                {["Any", "Vegetarian", "Non-Vegetarian", "Eggetarian"].map(val => (
                  <SelectItem key={val} value={val} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label className="sds-label ml-1">Social Habits</Label>
            <div className="grid grid-cols-2 gap-8">
              <Select value={formData.preferredSmokingHabits} onValueChange={(v) => onChange("preferredSmokingHabits", v)}>
                <SelectTrigger className="sds-input h-14 border-indigo-50/50">
                  <SelectValue placeholder="Smoking" />
                </SelectTrigger>
                <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                  {["Any", "Never", "Occasionally"].map(val => (
                    <SelectItem key={val} value={val} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.preferredDrinkingHabits} onValueChange={(v) => onChange("preferredDrinkingHabits", v)}>
                <SelectTrigger className="sds-input h-14 border-indigo-50/50">
                  <SelectValue placeholder="Drinking" />
                </SelectTrigger>
                <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                  {["Any", "Never", "Occasionally"].map(val => (
                    <SelectItem key={val} value={val} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* celestial Alignment Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">P2</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Religion</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Religious & Horoscope Preferences</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50">
          <div className="space-y-3">
            <Label className="sds-label ml-1">Religion</Label>
            <Input
              value={formData.preferredReligion}
              onChange={(e) => onChange("preferredReligion", e.target.value)}
              placeholder="e.g. Hindu"
              className="sds-input w-full px-6"
            />
          </div>
          <div className="space-y-3">
            <Label className="sds-label ml-1">Caste</Label>
            <Input
              value={formData.preferredCaste}
              onChange={(e) => onChange("preferredCaste", e.target.value)}
              placeholder="e.g. Brahmin"
              className="sds-input w-full px-6"
            />
          </div>
          <div className="space-y-3">
            <Label className="sds-label ml-1">Subcaste</Label>
            <Input
              value={formData.preferredSubcaste}
              onChange={(e) => onChange("preferredSubcaste", e.target.value)}
              placeholder="e.g. Iyer"
              className="sds-input w-full px-6"
            />
          </div>
          <div className="space-y-3">
            <Label className="sds-label ml-1">Star</Label>
            <Input
              value={formData.preferredStar}
              onChange={(e) => onChange("preferredStar", e.target.value)}
              placeholder="e.g. Rohini"
              className="sds-input w-full px-6"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label className="sds-label ml-1">Dhosham</Label>
            <Select value={formData.preferredDosham} onValueChange={(v) => onChange("preferredDosham", v)}>
              <SelectTrigger className="sds-input w-full h-14 border-indigo-50/50">
                <SelectValue placeholder="Select Compatibility" />
              </SelectTrigger>
              <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                {["Any", "No", "Yes", "Doesn't Matter"].map(val => (
                  <SelectItem key={val} value={val} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Professional Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">P3</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Professional</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Professional & Location</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50">
          <div className="space-y-3">
            <Label className="sds-label ml-1">Education</Label>
            <Input
              value={formData.preferredEducation}
              onChange={(e) => onChange("preferredEducation", e.target.value)}
              placeholder="e.g. Postgraduate"
              className="sds-input w-full px-6"
            />
          </div>
          <div className="space-y-3">
            <Label className="sds-label ml-1">Employment Type</Label>
            <Select value={formData.preferredEmploymentType} onValueChange={(v) => onChange("preferredEmploymentType", v)}>
              <SelectTrigger className="sds-input w-full h-14 border-indigo-50/50">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent className="sds-glass rounded-2xl border-indigo-50/50 shadow-2xl p-2 z-[100] backdrop-blur-2xl">
                {["Any", "Private Sector", "Govt Sector", "Business", "Self Employed"].map(val => (
                  <SelectItem key={val} value={val} className="rounded-xl p-3 focus:bg-[#4B0082] focus:text-white transition-all text-[10px] font-black uppercase tracking-widest">{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="sds-label ml-1">Occupation</Label>
            <Input
              value={formData.preferredOccupation}
              onChange={(e) => onChange("preferredOccupation", e.target.value)}
              placeholder="e.g. Enterprise Architect"
              className="sds-input w-full px-6"
            />
          </div>
          <div className="space-y-3">
            <Label className="sds-label ml-1">Annual Income</Label>
            <Input
              value={formData.preferredAnnualIncome}
              onChange={(e) => onChange("preferredAnnualIncome", e.target.value)}
              placeholder="e.g. ₹ 20 Lakhs+"
              className="sds-input w-full px-6"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label className="sds-label ml-1">Location (Country & State)</Label>
            <div className="grid grid-cols-2 gap-8">
              <Input
                value={formData.preferredCountry}
                onChange={(e) => onChange("preferredCountry", e.target.value)}
                placeholder="Country"
                className="sds-input px-6 h-14"
              />
              <Input
                value={formData.preferredState}
                onChange={(e) => onChange("preferredState", e.target.value)}
                placeholder="State"
                className="sds-input px-6 h-14"
              />
            </div>
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label className="sds-label ml-1">City</Label>
            <Input
              value={formData.preferredCity}
              onChange={(e) => onChange("preferredCity", e.target.value)}
              placeholder="e.g. Singapore"
              className="sds-input w-full px-6"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

