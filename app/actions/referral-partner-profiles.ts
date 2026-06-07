"use server"

import {
  ReferralPartnerAuthError,
  assertPartnerOwnsReferralUser,
  referralPartnerAuthErrorResult,
  requireReferralPartnerCaller,
} from "@/lib/server/referral-partner-auth"
import {
  REFERRAL_PARTNER_EDITABLE_TABLES,
  fetchReferralPartnerProfileBundle,
} from "@/lib/server/referral-partner-profiles"
import { supabaseAdmin } from "@/lib/supabase"

export async function loadReferralPartnerProfile(accessToken: string, targetUserId: string) {
  try {
    const caller = await requireReferralPartnerCaller(accessToken)
    await assertPartnerOwnsReferralUser(caller.partnerId, targetUserId)

    const profile = await fetchReferralPartnerProfileBundle(targetUserId)

    return {
      success: true as const,
      canEdit: caller.canEditProfile,
      ...profile,
    }
  } catch (error) {
    return referralPartnerAuthErrorResult(error)
  }
}

export async function updateReferralPartnerProfileSection(
  accessToken: string,
  targetUserId: string,
  table: string,
  data: Record<string, unknown>
) {
  try {
    const caller = await requireReferralPartnerCaller(accessToken)
    await assertPartnerOwnsReferralUser(caller.partnerId, targetUserId)

    if (!caller.canEditProfile) {
      throw new ReferralPartnerAuthError(403, "Profile editing is not enabled for your account")
    }

    if (!REFERRAL_PARTNER_EDITABLE_TABLES.has(table)) {
      throw new ReferralPartnerAuthError(403, "Forbidden")
    }

    const { id, user_id, created_at, updated_at, ...rest } = data
    const fields = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== null && value !== undefined && value !== "")
    )

    const { error } = await supabaseAdmin.from(table).update(fields).eq("user_id", targetUserId)
    if (error) {
      return { success: false as const, error: error.message }
    }

    return { success: true as const }
  } catch (error) {
    return referralPartnerAuthErrorResult(error)
  }
}

export async function updateReferralPartnerProfileUser(
  accessToken: string,
  targetUserId: string,
  data: { name?: string; phone?: string | null }
) {
  try {
    const caller = await requireReferralPartnerCaller(accessToken)
    await assertPartnerOwnsReferralUser(caller.partnerId, targetUserId)

    if (!caller.canEditProfile) {
      throw new ReferralPartnerAuthError(403, "Profile editing is not enabled for your account")
    }

    const updates: Record<string, string | null> = {}
    if (typeof data.name === "string") updates.name = data.name
    if (data.phone === null || typeof data.phone === "string") updates.phone = data.phone ?? null

    if (Object.keys(updates).length === 0) {
      return { success: false as const, error: "No valid fields to update" }
    }

    const { error } = await supabaseAdmin.from("users").update(updates).eq("id", targetUserId)
    if (error) {
      return { success: false as const, error: error.message }
    }

    return { success: true as const }
  } catch (error) {
    return referralPartnerAuthErrorResult(error)
  }
}
