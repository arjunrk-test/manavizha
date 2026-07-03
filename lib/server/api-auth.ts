import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export type AuthenticatedUser = {
  userId: string
  accessToken: string
}

export class ApiAuthError extends Error {
  status: 401 | 403

  constructor(status: 401 | 403, message: string) {
    super(message)
    this.name = "ApiAuthError"
    this.status = status
  }
}

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return authHeader.slice(7).trim() || null
}

export async function requireAuthenticatedUser(request: Request): Promise<AuthenticatedUser> {
  const accessToken = getBearerToken(request)
  if (!accessToken) {
    throw new ApiAuthError(401, "Unauthorized")
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken)

  if (error || !user) {
    throw new ApiAuthError(401, "Unauthorized")
  }

  return { userId: user.id, accessToken }
}

export async function requireAdmin(request: Request): Promise<AuthenticatedUser & { role: string }> {
  const auth = await requireAuthenticatedUser(request)
  const { data: row, error } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("user_id", auth.userId)
    .maybeSingle()

  if (error || !row) {
    throw new ApiAuthError(403, "Forbidden")
  }

  return { ...auth, role: row.role as string }
}

export async function requireSuperAdmin(request: Request): Promise<AuthenticatedUser> {
  const auth = await requireAuthenticatedUser(request)
  const { data: row, error } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("user_id", auth.userId)
    .maybeSingle()

  if (error || row?.role !== "super_admin") {
    throw new ApiAuthError(403, "Forbidden")
  }

  return auth
}

export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error("[api] Unhandled route error:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
