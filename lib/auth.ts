import { supabase } from "./supabase"

type AuthRedirectRouter = {
  push: (href: string) => void
}

/** Clears loading state before redirecting away from a protected page. */
export function finishAuthRedirect(
  router: AuthRedirectRouter,
  path: string,
  setLoading: (value: boolean) => void
): void {
  setLoading(false)
  router.push(path)
}

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

export async function getAdminRole(userId: string): Promise<string | null> {
  if (!userId) return null

  try {
    const { data, error } = await supabase
      .from("admins")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle()

    if (error || !data) return null
    return data.role ?? null
  } catch (error) {
    console.error("Error fetching admin role:", error)
    return null
  }
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getAdminRole(userId)
  return role === "super_admin"
}

export async function canAccessAdminEmail(userId: string): Promise<boolean> {
  const role = await getAdminRole(userId)
  return role === "super_admin" || role === "admin"
}

/** Returns the current Supabase access token for authenticated server action calls. */
export async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
