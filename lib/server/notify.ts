import { after } from 'next/server'
import { getSupabaseAdmin } from './supabase-admin-client'
import { isEmailConfigured, sendEmail, renderEmail } from './email'

export type NotificationType =
    | 'interest_received'
    | 'interest_accepted'
    | 'message_received'
    | 'photo_request'
    | 'photo_request_approved'
    | 'contact_viewed'
    | 'profile_shortlisted'

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manavizha.com'

// Maps each event to the email-alert preference that governs it and how the
// email reads. `pref` matches a key in user_settings.email_alerts.
const EMAIL_SPEC: Record<
    NotificationType,
    { pref: string; heading: (name: string) => string; body: (name: string) => string; cta: string; path: string }
> = {
    interest_received: {
        pref: 'express_interest',
        heading: (n) => `You have a new interest from ${n}`,
        body: (n) => `${n} has expressed interest in your profile. Log in to view their profile and respond.`,
        cta: 'View interest',
        path: '/dashboard/interests?tab=likedme',
    },
    interest_accepted: {
        pref: 'express_interest',
        heading: (n) => `${n} accepted your interest`,
        body: (n) => `Great news — ${n} accepted your interest. You can now connect with each other.`,
        cta: 'View match',
        path: '/dashboard/interests?tab=mutual',
    },
    message_received: {
        pref: 'personalized_messages',
        heading: (n) => `New message from ${n}`,
        body: (n) => `${n} sent you a message. Log in to read it and reply.`,
        cta: 'Open messages',
        path: '/dashboard/messages',
    },
    contact_viewed: {
        pref: 'phone_views',
        heading: (n) => `${n} viewed your contact details`,
        body: (n) => `${n} just viewed your contact information.`,
        cta: 'View profile',
        path: '/dashboard',
    },
    photo_request: {
        pref: 'member_activity',
        heading: (n) => `${n} requested your photos`,
        body: (n) => `${n} has asked to view your photos. You can approve or decline the request in Settings.`,
        cta: 'Review request',
        path: '/dashboard/settings',
    },
    photo_request_approved: {
        pref: 'member_activity',
        heading: (n) => `${n} approved your photo request`,
        body: (n) => `${n} approved your request — you can now view their photos.`,
        cta: 'View profile',
        path: '/dashboard',
    },
    profile_shortlisted: {
        pref: 'shortlists',
        heading: (n) => `${n} shortlisted you`,
        body: (n) => `${n} shortlisted your profile. Log in to view their profile.`,
        cta: 'View profile',
        path: '/dashboard',
    },
}

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

    // Fire the email alert after the response is sent, so the user's action
    // isn't slowed by SMTP. Falls back to inline if not in a request context.
    if (isEmailConfigured()) {
        const job = () => sendEventEmail(recipientId, actorId, type).catch(() => {})
        try {
            after(job)
        } catch {
            void job()
        }
    }
}

/**
 * Sends the transactional email for an event, respecting the recipient's
 * email_alerts preference. Best-effort; never throws.
 */
async function sendEventEmail(
    recipientId: string,
    actorId: string | null,
    type: NotificationType
): Promise<void> {
    const spec = EMAIL_SPEC[type]
    if (!spec) return

    try {
        const admin = await getSupabaseAdmin()

        const [{ data: recipient }, { data: settings }] = await Promise.all([
            admin.from('users').select('email').eq('id', recipientId).maybeSingle(),
            admin.from('user_settings').select('email_alerts').eq('user_id', recipientId).maybeSingle(),
        ])

        if (!recipient?.email) return

        // Respect the preference (default on when unset)
        const alerts = settings?.email_alerts
        if (alerts && alerts[spec.pref] === false) return

        // Resolve the actor's display name for the "[Name]" placeholder
        let actorName = 'A member'
        if (actorId) {
            const { data: actor } = await admin
                .from('personal_details')
                .select('name')
                .eq('user_id', actorId)
                .maybeSingle()
            if (actor?.name) actorName = actor.name
        }

        const html = renderEmail({
            heading: spec.heading(actorName),
            body: spec.body(actorName),
            ctaText: spec.cta,
            ctaUrl: `${APP_URL}${spec.path}`,
        })

        await sendEmail({ to: recipient.email, subject: spec.heading(actorName), html })
    } catch (err) {
        console.error('[notify] email failed:', err)
    }
}
