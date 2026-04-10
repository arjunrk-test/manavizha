'use client'

import { supabase } from '@/lib/supabase'

/**
 * Updates the last_active_at timestamp for the current user.
 * This is designed to be called periodically from the client.
 */
export async function updateActivity() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date().toISOString()

    // Update all relevant tables for maximum coverage across different views
    await Promise.allSettled([
        supabase
            .from('users')
            .update({ last_active_at: now })
            .eq('id', user.id),
        supabase
            .from('user_settings')
            .update({ last_active_at: now })
            .eq('user_id', user.id),
        supabase
            .from('personal_details')
            .update({ last_active_at: now })
            .eq('user_id', user.id)
    ])
}
