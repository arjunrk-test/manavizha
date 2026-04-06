"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { useClickOutside } from "@/hooks/use-click-outside"

interface FamilyDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

interface PostOffice {
  Name: string
  Taluk?: string
  Tehsil?: string
  Block?: string
  District: string
  Division: string
  Circle?: string
  Region?: string
  State: string
  Country: string
}

export function FamilyDetailsStep({ formData, onChange }: FamilyDetailsStepProps) {
  const [isLoadingParentsAddress, setIsLoadingParentsAddress] = useState(false)
  const [parentsAreas, setParentsAreas] = useState<PostOffice[]>([])
  const [isParentsAreaOpen, setIsParentsAreaOpen] = useState(false)
  const parentsAreaRef = useRef<HTMLDivElement>(null)

  // Fetch family master data using the common hook
  const { data: casteOptions } = useMasterData({ tableName: "master_caste" })
  const { data: subcasteOptions } = useMasterData({ tableName: "master_subcaste" })
  const { data: kulamOptions } = useMasterData({ tableName: "master_kulam" })
  const { data: gotramOptions } = useMasterData({ tableName: "master_gotram" })
  const { data: familyTypeOptions } = useMasterData({ tableName: "master_family_type" })
  const { data: familyStatusOptions } = useMasterData({ tableName: "master_family_status" })

  // Function to fetch areas from pincode
  const fetchAreasFromPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setIsLoadingParentsAddress(false)
      setParentsAreas([])
      // Clear fields if pincode is incomplete
      onChange("parentsArea", "")
      onChange("parentsTaluk", "")
      onChange("parentsDistrict", "")
      onChange("parentsDivision", "")
      onChange("parentsRegion", "")
      onChange("parentsState", "")
      onChange("parentsCountry", "")
      return
    }

    setIsLoadingParentsAddress(true)
    try {
      // Using PostPincode.in API - free API for pincode lookup
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await response.json()

      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice as PostOffice[]
        setParentsAreas(postOffices)
        // Auto-select first area if only one area exists
        if (postOffices.length === 1) {
          const postOffice = postOffices[0]
          onChange("parentsArea", postOffice.Name || "")
          onChange("parentsTaluk", postOffice.Taluk || postOffice.Tehsil || postOffice.Block || "")
          onChange("parentsDistrict", postOffice.District || "")
          onChange("parentsDivision", postOffice.Division || "")
          onChange("parentsRegion", postOffice.Circle || postOffice.Region || "")
          onChange("parentsState", postOffice.State || "")
          onChange("parentsCountry", postOffice.Country || "")
        }
      } else {
        // No areas found
        setParentsAreas([])
        onChange("parentsArea", "")
        onChange("parentsTaluk", "")
        onChange("parentsDistrict", "")
        onChange("parentsDivision", "")
        onChange("parentsRegion", "")
        onChange("parentsState", "")
        onChange("parentsCountry", "")
      }
    } catch (error) {
      console.error("Error fetching address from pincode:", error)
      setParentsAreas([])
    } finally {
      setIsLoadingParentsAddress(false)
    }
  }

  // Function to handle area selection
  const handleAreaSelect = (postOffice: PostOffice) => {
    onChange("parentsArea", postOffice.Name || "")
    onChange("parentsTaluk", postOffice.Taluk || postOffice.Tehsil || postOffice.Block || "")
    onChange("parentsDistrict", postOffice.District || "")
    onChange("parentsDivision", postOffice.Division || "")
    onChange("parentsRegion", postOffice.Circle || postOffice.Region || "")
    onChange("parentsState", postOffice.State || "")
    onChange("parentsCountry", postOffice.Country || "")
    setIsParentsAreaOpen(false)
  }

  // Fetch areas when pincode changes
  useEffect(() => {
    if (formData.parentsPincode && formData.parentsPincode.length === 6) {
      const timeoutId = setTimeout(() => {
        fetchAreasFromPincode(formData.parentsPincode)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setParentsAreas([])
      setIsLoadingParentsAddress(false)
    }
  }, [formData.parentsPincode])

  // Close dropdown when clicking outside
  useClickOutside<HTMLDivElement>(parentsAreaRef, () => setIsParentsAreaOpen(false))

  const filteredSubcasteOptions = useMemo(() => {
    if (!subcasteOptions) return [];
    if (!formData.caste) return []; // Filter strictly if caste is unselected? Wait! If they haven't selected a caste, showing all options might be confusing. So returning [] is better.
    // However, some subcastes might not have a category yet, we can choose to show them or hide them.
    return subcasteOptions.filter((opt) => !opt.category || opt.category === formData.caste);
  }, [subcasteOptions, formData.caste]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Parental Identity Section */}
        <div className="space-y-8 md:col-span-2">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">P1</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Family</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Parents' Details</h3>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50">
            <div className="space-y-2">
              <Label htmlFor="fatherName" className="sds-label">Father's Name *</Label>
              <Input
                id="fatherName"
                value={formData.fatherName || ""}
                onChange={(e) => onChange("fatherName", e.target.value)}
                placeholder="e.g., S. Ramaswamy"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherOccupation" className="sds-label">Father's Profession *</Label>
              <Input
                id="fatherOccupation"
                value={formData.fatherOccupation || ""}
                onChange={(e) => onChange("fatherOccupation", e.target.value)}
                placeholder="e.g., Retired Bank Manager"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherName" className="sds-label">Mother's Name *</Label>
              <Input
                id="motherName"
                value={formData.motherName || ""}
                onChange={(e) => onChange("motherName", e.target.value)}
                placeholder="e.g., R. Lakshmi"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherOccupation" className="sds-label">Mother's Profession *</Label>
              <Input
                id="motherOccupation"
                value={formData.motherOccupation || ""}
                onChange={(e) => onChange("motherOccupation", e.target.value)}
                placeholder="e.g., Homemaker / Teacher"
                required
                className="sds-input w-full"
              />
            </div>
          </div>
        </div>

        {/* Parental Residence Section */}
        <div className="space-y-8 md:col-span-2">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">P2</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Location</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Parents' Address</h3>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentsAddressLine1" className="sds-label">Address Line 1 *</Label>
              <Input
                id="parentsAddressLine1"
                value={formData.parentsAddressLine1 || ""}
                onChange={(e) => onChange("parentsAddressLine1", e.target.value)}
                placeholder="e.g., 45, Temple View Street"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentsAddressLine2" className="sds-label">Address Line 2</Label>
              <Input
                id="parentsAddressLine2"
                value={formData.parentsAddressLine2 || ""}
                onChange={(e) => onChange("parentsAddressLine2", e.target.value)}
                placeholder="Apartment, suite, unit (optional)"
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsPincode" className="sds-label">Pincode *</Label>
              <div className="relative group">
                <Input
                  id="parentsPincode"
                  type="number"
                  value={formData.parentsPincode || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    if (value.length <= 6) {
                      onChange("parentsPincode", value)
                    }
                  }}
                  placeholder="e.g., 625001"
                  maxLength={6}
                  required
                  className={`sds-input w-full ${isLoadingParentsAddress ? "pr-14" : ""}`}
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#4B0082]/20 border-t-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsArea" className="sds-label">Area *</Label>
              <div className="relative" ref={parentsAreaRef}>
                <button
                  type="button"
                  onClick={() => parentsAreas.length > 0 && setIsParentsAreaOpen(!isParentsAreaOpen)}
                  disabled={isLoadingParentsAddress || parentsAreas.length === 0}
                  className={`sds-input w-full flex items-center justify-between text-left transition-all duration-300 active:scale-[0.98] ${isParentsAreaOpen ? "border-[#4B0082] bg-white" : ""} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className={`flex-1 truncate ${formData.parentsArea ? "text-gray-900 font-bold" : "text-gray-300"}`}>
                    {formData.parentsArea || (isLoadingParentsAddress ? "Scanning..." : parentsAreas.length === 0 ? "Pending PIN" : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#4B0082]/40 transition-transform duration-500 ml-2 flex-shrink-0 ${isParentsAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isParentsAreaOpen && parentsAreas.length > 0 && (
                  <div className="absolute z-50 w-full mt-3 sds-glass rounded-3xl shadow-2xl border-indigo-50/50 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="overflow-y-auto max-h-60 p-2 space-y-1 custom-scrollbar">
                      {parentsAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice)}
                          className={`w-full px-5 py-3.5 rounded-2xl text-left text-xs font-bold transition-all duration-300 ${
                            formData.parentsArea === postOffice.Name 
                            ? "bg-[#4B0082] text-white shadow-lg shadow-indigo-900/20" 
                            : "hover:bg-indigo-50/50 text-gray-500 hover:text-[#4B0082]"
                          }`}
                        >
                          {postOffice.Name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsTaluk" className="sds-label">Taluk</Label>
              <Input
                id="parentsTaluk"
                value={formData.parentsTaluk || ""}
                readOnly
                className="sds-input w-full bg-black/[0.02] border-indigo-50/30 opacity-60 cursor-not-allowed font-medium text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsDistrict" className="sds-label">District</Label>
              <Input
                id="parentsDistrict"
                value={formData.parentsDistrict || ""}
                readOnly
                className="sds-input w-full bg-black/[0.02] border-indigo-50/30 opacity-60 cursor-not-allowed font-medium text-gray-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentsLandmark" className="sds-label">Landmark</Label>
              <Input
                id="parentsLandmark"
                value={formData.parentsLandmark || ""}
                onChange={(e) => onChange("parentsLandmark", e.target.value)}
                placeholder="e.g., Near Meenakshi Temple / Pillayar Kovil"
                className="sds-input w-full"
              />
            </div>
          </div>
        </div>

        {/* Heritage Matrix Section */}
        <div className="space-y-8 md:col-span-2">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">H3</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Background</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Caste & Heritage</h3>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50">
            <SelectDropdown
              id="caste"
              label="Caste *"
              value={formData.caste || ""}
              onChange={(value) => {
                onChange("caste", value)
                onChange("subcaste", "") // Reset subcaste when caste changes
              }}
              options={casteOptions}
              required
            />
            <SelectDropdown
              id="subcaste"
              label={formData.caste ? "Subcaste *" : "Select Caste First *"}
              value={formData.subcaste || ""}
              onChange={(value) => onChange("subcaste", value)}
              options={filteredSubcasteOptions}
              disabled={!formData.caste}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="kulam" className="sds-label">Kulam / Kilai (Optional)</Label>
              <Input
                id="kulam"
                value={formData.kulam || ""}
                onChange={(e) => onChange("kulam", e.target.value)}
                placeholder="Type your Kulam / Kilai"
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gotram" className="sds-label">Gotram (Optional)</Label>
              <Input
                id="gotram"
                value={formData.gotram || ""}
                onChange={(e) => onChange("gotram", e.target.value)}
                placeholder="Type your Gotram"
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ancestralOrigin" className="sds-label">Native Place *</Label>
              <Input
                id="ancestralOrigin"
                value={formData.ancestralOrigin || ""}
                onChange={(e) => onChange("ancestralOrigin", e.target.value)}
                placeholder="e.g., Madurai / Thanjavur"
                required
                className="sds-input w-full"
              />
            </div>
            <SelectDropdown
              id="familyStatus"
              label="Family Status *"
              value={formData.familyStatus || ""}
              onChange={(value) => onChange("familyStatus", value)}
              options={familyStatusOptions}
              required
            />
            <SelectDropdown
              id="familyType"
              label="Family Type *"
              value={formData.familyType || ""}
              onChange={(value) => onChange("familyType", value)}
              options={familyTypeOptions}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="siblings" className="sds-label">Siblings *</Label>
              <Input
                id="siblings"
                value={formData.siblings || ""}
                onChange={(e) => onChange("siblings", e.target.value)}
                placeholder="e.g., 1 Younger Brother (Unmarried)"
                required
                className="sds-input w-full"
              />
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="space-y-4 md:col-span-2">
          <Label htmlFor="familyDescription" className="sds-label">About Family *</Label>
          <Textarea
            id="familyDescription"
            value={formData.familyDescription || ""}
            onChange={(e) => onChange("familyDescription", e.target.value)}
            placeholder="Example: We are a traditional middle-class family from Madurai. My father is retired, and my mother is a homemaker. We value education and family unity..."
            rows={4}
            className="sds-input w-full resize-none min-h-[160px] py-6 px-6 leading-relaxed"
            required
          />
        </div>
      </div>
    </div>
  )
}
