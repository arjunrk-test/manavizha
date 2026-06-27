import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { sanitizeUserSettingsUpdates } from '@/lib/server/user-settings-validation'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()

        const { data, error } = await admin.from('user_settings').select('*').eq('user_id', userId).maybeSingle()
        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P01') {
                return NextResponse.json({})
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || {})
    } catch (error) {
        return authErrorResponse(error)
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { updates } = await request.json()
        const parsed = sanitizeUserSettingsUpdates(updates)
        if (!parsed.ok) {
            return NextResponse.json({ error: parsed.error }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin.from('user_settings').upsert({
            user_id: userId,
            ...parsed.data,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}
