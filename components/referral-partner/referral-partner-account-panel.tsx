"use client"

import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { ReferralPartnerProfileForm } from "@/components/referral-partner-profile-form"
import { Building2, Mail, UserRound } from "lucide-react"

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

interface ReferralPartnerAccountPanelProps {
  userId: string
  userEmail: string
  partnerId?: string | null
}

export function ReferralPartnerAccountPanel({
  userId,
  userEmail,
  partnerId,
}: ReferralPartnerAccountPanelProps) {
  return (
    <ThemedPanel>
      <div className="border-b border-[#f0ebe3]/80 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
          Partner account
        </p>
        <h1 className="font-display text-xl font-semibold text-[#1F4068] sm:text-2xl">
          Your profile &amp; details
        </h1>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-gray-500 sm:text-[13px]">
          Keep your contact, business, address, bank, and verification documents up to date
          for payouts and partner verification.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {partnerId && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fdf6e3] bg-[#fdf6e3] px-2.5 py-1 text-[10px] font-semibold text-[#c9a227]">
              <Building2 className="h-3 w-3" />
              {partnerId}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6f7f5] bg-[#e6f7f5] px-2.5 py-1 text-[10px] font-semibold text-[#3bb9ac]">
            <Mail className="h-3 w-3" />
            {userEmail}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fce8ef] bg-[#fce8ef] px-2.5 py-1 text-[10px] font-semibold text-[#e87898]">
            <UserRound className="h-3 w-3" />
            Account settings
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <ReferralPartnerProfileForm userId={userId} userEmail={userEmail} />
      </div>
    </ThemedPanel>
  )
}
