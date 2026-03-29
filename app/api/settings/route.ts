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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

        const { data, error } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', userId).maybeSingle()
        if (error) {
            // Table doesn't exist yet, return defaults
            if (error.code === 'PGRST116' || error.code === '42P01') {
                return NextResponse.json({})
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || {})
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { userId, updates } = await request.json()
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

        const { error } = await supabaseAdmin.from('user_settings').upsert({
            user_id: userId,
            ...updates,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
