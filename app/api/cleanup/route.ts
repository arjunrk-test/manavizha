import { NextResponse } from 'next/server'
import { cleanupData } from '@/app/actions/admin'

export async function GET() {
    const result = await cleanupData()
    return NextResponse.json(result)
}
