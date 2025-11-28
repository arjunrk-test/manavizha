"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { ChevronDown } from "lucide-react"

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]

interface ContactDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function ContactDetailsStep({ formData, onChange }: ContactDetailsStepProps) {
  const [isWhatsappSameAsPhone, setIsWhatsappSameAsPhone] = useState(false)
  const [isCurrentAddressSameAsPermanent, setIsCurrentAddressSameAsPermanent] = useState(false)
  const [isPermanentStateOpen, setIsPermanentStateOpen] = useState(false)
  const [isCurrentStateOpen, setIsCurrentStateOpen] = useState(false)
  const permanentStateRef = useRef<HTMLDivElement>(null)
  const currentStateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (permanentStateRef.current && !permanentStateRef.current.contains(event.target as Node)) {
        setIsPermanentStateOpen(false)
      }
      if (currentStateRef.current && !currentStateRef.current.contains(event.target as Node)) {
        setIsCurrentStateOpen(false)
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
      onChange("currentArea", formData.permanentArea)
      onChange("currentCity", formData.permanentCity)
      onChange("currentPincode", formData.permanentPincode)
      onChange("currentState", formData.permanentState)
      onChange("currentLandmark", formData.permanentLandmark)
    }
  }, [
    formData.permanentAddressLine1,
    formData.permanentAddressLine2,
    formData.permanentArea,
    formData.permanentCity,
    formData.permanentPincode,
    formData.permanentState,
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
              <Label htmlFor="permanentArea">Area *</Label>
              <Input
                id="permanentArea"
                value={formData.permanentArea}
                onChange={(e) => onChange("permanentArea", e.target.value)}
                placeholder="Enter area"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentCity">City *</Label>
              <Input
                id="permanentCity"
                value={formData.permanentCity}
                onChange={(e) => onChange("permanentCity", e.target.value)}
                placeholder="Enter city"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentPincode">Pincode *</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentState">State *</Label>
              <div className="relative" ref={permanentStateRef}>
                <button
                  type="button"
                  onClick={() => setIsPermanentStateOpen(!isPermanentStateOpen)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem]"
                >
                  <span className={formData.permanentState ? "" : "text-gray-500"}>
                    {formData.permanentState || "Select State"}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isPermanentStateOpen ? "rotate-180" : ""}`} />
                </button>
                {isPermanentStateOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-y-auto state-dropdown-scroll" style={{ maxHeight: '250px' }}>
                      {indianStates.map((state) => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => {
                            onChange("permanentState", state)
                            setIsPermanentStateOpen(false)
                          }}
                          className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors ${
                            formData.permanentState === state ? "bg-gray-100 dark:bg-gray-800" : ""
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
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
                    onChange("currentArea", formData.permanentArea)
                    onChange("currentCity", formData.permanentCity)
                    onChange("currentPincode", formData.permanentPincode)
                    onChange("currentState", formData.permanentState)
                    onChange("currentLandmark", formData.permanentLandmark)
                  } else {
                    onChange("currentAddressLine1", "")
                    onChange("currentAddressLine2", "")
                    onChange("currentArea", "")
                    onChange("currentCity", "")
                    onChange("currentPincode", "")
                    onChange("currentState", "")
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
              <Label htmlFor="currentArea">Area *</Label>
              <Input
                id="currentArea"
                value={formData.currentArea}
                onChange={(e) => onChange("currentArea", e.target.value)}
                placeholder="Enter area"
                required
                disabled={isCurrentAddressSameAsPermanent}
                className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentCity">City *</Label>
              <Input
                id="currentCity"
                value={formData.currentCity}
                onChange={(e) => onChange("currentCity", e.target.value)}
                placeholder="Enter city"
                required
                disabled={isCurrentAddressSameAsPermanent}
                className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPincode">Pincode *</Label>
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
                className={isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentState">State *</Label>
              <div className="relative" ref={currentStateRef}>
                <button
                  type="button"
                  onClick={() => !isCurrentAddressSameAsPermanent && setIsCurrentStateOpen(!isCurrentStateOpen)}
                  disabled={isCurrentAddressSameAsPermanent}
                  className={`w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem] ${
                    isCurrentAddressSameAsPermanent ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
                  }`}
                >
                  <span className={formData.currentState ? "" : "text-gray-500"}>
                    {formData.currentState || "Select State"}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCurrentStateOpen ? "rotate-180" : ""}`} />
                </button>
                {isCurrentStateOpen && !isCurrentAddressSameAsPermanent && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="max-h-[250px] overflow-y-auto state-dropdown-scroll">
                      {indianStates.map((state) => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => {
                            onChange("currentState", state)
                            setIsCurrentStateOpen(false)
                          }}
                          className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors ${
                            formData.currentState === state ? "bg-gray-100 dark:bg-gray-800" : ""
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
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

