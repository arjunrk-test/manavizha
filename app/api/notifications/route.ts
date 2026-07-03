import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()

        const { data, error } = await admin
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(30)

        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P01') {
                return NextResponse.json({ notifications: [], unreadCount: 0 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const { count } = await admin
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        return NextResponse.json({ notifications: data || [], unreadCount: count || 0 })
    } catch (error) {
        return authErrorResponse(error)
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const body = await request.json().catch(() => ({}))
        const admin = await getSupabaseAdmin()

        let query = admin
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)

        if (body.notificationId) {
            query = query.eq('id', body.notificationId)
        } else {
            query = query.eq('is_read', false)
        }

        const { error } = await query
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        return authErrorResponse(error)
    }
}
