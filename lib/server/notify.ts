import { getSupabaseAdmin } from './supabase-admin-client'

export type NotificationType =
    | 'interest_received'
    | 'interest_accepted'
    | 'message_received'
    | 'photo_request'
    | 'photo_request_approved'

/**
 * Inserts an in-app notification. Never throws — notification failures
 * must not break the action that triggered them (e.g. before the
 * notifications table migration has been run).
 */
export async function createNotification(
    recipientId: string,
    actorId: string | null,
    type: NotificationType,
    payload: Record<string, any> = {}
): Promise<void> {
    try {
        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('notifications')
            .insert({ user_id: recipientId, actor_id: actorId, type, payload })
        if (error) console.error('[notify] insert failed:', error.message)
    } catch (err) {
        console.error('[notify] failed:', err)
    }
}
