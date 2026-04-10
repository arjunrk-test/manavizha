import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get("userIds")?.split(",").filter(Boolean)

    if (!userIds || userIds.length === 0) {
        return NextResponse.json([])
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("user_settings")
            .select("*")
            .in("user_id", userIds)

        if (error) {
            console.error("[premium-status] Error fetching user_settings:", error)
            // Even if user_settings fails, we can try to return an empty array or 200
            return NextResponse.json([])
        }

        return NextResponse.json(data || [])
    } catch (err) {
        console.error("[premium-status] CRITICAL Error:", err)
        return NextResponse.json([])
    }
}
