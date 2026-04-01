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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Communication Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">01</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Sync Protocol</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Communication Access</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sds-glass rounded-[2.5rem] p-10 border-indigo-50/50 shadow-[0_20px_50px_-20px_rgba(75,0,130,0.05)]">
          <div className="flex flex-col space-y-3">
            <Label htmlFor="phone" className="sds-label ml-1">Intelligence Phone *</Label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4B0082]/40 font-black text-[11px] pointer-events-none z-10 transition-colors group-focus-within:text-[#4B0082] tracking-widest">
                +91
              </div>
              <Input
                id="phone"
                type="tel"
                value={formData.phone.startsWith("+91") ? formData.phone.slice(3) : formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  if (value.length <= 10) {
                    onChange("phone", value ? `+91${value}` : "+91")
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && formData.phone === "+91") {
                    e.preventDefault()
                  }
                }}
                placeholder="Enter phone number"
                maxLength={10}
                required
                className="sds-input pl-16 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="whatsappNumber" className="sds-label">Secure WhatsApp *</Label>
              <div 
                className="flex items-center gap-2 cursor-pointer group/toggle"
                onClick={() => {
                  const newVal = !isWhatsappSameAsPhone;
                  setIsWhatsappSameAsPhone(newVal);
                  if (newVal) onChange("whatsappNumber", formData.phone);
                }}
              >
                <div className={`w-8 h-4 rounded-full transition-all duration-300 relative ${isWhatsappSameAsPhone ? "bg-emerald-500" : "bg-gray-200"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isWhatsappSameAsPhone ? "left-4.5" : "left-0.5"}`} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#4B0082]/40 group-hover/toggle:text-[#4B0082] transition-colors">Sync Logic</span>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4B0082]/40 font-black text-[11px] pointer-events-none z-10 transition-colors group-focus-within:text-[#4B0082] tracking-widest">
                +91
              </div>
              <Input
                id="whatsappNumber"
                type="tel"
                value={formData.whatsappNumber.startsWith("+91") ? formData.whatsappNumber.slice(3) : formData.whatsappNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  if (value.length <= 10) {
                    onChange("whatsappNumber", value ? `+91${value}` : "+91")
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && formData.whatsappNumber === "+91") {
                    e.preventDefault()
                  }
                }}
                placeholder="Enter WhatsApp number"
                maxLength={10}
                required
                disabled={isWhatsappSameAsPhone}
                className={`sds-input pl-16 w-full ${isWhatsappSameAsPhone ? "opacity-40 grayscale cursor-not-allowed border-dashed bg-black/[0.02]" : ""}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">02</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Primary Residence Domain</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Geographic Anchor</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="sds-glass rounded-[2.5rem] p-10 border-indigo-50/50 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="permanentAddressLine1" className="sds-label ml-1">Vector Line 1 *</Label>
              <Input
                id="permanentAddressLine1"
                value={formData.permanentAddressLine1}
                onChange={(e) => onChange("permanentAddressLine1", e.target.value)}
                placeholder="Building number, street name"
                required
                className="sds-input w-full px-6"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="permanentAddressLine2" className="sds-label ml-1">Vector Line 2</Label>
              <Input
                id="permanentAddressLine2"
                value={formData.permanentAddressLine2}
                onChange={(e) => onChange("permanentAddressLine2", e.target.value)}
                placeholder="Apartment, suite, unit (optional)"
                className="sds-input w-full px-6"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="permanentPincode" className="sds-label ml-1">Geo-Code Pincode *</Label>
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
                  placeholder="6 Digit PIN"
                  maxLength={6}
                  required
                  className={`sds-input w-full px-6 font-black tracking-widest ${isLoadingPermanentAddress ? "pr-14" : ""}`}
                />
                {isLoadingPermanentAddress && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#4B0082]/20 border-t-[#4B0082]"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="permanentArea" className="sds-label ml-1">Target Area *</Label>
              <div className="relative" ref={permanentAreaRef}>
                <button
                  type="button"
                  onClick={() => permanentAreas.length > 0 && setIsPermanentAreaOpen(!isPermanentAreaOpen)}
                  disabled={isLoadingPermanentAddress || permanentAreas.length === 0}
                  className="sds-input w-full h-14 px-6 flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                >
                  <span className={`text-[11px] font-bold tracking-widest uppercase ${formData.permanentArea ? "text-gray-900" : "text-gray-300"}`}>
                    {formData.permanentArea || (isLoadingPermanentAddress ? "Scanning..." : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#4B0082]/40 transition-transform duration-500 ${isPermanentAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isPermanentAreaOpen && permanentAreas.length > 0 && (
                  <div className="absolute z-50 w-full mt-3 sds-glass rounded-3xl shadow-2xl border-indigo-50/50 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="overflow-y-auto max-h-[250px] p-2 space-y-1 custom-scrollbar">
                      {permanentAreas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice, "permanent")}
                          className={`w-full px-5 py-3.5 rounded-2xl text-left text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            formData.permanentArea === postOffice.Name 
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
            <div className="space-y-3">
              <Label htmlFor="permanentDistrict" className="sds-label ml-1">District Hub</Label>
              <Input
                id="permanentDistrict"
                value={formData.permanentDistrict}
                readOnly
                className="sds-input w-full px-6 bg-black/[0.02] border-none opacity-40 grayscale cursor-not-allowed font-medium italic"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="permanentState" className="sds-label ml-1">State Jurisdiction</Label>
              <Input
                id="permanentState"
                value={formData.permanentState}
                readOnly
                className="sds-input w-full px-6 bg-black/[0.02] border-none opacity-40 grayscale cursor-not-allowed font-medium italic"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="permanentLandmark" className="sds-label ml-1">Geo Landmark Signature</Label>
              <Input
                id="permanentLandmark"
                value={formData.permanentLandmark}
                onChange={(e) => onChange("permanentLandmark", e.target.value)}
                placeholder="Identify a notable static feature"
                className="sds-input w-full px-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Address Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
              <span className="text-[#4B0082] font-black text-xs">03</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Live Location</h4>
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Temporal Node</h3>
            </div>
          </div>
          
          <div 
            className="group flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              const newVal = !isCurrentAddressSameAsPermanent;
              setIsCurrentAddressSameAsPermanent(newVal);
              if (newVal) {
                onChange("currentAddressLine1", formData.permanentAddressLine1);
                onChange("currentAddressLine2", formData.permanentAddressLine2);
                onChange("currentPincode", formData.permanentPincode);
                onChange("currentArea", formData.permanentArea);
                onChange("currentTaluk", formData.permanentTaluk);
                onChange("currentDistrict", formData.permanentDistrict);
                onChange("currentDivision", formData.permanentDivision);
                onChange("currentRegion", formData.permanentRegion);
                onChange("currentState", formData.permanentState);
                onChange("currentCountry", formData.permanentCountry);
                onChange("currentLandmark", formData.permanentLandmark);
              }
            }}
          >
            <div className={`w-10 h-5 rounded-full transition-all duration-300 relative ${isCurrentAddressSameAsPermanent ? "bg-[#4B0082]" : "bg-gray-200"}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isCurrentAddressSameAsPermanent ? "left-6" : "left-1"}`} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4B0082]/60 group-hover:text-[#4B0082] transition-colors">Mirror Primary</span>
          </div>
        </div>

        <div className={`sds-glass rounded-[2.5rem] p-10 border-indigo-50/50 space-y-8 transition-all duration-700 ${isCurrentAddressSameAsPermanent ? "opacity-30 grayscale pointer-events-none scale-[0.98]" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="currentAddressLine1" className="sds-label ml-1">Vector Line 1 *</Label>
              <Input
                id="currentAddressLine1"
                value={formData.currentAddressLine1}
                onChange={(e) => onChange("currentAddressLine1", e.target.value)}
                placeholder="Current residence street details"
                required
                disabled={isCurrentAddressSameAsPermanent}
                className="sds-input w-full px-6"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="currentPincode" className="sds-label ml-1">Geo-Code Pincode *</Label>
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
                  placeholder="6 Digit PIN"
                  maxLength={6}
                  required
                  disabled={isCurrentAddressSameAsPermanent}
                  className={`sds-input w-full px-6 font-black tracking-widest ${isLoadingCurrentAddress ? "pr-14" : ""}`}
                />
                {isLoadingCurrentAddress && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400/20 border-t-amber-500"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="currentArea" className="sds-label ml-1">Target Area *</Label>
              <div className="relative" ref={currentAreaRef}>
                <button
                  type="button"
                  onClick={() => !isCurrentAddressSameAsPermanent && currentAreas.length > 0 && setIsCurrentAreaOpen(!isCurrentAreaOpen)}
                  disabled={isCurrentAddressSameAsPermanent || isLoadingCurrentAddress || currentAreas.length === 0}
                  className="sds-input w-full h-14 px-6 flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className={`text-[11px] font-bold tracking-widest uppercase ${formData.currentArea ? "text-gray-900" : "text-gray-300"}`}>
                    {formData.currentArea || (isLoadingCurrentAddress ? "Syncing..." : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#4B0082]/40 transition-transform duration-500 ${isCurrentAreaOpen ? "rotate-180" : ""}`} />
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

