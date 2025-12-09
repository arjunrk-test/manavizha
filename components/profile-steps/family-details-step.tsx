"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown } from "lucide-react"

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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (parentsAreaRef.current && !parentsAreaRef.current.contains(event.target as Node)) {
        setIsParentsAreaOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father Name *</Label>
          <Input
            id="fatherName"
            value={formData.fatherName || ""}
            onChange={(e) => onChange("fatherName", e.target.value)}
            placeholder="Enter father's name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherOccupation">Father's Occupation *</Label>
          <Input
            id="fatherOccupation"
            value={formData.fatherOccupation || ""}
            onChange={(e) => onChange("fatherOccupation", e.target.value)}
            placeholder="Enter father's occupation"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherName">Mother Name *</Label>
          <Input
            id="motherName"
            value={formData.motherName || ""}
            onChange={(e) => onChange("motherName", e.target.value)}
            placeholder="Enter mother's name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherOccupation">Mother's Occupation *</Label>
          <Input
            id="motherOccupation"
            value={formData.motherOccupation || ""}
            onChange={(e) => onChange("motherOccupation", e.target.value)}
            placeholder="Enter mother's occupation"
            required
          />
        </div>
        <div className="space-y-4 md:col-span-2">
          <Label>Current Residence of Parents (Permanent/Temporary) *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentsAddressLine1">Address Line 1 *</Label>
              <Input
                id="parentsAddressLine1"
                value={formData.parentsAddressLine1 || ""}
                onChange={(e) => onChange("parentsAddressLine1", e.target.value)}
                placeholder="Enter address line 1"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentsAddressLine2">Address Line 2</Label>
              <Input
                id="parentsAddressLine2"
                value={formData.parentsAddressLine2 || ""}
                onChange={(e) => onChange("parentsAddressLine2", e.target.value)}
                placeholder="Enter address line 2 (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsPincode">Pincode *</Label>
              <div className="relative">
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
                  placeholder="Enter pincode"
                  maxLength={6}
                  required
                  className={isLoadingParentsAddress ? "pr-10" : ""}
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsArea">Area Name *</Label>
              <div className="relative" ref={parentsAreaRef}>
                <button
                  type="button"
                  onClick={() => parentsAreas.length > 0 && setIsParentsAreaOpen(!isParentsAreaOpen)}
                  disabled={isLoadingParentsAddress || parentsAreas.length === 0}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem] disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <span className={formData.parentsArea ? "" : "text-gray-500"}>
                    {formData.parentsArea || (isLoadingParentsAddress ? "Loading areas..." : parentsAreas.length === 0 ? "Enter pincode first" : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isParentsAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isLoadingParentsAddress && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
                {isParentsAreaOpen && parentsAreas.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-y-auto language-dropdown-scroll" style={{ maxHeight: '250px' }}>
                      {parentsAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice)}
                          className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors ${
                            formData.parentsArea === postOffice.Name ? "bg-gray-100 dark:bg-gray-800" : ""
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
              <Label htmlFor="parentsTaluk">Taluk *</Label>
              <div className="relative">
                <Input
                  id="parentsTaluk"
                  value={formData.parentsTaluk || ""}
                  onChange={(e) => onChange("parentsTaluk", e.target.value)}
                  placeholder="Taluk (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsDistrict">District *</Label>
              <div className="relative">
                <Input
                  id="parentsDistrict"
                  value={formData.parentsDistrict || ""}
                  onChange={(e) => onChange("parentsDistrict", e.target.value)}
                  placeholder="District (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsDivision">Division *</Label>
              <div className="relative">
                <Input
                  id="parentsDivision"
                  value={formData.parentsDivision || ""}
                  onChange={(e) => onChange("parentsDivision", e.target.value)}
                  placeholder="Division (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsRegion">Region *</Label>
              <div className="relative">
                <Input
                  id="parentsRegion"
                  value={formData.parentsRegion || ""}
                  onChange={(e) => onChange("parentsRegion", e.target.value)}
                  placeholder="Region (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsState">State *</Label>
              <div className="relative">
                <Input
                  id="parentsState"
                  value={formData.parentsState || ""}
                  onChange={(e) => onChange("parentsState", e.target.value)}
                  placeholder="State (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsCountry">Country *</Label>
              <div className="relative">
                <Input
                  id="parentsCountry"
                  value={formData.parentsCountry || ""}
                  onChange={(e) => onChange("parentsCountry", e.target.value)}
                  placeholder="Country (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingParentsAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentsLandmark">Landmark</Label>
              <Input
                id="parentsLandmark"
                value={formData.parentsLandmark || ""}
                onChange={(e) => onChange("parentsLandmark", e.target.value)}
                placeholder="Enter landmark (optional)"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="siblings">Siblings Details (if any) *</Label>
          <Input
            id="siblings"
            value={formData.siblings || ""}
            onChange={(e) => onChange("siblings", e.target.value)}
            placeholder="e.g., 1 brother, 1 sister"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="familyDescription">Brief Description About Family *</Label>
          <Textarea
            id="familyDescription"
            value={formData.familyDescription || ""}
            onChange={(e) => onChange("familyDescription", e.target.value)}
            placeholder="Enter a brief description about your family"
            rows={4}
            className="resize-none"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="caste">Caste *</Label>
          <Input
            id="caste"
            value={formData.caste || ""}
            onChange={(e) => onChange("caste", e.target.value)}
            placeholder="Enter caste"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subcaste">Subcaste *</Label>
          <Input
            id="subcaste"
            value={formData.subcaste || ""}
            onChange={(e) => onChange("subcaste", e.target.value)}
            placeholder="Enter subcaste"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kulam">Kulam *</Label>
          <Input
            id="kulam"
            value={formData.kulam || ""}
            onChange={(e) => onChange("kulam", e.target.value)}
            placeholder="Enter kulam"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gotram">Gotram *</Label>
          <Input
            id="gotram"
            value={formData.gotram || ""}
            onChange={(e) => onChange("gotram", e.target.value)}
            placeholder="Enter gotram"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="familyType">Family Type *</Label>
          <select
            id="familyType"
            value={formData.familyType || ""}
            onChange={(e) => onChange("familyType", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="">Select</option>
            <option value="nuclear">Nuclear Family</option>
            <option value="joint">Joint Family</option>
            <option value="extended">Extended Family</option>
            <option value="single-parent">Single Parent Family</option>
            <option value="separated">Separated Family</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="familyStatus">Family Status *</Label>
          <select
            id="familyStatus"
            value={formData.familyStatus || ""}
            onChange={(e) => onChange("familyStatus", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800"
            required
          >
            <option value="">Select</option>
            <option value="lower-middle-class">Lower Middle Class</option>
            <option value="middle-class">Middle Class</option>
            <option value="upper-middle-class">Upper Middle Class</option>
            <option value="rich">Rich</option>
            <option value="affluent">Affluent</option>
          </select>
        </div>
      </div>
    </div>
  )
}
