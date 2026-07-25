import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

// Profile/activity tables keyed by a single `user_id` column
const USER_ID_TABLES = [
    'personal_details', 'contact_details', 'education_details',
    'profession_employee', 'profession_business', 'profession_student',
    'family_details', 'horoscope_details', 'interests', 'social_habits',
    'partner_preferences', 'photos', 'user_settings', 'shortlists',
    'blocks', 'ignores', 'id_verifications', 'user_keys',
]

/**
 * Permanently deletes the caller's account: their profile/activity data and the
 * Supabase auth user. Irreversible. Best-effort on data tables (a missing table
 * or column never blocks the auth-user deletion, which is the decisive step).
 */
export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()

        const ignore = (p: PromiseLike<any>) => Promise.resolve(p).then(() => {}, () => {})

        // Single user_id tables
        for (const table of USER_ID_TABLES) {
            await ignore(admin.from(table).delete().eq('user_id', userId))
        }

        // Two-sided / differently-named tables
        await ignore(admin.from('shortlists').delete().eq('shortlisted_user_id', userId))
        await ignore(admin.from('likes').delete().or(`user_id.eq.${userId},liked_user_id.eq.${userId}`))
        await ignore(admin.from('profile_views').delete().or(`viewer_user_id.eq.${userId},viewed_user_id.eq.${userId}`))
        await ignore(admin.from('contact_view_log').delete().or(`viewer_id.eq.${userId},viewed_user_id.eq.${userId}`))
        await ignore(admin.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`))
        await ignore(admin.from('reports').delete().or(`reporter_id.eq.${userId},reported_user_id.eq.${userId}`))
        await ignore(admin.from('photo_requests').delete().or(`requester_id.eq.${userId},owner_id.eq.${userId}`))
        await ignore(admin.from('notifications').delete().or(`user_id.eq.${userId},actor_id.eq.${userId}`))
        await ignore(admin.from('parent_selections').delete().eq('child_user_id', userId))
        await ignore(admin.from('users').delete().eq('id', userId))

        // Decisive, irreversible step: remove the auth account
        const { error: delErr } = await admin.auth.admin.deleteUser(userId)
        if (delErr) {
            return NextResponse.json({ error: delErr.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return authErrorResponse(error)
    }
}
