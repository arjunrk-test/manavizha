import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser, requireAdmin } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

const VALID_REASONS = ['fake_profile', 'harassment', 'inappropriate_content', 'scam', 'already_married', 'other']
const VALID_STATUSES = ['pending', 'reviewed', 'action_taken', 'dismissed']

// Any member can report a profile
export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { reportedUserId, reason, details } = await request.json()

        if (!reportedUserId || !reason) {
            return NextResponse.json({ error: 'reportedUserId and reason are required' }, { status: 400 })
        }
        if (!VALID_REASONS.includes(reason)) {
            return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
        }
        if (reportedUserId === userId) {
            return NextResponse.json({ error: 'You cannot report yourself' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()

        // One open report per reporter/reported pair
        const { data: existing } = await admin
            .from('reports')
            .select('id')
            .eq('reporter_id', userId)
            .eq('reported_user_id', reportedUserId)
            .eq('status', 'pending')
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'You have already reported this profile. Our team is reviewing it.' }, { status: 409 })
        }

        const { error } = await admin.from('reports').insert({
            reporter_id: userId,
            reported_user_id: reportedUserId,
            reason,
            details: typeof details === 'string' ? details.slice(0, 2000) : null,
        })

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

// Admin: list reports for the moderation queue
export async function GET(request: Request) {
    try {
        await requireAdmin(request)
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const admin = await getSupabaseAdmin()
        let query = admin.from('reports').select('*').order('created_at', { ascending: false }).limit(200)
        if (status && VALID_STATUSES.includes(status)) {
            query = query.eq('status', status)
        }
        const { data: reports, error } = await query
        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P01') {
                return NextResponse.json({ reports: [] })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Attach names for both sides
        const userIds = [...new Set((reports || []).flatMap((r: any) => [r.reporter_id, r.reported_user_id]))]
        let nameMap: Record<string, any> = {}
        if (userIds.length > 0) {
            const { data: profiles } = await admin
                .from('personal_details')
                .select('user_id, name, profile_code')
                .in('user_id', userIds)
            profiles?.forEach((p: any) => { nameMap[p.user_id] = p })
        }

        return NextResponse.json({
            reports: (reports || []).map((r: any) => ({
                ...r,
                reporter: nameMap[r.reporter_id] || null,
                reported: nameMap[r.reported_user_id] || null,
            }))
        })
    } catch (error) {
        return authErrorResponse(error)
    }
}

// Admin: resolve / dismiss a report
export async function PATCH(request: Request) {
    try {
        await requireAdmin(request)
        const { reportId, status, adminNote } = await request.json()

        if (!reportId || !status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'reportId and a valid status are required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const update: any = { status }
        if (adminNote !== undefined) update.admin_note = String(adminNote).slice(0, 2000)
        if (status !== 'pending') update.resolved_at = new Date().toISOString()

        const { error } = await admin.from('reports').update(update).eq('id', reportId)
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
