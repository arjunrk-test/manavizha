import { supabase } from "@/lib/supabase"

/**
 * Tracks a user's interaction with a specific profession.
 * This is used for "Silent Adjustment" of the feed.
 */
export async function trackProfessionInteraction(viewerId: string, viewedUserId: string) {
  try {
    // Fetch the viewed user's profession
    const { data: prof } = await supabase
      .from("profession_employee")
      .select("designation, sector")
      .eq("user_id", viewedUserId)
      .maybeSingle()

    if (!prof) return

    // Record the interaction in a simple log table (requires migration below)
    // For now, we'll use the profile_views table which already exists
    // and we can run an aggregation query later.
  } catch (error) {
    console.error("Error tracking profession interaction:", error)
  }
}

/**
 * Calculates a "Responsiveness Score" for a user based on their message history.
 * Part of the "Anti-Ghosting" protocol.
 * Returns a score between 0 and 1.
 */
export async function calculateResponsivenessScore(userId: string): Promise<number> {
  try {
    // Fetch messages where the user is the receiver
    const { data: messages } = await supabase
      .from("messages")
      .select("id, created_at, is_read, sender_id")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (!messages || messages.length === 0) return 0.5 // Default neutral score

    const readMessages = messages.filter(m => m.is_read).length
    const readRate = readMessages / messages.length

    // Bumps score if they read messages regularly
    return Math.min(1, readRate + 0.2)
  } catch (error) {
    console.error("Error calculating responsiveness score:", error)
    return 0.5
  }
}

/**
 * Returns a list of preferred professions for a user based on their historical views.
 */
export async function getPreferredProfessions(userId: string): Promise<string[]> {
  try {
    const { data: views } = await supabase
      .from("profile_views")
      .select(`
        viewed_user_id,
        profession_employee (designation)
      `)
      .eq("viewer_user_id", userId)
      .limit(100)

    if (!views) return []

    const counts: Record<string, number> = {}
    views.forEach((v: any) => {
      const design = v.profession_employee?.designation
      if (design) {
        counts[design] = (counts[design] || 0) + 1
      }
    })

    // Sort by frequency and return top 3
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3)
  } catch (error) {
    console.error("Error getting preferred professions:", error)
    return []
  }
}

/* 
-- MIGRATION SUGGESTION (Run in Supabase SQL Editor):
-- To make this more efficient, create a dedicated stats table:

CREATE TABLE IF NOT EXISTS public.user_behavior_stats (
    user_id UUID PRIMARY KEY REFERENCES public.users(id),
    preferred_professions JSONB DEFAULT '[]',
    responsiveness_score FLOAT DEFAULT 0.5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_behavior_user ON public.user_behavior_stats(user_id);
*/
