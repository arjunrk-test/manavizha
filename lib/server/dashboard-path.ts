import { supabaseAdmin } from "@/lib/supabase"

/**
 * Determines the correct dashboard path for a user based on their single role.
 * Role check order: Admin > Referral Partner > Parent > Standard User.
 */
export async function resolveDashboardPath(userId: string): Promise<string> {
  if (!userId) return "/"

  try {
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (!adminError && adminData) {
      return "/admin/dashboard"
    }

    const { data: partnerData, error: partnerError } = await supabaseAdmin
      .from("referral_partners")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (!partnerError && partnerData) {
      return "/referral-partner/dashboard"
    }

    const { data: parentData, error: parentError } = await supabaseAdmin
      .from("parents")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (!parentError && parentData) {
      return "/parent-dashboard"
    }

    return "/dashboard"
  } catch (error) {
    console.error("Error determining user dashboard:", error)
    return "/dashboard"
  }
}
