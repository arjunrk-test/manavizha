import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'
import { getUserTier, getContactViewLimit } from '@/lib/server/tier'
import { createNotification } from '@/lib/server/notify'

// GET: current usage/limit for the caller
export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()
        const tier = await getUserTier(userId)
        const limit = await getContactViewLimit(tier)

        const { count } = await admin
            .from('contact_view_log')
            .select('id', { count: 'exact', head: true })
            .eq('viewer_id', userId)

        return NextResponse.json({ tier, limit, used: count || 0, remaining: Math.max(0, limit - (count || 0)) })
    } catch (error) {
        return authErrorResponse(error)
    }
}

// POST: attempt to unlock a profile's contact. Enforces the tier limit.
export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { viewedUserId } = await request.json()

        if (!viewedUserId) {
            return NextResponse.json({ error: 'viewedUserId is required' }, { status: 400 })
        }
        if (viewedUserId === userId) {
            return NextResponse.json({ allowed: true, alreadyViewed: true })
        }

        const admin = await getSupabaseAdmin()
        const tier = await getUserTier(userId)

        if (tier === 'free') {
            return NextResponse.json(
                { allowed: false, error: 'Upgrade to a premium plan to view contact details.', tier },
                { status: 403 }
            )
        }

        const limit = await getContactViewLimit(tier)

        // Already unlocked this profile? Re-viewing is free.
        const { data: existing } = await admin
            .from('contact_view_log')
            .select('id')
            .eq('viewer_id', userId)
            .eq('viewed_user_id', viewedUserId)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ allowed: true, alreadyViewed: true, tier })
        }

        const { count } = await admin
            .from('contact_view_log')
            .select('id', { count: 'exact', head: true })
            .eq('viewer_id', userId)

        if ((count || 0) >= limit) {
            return NextResponse.json(
                {
                    allowed: false,
                    error: `You have reached your contact-view limit (${limit}) for this plan. Upgrade for more.`,
                    tier, limit, used: count || 0,
                },
                { status: 403 }
            )
        }

        const { error } = await admin
            .from('contact_view_log')
            .insert({ viewer_id: userId, viewed_user_id: viewedUserId })

        // Ignore unique-violation races — it just means it's already counted.
        if (error && error.code !== '23505') {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Notify the profile owner that their contact was viewed (first time only)
        if (!error) {
            await createNotification(viewedUserId, userId, 'contact_viewed')
        }

        const used = (count || 0) + 1
        return NextResponse.json({ allowed: true, tier, limit, used, remaining: Math.max(0, limit - used) })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}
