import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { authErrorResponse, requireAuthenticatedUser } from "@/lib/server/api-auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        await requireAuthenticatedUser(request)

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
            console.error("[premium-status] Error fetching user_settings:", error)
            return NextResponse.json([])
        }

        return NextResponse.json(data || [])
    } catch (error) {
        return authErrorResponse(error)
    }
}
