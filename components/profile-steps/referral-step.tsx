"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"
import { supabase } from "@/lib/supabase"

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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="referralPartnerId">Referral Partner ID *</Label>
          <Input
            id="referralPartnerId"
            value={formData.referralPartnerId || ""}
            onChange={handleInputChange}
            placeholder="AB1234CD567"
            maxLength={11}
          />
          {!isValidPattern && formData.referralPartnerId && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Format: 2 letters, 4 numbers, 2 letters, 3 numbers (e.g., AB1234CD567)
            </p>
          )}
          {isValidPattern && !partnerError && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Valid format
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If someone referred you to this platform, enter their partner ID here.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralPartnerName">Referral Partner Name</Label>
          <Input
            id="referralPartnerName"
            value={isLoadingPartner ? "Loading..." : partnerError || partnerName}
            readOnly
            disabled
            className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${
              partnerError ? "border-red-500 text-red-600" : partnerName ? "border-green-500 text-green-600" : ""
            }`}
            placeholder="Partner name will appear here"
          />
          {isLoadingPartner && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fetching partner details...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

