import { supabaseAdmin } from "@/lib/supabase"

export type AdminRole = "super_admin" | "admin" | "editor" | "viewer"

const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
}

export type AdminCaller = {
  userId: string
  role: AdminRole
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AdminAuthError"
  }
}

export async function requireAdminCaller(
  accessToken: string | null | undefined,
  minRole: AdminRole = "viewer"
): Promise<AdminCaller> {
  if (!accessToken?.trim()) {
    throw new AdminAuthError("Unauthorized")
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken)

  if (error || !user) {
    throw new AdminAuthError("Unauthorized")
  }

  const { data: row, error: rowError } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (rowError || !row?.role) {
    throw new AdminAuthError("Forbidden")
  }

  const role = row.role as AdminRole
  if (!(role in ROLE_RANK) || ROLE_RANK[role] < ROLE_RANK[minRole]) {
    throw new AdminAuthError("Forbidden")
  }

  return { userId: user.id, role }
}

export function authErrorResult(error: unknown): { success: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { success: false, error: error.message }
  }
  return { success: false, error: "Unauthorized" }
}
