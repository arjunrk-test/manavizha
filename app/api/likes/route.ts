import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'
import { createNotification } from '@/lib/server/notify'

function resolveLikeParticipants(authUserId: string, userId?: string, likedUserId?: string) {
    if (!userId || !likedUserId) return null
    if (userId === authUserId) {
        return { likerId: authUserId, likedId: likedUserId }
    }
    if (likedUserId === authUserId) {
        return { likerId: userId, likedId: authUserId }
    }
    return null
}

export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()
        const [{ data: iLikedData, error: e1 }, { data: likedMeData, error: e2 }] = await Promise.all([
            admin.from('likes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
            admin.from('likes').select('*').eq('liked_user_id', userId).order('created_at', { ascending: false }),
        ])

        if (e1 || e2) {
            return NextResponse.json({ error: e1?.message || e2?.message }, { status: 500 })
        }

        return NextResponse.json({
            iLiked: (iLikedData || []).map((r: any) => ({
                id: r.liked_user_id,
                created_at: r.created_at,
                accepted_at: r.accepted_at || null,
                is_read: r.is_read,
                status: r.status || 'pending'
            })),
            likedMe: (likedMeData || []).map((r: any) => ({
                id: r.user_id,
                created_at: r.created_at,
                accepted_at: r.accepted_at || null,
                is_read: r.is_read,
                status: r.status || 'pending'
            })),
        })
    } catch (error) {
        return authErrorResponse(error)
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId: authUserId } = await requireAuthenticatedUser(request)
        const { userId, likedUserId, status, is_read } = await request.json()

        const participants = resolveLikeParticipants(authUserId, userId, likedUserId)
        if (!participants) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const admin = await getSupabaseAdmin()
        const updateData: any = {}
        if (status !== undefined) updateData.status = status
        if (status === 'accepted') updateData.accepted_at = new Date().toISOString()
        if (is_read !== undefined) updateData.is_read = is_read

        const { error } = await admin
            .from('likes')
            .update(updateData)
            .eq('user_id', participants.likerId)
            .eq('liked_user_id', participants.likedId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (status === 'accepted' && participants.likerId !== authUserId) {
            await createNotification(participants.likerId, authUserId, 'interest_accepted')
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}

export async function POST(request: Request) {
    try {
        const { userId: authUserId } = await requireAuthenticatedUser(request)
        const { likedUserId, status } = await request.json()

        if (!likedUserId) {
            return NextResponse.json({ error: 'likedUserId is required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const insertData: any = { user_id: authUserId, liked_user_id: likedUserId }
        if (status) insertData.status = status
        if (status === 'accepted') insertData.accepted_at = new Date().toISOString()

        const { error } = await admin.from('likes').insert(insertData)

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'already_liked' }, { status: 409 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        await createNotification(
            likedUserId,
            authUserId,
            status === 'accepted' ? 'interest_accepted' : 'interest_received'
        )

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
        const { userId: authUserId } = await requireAuthenticatedUser(request)
        const { likedUserId } = await request.json()

        if (!likedUserId) {
            return NextResponse.json({ error: 'likedUserId is required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('likes')
            .delete()
            .eq('user_id', authUserId)
            .eq('liked_user_id', likedUserId)

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
