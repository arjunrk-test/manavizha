import { getSupabaseAdmin } from './supabase-admin-client'

export type Tier = 'free' | 'premium' | 'prime_gold'

/**
 * Derives a user's membership tier from their user_settings row.
 * Expired premium falls back to free.
 */
export async function getUserTier(userId: string): Promise<Tier> {
    try {
        const admin = await getSupabaseAdmin()
        const { data } = await admin
            .from('user_settings')
            .select('is_premium, premium_plan, premium_expires_at')
            .eq('user_id', userId)
            .maybeSingle()

        if (!data?.is_premium) return 'free'
        if (data.premium_expires_at && new Date(data.premium_expires_at) < new Date()) return 'free'
        if (data.premium_plan === 'prime_gold') return 'prime_gold'
        return 'premium'
    } catch {
        return 'free'
    }
}

const DEFAULT_LIMITS: Record<Tier, number> = { free: 0, premium: 25, prime_gold: 100 }

export async function getContactViewLimit(tier: Tier): Promise<number> {
    try {
        const admin = await getSupabaseAdmin()
        const { data } = await admin
            .from('tier_limits')
            .select('contact_view_limit')
            .eq('tier', tier)
            .maybeSingle()
        if (data && typeof data.contact_view_limit === 'number') return data.contact_view_limit
    } catch { /* fall through */ }
    return DEFAULT_LIMITS[tier]
}
