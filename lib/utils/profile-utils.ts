/**
 * Calculates a dynamic Trust Score (1.0 - 10.0) based on profile signals.
 * @param photoVerified Whether the profile identity/photo is verified
 * @param completionPercentage Profile completion progress (0-100)
 * @param photoCount Number of photos uploaded
 * @param hasFamilyPhoto Whether a family photo is present
 * @returns {number} A score rounded to 1 decimal place
 */
export function calculateTrustScore(
  photoVerified: boolean,
  completionPercentage: number,
  photoCount: number = 0,
  hasFamilyPhoto: boolean = false
): number {
  let score = 1.0 // Base score

  // 1. Verification Bonus (High Impact)
  if (photoVerified) {
    score += 3.0
  }

  // 2. Profile Completion Bonus
  // 100% completion = +3.0 points
  const completionBonus = (completionPercentage / 100) * 3.0
  score += completionBonus

  // 3. Photo Count Bonus (Granular impact)
  // Each photo = +0.4 points (Max 5 photos = +2.0 points)
  const photoBonus = Math.min(photoCount * 0.4, 2.0)
  score += photoBonus

  // 4. Family Photo Bonus (Transparency signal)
  if (hasFamilyPhoto) {
    score += 1.0
  }

  // Round to nearest 1 decimal
  return Math.min(Math.round(score * 10) / 10, 10.0)
}
