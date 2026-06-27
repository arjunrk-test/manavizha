export type PartnerPreferencesRow = {
  preferred_age_min?: number | null
  preferred_age_max?: number | null
  preferred_caste?: string | null
  preferred_subcaste?: string | null
  caste_compulsory?: boolean | null
}

export type ProfileForPartnerFilter = {
  age?: unknown
  caste?: string | null
  subcaste?: string | null
  family?: { caste?: string | null; subcaste?: string | null } | null
}

export function parseProfileAge(age: unknown): number | null {
  const raw = (age ?? "").toString().replace(/[^0-9]/g, "")
  return raw ? parseInt(raw, 10) : null
}

export function getProfileCaste(profile: ProfileForPartnerFilter): string | null {
  return profile.caste ?? profile.family?.caste ?? null
}

export function getProfileSubcaste(profile: ProfileForPartnerFilter): string | null {
  return profile.subcaste ?? profile.family?.subcaste ?? null
}

function isAny(value: string | null | undefined): boolean {
  return !value || value === "Any"
}

/**
 * Discovery filter: age always (when set); caste/subcaste only when caste_compulsory is true.
 */
export function filterProfilesByPartnerPreferences<T extends ProfileForPartnerFilter>(
  profiles: T[],
  prefs: PartnerPreferencesRow | null | undefined
): T[] {
  if (!prefs) return profiles

  return profiles.filter((profile) => {
    if (prefs.preferred_age_min != null || prefs.preferred_age_max != null) {
      const profileAge = parseProfileAge(profile.age)
      if (profileAge !== null) {
        if (prefs.preferred_age_min != null && profileAge < prefs.preferred_age_min) return false
        if (prefs.preferred_age_max != null && profileAge > prefs.preferred_age_max) return false
      }
    }

    if (prefs.caste_compulsory) {
      const prefCaste = prefs.preferred_caste
      if (!isAny(prefCaste)) {
        const profileCaste = getProfileCaste(profile)
        if (!profileCaste || profileCaste !== prefCaste) return false
      }

      const prefSubcaste = prefs.preferred_subcaste
      if (!isAny(prefSubcaste)) {
        const profileSubcaste = getProfileSubcaste(profile)
        if (!profileSubcaste || profileSubcaste !== prefSubcaste) return false
      }
    }

    return true
  })
}
