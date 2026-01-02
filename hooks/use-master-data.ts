import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

interface MasterDataItem {
  id: string
  value: string
  category?: string
  colour_code?: string
  created_at?: string
  updated_at?: string
}

interface UseMasterDataOptions {
  tableName: string
  enabled?: boolean // Optional flag to enable/disable fetching
}

interface UseMasterDataReturn {
  data: MasterDataItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook to fetch master data from any master table
 * @param options - Configuration object with tableName and optional enabled flag
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useMasterData({
  tableName,
  enabled = true,
}: UseMasterDataOptions): UseMasterDataReturn {
  const [data, setData] = useState<MasterDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: true })

      if (fetchError) throw fetchError

      setData(fetchedData || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error(`Error fetching ${tableName}:`, error)
      setError(error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [tableName, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}

