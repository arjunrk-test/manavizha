"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { ChevronDown } from "lucide-react"

interface ContactDetailsStepProps {
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

export function ContactDetailsStep({ formData, onChange }: ContactDetailsStepProps) {
  const [isWhatsappSameAsPhone, setIsWhatsappSameAsPhone] = useState(false)
  const [isCurrentAddressSameAsPermanent, setIsCurrentAddressSameAsPermanent] = useState(false)
  const [isLoadingPermanentAddress, setIsLoadingPermanentAddress] = useState(false)
  const [isLoadingCurrentAddress, setIsLoadingCurrentAddress] = useState(false)
  const [permanentAreas, setPermanentAreas] = useState<PostOffice[]>([])
  const [currentAreas, setCurrentAreas] = useState<PostOffice[]>([])
  const [isPermanentAreaOpen, setIsPermanentAreaOpen] = useState(false)
  const [isCurrentAreaOpen, setIsCurrentAreaOpen] = useState(false)
  const permanentAreaRef = useRef<HTMLDivElement>(null)
  const currentAreaRef = useRef<HTMLDivElement>(null)

  // Function to fetch areas from pincode
  const fetchAreasFromPincode = async (pincode: string, type: "permanent" | "current") => {
    if (!pincode || pincode.length !== 6) {
      if (type === "permanent") {
        setIsLoadingPermanentAddress(false)
        setPermanentAreas([])
        // Clear fields if pincode is incomplete
        onChange("permanentArea", "")
        onChange("permanentTaluk", "")
        onChange("permanentDistrict", "")
        onChange("permanentDivision", "")
        onChange("permanentRegion", "")
        onChange("permanentState", "")
        onChange("permanentCountry", "")
      } else {
        setIsLoadingCurrentAddress(false)
        setCurrentAreas([])
        // Clear fields if pincode is incomplete
        onChange("currentArea", "")
        onChange("currentTaluk", "")
        onChange("currentDistrict", "")
        onChange("currentDivision", "")
        onChange("currentRegion", "")
        onChange("currentState", "")
        onChange("currentCountry", "")
      }
      return
    }

    try {
      // Using PostPincode.in API - free API for pincode lookup
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await response.json()

      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice as PostOffice[]

        if (type === "permanent") {
          setPermanentAreas(postOffices)
          // Auto-select first area if only one area exists
          if (postOffices.length === 1) {
            const postOffice = postOffices[0]
            onChange("permanentArea", postOffice.Name || "")
            onChange("permanentTaluk", postOffice.Taluk || postOffice.Tehsil || postOffice.Block || "")
            onChange("permanentDistrict", postOffice.District || "")
            onChange("permanentDivision", postOffice.Division || "")
            onChange("permanentRegion", postOffice.Circle || postOffice.Region || "")
            onChange("permanentState", postOffice.State || "")
            onChange("permanentCountry", postOffice.Country || "")
          }
        } else {
          setCurrentAreas(postOffices)
          // Auto-select first area if only one area exists
          if (postOffices.length === 1) {
            const postOffice = postOffices[0]
            onChange("currentArea", postOffice.Name || "")
            onChange("currentTaluk", postOffice.Taluk || postOffice.Tehsil || postOffice.Block || "")
            onChange("currentDistrict", postOffice.District || "")
            onChange("currentDivision", postOffice.Division || "")
            onChange("currentRegion", postOffice.Circle || postOffice.Region || "")
            onChange("currentState", postOffice.State || "")
            onChange("currentCountry", postOffice.Country || "")
          }
        }
      } else {
        // No areas found
        if (type === "permanent") {
          setPermanentAreas([])
          onChange("permanentArea", "")
          onChange("permanentTaluk", "")
          onChange("permanentDistrict", "")
          onChange("permanentDivision", "")
          onChange("permanentRegion", "")
          onChange("permanentState", "")
          onChange("permanentCountry", "")
        } else {
          setCurrentAreas([])
          onChange("currentArea", "")
          onChange("currentTaluk", "")
          onChange("currentDistrict", "")
          onChange("currentDivision", "")
          onChange("currentRegion", "")
          onChange("currentState", "")
          onChange("currentCountry", "")
        }
      }
    } catch (error) {
      console.error("Error fetching address from pincode:", error)
      if (type === "permanent") {
        setPermanentAreas([])
      } else {
        setCurrentAreas([])
      }
    } finally {
      if (type === "permanent") {
        setIsLoadingPermanentAddress(false)
      } else {
        setIsLoadingCurrentAddress(false)
      }
    }
  }

  // Function to handle area selection
  const handleAreaSelect = (postOffice: PostOffice, type: "permanent" | "current") => {
    if (type === "permanent") {
      onChange("permanentArea", postOffice.Name || "")
      onChange("permanentTaluk", postOffice.Taluk || postOffice.Tehsil || postOffice.Block || "")
      onChange("permanentDistrict", postOffice.District || "")
      onChange("permanentDivision", postOffice.Division || "")
      onChange("permanentRegion", postOffice.Circle || postOffice.Region || "")
      onChange("permanentState", postOffice.State || "")
      onChange("permanentCountry", postOffice.Country || "")
      setIsPermanentAreaOpen(false)
    } else {
      onChange("currentArea", postOffice.Name || "")
      onChange("currentTaluk", postOffice.Taluk || postOffice.Tehsil || postOffice.Block || "")
      onChange("currentDistrict", postOffice.District || "")
      onChange("currentDivision", postOffice.Division || "")
      onChange("currentRegion", postOffice.Circle || postOffice.Region || "")
      onChange("currentState", postOffice.State || "")
      onChange("currentCountry", postOffice.Country || "")
      setIsCurrentAreaOpen(false)
    }
  }

  // Auto-fetch areas for permanent address when pincode is entered
  useEffect(() => {
    if (formData.permanentPincode && formData.permanentPincode.length === 6) {
      // Set loading immediately
      setIsLoadingPermanentAddress(true)
      // Small delay to show loading, then fetch
      const timeoutId = setTimeout(() => {
        fetchAreasFromPincode(formData.permanentPincode, "permanent")
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setIsLoadingPermanentAddress(false)
      setPermanentAreas([])
    }
  }, [formData.permanentPincode])

  // Auto-fetch areas for current address when pincode is entered
  useEffect(() => {
    if (formData.currentPincode && formData.currentPincode.length === 6 && !isCurrentAddressSameAsPermanent) {
      // Set loading immediately
      setIsLoadingCurrentAddress(true)
      // Small delay to show loading, then fetch
      const timeoutId = setTimeout(() => {
        fetchAreasFromPincode(formData.currentPincode, "current")
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setIsLoadingCurrentAddress(false)
      setCurrentAreas([])
    }
  }, [formData.currentPincode, isCurrentAddressSameAsPermanent])

  // Handle click outside for area dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (permanentAreaRef.current && !permanentAreaRef.current.contains(event.target as Node)) {
        setIsPermanentAreaOpen(false)
      }
      if (currentAreaRef.current && !currentAreaRef.current.contains(event.target as Node)) {
        setIsCurrentAreaOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sync WhatsApp number with phone number when checkbox is checked
  useEffect(() => {
    if (isWhatsappSameAsPhone && formData.whatsappNumber !== formData.phone) {
      onChange("whatsappNumber", formData.phone || "+91")
    }
  }, [formData.phone, isWhatsappSameAsPhone])

  // Sync current address with permanent address when checkbox is checked
  useEffect(() => {
    if (isCurrentAddressSameAsPermanent) {
      onChange("currentAddressLine1", formData.permanentAddressLine1)
      onChange("currentAddressLine2", formData.permanentAddressLine2)
      onChange("currentPincode", formData.permanentPincode)
      onChange("currentArea", formData.permanentArea)
      onChange("currentTaluk", formData.permanentTaluk)
      onChange("currentDistrict", formData.permanentDistrict)
      onChange("currentDivision", formData.permanentDivision)
      onChange("currentRegion", formData.permanentRegion)
      onChange("currentState", formData.permanentState)
      onChange("currentCountry", formData.permanentCountry)
      onChange("currentLandmark", formData.permanentLandmark)
      setCurrentAreas([])
      setIsCurrentAreaOpen(false)
    } else {
      setCurrentAreas([])
      setIsCurrentAreaOpen(false)
    }
  }, [
    formData.permanentAddressLine1,
    formData.permanentAddressLine2,
    formData.permanentPincode,
    formData.permanentArea,
    formData.permanentTaluk,
    formData.permanentDistrict,
    formData.permanentDivision,
    formData.permanentRegion,
    formData.permanentState,
    formData.permanentCountry,
    formData.permanentLandmark,
    isCurrentAddressSameAsPermanent,
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <Label htmlFor="phone" className="mb-3.5">Phone Number *</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
              +91
            </div>
            <Input
              id="phone"
              type="tel"
              value={formData.phone.startsWith("+91") ? formData.phone.slice(3) : formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "")
                // Limit to 10 digits
                if (value.length <= 10) {
                  onChange("phone", value ? `+91${value}` : "+91")
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && formData.phone === "+91") {
                  e.preventDefault()
                }
              }}
              placeholder="Enter your phone number"
              maxLength={10}
              required
              className="pl-12"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isWhatsappSameAsPhone"
                checked={isWhatsappSameAsPhone}
                onChange={(e) => {
                  setIsWhatsappSameAsPhone(e.target.checked)
                  if (e.target.checked) {
                    onChange("whatsappNumber", formData.phone)
                  } else {
                    onChange("whatsappNumber", "")
                  }
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isWhatsappSameAsPhone" className="text-sm font-normal cursor-pointer">
                Same as phone number
              </Label>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
              +91
            </div>
            <Input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber.startsWith("+91") ? formData.whatsappNumber.slice(3) : formData.whatsappNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "")
                // Limit to 10 digits
                if (value.length <= 10) {
                  onChange("whatsappNumber", value ? `+91${value}` : "+91")
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && formData.whatsappNumber === "+91") {
                  e.preventDefault()
                }
              }}
              placeholder="Enter your WhatsApp number"
              maxLength={10}
              required
              disabled={isWhatsappSameAsPhone}
              className={`pl-12 ${isWhatsappSameAsPhone ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <Label>Permanent Address *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="permanentAddressLine1">Address Line 1 *</Label>
              <Input
                id="permanentAddressLine1"
                value={formData.permanentAddressLine1}
                onChange={(e) => onChange("permanentAddressLine1", e.target.value)}
                placeholder="Enter address line 1"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="permanentAddressLine2">Address Line 2</Label>
              <Input
                id="permanentAddressLine2"
                value={formData.permanentAddressLine2}
                onChange={(e) => onChange("permanentAddressLine2", e.target.value)}
                placeholder="Enter address line 2 (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentPincode">Pincode *</Label>
              <div className="relative">
                <Input
                  id="permanentPincode"
                  type="number"
                  value={formData.permanentPincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    if (value.length <= 6) {
                      onChange("permanentPincode", value)
                    }
                  }}
                  placeholder="Enter pincode"
                  maxLength={6}
                  required
                  className={isLoadingPermanentAddress ? "pr-10" : ""}
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentArea">Area Name *</Label>
              <div className="relative" ref={permanentAreaRef}>
                <button
                  type="button"
                  onClick={() => permanentAreas.length > 0 && setIsPermanentAreaOpen(!isPermanentAreaOpen)}
                  disabled={isLoadingPermanentAddress || permanentAreas.length === 0}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem] disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <span className={formData.permanentArea ? "" : "text-gray-500"}>
                    {formData.permanentArea || (isLoadingPermanentAddress ? "Loading areas..." : permanentAreas.length === 0 ? "Enter pincode first" : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isPermanentAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isLoadingPermanentAddress && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
                {isPermanentAreaOpen && permanentAreas.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-y-auto language-dropdown-scroll" style={{ maxHeight: '250px' }}>
                      {permanentAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice, "permanent")}
                          className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors ${
                            formData.permanentArea === postOffice.Name ? "bg-gray-100 dark:bg-gray-800" : ""
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
              <Label htmlFor="permanentTaluk">Taluk *</Label>
              <div className="relative">
                <Input
                  id="permanentTaluk"
                  value={formData.permanentTaluk || ""}
                  onChange={(e) => onChange("permanentTaluk", e.target.value)}
                  placeholder="Taluk (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentDistrict">District *</Label>
              <div className="relative">
                <Input
                  id="permanentDistrict"
                  value={formData.permanentDistrict}
                  onChange={(e) => onChange("permanentDistrict", e.target.value)}
                  placeholder="District (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentDivision">Division *</Label>
              <div className="relative">
                <Input
                  id="permanentDivision"
                  value={formData.permanentDivision}
                  onChange={(e) => onChange("permanentDivision", e.target.value)}
                  placeholder="Division (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentRegion">Region *</Label>
              <div className="relative">
                <Input
                  id="permanentRegion"
                  value={formData.permanentRegion}
                  onChange={(e) => onChange("permanentRegion", e.target.value)}
                  placeholder="Region (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentState">State *</Label>
              <div className="relative">
                <Input
                  id="permanentState"
                  value={formData.permanentState}
                  onChange={(e) => onChange("permanentState", e.target.value)}
                  placeholder="State (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentCountry">Country *</Label>
              <div className="relative">
                <Input
                  id="permanentCountry"
                  value={formData.permanentCountry}
                  onChange={(e) => onChange("permanentCountry", e.target.value)}
                  placeholder="Country (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="permanentLandmark">Landmark</Label>
              <Input
                id="permanentLandmark"
                value={formData.permanentLandmark}
                onChange={(e) => onChange("permanentLandmark", e.target.value)}
                placeholder="Enter landmark (optional)"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label>Current Address of Residence *</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrentAddressSameAsPermanent"
                checked={isCurrentAddressSameAsPermanent}
                onChange={(e) => {
                  setIsCurrentAddressSameAsPermanent(e.target.checked)
                  if (e.target.checked) {
                    onChange("currentAddressLine1", formData.permanentAddressLine1)
                    onChange("currentAddressLine2", formData.permanentAddressLine2)
                    onChange("currentPincode", formData.permanentPincode)
                    onChange("currentArea", formData.permanentArea)
                    onChange("currentTaluk", formData.permanentTaluk)
                    onChange("currentDistrict", formData.permanentDistrict)
                    onChange("currentDivision", formData.permanentDivision)
                    onChange("currentRegion", formData.permanentRegion)
                    onChange("currentState", formData.permanentState)
                    onChange("currentCountry", formData.permanentCountry)
                    onChange("currentLandmark", formData.permanentLandmark)
                  } else {
                    onChange("currentAddressLine1", "")
                    onChange("currentAddressLine2", "")
                    onChange("currentPincode", "")
                    onChange("currentArea", "")
                    onChange("currentTaluk", "")
                    onChange("currentDistrict", "")
                    onChange("currentDivision", "")
                    onChange("currentRegion", "")
                    onChange("currentState", "")
                    onChange("currentCountry", "")
                    onChange("currentLandmark", "")
                  }
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isCurrentAddressSameAsPermanent" className="text-sm font-normal cursor-pointer">
                Same as permanent address
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentAddressLine1">Address Line 1 *</Label>
              <Input
                id="currentAddressLine1"
                value={formData.currentAddressLine1}
                onChange={(e) => onChange("currentAddressLine1", e.target.value)}
                placeholder="Enter address line 1"
                required
                disabled={isCurrentAddressSameAsPermanent}
                className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentAddressLine2">Address Line 2</Label>
              <Input
                id="currentAddressLine2"
                value={formData.currentAddressLine2}
                onChange={(e) => onChange("currentAddressLine2", e.target.value)}
                placeholder="Enter address line 2 (optional)"
                disabled={isCurrentAddressSameAsPermanent}
                className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPincode">Pincode *</Label>
              <div className="relative">
                <Input
                  id="currentPincode"
                  type="number"
                  value={formData.currentPincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    if (value.length <= 6) {
                      onChange("currentPincode", value)
                    }
                  }}
                  placeholder="Enter pincode"
                  maxLength={6}
                  required
                  disabled={isCurrentAddressSameAsPermanent}
                  className={`${isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""} ${isLoadingCurrentAddress ? "pr-10" : ""}`}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentArea">Area Name *</Label>
              <div className="relative" ref={currentAreaRef}>
                <button
                  type="button"
                  onClick={() => !isCurrentAddressSameAsPermanent && currentAreas.length > 0 && setIsCurrentAreaOpen(!isCurrentAreaOpen)}
                  disabled={isCurrentAddressSameAsPermanent || isLoadingCurrentAddress || currentAreas.length === 0}
                  className={`w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem] ${
                    isCurrentAddressSameAsPermanent || isLoadingCurrentAddress || currentAreas.length === 0 ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
                  }`}
                >
                  <span className={formData.currentArea ? "" : "text-gray-500"}>
                    {formData.currentArea || (isCurrentAddressSameAsPermanent ? "Same as permanent" : isLoadingCurrentAddress ? "Loading areas..." : currentAreas.length === 0 ? "Enter pincode first" : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCurrentAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
                {isCurrentAreaOpen && !isCurrentAddressSameAsPermanent && currentAreas.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-y-auto language-dropdown-scroll" style={{ maxHeight: '250px' }}>
                      {currentAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice, "current")}
                          className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors ${
                            formData.currentArea === postOffice.Name ? "bg-gray-100 dark:bg-gray-800" : ""
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
              <Label htmlFor="currentTaluk">Taluk *</Label>
              <div className="relative">
                <Input
                  id="currentTaluk"
                  value={formData.currentTaluk || ""}
                  onChange={(e) => onChange("currentTaluk", e.target.value)}
                  placeholder="Taluk (auto-filled)"
                  required
                  readOnly
                  disabled={isCurrentAddressSameAsPermanent}
                  className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentDistrict">District *</Label>
              <div className="relative">
                <Input
                  id="currentDistrict"
                  value={formData.currentDistrict}
                  onChange={(e) => onChange("currentDistrict", e.target.value)}
                  placeholder="District (auto-filled)"
                  required
                  readOnly
                  disabled={isCurrentAddressSameAsPermanent}
                  className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentDivision">Division *</Label>
              <div className="relative">
                <Input
                  id="currentDivision"
                  value={formData.currentDivision}
                  onChange={(e) => onChange("currentDivision", e.target.value)}
                  placeholder="Division (auto-filled)"
                  required
                  readOnly
                  disabled={isCurrentAddressSameAsPermanent}
                  className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentRegion">Region *</Label>
              <div className="relative">
                <Input
                  id="currentRegion"
                  value={formData.currentRegion}
                  onChange={(e) => onChange("currentRegion", e.target.value)}
                  placeholder="Region (auto-filled)"
                  required
                  readOnly
                  disabled={isCurrentAddressSameAsPermanent}
                  className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentState">State *</Label>
              <div className="relative">
                <Input
                  id="currentState"
                  value={formData.currentState}
                  onChange={(e) => onChange("currentState", e.target.value)}
                  placeholder="State (auto-filled)"
                  required
                  readOnly
                  disabled={isCurrentAddressSameAsPermanent}
                  className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentCountry">Country *</Label>
              <div className="relative">
                <Input
                  id="currentCountry"
                  value={formData.currentCountry}
                  onChange={(e) => onChange("currentCountry", e.target.value)}
                  placeholder="Country (auto-filled)"
                  required
                  readOnly
                  disabled={isCurrentAddressSameAsPermanent}
                  className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentLandmark">Landmark</Label>
              <Input
                id="currentLandmark"
                value={formData.currentLandmark}
                onChange={(e) => onChange("currentLandmark", e.target.value)}
                placeholder="Enter landmark (optional)"
                disabled={isCurrentAddressSameAsPermanent}
                className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

