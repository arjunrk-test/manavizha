import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser, ApiAuthError } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'
import type { SupabaseClient } from '@supabase/supabase-js'

async function verifyChildCanLinkParents(admin: SupabaseClient, childUserId: string) {
    const { data: asParent, error: parentError } = await admin
        .from('parents')
        .select('id')
        .eq('id', childUserId)
        .maybeSingle()

    if (parentError) {
        throw new Error(`Error verifying caller: ${parentError.message}`)
    }

    if (asParent) {
        throw new ApiAuthError(403, 'Only member accounts can link parent profiles')
    }
}

export async function GET(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()

        const { data: parentRecord, error } = await admin
            .from('parents')
            .select('id, child_user_id, name, email, role')
            .eq('id', userId)
            .single()

        if (error || !parentRecord) {
            return NextResponse.json({ error: 'Parent record not found' }, { status: 404 })
        }

        return NextResponse.json({ parent: parentRecord })
    } catch (error: any) {
        if (error instanceof ApiAuthError) {
            return authErrorResponse(error)
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { userId: childUserId } = await requireAuthenticatedUser(request)
        const body = await request.json()
        const { email, password, name, phone, role, child_user_id: clientChildId } = body

        if (clientChildId && clientChildId !== childUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
        }

        if (typeof password !== 'string' || password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        if (role !== 'Father' && role !== 'Mother') {
            return NextResponse.json(
                { error: 'Role must be either Father or Mother' },
                { status: 400 }
            )
        }

        const admin = await getSupabaseAdmin()
        await verifyChildCanLinkParents(admin, childUserId)

        const { data: existingParent, error: existingParentError } = await admin
            .from('parents')
            .select('id')
            .eq('child_user_id', childUserId)
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

        const { data: authData, error: authError } = await admin.auth.admin.createUser({
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

        const { error: usersError } = await admin
            .from('users')
            .upsert({
                id: parentUserId,
                email: email,
                name: name,
                phone: phone || null
            }, { onConflict: 'id' })

        if (usersError) {
            await admin.auth.admin.deleteUser(parentUserId)
            throw new Error(`Error creating public user record: ${usersError.message}`)
        }

        const { data: parentRecord, error: parentError } = await admin
            .from('parents')
            .insert({
                id: parentUserId,
                child_user_id: childUserId,
                name,
                email,
                phone: phone || null,
                role,
            })
            .select()
            .single()

        if (parentError) {
            await admin.auth.admin.deleteUser(parentUserId)
            throw new Error(`Error creating parent profile: ${parentError.message}`)
        }

        return NextResponse.json({
            success: true,
            message: 'Parent profile created successfully',
            parent: parentRecord
        })

    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        if (error instanceof ApiAuthError) {
            return authErrorResponse(error)
        }
        console.error('Error in /api/parents:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
