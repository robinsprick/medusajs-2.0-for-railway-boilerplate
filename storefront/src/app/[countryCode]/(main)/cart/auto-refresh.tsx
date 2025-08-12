"use client"

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export function AutoRefresh() {
  const searchParams = useSearchParams()
  const hasRefreshed = useRef(false)
  
  useEffect(() => {
    // Check if we have refresh indicators in the URL
    const needsRefresh = searchParams.has('_refresh') || 
                        searchParams.has('_t') ||
                        searchParams.has('items_added')
    
    const fromKonfigurator = searchParams.get('from') === 'konfigurator' ||
                            searchParams.get('source') === 'konfigurator'
    
    console.log('[AutoRefresh] Checking:', {
      needsRefresh,
      fromKonfigurator,
      hasRefreshed: hasRefreshed.current,
      params: Object.fromEntries(searchParams.entries())
    })
    
    // Only refresh once and only if we have the indicators
    if (needsRefresh && !hasRefreshed.current) {
      hasRefreshed.current = true
      
      console.log('[AutoRefresh] Triggering automatic page reload...')
      
      // Small delay to ensure server processing is complete
      setTimeout(() => {
        // Force a hard reload to get fresh data
        window.location.reload()
      }, 100)
    }
  }, [searchParams])
  
  // Show loading indicator while refreshing
  if (searchParams.has('_refresh') && !hasRefreshed.current) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Warenkorb wird aktualisiert...</p>
        </div>
      </div>
    )
  }
  
  return null
}