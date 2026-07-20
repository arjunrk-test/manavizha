import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

export const dynamic = 'force-dynamic'

// Decides whether the caller may see a target's photos, honouring the target's
// photo_visibility setting. Access is granted when the target is public, the
// two have a mutually accepted interest, or the owner approved a photo request.
export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('targetUserId')

        if (!targetUserId) return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 })
        if (targetUserId === userId) return NextResponse.json({ canView: true, requestStatus: null })

        const admin = await getSupabaseAdmin()

        const { data: settings } = await admin
            .from('user_settings')
            .select('photo_visibility')
            .eq('user_id', targetUserId)
            .maybeSingle()

        const visibility = settings?.photo_visibility || 'everyone'
        if (visibility === 'everyone') {
            return NextResponse.json({ canView: true, requestStatus: null })
        }

        // Password-protected — the viewer must supply the correct password (POST)
        if (visibility === 'password') {
            return NextResponse.json({
                canView: false,
                passwordProtected: true,
                restricted: true,
            })
        }

        // on_accept — check mutual accepted interest or an approved photo request
        const [{ data: like1 }, { data: like2 }, { data: req }] = await Promise.all([
            admin.from('likes').select('status').eq('user_id', userId).eq('liked_user_id', targetUserId).maybeSingle(),
            admin.from('likes').select('status').eq('user_id', targetUserId).eq('liked_user_id', userId).maybeSingle(),
            admin.from('photo_requests').select('status').eq('requester_id', userId).eq('owner_id', targetUserId).maybeSingle(),
        ])

        const mutualAccepted =
            !!like1 && !!like2 && (like1.status === 'accepted' || like2.status === 'accepted')

        const requestApproved = req?.status === 'approved'
        
        console.log('photo-access API:', { targetUserId, userId, visibility, mutualAccepted, requestApproved });

        return NextResponse.json({
            canView: mutualAccepted || requestApproved,
            requestStatus: req?.status || null,
            restricted: true,
        })
    } catch (error) {
        console.error('photo-access API error:', error);
        return authErrorResponse(error)
    }
}

// Verify a photo password. The password is compared server-side and never
// returned to the viewer.
export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { targetUserId, password } = await request.json()

        if (!targetUserId || typeof password !== 'string') {
            return NextResponse.json({ error: 'targetUserId and password are required' }, { status: 400 })
        }
        if (targetUserId === userId) {
            return NextResponse.json({ valid: true })
        }

        const admin = await getSupabaseAdmin()
        const { data: settings } = await admin
            .from('user_settings')
            .select('photo_visibility, photo_password')
            .eq('user_id', targetUserId)
            .maybeSingle()

        if (settings?.photo_visibility !== 'password') {
            // Not password-protected — nothing to verify
            return NextResponse.json({ valid: true })
        }

        const valid = !!settings.photo_password && password === settings.photo_password
        return NextResponse.json({ valid })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}
