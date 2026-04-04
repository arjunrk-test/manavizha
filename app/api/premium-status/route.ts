import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get("userIds")?.split(",").filter(Boolean)

    if (!userIds || userIds.length === 0) {
        return NextResponse.json([])
    }

    const { data, error } = await supabaseAdmin
        .from("user_settings")
        .select("user_id, is_premium, premium_plan, premium_expires_at")
        .in("user_id", userIds)

    if (error) {
        console.error("Error fetching premium status:", error)
        return NextResponse.json([])
    }

    return NextResponse.json(data || [])
}
