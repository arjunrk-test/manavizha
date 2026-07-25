import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'
import { createNotification } from '@/lib/server/notify'

// Requester asks an owner to share photos
export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { ownerId } = await request.json()

        if (!ownerId) return NextResponse.json({ error: 'ownerId is required' }, { status: 400 })
        if (ownerId === userId) return NextResponse.json({ error: 'You cannot request your own photos' }, { status: 400 })

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('photo_requests')
            .upsert({ requester_id: userId, owner_id: ownerId, status: 'pending', responded_at: null, created_at: new Date().toISOString() },
                { onConflict: 'requester_id,owner_id' })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        await createNotification(ownerId, userId, 'photo_request')
        return NextResponse.json({ success: true, status: 'pending' })
    } catch (error: any) {
        if (error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 })
        return authErrorResponse(error)
    }
}

// Owner lists incoming photo requests
export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()

        const { data: rows, error } = await admin
            .from('photo_requests')
            .select('*')
            .eq('owner_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P01') return NextResponse.json({ requests: [] })
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const requesterIds = (rows || []).map((r: any) => r.requester_id)
        let nameMap: Record<string, any> = {}
        if (requesterIds.length > 0) {
            const { data: profiles } = await admin
                .from('personal_details')
                .select('user_id, name, profile_code')
                .in('user_id', requesterIds)
            profiles?.forEach((p: any) => { nameMap[p.user_id] = p })
        }

        return NextResponse.json({
            requests: (rows || []).map((r: any) => ({ ...r, requester: nameMap[r.requester_id] || null })),
        })
    } catch (error) {
        return authErrorResponse(error)
    }
}

// Owner approves / declines a request
export async function PATCH(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { requesterId, status } = await request.json()

        if (!requesterId || !['approved', 'declined'].includes(status)) {
            return NextResponse.json({ error: 'requesterId and a valid status are required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('photo_requests')
            .update({ status, responded_at: new Date().toISOString() })
            .eq('owner_id', userId)
            .eq('requester_id', requesterId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (status === 'approved') {
            await createNotification(requesterId, userId, 'photo_request_approved')
        }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 })
        return authErrorResponse(error)
    }
}
