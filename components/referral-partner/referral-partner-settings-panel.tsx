"use client"

import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { AlertCircle, CheckCircle2, Copy, Hash, Mail, Settings2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const FIELD_INPUT =
  "rounded-lg border-[#f0ebe3] bg-[#faf8f4] text-[#1F4068] placeholder:text-gray-400 h-10 text-[13px] cursor-not-allowed"
const FIELD_LABEL = "text-[11px] font-medium text-gray-500"

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

interface ReferralPartnerSettingsPanelProps {
  userId: string
  userEmail: string
  initialPartnerId?: string | null
  initialPartnerData: Record<string, unknown>
}

export function ReferralPartnerSettingsPanel({
  userId,
  userEmail,
  initialPartnerId,
  initialPartnerData,
}: ReferralPartnerSettingsPanelProps) {
  const [generatedId, setGeneratedId] = useState(initialPartnerId || "")
  const [partnerData, setPartnerData] = useState(initialPartnerData)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const hasPartnerId = !!partnerData?.partner_id

  const copyPartnerId = async () => {
    if (!generatedId) return
    try {
      await navigator.clipboard.writeText(generatedId)
      toast.success("Partner ID copied")
    } catch {
      toast.error("Could not copy partner ID")
    }
  }

  const generatePartnerId = async () => {
    setError("")
    setSuccess("")
    setIsGenerating(true)

    const name = String(partnerData.name || "").trim()
    const phone = String(partnerData.phone || "").trim()
    const pincode = String(partnerData.pincode || "").trim()
    const companyName = String(partnerData.company_name || "").trim()

    if (!name || name.length < 2) {
      setError("Please save your name in the profile (at least 2 characters required).")
      setIsGenerating(false)
      return
    }

    if (!phone || phone.length < 2) {
      setError("Please save your phone number in the profile.")
      setIsGenerating(false)
      return
    }

    if (!pincode || pincode.length < 2) {
      setError("Please save your pincode in the profile.")
      setIsGenerating(false)
      return
    }

    if (!companyName) {
      setError("Please save your company name in the profile.")
      setIsGenerating(false)
      return
    }

    try {
      const namePart = name.substring(0, 2).toUpperCase()
      const phoneDigits = phone.replace(/^\+91/, "").replace(/\D/g, "")
      const phonePart = phoneDigits.slice(-2)
      const pincodePart = pincode.slice(-2)
      const companyFirst = companyName.charAt(0).toUpperCase()
      const companyLast = companyName.charAt(companyName.length - 1).toUpperCase()

      const { data: allPartners, error: countError } = await supabase
        .from("referral_partners")
        .select("id")
        .not("name", "is", null)
        .not("phone", "is", null)
        .not("pincode", "is", null)
        .not("company_name", "is", null)
        .order("created_at", { ascending: true })

      if (countError) {
        console.error("Error counting partners:", countError)
        setError("Failed to generate ID. Please try again.")
        setIsGenerating(false)
        return
      }

      const currentPartnerIndex =
        allPartners?.findIndex((p) => p.id === partnerData.id) ?? -1
      const serialNumber =
        currentPartnerIndex >= 0 ? currentPartnerIndex + 1 : (allPartners?.length || 0) + 1
      const serialPart = serialNumber.toString().padStart(3, "0")
      const newId = `${namePart}${phonePart}${pincodePart}${companyFirst}${companyLast}${serialPart}`

      const { error: updateError } = await supabase
        .from("referral_partners")
        .update({ partner_id: newId })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error saving partner ID:", updateError)
        setError("Failed to save ID to database. Please try again.")
        setIsGenerating(false)
        return
      }

      setGeneratedId(newId)
      setPartnerData((prev) => ({ ...prev, partner_id: newId }))
      setSuccess("Partner ID generated and saved successfully.")
      toast.success("Partner ID generated")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error generating ID:", err)
      setError("Failed to generate ID. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <ThemedPanel>
      <div className="border-b border-[#f0ebe3]/80 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
          Partner settings
        </p>
        <h1 className="font-display text-xl font-semibold text-[#1F4068] sm:text-2xl">
          Referral partner ID
        </h1>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-gray-500 sm:text-[13px]">
          Generate your unique partner ID once your profile is complete. Share this ID with
          members you refer so their registrations are linked to your account.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6f7f5] bg-[#e6f7f5] px-2.5 py-1 text-[10px] font-semibold text-[#3bb9ac]">
            <Mail className="h-3 w-3" />
            {userEmail}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fce8ef] bg-[#fce8ef] px-2.5 py-1 text-[10px] font-semibold text-[#e87898]">
            <Settings2 className="h-3 w-3" />
            One-time setup
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
          <div className="border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
            <h2 className="font-display text-base font-semibold text-[#1F4068]">
              Partner ID
            </h2>
            <p className="mt-1 text-[11px] text-gray-500">
              Complete your{" "}
              <Link href="/referral-partner/profile" className="font-medium text-[#3bb9ac] hover:underline">
                partner profile
              </Link>{" "}
              before generating an ID.
            </p>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="space-y-1.5">
              <Label htmlFor="partner-id" className={FIELD_LABEL}>
                Your partner ID
              </Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a227]" />
                  <Input
                    id="partner-id"
                    type="text"
                    value={generatedId}
                    readOnly
                    disabled
                    placeholder={
                      hasPartnerId
                        ? "Partner ID has been generated"
                        : "Click Generate ID to create your unique code"
                    }
                    className={`pl-9 ${FIELD_INPUT}`}
                  />
                </div>
                <div className="flex shrink-0 gap-2">
                  {generatedId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyPartnerId}
                      className="h-10 rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
                    >
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copy
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={generatePartnerId}
                    disabled={isGenerating || hasPartnerId}
                    className="h-10 rounded-lg bg-[#1F4068] px-5 text-[13px] font-medium text-white hover:bg-[#1a3558] disabled:opacity-50"
                  >
                    {isGenerating ? "Generating…" : "Generate ID"}
                  </Button>
                </div>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-[#e6f7f5] bg-[#e6f7f5]/60 px-4 py-3 text-[12px] text-[#1F4068]">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3bb9ac]" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#fce8ef] bg-[#fce8ef]/60 px-4 py-3 text-[12px] text-[#1F4068]">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#e87898]" />
                <span>{error}</span>
              </div>
            )}

            {hasPartnerId && (
              <div className="rounded-lg border border-[#fdf6e3] bg-[#fdf6e3]/50 px-4 py-3 text-[12px] leading-relaxed text-[#1F4068]">
                <p className="mb-1 font-medium text-[#c9a227]">Partner ID already generated</p>
                <p className="text-gray-600">
                  If there is a problem with your partner ID, contact us at{" "}
                  <a
                    href="mailto:contact@manavizha.com"
                    className="font-medium text-[#1F4068] underline hover:text-[#3bb9ac]"
                  >
                    contact@manavizha.com
                  </a>{" "}
                  or call{" "}
                  <a href="tel:+918925554449" className="font-medium text-[#1F4068] underline hover:text-[#3bb9ac]">
                    +91 8925554449
                  </a>{" "}
                  /{" "}
                  <a href="tel:+918925554440" className="font-medium text-[#1F4068] underline hover:text-[#3bb9ac]">
                    +91 8925554440
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemedPanel>
  )
}
