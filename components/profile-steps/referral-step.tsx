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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4B0082]/5 flex items-center justify-center border border-[#4B0082]/10">
            <span className="text-[#4B0082] font-black text-xs">R1</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4B0082]/30 mb-0.5">Referral</h4>
            <h3 className="text-xl font-light text-gray-900 tracking-tight">Partner Details</h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-black/[0.05] to-transparent ml-4" />
        </div>

        <div className="sds-glass rounded-[2.5rem] p-10 border-indigo-50/50 space-y-8 shadow-[0_20px_50px_-20px_rgba(75,0,130,0.1)]">
          <div className="space-y-3">
            <Label htmlFor="referralPartnerId" className="sds-label ml-1">Referral Partner ID *</Label>
            <div className="relative group">
              <Input
                id="referralPartnerId"
                value={formData.referralPartnerId || ""}
                onChange={handleInputChange}
                placeholder="AB1234CD567"
                maxLength={11}
                className={`sds-input w-full uppercase font-black tracking-widest h-16 px-6 text-lg transition-all duration-500 ${
                  isValidPattern && partnerName ? "border-emerald-200 bg-emerald-50/20" : 
                  partnerError ? "border-rose-200 bg-rose-50/20" : ""
                }`}
              />
              {isLoadingPartner && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4B0082]/20 border-t-[#4B0082]"></div>
                </div>
              )}
            </div>
            
            <div className="px-2">
              {!isValidPattern && formData.referralPartnerId && (
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                  Format: 2 Letters, 4 Numbers, 2 Letters, 3 Numbers
                </p>
              )}
              {isValidPattern && !partnerError && partnerName && (
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ID Verified
                </p>
              )}
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-3">
                Enter the ID of your referral partner
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-indigo-50/50">
            <Label htmlFor="referralPartnerName" className="sds-label ml-1">Partner Name</Label>
            <div className="relative">
              <Input
                id="referralPartnerName"
                value={isLoadingPartner ? "Finding partner..." : partnerError || partnerName}
                readOnly
                disabled
                className={`sds-input w-full h-16 px-6 font-bold transition-all duration-700 ${
                  partnerError ? "text-rose-500 bg-rose-50/10 border-rose-100" : 
                  partnerName ? "text-[#4B0082] bg-indigo-50/10 border-indigo-100" : 
                  "text-gray-300 bg-black/[0.02] border-transparent opacity-40 cursor-not-allowed"
                }`}
                placeholder="Waiting for ID..."
              />
              {partnerName && !isLoadingPartner && !partnerError && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {partnerError && (
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mt-2 px-2 animate-pulse">
                {partnerError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

