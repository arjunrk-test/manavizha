import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import https from 'https'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'


const customFetch = (url: any, options: any = {}) => {
    try {
        const u = new URL(url)
        if (u.hostname === 'olktibxfpgfjkcppqbqd.supabase.co') {
            const originalHost = u.hostname
            u.hostname = '104.18.38.10'
            options.headers = options.headers || {}
            if (typeof options.headers.set === 'function') {
                options.headers.set('Host', originalHost)
            } else {
                options.headers['Host'] = originalHost
            }
            options.agent = new https.Agent({ servername: originalHost })
            return (fetch as any)(u.toString(), options)
        }
        return (fetch as any)(url, options)
    } catch (e) {
        return (fetch as any)(url, options)
    }
}

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Supabase URL and Service Role Key are required')
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { fetch: customFetch }
    })
}

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
        const admin = getSupabaseAdmin()
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
                is_read: r.is_read,
                status: r.status || 'pending'
            })),
            likedMe: (likedMeData || []).map((r: any) => ({
                id: r.user_id,
                created_at: r.created_at,
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

        const admin = getSupabaseAdmin()
        const updateData: any = {}
        if (status !== undefined) updateData.status = status
        if (is_read !== undefined) updateData.is_read = is_read

        const { error } = await admin
            .from('likes')
            .update(updateData)
            .eq('user_id', participants.likerId)
            .eq('liked_user_id', participants.likedId)

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

export async function POST(request: Request) {
    try {
        const { userId: authUserId } = await requireAuthenticatedUser(request)
        const { likedUserId, status } = await request.json()

        if (!likedUserId) {
            return NextResponse.json({ error: 'likedUserId is required' }, { status: 400 })
        }

        const admin = getSupabaseAdmin()
        const insertData: any = { user_id: authUserId, liked_user_id: likedUserId }
        if (status) insertData.status = status

        const { error } = await admin.from('likes').insert(insertData)

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'already_liked' }, { status: 409 })
            }
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

export async function DELETE(request: Request) {
    try {
        const { userId: authUserId } = await requireAuthenticatedUser(request)
        const { likedUserId } = await request.json()

        if (!likedUserId) {
            return NextResponse.json({ error: 'likedUserId is required' }, { status: 400 })
        }

        const admin = getSupabaseAdmin()
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
