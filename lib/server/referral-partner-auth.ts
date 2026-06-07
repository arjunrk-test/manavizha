import { supabaseAdmin } from "@/lib/supabase"

export type ReferralPartnerCaller = {
  userId: string
  partnerId: string
  canEditProfile: boolean
}

export class ReferralPartnerAuthError extends Error {
  status: 401 | 403

  constructor(status: 401 | 403, message: string) {
    super(message)
    this.name = "ReferralPartnerAuthError"
    this.status = status
  }
}

export async function requireReferralPartnerCaller(
  accessToken: string | null | undefined
): Promise<ReferralPartnerCaller> {
  if (!accessToken?.trim()) {
    throw new ReferralPartnerAuthError(401, "Unauthorized")
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken)

  if (error || !user) {
    throw new ReferralPartnerAuthError(401, "Unauthorized")
  }

  const { data: partner, error: partnerError } = await supabaseAdmin
    .from("referral_partners")
    .select("partner_id, can_edit_profile")
    .eq("user_id", user.id)
    .maybeSingle()

  if (partnerError || !partner?.partner_id) {
    throw new ReferralPartnerAuthError(403, "Forbidden")
  }

  return {
    userId: user.id,
    partnerId: partner.partner_id,
    canEditProfile: !!partner.can_edit_profile,
  }
}

export async function assertPartnerOwnsReferralUser(
  partnerId: string,
  targetUserId: string
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("referral_details")
    .select("user_id")
    .eq("user_id", targetUserId)
    .eq("referral_partner_id", partnerId)
    .maybeSingle()

  if (error) {
    throw new ReferralPartnerAuthError(403, "Forbidden")
  }

  if (!data) {
    throw new ReferralPartnerAuthError(403, "Forbidden")
  }
}

export function referralPartnerAuthErrorResult(error: unknown): { success: false; error: string } {
  if (error instanceof ReferralPartnerAuthError) {
    return { success: false, error: error.message }
  }
  return { success: false, error: "Unauthorized" }
}
