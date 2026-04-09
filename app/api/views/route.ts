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

// GET /api/views?userId=xxx — fetch all view data for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const [{ data: iViewedData, error: e1 }, { data: viewedMeData, error: e2 }] = await Promise.all([
            supabaseAdmin.from('profile_views').select('viewed_user_id, created_at, is_read').eq('viewer_user_id', userId).order('created_at', { ascending: false }),
            supabaseAdmin.from('profile_views').select('viewer_user_id, created_at, is_read').eq('viewed_user_id', userId).order('created_at', { ascending: false }),
        ])

        if (e1 || e2) {
            return NextResponse.json({ error: e1?.message || e2?.message }, { status: 500 })
        }

        // De-duplicate: keep only the latest view for each user
        const uniqueIViewed: any[] = []
        const iViewedMap = new Set()
        for (const v of (iViewedData || [])) {
            if (!iViewedMap.has(v.viewed_user_id)) {
                iViewedMap.add(v.viewed_user_id)
                uniqueIViewed.push(v)
            }
        }

        const uniqueViewedMe: any[] = []
        const viewedMeMap = new Set()
        for (const v of (viewedMeData || [])) {
            if (!viewedMeMap.has(v.viewer_user_id)) {
                viewedMeMap.add(v.viewer_user_id)
                uniqueViewedMe.push(v)
            }
        }

        return NextResponse.json({
            iViewed: uniqueIViewed,
            viewedMe: uniqueViewedMe,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH /api/views — mark a profile view as read
export async function PATCH(request: Request) {
    try {
        const { viewerId, viewedUserId } = await request.json()

        if (!viewerId || !viewedUserId) {
            return NextResponse.json({ error: 'viewerId and viewedUserId are required' }, { status: 400 })
        }

        // Attempt to mark as read (if is_read column exists)
        const { error } = await supabaseAdmin
            .from('profile_views')
            .update({ is_read: true })
            .eq('viewer_user_id', viewerId)
            .eq('viewed_user_id', viewedUserId)

        if (error) {
            // Silently ignore if column doesn't exist to prevent crash, 
            // but return error if it's something else
            if (error.message.includes('column "is_read" of relation "profile_views" does not exist')) {
                return NextResponse.json({ success: false, error: 'column_missing' })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/views — record a profile view
export async function POST(request: Request) {
    try {
        const { viewerId, viewedUserId } = await request.json()

        if (!viewerId || !viewedUserId) {
            return NextResponse.json({ error: 'viewerId and viewedUserId are required' }, { status: 400 })
        }

        // Don't record self-views
        if (viewerId === viewedUserId) {
            return NextResponse.json({ success: true, message: 'Self-view ignored' })
        }

        // Optional: Check if a duplicate view was recorded recently (e.g., last 1 hour) to avoid spamming
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { data: recentView } = await supabaseAdmin
            .from('profile_views')
            .select('id')
            .eq('viewer_user_id', viewerId)
            .eq('viewed_user_id', viewedUserId)
            .gt('created_at', oneHourAgo)
            .maybeSingle()

        if (recentView) {
            return NextResponse.json({ success: true, message: 'Recent view already exists' })
        }

        const { error } = await supabaseAdmin
            .from('profile_views')
            .insert({ viewer_user_id: viewerId, viewed_user_id: viewedUserId })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
