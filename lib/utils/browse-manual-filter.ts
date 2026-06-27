import {
  getProfileCaste,
  getProfileSubcaste,
  parseProfileAge,
  type ProfileForPartnerFilter,
} from "@/lib/utils/partner-preference-filter"
import { educationMatchesLevel, type EducationRecord } from "@/lib/utils/education-display"

export type BrowseManualFilters = {
  ageMin?: number | null
  ageMax?: number | null
  caste?: string | null
  subcaste?: string | null
  maritalStatus?: string | null
  educationLevel?: string | null
  withPhoto?: boolean
  verified?: boolean
}

export const EMPTY_BROWSE_MANUAL_FILTERS: BrowseManualFilters = {}

function isAny(value: string | null | undefined): boolean {
  return !value || value === "Any"
}

export function hasActiveBrowseManualFilters(filters: BrowseManualFilters): boolean {
  return (
    filters.ageMin != null ||
    filters.ageMax != null ||
    !isAny(filters.caste) ||
    !isAny(filters.subcaste) ||
    !isAny(filters.maritalStatus) ||
    !isAny(filters.educationLevel) ||
    filters.withPhoto === true ||
    filters.verified === true
  )
}

export type BrowseFilterProfile = ProfileForPartnerFilter & {
  marital_status?: string | null
  photos?: unknown[] | null
  photo_verified?: boolean | null
  education?: EducationRecord[] | null
}

/**
 * Browse filters combine with partner preferences (applied after partner prefs).
 */
export function filterProfilesByBrowseManualFilters<T extends BrowseFilterProfile>(
  profiles: T[],
  filters: BrowseManualFilters
): T[] {
  if (!hasActiveBrowseManualFilters(filters)) return profiles

  return profiles.filter((profile) => {
    if (filters.ageMin != null || filters.ageMax != null) {
      const profileAge = parseProfileAge(profile.age)
      if (profileAge !== null) {
        if (filters.ageMin != null && profileAge < filters.ageMin) return false
        if (filters.ageMax != null && profileAge > filters.ageMax) return false
      }
    }

    if (!isAny(filters.caste)) {
      const profileCaste = getProfileCaste(profile)
      if (!profileCaste || profileCaste !== filters.caste) return false
    }

    if (!isAny(filters.subcaste)) {
      const profileSubcaste = getProfileSubcaste(profile)
      if (!profileSubcaste || profileSubcaste !== filters.subcaste) return false
    }

    if (!isAny(filters.maritalStatus)) {
      const status = (profile.marital_status || "").toLowerCase()
      if (status !== filters.maritalStatus!.toLowerCase()) return false
    }

    if (!isAny(filters.educationLevel)) {
      if (!educationMatchesLevel(profile.education, filters.educationLevel!)) return false
    }

    if (filters.withPhoto && (!profile.photos || profile.photos.length === 0)) return false

    if (filters.verified && !profile.photo_verified) return false

    return true
  })
}
