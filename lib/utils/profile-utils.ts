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
/**
 * Generates a bullet-separated string of profile attributes for UI tags.
 */
export function getProfileSummaryStr(profile: any): string {
  const parts = []
  if (profile.age) parts.push(`${profile.age} yrs`)
  if (profile.height) parts.push(`${profile.height} cm`)
  if (profile.caste) parts.push(profile.caste)
  
  if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) {
    // Get last 2 educations (most recent)
    const recentEdu = profile.education.slice(-2);
    recentEdu.forEach((e: any) => {
      const edu = typeof e === 'string' ? e : (e.education || e.degree || "Education");
      parts.push(edu);
    });
  }
  
  if (profile.profession && profile.profession !== "Not specified") {
    parts.push(profile.profession)
  }
  
  if (profile.location && profile.location !== "Location not specified" && !profile.location.includes("hidden")) {
    const city = profile.location.split(',')[0]
    parts.push(city)
  }
  
  return parts.join(" • ")
}

/**
 * Generates a bullet-separated string of profile attributes containing strictly Role and Height.
 */
export function getRoleAndHeightStr(profile: any): string {
  const parts = []
  if (profile.profession && profile.profession !== "Not specified") {
    parts.push(profile.profession)
  }
  if (profile.height) {
    parts.push(`${profile.height} cm`)
  }
  return parts.join(" • ")
}
