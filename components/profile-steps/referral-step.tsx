"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { supabase } from "@/lib/supabase"
import {
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"
import { Handshake } from "lucide-react"

interface ReferralStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
  onPartnerNameChange?: (name: string | null, isValid: boolean) => void
}

export function ReferralStep({ formData, onChange, onPartnerNameChange }: ReferralStepProps) {
  const [partnerName, setPartnerName] = useState<string>("")
  const [isLoadingPartner, setIsLoadingPartner] = useState(false)
  const [partnerError, setPartnerError] = useState<string>("")
  const [lastFetchedId, setLastFetchedId] = useState<string>("")

  // Pattern: (two letters)(four numbers)(two letters)(three numbers)
  // Example: AB1234CD567
  const partnerIdPattern = /^[A-Z]{2}\d{4}[A-Z]{2}\d{3}$/

  // Fetch partner name when ID changes
  useEffect(() => {
    const fetchPartnerName = async () => {
      const partnerId = formData.referralPartnerId || ""
      const trimmedPartnerId = partnerId.trim().toUpperCase()
      
      // Don't refetch if we already have data for this ID and it's still the same
      if (trimmedPartnerId === lastFetchedId && trimmedPartnerId.length === 11 && (partnerName || partnerError)) {
        return
      }
      
      // Clear previous data only if ID changed
      if (trimmedPartnerId !== lastFetchedId) {
        setPartnerName("")
        setPartnerError("")
        onPartnerNameChange?.(null, false)
      }

      // Only fetch if pattern is valid and ID is complete (11 characters)
      if (partnerIdPattern.test(partnerId) && partnerId.length === 11) {
        setIsLoadingPartner(true)
        setLastFetchedId(trimmedPartnerId)
        
        try {
          // Query with explicit error handling
          const { data, error } = await supabase
            .from("referral_partners")
            .select("name, partner_id, id")
            .eq("partner_id", trimmedPartnerId)
            .maybeSingle()

          if (error) {
            console.error("Error fetching partner:", error)
            // Check if it's an RLS error
            if (error.code === "PGRST301" || error.message?.includes("permission") || error.message?.includes("policy")) {
              setPartnerError("Permission error: Unable to access partner data. Please check RLS policies.")
            } else {
              setPartnerError(`Error fetching partner details: ${error.message || "Unknown error"}`)
            }
            onPartnerNameChange?.(null, false)
          } else if (data !== null && data !== undefined) {
            // Partner exists (data is not null/undefined)
            // Partner exists, use name if available, otherwise show a message
            const displayName = data.name || "Partner found (name not available)"
            setPartnerName(displayName)
            setPartnerError("")
            // Mark as valid even if name is null
            onPartnerNameChange?.(data.name || displayName, true)
          } else {
            // No data returned - partner ID doesn't exist
            setPartnerError("This partner id is not valid please get the proper id from the partner")
            setPartnerName("")
            onPartnerNameChange?.(null, false)
          }
        } catch (error: any) {
          console.error("Unexpected error fetching partner:", error)
          setPartnerError(`Error: ${error?.message || "Unknown error occurred"}`)
          onPartnerNameChange?.(null, false)
        } finally {
          setIsLoadingPartner(false)
        }
      } else if (partnerId.length > 0 && partnerId.length < 11) {
        // ID is being typed but not complete yet
        setPartnerName("")
        setPartnerError("")
        setLastFetchedId("")
        onPartnerNameChange?.(null, false)
      } else if (partnerId.length === 0) {
        // ID is cleared
        setPartnerName("")
        setPartnerError("")
        setLastFetchedId("")
        onPartnerNameChange?.(null, false)
      }
    }

    // Add debounce to prevent too many requests
    const timeoutId = setTimeout(() => {
      fetchPartnerName()
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [formData.referralPartnerId]) // Removed onPartnerNameChange from dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Remove any non-alphanumeric characters
    value = value.replace(/[^A-Za-z0-9]/g, "")

    // Convert letters to uppercase
    value = value.toUpperCase()

    // Limit to 11 characters
    if (value.length > 11) {
      value = value.substring(0, 11)
    }

    onChange("referralPartnerId", value)
  }

  const isValidPattern = partnerIdPattern.test(formData.referralPartnerId || "")

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="setup-section-stack">
        <div className={SETUP_SECTION_CARD}>
          <SetupSectionHeader
            icon={Handshake}
            title="Partner details"
            description="Enter your referral partner ID to link your profile"
          />
          <div className="setup-section-card-body space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="referralPartnerId" className="sds-label">Referral Partner ID *</Label>
            <div className="relative group">
              <Input
                id="referralPartnerId"
                value={formData.referralPartnerId || ""}
                onChange={handleInputChange}
                placeholder="e.g., AB1234CD567"
                maxLength={11}
                className={`sds-input w-full uppercase font-semibold tracking-wider ${
                  isValidPattern && partnerName ? "border-[#fce8ef] bg-[#fce8ef]/40" :
                  partnerError ? "border-primary bg-primary" : ""
                }`}
              />
              {isLoadingPartner && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#e87898]/20 border-t-[#e87898]" />
                </div>
              )}
            </div>

            <div>
              {!isValidPattern && formData.referralPartnerId && (
                <p className="text-[11px] font-medium text-amber-600 mt-1.5 flex items-center gap-2">
                  Format: 2 letters, 4 numbers, 2 letters, 3 numbers
                </p>
              )}
              {isValidPattern && !partnerError && partnerName && (
                <p className="text-[11px] font-medium text-[#e87898] mt-1.5 flex items-center gap-2">
                  ID verified
                </p>
              )}
              <p className="text-[11px] text-[#9ca3af] mt-1">
                Enter the ID of your referral partner
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-[#f0ebe3]">
            <Label htmlFor="referralPartnerName" className="sds-label">Partner Name</Label>
            <div className="relative">
              <Input
                id="referralPartnerName"
                value={isLoadingPartner ? "Finding partner..." : partnerError || partnerName}
                readOnly
                disabled
                className={`sds-input w-full font-medium ${
                  partnerError ? "text-primary bg-primary border-primary" :
                  partnerName ? "text-[#1F4068] bg-[#faf8f4] border-[#f0ebe3]" :
                  "text-gray-400 bg-black/[0.02] border-transparent opacity-60 cursor-not-allowed"
                }`}
                placeholder="Waiting for ID..."
              />
              {partnerName && !isLoadingPartner && !partnerError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 rounded-full bg-[#fce8ef]0 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {partnerError && (
              <p className="text-[11px] font-medium text-primary mt-1">{partnerError}</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

