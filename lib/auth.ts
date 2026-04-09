import { supabase } from "./supabase"

/**
 * Determines the correct dashboard path for a user based on their single role.
 * Role check order: Admin > Referral Partner > Parent > Standard User.
 */
export async function getUserDashboard(userId: string): Promise<string> {
  if (!userId) return "/"

  try {
    // 1. Check if Admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (!adminError && adminData) {
      return "/admin/dashboard"
    }

    // 2. Check if Referral Partner
    const { data: partnerData, error: partnerError } = await supabase
      .from("referral_partners")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (!partnerError && partnerData) {
      return "/referral-partner/dashboard"
    }

    // 3. Check if Parent
    const { data: parentData, error: parentError } = await supabase
      .from("parents")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (!parentError && parentData) {
      return "/parent-dashboard"
    }

    // Default to standard user dashboard
    return "/dashboard"
  } catch (error) {
    console.error("Error determining user dashboard:", error)
    return "/dashboard"
  }
}
