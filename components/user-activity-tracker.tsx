'use client'

import { useEffect } from 'react'
import { updateActivity } from '@/app/actions/activity'

export function UserActivityTracker() {
    useEffect(() => {
        // Run immediately on mount
        updateActivity()

        // Set up interval to update every 1 minute
        // 1 minute = 60,000 ms
        const intervalId = setInterval(() => {
            updateActivity()
        }, 60000)

        return () => clearInterval(intervalId)
    }, [])

    // This component doesn't render anything
    return null
}
