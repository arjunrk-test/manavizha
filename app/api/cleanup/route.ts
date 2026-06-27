import { NextRequest, NextResponse } from "next/server"
import { executeTestUserCleanup } from "@/lib/server/admin-cleanup"

export const runtime = "nodejs"

const CLEANUP_SECRET = process.env.CLEANUP_CRON_SECRET

/**
 * Dev/test cleanup hook for hardcoded test auth users only.
 * Disabled unless CLEANUP_CRON_SECRET is set. POST + x-cleanup-secret required.
 */
export async function POST(request: NextRequest) {
  if (!CLEANUP_SECRET) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  }

  const providedSecret = request.headers.get("x-cleanup-secret")
  if (!providedSecret || providedSecret !== CLEANUP_SECRET) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const result = await executeTestUserCleanup()
  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 })
}
