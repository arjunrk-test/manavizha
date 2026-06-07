import { useState, useEffect, useRef, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData, SiblingDetail } from "@/types/profile"
import { Textarea } from "@/components/ui/textarea"
import {
  SETUP_SECTION_BODY,
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"
import { ChevronDown, FileText, Home, Landmark, Plus, Trash2, UserPlus, Users } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { useClickOutside } from "@/hooks/use-click-outside"
import { Button } from "@/components/ui/button"

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
    if (!formData.caste) return []; 
    return subcasteOptions.filter((opt) => !opt.category || opt.category === formData.caste);
  }, [subcasteOptions, formData.caste]);

  const addSibling = (type: 'brother' | 'sister') => {
    const currentSiblings = formData.siblingDetails || []
    const newSibling: SiblingDetail = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      relation: 'younger',
      occupation: '',
      isWorking: false,
      isMarried: false
    }
    onChange("siblingDetails", [...currentSiblings, newSibling])
  }

  const removeSibling = (id: string) => {
    const currentSiblings = formData.siblingDetails || []
    onChange("siblingDetails", currentSiblings.filter(s => s.id !== id))
  }

  const updateSibling = (id: string, field: keyof SiblingDetail, value: any) => {
    const currentSiblings = formData.siblingDetails || []
    onChange("siblingDetails", currentSiblings.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Users}
            title="Parents' details"
            description="Father and mother names and professions"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
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

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Home}
            title="Parents' address"
            description="Family residence and location details"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
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
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#e87898]/20 border-t-[#e87898]"></div>
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
                  className={`sds-input w-full flex items-center justify-between text-left transition-all duration-300 active:scale-[0.98] ${isParentsAreaOpen ? "border-[#e87898] bg-white" : ""} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className={`flex-1 truncate ${formData.parentsArea ? "text-gray-900 font-bold" : "text-gray-300"}`}>
                    {formData.parentsArea || (isLoadingParentsAddress ? "Scanning..." : parentsAreas.length === 0 ? "Pending PIN" : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#e87898]/40 transition-transform duration-500 ml-2 flex-shrink-0 ${isParentsAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isParentsAreaOpen && parentsAreas.length > 0 && (
                  <div className="absolute z-50 w-full mt-3 sds-glass rounded-3xl shadow-2xl border-[#f0ebe3] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="overflow-y-auto max-h-60 p-2 space-y-1 custom-scrollbar">
                      {parentsAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice)}
                          className={`w-full px-5 py-3.5 rounded-2xl text-left text-xs font-bold transition-all duration-300 ${
                            formData.parentsArea === postOffice.Name 
                            ? "bg-[#e87898] text-white shadow-lg shadow-[#e87898]/15" 
                            : "hover:bg-[#fce8ef]/80 text-gray-500 hover:text-[#e87898]"
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
                className="sds-input w-full bg-black/[0.02] border-[#f0ebe3] opacity-60 cursor-not-allowed font-medium text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsDistrict" className="sds-label">District</Label>
              <Input
                id="parentsDistrict"
                value={formData.parentsDistrict || ""}
                readOnly
                className="sds-input w-full bg-black/[0.02] border-[#f0ebe3] opacity-60 cursor-not-allowed font-medium text-gray-500"
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

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Landmark}
            title="Caste & heritage"
            description="Community background, kulam, gotram, and family status"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
            <SelectDropdown
              id="caste"
              label="Caste *"
              value={formData.caste || ""}
              onChange={(value) => {
                onChange("caste", value)
                onChange("subcaste", "") 
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
            <SelectDropdown
              id="kulam"
              label="Kulam / Kilai *"
              value={formData.kulam || ""}
              onChange={(value) => onChange("kulam", value)}
              options={kulamOptions}
              required
            />
            <SelectDropdown
              id="gotram"
              label="Gotram *"
              value={formData.gotram || ""}
              onChange={(value) => onChange("gotram", value)}
              options={gotramOptions}
              required
            />
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
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={UserPlus}
            title="Brothers & sisters"
            description="Add siblings with their occupation and marital status"
          />
          <div className="setup-section-card-body space-y-6">
            <div className="flex gap-4">
              <Button 
                type="button" 
                onClick={() => addSibling('brother')}
                variant="outline"
                className="flex-1 h-16 rounded-2xl border-dashed border-[#eadfce] hover:border-[#e87898] hover:bg-[#fce8ef]/50 text-[#e87898] font-black text-[10px] uppercase tracking-widest gap-3"
              >
                <Plus className="h-4 w-4" /> Add Brother
              </Button>
              <Button 
                type="button" 
                onClick={() => addSibling('sister')}
                variant="outline"
                className="flex-1 h-16 rounded-2xl border-dashed border-[#eadfce] hover:border-[#e87898] hover:bg-[#fce8ef]/50 text-[#e87898] font-black text-[10px] uppercase tracking-widest gap-3"
              >
                <Plus className="h-4 w-4" /> Add Sister
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {(formData.siblingDetails || []).map((sibling, index) => (
                <div 
                  key={sibling.id} 
                  className="sds-glass rounded-3xl p-8 border-[#f0ebe3] shadow-xl space-y-6 animate-in slide-in-from-left-4 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sibling.type === 'brother' ? 'bg-[#fce8ef] text-[#e87898]' : 'bg-primary text-primary'}`}>
                        <span className="font-black text-[10px] uppercase">{sibling.type[0]}</span>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sibling {index + 1}</h4>
                        <h3 className="font-bold text-gray-900 capitalize">{sibling.relation} {sibling.type}</h3>
                      </div>
                    </div>
                    <Button 
                      onClick={() => removeSibling(sibling.id)}
                      variant="ghost" 
                      size="icon"
                      className="text-primary hover:text-primary hover:bg-primary rounded-full"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                      <Label className="sds-label">Relation</Label>
                      <select 
                        value={sibling.relation}
                        onChange={(e) => updateSibling(sibling.id, 'relation', e.target.value)}
                        className="sds-input w-full appearance-none cursor-pointer"
                      >
                        <option value="elder">Elder</option>
                        <option value="younger">Younger</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="sds-label">Status</Label>
                      <div className="flex bg-black/[0.03] p-1 rounded-2xl border border-[#f0ebe3] h-14">
                        <button
                          type="button"
                          onClick={() => updateSibling(sibling.id, 'isWorking', false)}
                          className={`flex-1 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${!sibling.isWorking ? 'bg-white shadow-sm text-[#e87898]' : 'text-gray-400 hover:text-[#e87898]/60'}`}
                        >
                          Studying
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSibling(sibling.id, 'isWorking', true)}
                          className={`flex-1 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${sibling.isWorking ? 'bg-white shadow-sm text-[#e87898]' : 'text-gray-400 hover:text-[#e87898]/60'}`}
                        >
                          Working
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="sds-label">Profession / Course</Label>
                      <Input 
                        value={sibling.occupation}
                        onChange={(e) => updateSibling(sibling.id, 'occupation', e.target.value)}
                        placeholder={sibling.isWorking ? "e.g., Software Engineer" : "e.g., B.E. Final Year"}
                        className="sds-input w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="sds-label">Marital Status</Label>
                      <div className="flex bg-black/[0.03] p-1 rounded-2xl border border-[#f0ebe3] h-14">
                        <button
                          type="button"
                          onClick={() => updateSibling(sibling.id, 'isMarried', false)}
                          className={`flex-1 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${!sibling.isMarried ? 'bg-white shadow-sm text-[#e87898]' : 'text-gray-400 hover:text-[#e87898]/60'}`}
                        >
                          Unmarried
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSibling(sibling.id, 'isMarried', true)}
                          className={`flex-1 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${sibling.isMarried ? 'bg-white shadow-sm text-[#e87898]' : 'text-gray-400 hover:text-[#e87898]/60'}`}
                        >
                          Married
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(formData.siblingDetails || []).length === 0 && (
                <div className="text-center py-12 px-6 sds-glass rounded-3xl border-dashed border-[#f0ebe3]">
                  <UserPlus className="h-10 w-10 text-[#e87898]/50/30 mx-auto mb-4" />
                  <p className="text-[#6b7280] text-sm font-medium">No siblings added yet. Use the buttons above to add brothers or sisters.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={FileText}
            title="About family"
            description="Describe your family background and values"
          />
          <div className="setup-section-card-body space-y-3">
            <Label htmlFor="familyDescription" className="sds-label">About family *</Label>
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
    </div>
  )
}
