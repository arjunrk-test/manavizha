import { NextResponse } from 'next/server'
import { authErrorResponse, requireAuthenticatedUser, requireAdmin } from '@/lib/server/api-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin-client'

const VALID_DOC_TYPES = ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id']

// User: submit an ID document for verification
export async function POST(request: Request) {
    try {
        const { userId } = await requireAuthenticatedUser(request)
        const { documentType, documentPath } = await request.json()

        if (!documentType || !documentPath) {
            return NextResponse.json({ error: 'documentType and documentPath are required' }, { status: 400 })
        }
        if (!VALID_DOC_TYPES.includes(documentType)) {
            return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
        }
        // Path must live under the user's own folder in the private bucket
        if (!documentPath.startsWith(`${userId}/`)) {
            return NextResponse.json({ error: 'Invalid document path' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        
        // Fetch existing photos to preserve them
        const { data: existingPhoto } = await admin
            .from('photos')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
            
        const { error } = await admin
            .from('photos')
            .upsert({
                ...(existingPhoto || {}),
                user_id: userId,
                aadhar_front: documentPath,
                verification_status: 'pending',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}

// User: check own status  |  Admin (?admin=1): list pending with signed URLs
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        if (searchParams.get('admin') === '1') {
            await requireAdmin(request)
            const admin = await getSupabaseAdmin()
            const status = searchParams.get('status') || 'pending'

            // Admin now uses the main photos table, so this endpoint shouldn't be called by admin
            // but we return empty just in case.
            return NextResponse.json({ verifications: [] })


        }

        // Default: caller's own status
        const { userId } = await requireAuthenticatedUser(request)
        const admin = await getSupabaseAdmin()
        const { data: personal } = await admin
            .from('personal_details')
            .select('id_verified')
            .eq('user_id', userId)
            .maybeSingle()
            
        const { data: photoData, error } = await admin
            .from('photos')
            .select('verification_status, aadhar_front')
            .eq('user_id', userId)
            .maybeSingle()

        if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        let verification = null
        if (personal?.id_verified) {
            verification = { status: 'approved' }
        } else if (photoData?.aadhar_front) {
            verification = { status: photoData.verification_status }
        }
        
        return NextResponse.json({ verification })
    } catch (error) {
        return authErrorResponse(error)
    }
}

// Admin: approve / reject
export async function PATCH(request: Request) {
    try {
        await requireAdmin(request)
        const { userId, status, adminNote } = await request.json()

        if (!userId || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'userId and a valid status are required' }, { status: 400 })
        }

        const admin = await getSupabaseAdmin()
        const { error } = await admin
            .from('id_verifications')
            .update({
                status,
                admin_note: adminNote ? String(adminNote).slice(0, 1000) : null,
                reviewed_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Mirror the approved flag onto the profile for badge display
        await admin
            .from('personal_details')
            .update({ id_verified: status === 'approved' })
            .eq('user_id', userId)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return authErrorResponse(error)
    }
}
