import { FormData } from "@/types/profile"

export interface MatchBreakdown {
  category: string;
  score: number;
  label: string;
  details: string[];
  icon: string;
}

export interface CompatibilityResult {
  totalScore: number;
  breakdown: MatchBreakdown[];
}

/**
 * Calculates the Lifestyle Compatibility Score between two profiles.
 */
export function calculateLifestyleScore(user: FormData, partner: FormData): CompatibilityResult {
  const breakdown: MatchBreakdown[] = []
  
  // --- Tier 1: Dealbreakers (50%) ---
  let tier1Score = 0
  const tier1Details: string[] = []
  
  // Diet
  if (user.foodPreference === partner.foodPreference) {
    tier1Score += 25
    tier1Details.push(`Both prefer ${user.foodPreference} food`)
  } else {
    // If one is strict veg and other is non-veg, significant penalty
    if (user.foodPreference?.includes('Veg') && partner.foodPreference?.includes('Non-Veg')) {
      tier1Score += 0
    } else {
      tier1Score += 10
    }
  }

  // Habits (Smoking/Drinking)
  const habitsMatch = (user.smoking === partner.smoking) && (user.drinking === partner.drinking)
  if (habitsMatch) {
    tier1Score += 25
    tier1Details.push("Compatible social habits")
  } else {
    tier1Score += 5
  }
  
  breakdown.push({
    category: "Dealbreakers",
    score: tier1Score * 2, // Scale to 100 for display
    label: "Values & Habits",
    details: tier1Details,
    icon: "Shield"
  })

  // --- Tier 2: Lifestyle & Vibe (30%) ---
  const userInterests = [...(user.hobbies || []), ...(user.interests || [])]
  const partnerInterests = [...(partner.hobbies || []), ...(partner.interests || [])]
  
  const commonInterests = userInterests.filter(i => partnerInterests.includes(i))
  const interestScore = userInterests.length > 0 ? (commonInterests.length / Math.max(userInterests.length, partnerInterests.length)) * 100 : 50
  
  const tier2Details: string[] = []
  if (commonInterests.length > 0) {
    tier2Details.push(`Shared interests in ${commonInterests.slice(0, 2).join(", ")}`)
  }
  
  breakdown.push({
    category: "Lifestyle",
    score: interestScore,
    label: "Vibe & Hobbies",
    details: tier2Details,
    icon: "Heart"
  })

  // --- Tier 3: Future Goals (20%) ---
  let tier3Score = 0
  const tier3Details: string[] = []
  
  // Work Location / Relocation
  if (user.workLocation === partner.workLocation || user.currentDistrict === partner.currentDistrict) {
    tier3Score += 50
    tier3Details.push("Same work location or home town")
  } else {
    tier3Score += 25
  }
  
  // Sector/Ambition
  if (user.sector === partner.sector) {
    tier3Score += 50
    tier3Details.push(`Both work in ${user.sector} sector`)
  } else {
    tier3Score += 25
  }

  breakdown.push({
    category: "Future",
    score: tier3Score,
    label: "Career & Goals",
    details: tier3Details,
    icon: "Target"
  })

  // Final Weighted Score
  // Tier 1 (50%) + Tier 2 (30%) + Tier 3 (20%)
  const totalScore = Math.round((tier1Score * 2) * 0.5 + (interestScore) * 0.3 + (tier3Score) * 0.2)

  return {
    totalScore,
    breakdown
  }
}
