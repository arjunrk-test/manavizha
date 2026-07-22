import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()

        const [{ data: myShortlistData, error: e1 }, { data: shortlistedMeData, error: e2 }] = await Promise.all([
            admin.from('shortlists').select('shortlisted_user_id, created_at').eq('user_id', userId),
            admin.from('shortlists').select('user_id, created_at').eq('shortlisted_user_id', userId)
        ])

        if (e1 || e2) {
            const error = e1 || e2
            if (error?.code === 'PGRST116' || error?.code === '42P01') {
                return NextResponse.json({ shortlistedIds: [], shortlistedMeIds: [], shortlisted: [], shortlistedMe: [] })
            }
            return NextResponse.json({ error: error?.message }, { status: 500 })
        }

        return NextResponse.json({
            shortlistedIds: (myShortlistData || []).map((r: any) => r.shortlisted_user_id),
            shortlistedMeIds: (shortlistedMeData || []).map((r: any) => r.user_id),
            shortlisted: (myShortlistData || []).map((r: any) => ({ id: r.shortlisted_user_id, created_at: r.created_at })),
            shortlistedMe: (shortlistedMeData || []).map((r: any) => ({ id: r.user_id, created_at: r.created_at })),
        })
    } catch (error) {
        return authErrorResponse(error)
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { targetUserId } = await request.json()

        if (!targetUserId) {
            return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('shortlists')
            .insert({ user_id: userId, shortlisted_user_id: targetUserId })

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'already_shortlisted' }, { status: 409 })
            }
            if (error.code === 'PGRST116' || error.code === '42P01') {
                return NextResponse.json({ error: 'Shortlists table does not exist. Please run the migration SQL.' }, { status: 500 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const { createNotification } = await import('@/lib/server/notify')
        await createNotification(targetUserId, userId, 'profile_shortlisted')

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

        if (!targetUserId) {
            return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('shortlists')
            .delete()
            .eq('user_id', userId)
            .eq('shortlisted_user_id', targetUserId)

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
