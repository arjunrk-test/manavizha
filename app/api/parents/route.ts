import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import https from 'https'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const customFetch = (url: any, options: any = {}) => {
    try {
        const u = new URL(url)
        if (u.hostname === 'olktibxfpgfjkcppqbqd.supabase.co') {
            const originalHost = u.hostname
            u.hostname = '104.18.38.10' // Real Cloudflare IP for Supabase

            options.headers = options.headers || {}
            if (typeof options.headers.set === 'function') {
                options.headers.set('Host', originalHost)
            } else {
                options.headers['Host'] = originalHost
            }

            options.agent = new https.Agent({ servername: originalHost })
            return (fetch as any)(u.toString(), options)
        }
        return (fetch as any)(url, options)
    } catch (e) {
        return (fetch as any)(url, options)
    }
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: customFetch }
})

export async function POST(request: Request) {
    try {
        const { email, password, name, phone, role, child_user_id } = await request.json()

        if (!email || !password || !name || !role || !child_user_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (role !== 'Father' && role !== 'Mother') {
            return NextResponse.json(
                { error: 'Role must be either Father or Mother' },
                { status: 400 }
            )
        }

        // 1. Check if parent already exists for this child with this role
        const { data: existingParent, error: existingParentError } = await supabaseAdmin
            .from('parents')
            .select('id')
            .eq('child_user_id', child_user_id)
            .eq('role', role)
            .maybeSingle()

        if (existingParentError) {
            throw new Error(`Error checking existing parent: ${existingParentError.message}`)
        }

        if (existingParent) {
            return NextResponse.json(
                { error: `You have already added a ${role} profile.` },
                { status: 400 }
            )
        }

        // 2. Create the user in Supabase Auth using the Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, is_parent: true }
        })

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user account' },
                { status: 500 }
            )
        }

        const parentUserId = authData.user.id

        // 3. Upsert into public.users so they can technically login and be recognized
        const { error: usersError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: parentUserId,
                email: email,
                name: name,
                phone: phone || null
            }, { onConflict: 'id' })

        if (usersError) {
            // Cleanup auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(parentUserId)
            throw new Error(`Error creating public user record: ${usersError.message}`)
        }

        // 4. Create the specific parents record linking them to the child
        const { data: parentRecord, error: parentError } = await supabaseAdmin
            .from('parents')
            .insert({
                id: parentUserId,
                child_user_id,
                name,
                email,
                phone: phone || null,
                role,
            })
            .select()
            .single()

        if (parentError) {
            // Cleanup
            await supabaseAdmin.auth.admin.deleteUser(parentUserId)
            throw new Error(`Error creating parent profile: ${parentError.message}`)
        }

        return NextResponse.json({
            success: true,
            message: 'Parent profile created successfully',
            parent: parentRecord
        })

    } catch (error: any) {
        console.error('Error in /api/parents:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
