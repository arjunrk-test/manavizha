import { NextResponse } from "next/server"
import { authErrorResponse, requireSuperAdmin } from "@/lib/server/api-auth"
import { isAllowedMasterDataTable } from "@/lib/server/master-data-import"
import { getSupabaseAdmin } from "@/lib/server/supabase-admin-client"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request)

    const { searchParams } = new URL(request.url)
    const table = searchParams.get("table")?.trim() ?? ""

    if (!table || !isAllowedMasterDataTable(table)) {
      return NextResponse.json({ error: "Invalid or missing table parameter" }, { status: 400 })
    }

    const admin = await getSupabaseAdmin()
    const { data, error } = await admin.from(table).select("*").order("value", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return authErrorResponse(err)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireSuperAdmin(request)

    const body = await request.json()
    const { table, id } = body ?? {}

    if (!table || typeof table !== "string" || !isAllowedMasterDataTable(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const admin = await getSupabaseAdmin()
    const { error } = await admin.from(table).delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return authErrorResponse(err)
  }
}
