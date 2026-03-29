import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import https from 'https'
import fetch from 'node-fetch'

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

// GET /api/shortlists?userId=xxx — fetch all shortlisted IDs for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('shortlists')
            .select('shortlisted_user_id')
            .eq('user_id', userId)

        if (error) {
            // If table doesn't exist, return empty
            if (error.code === 'PGRST116' || error.code === '42P01') {
                return NextResponse.json({ shortlistedIds: [] })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            shortlistedIds: (data || []).map((r: any) => r.shortlisted_user_id),
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/shortlists — shortlist a profile
export async function POST(request: Request) {
    try {
        const { userId, targetUserId } = await request.json()

        if (!userId || !targetUserId) {
            return NextResponse.json({ error: 'userId and targetUserId are required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
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

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE /api/shortlists — remove a profile from shortlist
export async function DELETE(request: Request) {
    try {
        const { userId, targetUserId } = await request.json()

        if (!userId || !targetUserId) {
            return NextResponse.json({ error: 'userId and targetUserId are required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('shortlists')
            .delete()
            .eq('user_id', userId)
            .eq('shortlisted_user_id', targetUserId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
