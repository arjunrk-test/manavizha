import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

// Publish the caller's ECDH public key (JWK)
export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { publicKey } = await request.json()

        if (!publicKey || typeof publicKey !== 'object' || publicKey.kty !== 'EC') {
            return NextResponse.json({ error: 'A valid EC public key (JWK) is required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('user_keys')
            .upsert({ user_id: userId, public_key: publicKey, created_at: new Date().toISOString() }, { onConflict: 'user_id' })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 })
        return authErrorResponse(error)
    }
}

// Fetch a user's public key (any authenticated member can read public keys)
export async function GET(request: Request) {
    try {
        await requireAuthenticatedUser(request)
        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('userId')
        if (!targetUserId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

        const admin = await getSupabaseAdmin()
        const { data, error } = await admin
            .from('user_keys')
            .select('public_key')
            .eq('user_id', targetUserId)
            .maybeSingle()

        if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ publicKey: data?.public_key || null })
    } catch (error) {
        return authErrorResponse(error)
    }
}
