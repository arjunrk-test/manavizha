import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import https from 'https'
import { authErrorResponse, requireAuthenticatedUser, ApiAuthError } from '@/lib/server/api-auth'

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

export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('targetUserId')
        const admin = getSupabaseAdmin()

        if (targetUserId) {
            const { data, error } = await admin
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${userId})`)
                .order('created_at', { ascending: true })

            if (error) throw error
            return NextResponse.json({ messages: data })
        }

        const { data, error } = await admin
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ messages: data })
    } catch (error: any) {
        if (error instanceof ApiAuthError) {
            return authErrorResponse(error)
        }
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const body = await request.json()
        const admin = getSupabaseAdmin()

        if (body.messageId) {
            // Mark a single message as read — only allowed if the caller is the receiver
            const { error } = await admin
                .from('messages')
                .update({ is_read: true })
                .eq('id', body.messageId)
                .eq('receiver_id', userId)

            if (error) throw error
            return NextResponse.json({ success: true })
        }

        if (body.senderId) {
            // Mark all unread messages from senderId to the auth user as read
            const { error } = await admin
                .from('messages')
                .update({ is_read: true })
                .eq('sender_id', body.senderId)
                .eq('receiver_id', userId)
                .eq('is_read', false)

            if (error) throw error
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'messageId or senderId is required' }, { status: 400 })
    } catch (error: any) {
        if (error instanceof ApiAuthError) {
            return authErrorResponse(error)
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { userId: senderId } = await requireAuthenticatedUser(request)
        const { receiverId, content } = await request.json()

        if (!receiverId || content === undefined || content === null) {
            return NextResponse.json({ error: 'receiverId and content are required' }, { status: 400 })
        }

        if (typeof content !== 'string' || !content.trim()) {
            return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 })
        }

        if (receiverId === senderId) {
            return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 })
        }

        const trimmedContent = content.trim()
        if (trimmedContent.length > 5000) {
            return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
        }

        const admin = getSupabaseAdmin()

        const [{ data: like1 }, { data: like2 }, { data: settings }] = await Promise.all([
            admin.from('likes').select('status').eq('user_id', senderId).eq('liked_user_id', receiverId).maybeSingle(),
            admin.from('likes').select('status').eq('user_id', receiverId).eq('liked_user_id', senderId).maybeSingle(),
            admin.from('user_settings').select('is_premium, premium_expires_at').eq('user_id', senderId).maybeSingle(),
        ])

        if (!like1 || !like2) {
            return NextResponse.json({ error: 'Mutual interest is required to send messages.' }, { status: 403 })
        }

        if (like1.status === 'declined' || like2.status === 'declined') {
            return NextResponse.json({ error: 'Messaging is not available for declined interests.' }, { status: 403 })
        }

        const hasActivePremium =
            !!settings?.is_premium &&
            (!settings.premium_expires_at || new Date(settings.premium_expires_at) > new Date())

        if (!hasActivePremium) {
            return NextResponse.json({ error: 'Premium subscription is required to send messages.' }, { status: 403 })
        }

        const { data, error } = await admin
            .from('messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content: trimmedContent
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ message: data })
    } catch (error: any) {
        if (error instanceof ApiAuthError) {
            return authErrorResponse(error)
        }
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
