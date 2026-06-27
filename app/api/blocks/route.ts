import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()

        const { data, error } = await admin.from('blocked_profiles').select('blocked_user_id').eq('user_id', userId)

        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P01') {
                return NextResponse.json({ blockedIds: [] })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ blockedIds: (data || []).map(r => r.blocked_user_id) })
    } catch (error) {
        return authErrorResponse(error)
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { targetUserId } = await request.json()
        if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 })

        const admin = await getSupabaseAdmin()
        const { error } = await admin.from('blocked_profiles').insert({
            user_id: userId,
            blocked_user_id: targetUserId
        })

        if (error && error.code !== '23505') return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { targetUserId } = await request.json()
        if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 })

        const admin = await getSupabaseAdmin()
        const { error } = await admin.from('blocked_profiles').delete().eq('user_id', userId).eq('blocked_user_id', targetUserId)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}
