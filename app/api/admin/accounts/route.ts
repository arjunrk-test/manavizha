/**
 * Mobile admin app calls: POST /api/admin/accounts (Bearer Supabase JWT).
 * Must be deployed with the site — if Flutter gets 404, redeploy this Next.js project.
 */
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import {
  createAdminAccount,
  createReferralPartnerAccount,
  revokeAdminAccess,
  updateAdminRole,
  type AdminRole,
} from "@/app/actions/admin"

export const runtime = "nodejs"

async function verifyCallerIsAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  const jwt = authHeader.slice(7)
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(jwt)
  if (error || !user) return null
  const { data: row } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()
  if (!row) return null
  return { userId: user.id, role: row.role as string }
}

export async function POST(request: NextRequest) {
  const admin = await verifyCallerIsAdmin(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 })
  }

  const action = body.action as string | undefined
  if (!action) {
    return NextResponse.json({ success: false, error: "Missing action" }, { status: 400 })
  }

  try {
    switch (action) {
      case "createAdmin": {
        const name = String(body.name ?? "").trim()
        const email = String(body.email ?? "").trim()
        const phone = String(body.phone ?? "").trim()
        const password = String(body.password ?? "")
        const role = (String(body.role ?? "editor") as AdminRole) || "editor"
        if (!name || !email || !password) {
          return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 })
        }
        const res = await createAdminAccount({ name, email, phone, role, password })
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error ?? "Failed" }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }
      case "updateAdminRole": {
        const userId = String(body.userId ?? "").trim()
        const newRole = String(body.role ?? "editor") as AdminRole
        if (!userId) {
          return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
        }
        const res = await updateAdminRole(userId, newRole)
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error ?? "Failed" }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }
      case "revokeAdmin": {
        const userId = String(body.userId ?? "").trim()
        if (!userId) {
          return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
        }
        const res = await revokeAdminAccess(userId)
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error ?? "Failed" }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }
      case "createPartner": {
        const name = String(body.name ?? "").trim()
        const email = String(body.email ?? "").trim()
        const phone = String(body.phone ?? "").trim()
        const password = String(body.password ?? "")
        if (!name || !email || !password) {
          return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 })
        }
        const res = await createReferralPartnerAccount({ name, email, phone, password })
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error ?? "Failed" }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error"
    console.error("admin accounts API:", e)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
