import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import https from 'https'

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

// GET /api/messages?userId=xxx&targetUserId=yyy — fetch messages between two users
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const targetUserId = searchParams.get('targetUserId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const admin = getSupabaseAdmin()

        if (targetUserId) {
            // Fetch conversation between two users
            const { data, error } = await admin
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${userId})`)
                .order('created_at', { ascending: true })

            if (error) throw error
            return NextResponse.json({ messages: data })
        } else {
            // Fetch message list for a user (most recent per contact)
            // This is harder with single query, but for now just fetch all where user is involved
            const { data, error } = await admin
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: false })

            if (error) throw error
            return NextResponse.json({ messages: data })
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/messages — send a message
export async function POST(request: Request) {
    try {
        const { senderId, receiverId, content } = await request.json()

        if (!senderId || !receiverId || !content) {
            return NextResponse.json({ error: 'senderId, receiverId, and content are required' }, { status: 400 })
        }

        const admin = getSupabaseAdmin()

        // 1. Verify mutual like
        const { data: like1 } = await admin.from('likes').select('*').eq('user_id', senderId).eq('liked_user_id', receiverId).maybeSingle()
        const { data: like2 } = await admin.from('likes').select('*').eq('user_id', receiverId).eq('liked_user_id', senderId).maybeSingle()

        if (!like1 || !like2) {
            // Check if it's a bypass for now (dev/manual check)
            // return NextResponse.json({ error: 'Mutual interest is required to send messages.' }, { status: 403 })
        }

        // 2. Verify sender is premium
        const { data: settings } = await admin.from('user_settings').select('is_premium').eq('user_id', senderId).maybeSingle()
        
        // ALLOW FOR NOW: Bypassing strict check since user requested it
        // if (!settings?.is_premium) {
        //     return NextResponse.json({ error: 'Premium subscription is required to send messages.' }, { status: 403 })
        // }

        // 3. Insert message
        const { data, error } = await admin
            .from('messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content: content
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ message: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
