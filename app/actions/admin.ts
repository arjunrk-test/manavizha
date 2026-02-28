"use server"

import { createClient } from "@supabase/supabase-js"
import fetch from "cross-fetch"
import axios from "axios"
import * as https from "https"
import * as fs from 'fs'

// Force IPv4 using a custom HTTPS Agent (fixes Node 18+ undici timeout on Windows to Supabase)
const ipv4Agent = new https.Agent({ family: 4 })

const customFetch = (url: RequestInfo | URL, options?: RequestInit) => {
    return fetch(url.toString(), {
        ...options,
        agent: ipv4Agent
    } as any)
}

// Override Next.js undici fetch globally for this action file
if (typeof globalThis !== 'undefined') {
    globalThis.fetch = customFetch as any;
}

// We use the Service Role Key here to bypass RLS and perform administrative auth actions.
// WARNING: NEVER expose this key to the client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
    global: {
        fetch: fetch
    }
})

export type AdminRole = "super_admin" | "editor" | "viewer"

export async function createAdminAccount(data: {
    name: string
    email: string
    phone: string
    role: AdminRole
    password?: string
}) {
    fs.appendFileSync('debug.txt', `[${new Date().toISOString()}] createAdminAccount called with email: ${data.email}\n`)
    try {
        fs.appendFileSync('debug.txt', `\n[${new Date().toISOString()}] Attempting to fetch Auth user creation via Axios...\n`)

        // 1. Create the user in Supabase Auth using native Axios to bypass Next.js unresolvable DNS looping
        const { data: authData } = await axios.post(
            `${supabaseUrl}/auth/v1/admin/users`,
            {
                email: data.email,
                password: data.password || "TempAdmin!23",
                email_confirm: true,
                user_metadata: {
                    role: data.role,
                    name: data.name,
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'apikey': supabaseServiceKey,
                    'Content-Type': 'application/json'
                },
                httpsAgent: ipv4Agent
            }
        )

        if (!authData || !authData.id) {
            throw new Error("Failed to create user account (No ID returned)")
        }

        const userId = authData.id

        // 2. Insert into admins table
        const { error: adminError } = await supabaseAdmin
            .from("admins")
            .insert({
                user_id: userId,
                role: data.role,
            })

        if (adminError) throw adminError

        // 3. Insert basic data into personal_details so they have a profile
        const { error: profileError } = await supabaseAdmin
            .from("personal_details")
            .insert({
                user_id: userId,
                name: data.name,
            })

        if (profileError) console.error("Could not insert personal details for Admin:", profileError)

        // 4. Insert basic contact details
        const { error: contactError } = await supabaseAdmin
            .from("contact_details")
            .insert({
                user_id: userId,
                phone: data.phone,
                email: data.email,
            })

        if (contactError) console.error("Could not insert contact details for Admin:", contactError)

        fs.appendFileSync('debug.txt', `[${new Date().toISOString()}] Successfully completed createAdminAccount\n`)
        return { success: true, user: authData }
    } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.message || "Unknown error occurred"
        fs.appendFileSync('debug.txt', `[${new Date().toISOString()}] ERROR: ${errorMsg}\nCAUSE: ${error?.cause ? JSON.stringify(error.cause) : 'none'}\nSTACK: ${error?.stack}\n`)
        console.error("Error creating admin:", error)
        return { success: false, error: errorMsg }
    }
}

export async function updateAdminRole(userId: string, newRole: AdminRole) {
    try {
        // Update the admins table
        const { error: dbError } = await supabaseAdmin
            .from("admins")
            .update({ role: newRole })
            .eq("user_id", userId)

        if (dbError) throw dbError

        // Optionally update user_metadata in Auth if keeping it synced
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role: newRole }
        })

        return { success: true }
    } catch (error: any) {
        console.error("Error updating admin role:", error)
        return { success: false, error: error.message }
    }
}

export async function revokeAdminAccess(userId: string) {
    try {
        // Delete the admin role entirely to revoke access
        // Depending on DB rules this could also cascade or be a soft delete. We'll do a hard delete from `admins`
        const { error: dbError } = await supabaseAdmin
            .from("admins")
            .delete()
            .eq("user_id", userId)

        if (dbError) throw dbError

        // Disable their auth account or delete them from the system completely
        // We'll delete them from Auth to fully clean up
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) throw authError

        return { success: true }
    } catch (error: any) {
        console.error("Error revoking admin access:", error)
        return { success: false, error: error.message }
    }
}
