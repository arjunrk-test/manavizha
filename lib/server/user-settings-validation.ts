const USER_WRITABLE_FIELDS = new Set([
  "email_alerts",
  "sms_alerts",
  "call_preference",
  "contact_person",
  "convenient_call_time",
  "mobile_privacy",
  "horoscope_privacy",
  "horoscope_password",
  "profile_privacy",
  "photo_visibility",
  "is_deactivated",
  "deactivated_until",
])

const ADMIN_ONLY_FIELDS = new Set([
  "is_premium",
  "premium_plan",
  "premium_expires_at",
  "user_id",
  "id",
  "created_at",
  "updated_at",
])

const MOBILE_PRIVACY_VALUES = new Set(["show_all", "paid_only", "hidden"])
const HOROSCOPE_PRIVACY_VALUES = new Set(["visible_all", "contacted_only", "password_protected"])
const PROFILE_PRIVACY_VALUES = new Set(["show_all", "registered_only"])
const PHOTO_VISIBILITY_VALUES = new Set(["everyone", "on_accept"])

const EMAIL_ALERT_KEYS = [
  "member_activity",
  "phone_views",
  "express_interest",
  "personalized_messages",
  "shortlists",
] as const

const SMS_ALERT_KEYS = [
  "member_activity",
  "phone_views",
  "express_interest",
  "personalized_messages",
] as const

function validateAlertObject(
  value: unknown,
  allowedKeys: readonly string[]
): Record<string, boolean> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const input = value as Record<string, unknown>
  const result: Record<string, boolean> = {}

  for (const key of allowedKeys) {
    if (!(key in input)) continue
    if (typeof input[key] !== "boolean") return null
    result[key] = input[key]
  }

  return result
}

export type SanitizedUserSettingsUpdates = Record<string, unknown>

export function sanitizeUserSettingsUpdates(
  updates: unknown
): { ok: true; data: SanitizedUserSettingsUpdates } | { ok: false; error: string } {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return { ok: false, error: "updates must be an object" }
  }

  const input = updates as Record<string, unknown>

  for (const key of Object.keys(input)) {
    if (ADMIN_ONLY_FIELDS.has(key)) {
      return { ok: false, error: `Field "${key}" cannot be modified` }
    }
  }

  const sanitized: SanitizedUserSettingsUpdates = {}

  for (const key of USER_WRITABLE_FIELDS) {
    if (!(key in input)) continue

    const value = input[key]

    switch (key) {
      case "email_alerts": {
        const parsed = validateAlertObject(value, EMAIL_ALERT_KEYS)
        if (!parsed) return { ok: false, error: "Invalid email_alerts" }
        sanitized.email_alerts = parsed
        break
      }
      case "sms_alerts": {
        const parsed = validateAlertObject(value, SMS_ALERT_KEYS)
        if (!parsed) return { ok: false, error: "Invalid sms_alerts" }
        sanitized.sms_alerts = parsed
        break
      }
      case "call_preference":
      case "contact_person":
      case "convenient_call_time":
        if (typeof value !== "string" || value.length > 500) {
          return { ok: false, error: `Invalid ${key}` }
        }
        sanitized[key] = value
        break
      case "mobile_privacy":
        if (typeof value !== "string" || !MOBILE_PRIVACY_VALUES.has(value)) {
          return { ok: false, error: "Invalid mobile_privacy" }
        }
        sanitized.mobile_privacy = value
        break
      case "horoscope_privacy":
        if (typeof value !== "string" || !HOROSCOPE_PRIVACY_VALUES.has(value)) {
          return { ok: false, error: "Invalid horoscope_privacy" }
        }
        sanitized.horoscope_privacy = value
        break
      case "profile_privacy":
        if (typeof value !== "string" || !PROFILE_PRIVACY_VALUES.has(value)) {
          return { ok: false, error: "Invalid profile_privacy" }
        }
        sanitized.profile_privacy = value
        break
      case "photo_visibility":
        if (typeof value !== "string" || !PHOTO_VISIBILITY_VALUES.has(value)) {
          return { ok: false, error: "Invalid photo_visibility" }
        }
        sanitized.photo_visibility = value
        break
      case "horoscope_password":
        if (value !== null && (typeof value !== "string" || value.length > 200)) {
          return { ok: false, error: "Invalid horoscope_password" }
        }
        sanitized.horoscope_password = value
        break
      case "is_deactivated":
        if (typeof value !== "boolean") {
          return { ok: false, error: "Invalid is_deactivated" }
        }
        sanitized.is_deactivated = value
        break
      case "deactivated_until": {
        if (value === null) {
          sanitized.deactivated_until = null
          break
        }
        if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
          return { ok: false, error: "Invalid deactivated_until" }
        }
        const until = new Date(value)
        const now = Date.now()
        const diffDays = (until.getTime() - now) / (1000 * 60 * 60 * 24)
        // Allow 1–365 days for temporary deactivation, or ~3650 days for married status
        if (diffDays < 0.9 || (diffDays > 366 && diffDays < 3640)) {
          return { ok: false, error: "deactivated_until must be 1–365 days from now" }
        }
        sanitized.deactivated_until = value
        break
      }
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return { ok: false, error: "No valid fields to update" }
  }

  return { ok: true, data: sanitized }
}
