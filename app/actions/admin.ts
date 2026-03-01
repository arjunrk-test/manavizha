"use server"

import axios from "axios"
import * as https from "https"
import * as fs from 'fs'
import * as dns from 'dns'

// Force Node to prefer IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseHost = new URL(supabaseUrl).hostname

export type AdminRole = "super_admin" | "admin" | "editor" | "viewer"

// Resolve Supabase hostname fresh each time to avoid stale DNS cache
async function resolveHost(): Promise<string> {
    return new Promise((resolve, reject) => {
        dns.resolve4(supabaseHost, (err, addresses) => {
            if (err) reject(err)
            else resolve(addresses[0])
        })
    })
}

// Build an axios instance that connects directly to the resolved IP
// with the correct Host header — bypasses ISP DNS issues entirely
async function getAxios() {
    const ip = await resolveHost()
    const instance = axios.create({
        baseURL: `https://${ip}`,
        timeout: 15000,
        httpsAgent: new https.Agent({ family: 4 }),
        headers: {
            'Host': supabaseHost,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
        },
    })
    return instance
}

export async function createAdminAccount(data: {
    name: string
    email: string
    phone: string
    role: AdminRole
    password?: string
}) {
    const logFile = 'debug.txt'
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] createAdminAccount: ${data.email}\n`)

    try {
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
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Auth user created: ${userId}\n`)

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
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Admins table insert status: ${adminStatus}\n`)

        // Step 3: Insert into personal_details (best-effort)
        try {
            await ax.post('/rest/v1/personal_details', { user_id: userId, name: data.name })
        } catch (e: any) {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] personal_details insert failed (non-fatal): ${e.message}\n`)
        }

        // Step 4: Insert into contact_details (best-effort)
        try {
            await ax.post('/rest/v1/contact_details', { user_id: userId, phone: data.phone, email: data.email })
        } catch (e: any) {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] contact_details insert failed (non-fatal): ${e.message}\n`)
        }

        fs.appendFileSync(logFile, `[${new Date().toISOString()}] createAdminAccount SUCCESS\n`)
        return { success: true, user: authData }
    } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.response?.data || error?.message || "Unknown error"
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR: ${JSON.stringify(errorMsg)}\nSTACK: ${error?.stack}\n`)
        console.error("Error creating admin:", errorMsg)
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) }
    }
}

export async function createReferralPartnerAccount(data: {
    name: string
    email: string
    phone: string
    password?: string
}) {
    const logFile = 'debug.txt'
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] createReferralPartnerAccount: ${data.email}\n`)

    try {
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
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Auth user created (Partner): ${userId}\n`)

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
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] referral_partners insert status: ${partnerStatus}\n`)

        // Step 3: Insert into personal_details
        try {
            await ax.post('/rest/v1/personal_details', { user_id: userId, name: data.name })
        } catch (e: any) {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] personal_details insert failed (Partner): ${e.message}\n`)
        }

        // Step 4: Insert into contact_details
        try {
            await ax.post('/rest/v1/contact_details', { user_id: userId, phone: data.phone, email: data.email })
        } catch (e: any) {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] contact_details insert failed (Partner): ${e.message}\n`)
        }

        fs.appendFileSync(logFile, `[${new Date().toISOString()}] createReferralPartnerAccount SUCCESS\n`)
        return { success: true, user: authData }
    } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.response?.data || error?.message || "Unknown error"
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR (Partner): ${JSON.stringify(errorMsg)}\nSTACK: ${error?.stack}\n`)
        console.error("Error creating partner:", errorMsg)
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) }
    }
}

export async function updateAdminRole(userId: string, newRole: AdminRole) {
    try {
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
        const errorMsg = error?.response?.data?.message || error?.message
        console.error("Error updating admin role:", errorMsg)
        return { success: false, error: errorMsg }
    }
}

export async function revokeAdminAccess(userId: string) {
    try {
        const ax = await getAxios()

        // Delete from admins table
        await ax.delete(`/rest/v1/admins?user_id=eq.${userId}`)

        // Delete auth user
        await ax.delete(`/auth/v1/admin/users/${userId}`)

        return { success: true }
    } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.message
        console.error("Error revoking admin access:", errorMsg)
        return { success: false, error: errorMsg }
    }
}

export async function getAllParentIds() {
    const logFile = 'debug.txt'
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] getAllParentIds called\n`)
    try {
        const ax = await getAxios()
        const { data } = await ax.get('/rest/v1/parents?select=id')
        const { data: usersData } = await ax.get('/rest/v1/users?select=id,email,name')
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] USERS DUMP: ${JSON.stringify(usersData)}\nPARENT DUMP: ${JSON.stringify(data)}\n`)
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] getAllParentIds SUCCESS: ${data.length} parents\n`)
        return { success: true, ids: data.map((p: any) => p.id) }
    } catch (error: any) {
        const errorMsg = error?.response?.data || error?.message
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] getAllParentIds ERROR: ${JSON.stringify(errorMsg)}\n`)
        console.error("Error fetching parent IDs:", errorMsg)
        return { success: false, ids: [] }
    }
}

export async function cleanupData() {
    const logFile = 'debug.txt'
    try {
        const ax = await getAxios()
        const emailsToDelete = ['tls-test2@test.com', 'tls-test@test.com', 'edge2@test.com']
        // Get users by email from the admin auth API
        const { data: allUsers } = await ax.get('/auth/v1/admin/users?page=1&per_page=200')
        const usersToDelete = (allUsers?.users || []).filter((u: any) => emailsToDelete.includes(u.email))
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] CLEANUP: Found ${usersToDelete.length} users to delete\n`)
        for (const u of usersToDelete) {
            await ax.delete(`/auth/v1/admin/users/${u.id}`)
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] CLEANUP: Deleted ${u.email} (${u.id})\n`)
        }
        return { success: true, deleted: usersToDelete.length }
    } catch (e: any) {
        const errorMsg = e?.response?.data || e?.message
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] CLEANUP ERROR: ${JSON.stringify(errorMsg)}\n`)
        return { success: false, error: String(errorMsg) }
    }
}
