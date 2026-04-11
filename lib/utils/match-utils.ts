import { supabase } from "@/lib/supabase"
import { calculateLifestyleScore } from "@/lib/matching"
import { checkTamilPorutham } from "@/lib/astrology"
import { calculateTrustScore } from "@/lib/utils/profile-utils"

/**
 * Generates a stable seeded shuffle of an array based on a string seed (e.g., Date + UserID).
 */
export function seededShuffle<T>(arr: T[], seedStr: string): T[] {
    const result = [...arr]
    
    // Create a numeric seed from the string
    let seed = 0
    for (let i = 0; i < seedStr.length; i++) {
        seed += seedStr.charCodeAt(i)
    }

    // Fisher-Yates shuffle with seeded PRNG
    let s = seed
    for (let i = result.length - 1; i > 0; i--) {
        // Simple deterministic PRNG
        const x = Math.sin(s++) * 10000
        const random = x - Math.floor(x)
        const j = Math.floor(random * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    
    return result
}

/**
 * Gets the current daily seed for a user.
 */
export function getDailySeed(userId: string): string {
    const today = new Date().toISOString().split('T')[0]
    return `${today}-${userId}`
}

/**
 * Fetches and filters potential matches for a user, returning exactly the 10 daily recommendations.
 */
export async function fetchDailyRecommendations(userId: string) {
    try {
        // 1. Get current user's gender and details
        const { data: userData } = await supabase
            .from("personal_details")
            .select("sex, food_preference")
            .eq("user_id", userId)
            .maybeSingle()

        if (!userData) return []

        const targetGender = (userData.sex || "").toLowerCase() === "male" ? "Female" : "Male"

        // 2. Fetch preferences and matches
        const [
            { data: prefs },
            { data: myHoro },
            { data: myInterests },
            { data: mySocial },
            { data: myEmp },
            { data: myBus }
        ] = await Promise.all([
            supabase.from("partner_preferences").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("horoscope_details").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("interests").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("social_habits").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("profession_employee").select("*").eq("user_id", userId).maybeSingle(),
            supabase.from("profession_business").select("*").eq("user_id", userId).maybeSingle()
        ])

        const viewerData: any = {
            ...userData,
            interests: myInterests?.interests || [],
            hobbies: myInterests?.hobbies || [],
            smoking: mySocial?.smoking,
            drinking: mySocial?.drinking,
            foodPreference: userData?.food_preference,
            workLocation: myEmp?.work_location || myBus?.business_location,
            sector: myEmp?.sector || myBus?.business_type,
            salary: myEmp?.salary || myBus?.annual_returns
        }

        // 3. Fetch all potential matches
        const { data: potentialMatches } = await supabase
            .from("personal_details")
            .select("*, created_at")
            .ilike("sex", targetGender)
            .neq("user_id", userId)
            .neq("marital_status", "Married")

        if (!potentialMatches || potentialMatches.length === 0) return []

        const matchUserIds = potentialMatches.map(p => p.user_id)

        // 4. Fetch auxiliary data
        const [
            { data: photosData },
            { data: contactData },
            { data: empData },
            { data: busData },
            { data: eduData },
            { data: targetInterestsData },
            { data: targetSocialData },
            { data: targetHoroData },
            premiumApiRes
        ] = await Promise.all([
            supabase.from("photos").select("user_id, user_photos").in("user_id", matchUserIds),
            supabase.from("contact_details").select("user_id, current_district, current_state").in("user_id", matchUserIds),
            supabase.from("profession_employee").select("*").in("user_id", matchUserIds),
            supabase.from("profession_business").select("*").in("user_id", matchUserIds),
            supabase.from("education_details").select("user_id, education").in("user_id", matchUserIds),
            supabase.from("interests").select("*").in("user_id", matchUserIds),
            supabase.from("social_habits").select("*").in("user_id", matchUserIds),
            supabase.from("horoscope_details").select("*").in("user_id", matchUserIds),
            fetch(`/api/premium-status?userIds=${matchUserIds.join(",")}`).then(r => r.ok ? r.json() : []).catch(() => [])
        ])

        const combined = potentialMatches.map(p => {
            const photos = photosData?.find(x => x.user_id === p.user_id)?.user_photos || []
            const contact = contactData?.find(x => x.user_id === p.user_id)
            const emp = empData?.find(x => x.user_id === p.user_id)
            const bus = busData?.find(x => x.user_id === p.user_id)
            const edu = eduData?.find(x => x.user_id === p.user_id)
            const premiumStatus = Array.isArray(premiumApiRes) ? premiumApiRes.find((x: any) => x.user_id === p.user_id) : null

            let profession = "Not specified"
            if (emp?.designation) profession = emp.designation + (emp.company ? ` at ${emp.company}` : "")
            else if (bus?.designation) profession = bus.designation + (bus.business_name ? ` at ${bus.business_name}` : "")

            const targetInterests = targetInterestsData?.find(x => x.user_id === p.user_id)
            const targetSocial = targetSocialData?.find(x => x.user_id === p.user_id)
            const targetHoro = targetHoroData?.find(x => x.user_id === p.user_id)

            const targetProfileData = {
                ...p,
                foodPreference: p.food_preference,
                hobbies: targetInterests?.hobbies || [],
                interests: targetInterests?.interests || [],
                smoking: targetSocial?.smoking,
                drinking: targetSocial?.drinking,
                workLocation: emp?.work_location || bus?.business_location,
                sector: emp?.sector || bus?.business_type,
                salary: emp?.salary || bus?.annual_returns
            }

            const lifestyleMatch = viewerData ? calculateLifestyleScore(viewerData as any, targetProfileData as any) : null
            const horoscopeMatch = (myHoro?.star && targetHoro?.star) 
                ? checkTamilPorutham(myHoro.star, myHoro.zodiac_sign || "", targetHoro.star, targetHoro.zodiac_sign || "")
                : { score: 0, status: 'Athamam', breakdown: {} }

            return {
                ...p,
                photos,
                location: contact?.current_district ? `${contact.current_district}${contact.current_state ? `, ${contact.current_state}` : ""}` : "Location hidden",
                profession,
                education: edu?.education || "Not specified",
                isPremium: premiumStatus?.is_premium || false,
                premiumPlan: premiumStatus?.premium_plan || null,
                lifestyleScore: lifestyleMatch?.totalScore || 0,
                poruthamScore: horoscopeMatch?.score || 0,
                trustScore: calculateTrustScore(
                    p.photo_verified, 
                    p.completion_percentage || 80, 
                    photos.length || 0,
                    false
                )
            }
        })

        // Filter by simple age preference for recommendations
        let filtered = combined
        if (prefs) {
            filtered = combined.filter(p => {
                if (prefs.min_age && p.age && p.age < prefs.min_age) return false
                if (prefs.max_age && p.age && p.age > prefs.max_age) return false
                return true
            })
        }

        // Shuffle and slice
        const seedStr = getDailySeed(userId)
        return seededShuffle(filtered, seedStr).slice(0, 10)
    } catch (error) {
        console.error("Error fetching daily recommendations:", error)
        return []
    }
}
