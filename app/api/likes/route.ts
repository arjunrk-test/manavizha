import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import https from 'https'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: customFetch }
})

// GET /api/likes?userId=xxx — fetch all likes data for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const [{ data: iLikedData, error: e1 }, { data: likedMeData, error: e2 }] = await Promise.all([
            supabaseAdmin.from('likes').select('liked_user_id').eq('user_id', userId),
            supabaseAdmin.from('likes').select('user_id').eq('liked_user_id', userId),
        ])

        if (e1 || e2) {
            return NextResponse.json({ error: e1?.message || e2?.message }, { status: 500 })
        }

        return NextResponse.json({
            iLikedIds: (iLikedData || []).map((r: any) => r.liked_user_id),
            likedMeIds: (likedMeData || []).map((r: any) => r.user_id),
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/likes — like a profile
export async function POST(request: Request) {
    try {
        const { userId, likedUserId } = await request.json()

        if (!userId || !likedUserId) {
            return NextResponse.json({ error: 'userId and likedUserId are required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('likes')
            .insert({ user_id: userId, liked_user_id: likedUserId })

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'already_liked' }, { status: 409 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE /api/likes — unlike a profile
export async function DELETE(request: Request) {
    try {
        const { userId, likedUserId } = await request.json()

        if (!userId || !likedUserId) {
            return NextResponse.json({ error: 'userId and likedUserId are required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('liked_user_id', likedUserId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
