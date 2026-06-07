"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import {
  SETUP_SECTION_BODY,
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"
import { ChevronDown, Home, MapPin, Phone } from "lucide-react"
import {
  buildPhoneNumber,
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  getMaxNationalDigits,
  parsePhoneWithCountryCode,
} from "@/lib/country-codes"

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
      onChange("whatsappNumber", formData.phone || DEFAULT_COUNTRY_CODE)
    }
  }, [formData.phone, isWhatsappSameAsPhone])

  const phoneParsed = parsePhoneWithCountryCode(formData.phone || DEFAULT_COUNTRY_CODE)
  const whatsappParsed = parsePhoneWithCountryCode(
    isWhatsappSameAsPhone
      ? formData.phone || DEFAULT_COUNTRY_CODE
      : formData.whatsappNumber || DEFAULT_COUNTRY_CODE
  )

  const handlePhoneCountryChange = (countryCode: string) => {
    onChange("phone", buildPhoneNumber(countryCode, phoneParsed.nationalNumber))
  }

  const handlePhoneNationalChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "")
    const maxDigits = getMaxNationalDigits(phoneParsed.countryCode)
    if (digits.length <= maxDigits) {
      onChange("phone", buildPhoneNumber(phoneParsed.countryCode, digits))
    }
  }

  const handleWhatsappCountryChange = (countryCode: string) => {
    onChange("whatsappNumber", buildPhoneNumber(countryCode, whatsappParsed.nationalNumber))
  }

  const handleWhatsappNationalChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "")
    const maxDigits = getMaxNationalDigits(whatsappParsed.countryCode)
    if (digits.length <= maxDigits) {
      onChange("whatsappNumber", buildPhoneNumber(whatsappParsed.countryCode, digits))
    }
  }

  const countryCodeSelectClass =
    "country-code-select sds-input shrink-0 cursor-pointer text-[#1F4068]"

  const phoneInputRowClass = "flex items-stretch gap-2 min-w-0"

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Phone}
            title="Phone & WhatsApp"
            description="Contact numbers for communication"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="sds-label">Phone Number *</Label>
              <div className={phoneInputRowClass}>
                <select
                  id="phoneCountryCode"
                  value={phoneParsed.countryCode}
                  onChange={(e) => handlePhoneCountryChange(e.target.value)}
                  className={countryCodeSelectClass}
                  aria-label="Phone country code"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneParsed.nationalNumber}
                  onChange={(e) => handlePhoneNationalChange(e.target.value)}
                  placeholder="e.g., 9876543210"
                  maxLength={getMaxNationalDigits(phoneParsed.countryCode)}
                  required
                  className="sds-input flex-1 min-w-0 w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="whatsappNumber" className="sds-label mb-0">WhatsApp Number *</Label>
                <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none">
                  <input
                    type="checkbox"
                    checked={isWhatsappSameAsPhone}
                    onChange={(e) => {
                      const newVal = e.target.checked
                      setIsWhatsappSameAsPhone(newVal)
                      if (newVal) onChange("whatsappNumber", formData.phone || DEFAULT_COUNTRY_CODE)
                    }}
                    className="h-3.5 w-3.5 rounded border-[#f0ebe3] text-[#e87898] focus:ring-2 focus:ring-[#e87898]/20"
                  />
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[#6b7280]">
                    Same as Phone
                  </span>
                </label>
              </div>
              <div className={phoneInputRowClass}>
                <select
                  id="whatsappCountryCode"
                  value={whatsappParsed.countryCode}
                  onChange={(e) => handleWhatsappCountryChange(e.target.value)}
                  disabled={isWhatsappSameAsPhone}
                  className={`${countryCodeSelectClass} ${isWhatsappSameAsPhone ? "opacity-40 cursor-not-allowed" : ""}`}
                  aria-label="WhatsApp country code"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={whatsappParsed.nationalNumber}
                  onChange={(e) => handleWhatsappNationalChange(e.target.value)}
                  placeholder="e.g., 9876543210"
                  maxLength={getMaxNationalDigits(whatsappParsed.countryCode)}
                  required
                  disabled={isWhatsappSameAsPhone}
                  className={`sds-input flex-1 min-w-0 w-full ${isWhatsappSameAsPhone ? "opacity-40 cursor-not-allowed border-dashed bg-black/[0.02]" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Home}
            title="Permanent address"
            description="Where you live permanently"
          />
          <div className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2`}>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="permanentAddressLine1" className="sds-label">Address Line 1 *</Label>
              <Input
                id="permanentAddressLine1"
                value={formData.permanentAddressLine1}
                onChange={(e) => onChange("permanentAddressLine1", e.target.value)}
                placeholder="e.g., Flat No. 402, Sunshine Apartments"
                required
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="permanentAddressLine2" className="sds-label">Address Line 2</Label>
              <Input
                id="permanentAddressLine2"
                value={formData.permanentAddressLine2}
                onChange={(e) => onChange("permanentAddressLine2", e.target.value)}
                placeholder="e.g., 123, Green Street, Apartment 4B"
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="permanentPincode" className="sds-label">Pincode *</Label>
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
                  placeholder="e.g., 600017"
                  maxLength={6}
                  required
                  className={`sds-input w-full font-black tracking-widest ${isLoadingPermanentAddress ? "pr-10" : ""}`}
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#e87898]/20 border-t-[#e87898]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="permanentArea" className="sds-label">Area / Colony *</Label>
              <div className="relative" ref={permanentAreaRef}>
                <button
                  type="button"
                  onClick={() => permanentAreas.length > 0 && setIsPermanentAreaOpen(!isPermanentAreaOpen)}
                  disabled={isLoadingPermanentAddress || permanentAreas.length === 0}
                  className="sds-input w-full flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                >
                  <span className={`text-[11px] font-bold tracking-widest uppercase ${formData.permanentArea ? "text-gray-900" : "text-gray-300"}`}>
                    {formData.permanentArea || (isLoadingPermanentAddress ? "Scanning..." : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#e87898]/40 transition-transform duration-500 ${isPermanentAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isPermanentAreaOpen && permanentAreas.length > 0 && (
                  <div className="absolute z-50 w-full mt-3 sds-glass rounded-3xl shadow-2xl border-[#f0ebe3] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="overflow-y-auto max-h-[250px] p-2 space-y-1 custom-scrollbar">
                      {permanentAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice, "permanent")}
                          className={`w-full px-5 py-3.5 rounded-2xl text-left text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            formData.permanentArea === postOffice.Name
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
            <div className="space-y-1.5">
              <Label htmlFor="permanentDistrict" className="sds-label">District</Label>
              <Input
                id="permanentDistrict"
                value={formData.permanentDistrict}
                readOnly
                className="sds-input w-full bg-black/[0.02] border-none opacity-40 grayscale cursor-not-allowed font-medium italic"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="permanentState" className="sds-label">State</Label>
              <Input
                id="permanentState"
                value={formData.permanentState}
                readOnly
                className="sds-input w-full bg-black/[0.02] border-none opacity-40 grayscale cursor-not-allowed font-medium italic"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="permanentLandmark" className="sds-label">Landmark</Label>
              <Input
                id="permanentLandmark"
                value={formData.permanentLandmark}
                onChange={(e) => onChange("permanentLandmark", e.target.value)}
                placeholder="e.g., Near City Hospital / Opp. Post Office"
                className="sds-input w-full"
              />
            </div>
          </div>
        </div>

        <div className={SETUP_SECTION_CARD}>
          <div className="border-b border-[#f0ebe3]/80 px-3.5 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[#1F4068] flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fce8ef]">
                    <MapPin className="h-3.5 w-3.5 text-[#e87898]" />
                  </span>
                  Current location
                </h3>
                <p className="text-[12px] text-[#6b7280] mt-1 ml-[38px]">Where you live now</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={isCurrentAddressSameAsPermanent}
                  onChange={(e) => {
                    const newVal = e.target.checked
                    setIsCurrentAddressSameAsPermanent(newVal)
                    if (newVal) {
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
                    }
                  }}
                  className="h-3.5 w-3.5 rounded border-[#f0ebe3] text-[#e87898] focus:ring-2 focus:ring-[#e87898]/20"
                />
                <span className="text-[10px] font-medium uppercase tracking-wide text-[#6b7280]">
                  Same as Permanent
                </span>
              </label>
            </div>
          </div>
          <div
            className={`${SETUP_SECTION_BODY} grid-cols-1 md:grid-cols-2 transition-all duration-700 ${isCurrentAddressSameAsPermanent ? "opacity-30 grayscale pointer-events-none scale-[0.98]" : ""}`}
          >
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="currentAddressLine1" className="sds-label">Address Line 1 *</Label>
              <Input
                id="currentAddressLine1"
                value={formData.currentAddressLine1}
                onChange={(e) => onChange("currentAddressLine1", e.target.value)}
                placeholder="e.g., Plot No. 12, Rose Villa"
                required
                disabled={isCurrentAddressSameAsPermanent}
                className="sds-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentPincode" className="sds-label">Pincode *</Label>
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
                  placeholder="e.g., 600028"
                  maxLength={6}
                  required
                  disabled={isCurrentAddressSameAsPermanent}
                  className={`sds-input w-full font-black tracking-widest ${isLoadingCurrentAddress ? "pr-10" : ""}`}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400/20 border-t-amber-500"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentArea" className="sds-label">Area / Colony *</Label>
              <div className="relative" ref={currentAreaRef}>
                <button
                  type="button"
                  onClick={() => !isCurrentAddressSameAsPermanent && currentAreas.length > 0 && setIsCurrentAreaOpen(!isCurrentAreaOpen)}
                  disabled={isCurrentAddressSameAsPermanent || isLoadingCurrentAddress || currentAreas.length === 0}
                  className="sds-input w-full flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className={`text-[11px] font-bold tracking-widest uppercase ${formData.currentArea ? "text-gray-900" : "text-gray-300"}`}>
                    {formData.currentArea || (isLoadingCurrentAddress ? "Syncing..." : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#e87898]/40 transition-transform duration-500 ${isCurrentAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isCurrentAreaOpen && !isCurrentAddressSameAsPermanent && currentAreas.length > 0 && (
                  <div className="absolute z-50 w-full mt-3 sds-glass rounded-3xl shadow-2xl border-amber-50/50 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="overflow-y-auto max-h-[250px] p-2 space-y-1 custom-scrollbar">
                      {currentAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice, "current")}
                          className={`w-full px-5 py-3.5 rounded-2xl text-left text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            formData.currentArea === postOffice.Name
                              ? "bg-amber-500 text-white shadow-lg shadow-amber-900/20"
                              : "hover:bg-amber-50/50 text-gray-500 hover:text-amber-700"
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
          </div>
        </div>
      </div>
    </div>
  )
}

