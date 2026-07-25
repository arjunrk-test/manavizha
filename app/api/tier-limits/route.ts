import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser, requireAdmin } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

const DEFAULTS = [
    { tier: 'free', contact_view_limit: 0 },
    { tier: 'premium', contact_view_limit: 25 },
    { tier: 'prime_gold', contact_view_limit: 100 },
]

// Any authenticated user can read the limits (used to show remaining views)
export async function GET(request: Request) {
    try {
        await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()
        const { data, error } = await admin.from('tier_limits').select('*').order('contact_view_limit')

        if (error || !data || data.length === 0) {
            return NextResponse.json({ limits: DEFAULTS })
        }
        return NextResponse.json({ limits: data })
    } catch (error) {
        return authErrorResponse(error)
    }
}

// Super admin sets the limit for a tier
export async function PATCH(request: Request) {
    try {
        const { role } = await requireAdmin(request)
        if (role !== 'super_admin') {
            return NextResponse.json({ error: 'Only super admins can change tier limits' }, { status: 403 })
        }

        const { tier, limit } = await request.json()
        if (!['free', 'premium', 'prime_gold'].includes(tier) || typeof limit !== 'number' || limit < 0) {
            return NextResponse.json({ error: 'Valid tier and non-negative limit are required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('tier_limits')
            .upsert({ tier, contact_view_limit: Math.floor(limit), updated_at: new Date().toISOString() }, { onConflict: 'tier' })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}
