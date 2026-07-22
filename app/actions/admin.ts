"use server"

import axios from "axios"
import * as https from "https"
import * as dns from 'dns'
import { AdminAuthError, authErrorResult, requireAdminCaller, type AdminRole } from "@/lib/server/admin-auth"
import { executeTestUserCleanup } from "@/lib/server/admin-cleanup"

export type { AdminRole } from "@/lib/server/admin-auth"

/** Serverless (e.g. Vercel) has a read-only FS — never write debug.txt here; use logs. */
function adminDebugLog(message: string) {
    console.log(`[admin] ${message}`)
}

// Force Node to prefer IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first')

async function getAxios() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase credentials are not set")

    const instance = axios.create({
        baseURL: supabaseUrl,
        timeout: 15000,
        headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
        },
    })
    return instance
}

export async function createAdminAccount(
    accessToken: string,
    data: {
    name: string
    email: string
    phone: string
    role: AdminRole
    password?: string
}
) {
    adminDebugLog(`${new Date().toISOString()} createAdminAccount: ${data.email}`)

    try {
        await requireAdminCaller(accessToken, "super_admin")
        const ax = await getAxios()

        // Step 1: Create user in Supabase Auth
        const { data: authData } = await ax.post('/auth/v1/admin/users', {
            email: data.email,
            password: data.password || "TempAdmin!23",
            email_confirm: true,
            user_metadata: { role: data.role, name: data.name },
        })

        if (!authData?.id) throw new Error("No user ID returned from auth")
        const userId = authData.id
        adminDebugLog(`${new Date().toISOString()} Auth user created: ${userId}`)

        // Step 2: Insert into admins table via REST API
        const { data: adminRow, status: adminStatus } = await ax.post(
            '/rest/v1/admins',
            {
                user_id: userId,
                email: data.email,
                name: data.name,
                phone: data.phone || null,
                role: data.role,
            },
            { headers: { 'Prefer': 'return=representation' } }
        )
        adminDebugLog(`${new Date().toISOString()} Admins table insert status: ${adminStatus}`)

        // Step 3: Insert into personal_details (best-effort)
        try {
            await ax.post('/rest/v1/personal_details', { user_id: userId, name: data.name })
        } catch (e: any) {
            adminDebugLog(`${new Date().toISOString()} personal_details insert failed (non-fatal): ${e.message}`)
        }

        // Step 4: Insert into contact_details (best-effort)
        try {
            await ax.post('/rest/v1/contact_details', { user_id: userId, phone: data.phone, email: data.email })
        } catch (e: any) {
            adminDebugLog(`${new Date().toISOString()} contact_details insert failed (non-fatal): ${e.message}`)
        }

        adminDebugLog(`${new Date().toISOString()} createAdminAccount SUCCESS`)
        return { success: true, user: authData }
    } catch (error: any) {
        if (error instanceof AdminAuthError) {
            return authErrorResult(error)
        }
        const errorMsg = error?.response?.data?.message || error?.response?.data || error?.message || "Unknown error"
        adminDebugLog(`${new Date().toISOString()} ERROR: ${JSON.stringify(errorMsg)} STACK: ${error?.stack}`)
        console.error("Error creating admin:", errorMsg)
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) }
    }
}

export async function createReferralPartnerAccount(
    accessToken: string,
    data: {
    name: string
    email: string
    phone: string
    password?: string
}
) {
    adminDebugLog(`${new Date().toISOString()} createReferralPartnerAccount: ${data.email}`)

    try {
        await requireAdminCaller(accessToken, "super_admin")
        const ax = await getAxios()

        // Step 1: Create user in Supabase Auth
        const { data: authData } = await ax.post('/auth/v1/admin/users', {
            email: data.email,
            password: data.password || "Partner!23", // Default partner password
            email_confirm: true,
            user_metadata: { role: "referral_partner", name: data.name },
        })

        if (!authData?.id) throw new Error("No user ID returned from auth")
        const userId = authData.id
        adminDebugLog(`${new Date().toISOString()} Auth user created (Partner): ${userId}`)

        // Step 2: Insert into referral_partners table
        const { data: partnerRow, status: partnerStatus } = await ax.post(
            '/rest/v1/referral_partners',
            {
                user_id: userId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                referral_percentage: 10 // Default percentage
            },
            { headers: { 'Prefer': 'return=representation' } }
        )
        adminDebugLog(`${new Date().toISOString()} referral_partners insert status: ${partnerStatus}`)

        // Step 3: Insert into personal_details
        try {
            await ax.post('/rest/v1/personal_details', { user_id: userId, name: data.name })
        } catch (e: any) {
            adminDebugLog(`${new Date().toISOString()} personal_details insert failed (Partner): ${e.message}`)
        }

        // Step 4: Insert into contact_details
        try {
            await ax.post('/rest/v1/contact_details', { user_id: userId, phone: data.phone, email: data.email })
        } catch (e: any) {
            adminDebugLog(`${new Date().toISOString()} contact_details insert failed (Partner): ${e.message}`)
        }

        adminDebugLog(`${new Date().toISOString()} createReferralPartnerAccount SUCCESS`)
        return { success: true, user: authData }
    } catch (error: any) {
        if (error instanceof AdminAuthError) {
            return authErrorResult(error)
        }
        const errorMsg = error?.response?.data?.message || error?.response?.data || error?.message || "Unknown error"
        adminDebugLog(`${new Date().toISOString()} ERROR (Partner): ${JSON.stringify(errorMsg)} STACK: ${error?.stack}`)
        console.error("Error creating partner:", errorMsg)
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) }
    }
}

export async function updateAdminRole(accessToken: string, userId: string, newRole: AdminRole) {
    try {
        const caller = await requireAdminCaller(accessToken, "super_admin")
        if (caller.userId === userId) {
            return { success: false, error: "You cannot change your own admin role" }
        }

        const ax = await getAxios()

        // Update admins table
        await ax.patch(
            `/rest/v1/admins?user_id=eq.${userId}`,
            { role: newRole },
            { headers: { 'Prefer': 'return=minimal' } }
        )

        // Update auth user metadata
        await ax.put(`/auth/v1/admin/users/${userId}`, {
            user_metadata: { role: newRole }
        })

        return { success: true }
    } catch (error: any) {
        if (error instanceof AdminAuthError) {
            return authErrorResult(error)
        }
        const errorMsg = error?.response?.data?.message || error?.message
        console.error("Error updating admin role:", errorMsg)
        return { success: false, error: errorMsg }
    }
}

export async function revokeAdminAccess(accessToken: string, userId: string) {
    try {
        const caller = await requireAdminCaller(accessToken, "super_admin")
        if (caller.userId === userId) {
            return { success: false, error: "You cannot revoke your own admin access" }
        }

        const ax = await getAxios()

        // Delete from admins table
        await ax.delete(`/rest/v1/admins?user_id=eq.${userId}`)

        // Delete auth user
        await ax.delete(`/auth/v1/admin/users/${userId}`)

        return { success: true }
    } catch (error: any) {
        if (error instanceof AdminAuthError) {
            return authErrorResult(error)
        }
        const errorMsg = error?.response?.data?.message || error?.message
        console.error("Error revoking admin access:", errorMsg)
        return { success: false, error: errorMsg }
    }
}

export async function getAllParentIds(accessToken: string) {
    adminDebugLog(`${new Date().toISOString()} getAllParentIds called`)
    try {
        await requireAdminCaller(accessToken, "viewer")
        const ax = await getAxios()
        const { data } = await ax.get('/rest/v1/parents?select=id')
        adminDebugLog(`${new Date().toISOString()} getAllParentIds SUCCESS: ${data.length} parents`)
        return { success: true, ids: data.map((p: any) => p.id) }
    } catch (error: any) {
        if (error instanceof AdminAuthError) {
            return { ...authErrorResult(error), ids: [] as string[] }
        }
        const errorMsg = error?.response?.data || error?.message
        adminDebugLog(`${new Date().toISOString()} getAllParentIds ERROR: ${JSON.stringify(errorMsg)}`)
        console.error("Error fetching parent IDs:", errorMsg)
        return { success: false, ids: [] }
    }
}

export async function cleanupData(accessToken: string) {
    try {
        await requireAdminCaller(accessToken, "super_admin")
        adminDebugLog(`${new Date().toISOString()} CLEANUP: starting test-user cleanup`)
        return executeTestUserCleanup()
    } catch (e: any) {
        if (e instanceof AdminAuthError) {
            return authErrorResult(e)
        }
        const errorMsg = e?.response?.data || e?.message
        adminDebugLog(`${new Date().toISOString()} CLEANUP ERROR: ${JSON.stringify(errorMsg)}`)
        return { success: false, error: String(errorMsg) }
    }
}
export async function updateUserPremiumSubscription(
    accessToken: string,
    data: {
    userId: string
    isPremium: boolean
    plan: string | null
    expiresAt: string | null
}
) {
    adminDebugLog(`${new Date().toISOString()} updateUserPremiumSubscription: ${data.userId} to ${data.plan}`)

    try {
        await requireAdminCaller(accessToken, "editor")
        const ax = await getAxios()

        // Check if user_settings exists
        const { data: settings } = await ax.get(`/rest/v1/user_settings?user_id=eq.${data.userId}&select=user_id`)
        
        const payload = {
            user_id: data.userId,
            is_premium: data.isPremium,
            premium_plan: data.plan,
            premium_expires_at: data.expiresAt,
            updated_at: new Date().toISOString()
        }

        if (settings && settings.length > 0) {
            // Update
            await ax.patch(`/rest/v1/user_settings?user_id=eq.${data.userId}`, payload)
        } else {
            // Insert
            await ax.post('/rest/v1/user_settings', payload)
        }

        adminDebugLog(`${new Date().toISOString()} updateUserPremiumSubscription SUCCESS`)
        return { success: true }
    } catch (error: any) {
        if (error instanceof AdminAuthError) {
            return authErrorResult(error)
        }
        const errorMsg = error?.response?.data?.message || error?.message || "Unknown error"
        adminDebugLog(`${new Date().toISOString()} updateUserPremiumSubscription ERROR: ${JSON.stringify(errorMsg)}`)
        console.error("Error updating subscription:", errorMsg)
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) }
    }
}

export async function updateVerificationStatus(
    accessToken: string,
    targetUserId: string,
    status: "verified" | "rejected"
) {
    adminDebugLog(`${new Date().toISOString()} updateVerificationStatus: ${targetUserId} to ${status}`)
    try {
        await requireAdminCaller(accessToken, "editor")
        const ax = await getAxios()

        // 1. Update photos table
        await ax.patch(
            `/rest/v1/photos?user_id=eq.${targetUserId}`,
            { verification_status: status }
        )

        // 2. Update personal_details table
        if (status === "verified") {
            await ax.patch(
                `/rest/v1/personal_details?user_id=eq.${targetUserId}`,
                { photo_verified: true, id_verified: true }
            )
        } else {
            await ax.patch(
                `/rest/v1/personal_details?user_id=eq.${targetUserId}`,
                { photo_verified: false, id_verified: false }
            )
        }

        adminDebugLog(`${new Date().toISOString()} updateVerificationStatus SUCCESS`)
        return { success: true }
    } catch (error: any) {
        if (error instanceof AdminAuthError) {
            return authErrorResult(error)
        }
        const errorMsg = error?.response?.data?.message || error?.message || "Unknown error"
        adminDebugLog(`${new Date().toISOString()} updateVerificationStatus ERROR: ${JSON.stringify(errorMsg)}`)
        console.error("Error updating verification:", errorMsg)
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) }
    }
}
