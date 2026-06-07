import { supabaseAdmin } from "@/lib/supabase"

async function getSignedPhotoUrl(
  userId: string,
  url: string | null,
  bucket: string
): Promise<string> {
  if (!url) return ""
  if (url.startsWith("http")) return url

  try {
    const filePath = url.includes("/") ? url : `${userId}/${url}`
    const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(filePath, 31536000)
    return data?.signedUrl || url
  } catch {
    return url
  }
}

async function processProfilePhotos(userId: string, photos: Record<string, unknown> | null) {
  if (!photos) return null

  const userPhotos = (photos.user_photos as string[] | undefined) || []
  const userPhotoUrls = await Promise.all(
    userPhotos.map(async (photo: string, index: number) => {
      if (photo.startsWith("http")) return photo
      try {
        const filePath = photo.includes("/") ? photo : `${userId}/photo_${index + 1}.jpg`
        const { data } = await supabaseAdmin.storage
          .from("user-photos")
          .createSignedUrl(filePath, 31536000)
        return data?.signedUrl || photo
      } catch {
        return photo
      }
    })
  )

  return {
    userPhotos: userPhotoUrls,
    familyPhoto: await getSignedPhotoUrl(userId, photos.family_photo as string | null, "family-photos"),
    aadharFront: await getSignedPhotoUrl(userId, photos.aadhar_front as string | null, "aadhar-photos"),
    aadharBack: await getSignedPhotoUrl(userId, photos.aadhar_back as string | null, "aadhar-photos"),
  }
}

export async function fetchReferralPartnerProfileBundle(targetUserId: string) {
  const [
    { data: personal },
    { data: contact },
    { data: education },
    { data: family },
    { data: horoscope },
    { data: interests },
    { data: social },
    { data: photos },
    { data: referral },
    { data: employee },
    { data: business },
    { data: student },
    { data: userRow },
  ] = await Promise.all([
    supabaseAdmin.from("personal_details").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("contact_details").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("education_details").select("*").eq("user_id", targetUserId),
    supabaseAdmin.from("family_details").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("horoscope_details").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("interests").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("social_habits").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("photos").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin
      .from("referral_details")
      .select("*, referral_partners(name)")
      .eq("user_id", targetUserId)
      .maybeSingle(),
    supabaseAdmin.from("profession_employee").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("profession_business").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("profession_student").select("*").eq("user_id", targetUserId).maybeSingle(),
    supabaseAdmin.from("users").select("email, name, phone").eq("id", targetUserId).maybeSingle(),
  ])

  const processedPhotos = await processProfilePhotos(targetUserId, photos)

  return {
    personal: personal || {},
    contact: contact || {},
    family: family || {},
    horoscope: horoscope || {},
    interests: interests || {},
    social: social || {},
    userRow: userRow || {},
    raw: {
      edu: education || [],
      photos: processedPhotos,
      ref: referral,
      emp: employee,
      bus: business,
      stu: student,
    },
  }
}

export const REFERRAL_PARTNER_EDITABLE_TABLES = new Set([
  "personal_details",
  "contact_details",
  "family_details",
  "horoscope_details",
  "interests",
  "social_habits",
])
