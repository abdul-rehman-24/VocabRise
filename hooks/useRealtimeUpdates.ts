'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

// Realtime updates - disabled to prevent infinite refresh loops
// The main hook (useDashboardData) handles initial data loading
// This prevents duplicate fetches that cause the refresh loop
export function useRealtimeUpdates(userId: string, refetch: () => void) {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Polling disabled - causes refresh loops with current hook setup
    // Data will be fetched once on component mount via useDashboardData
    // Users can manually click "Refresh" to get latest data
    return () => {}
  }, [userId, status, refetch])
}
