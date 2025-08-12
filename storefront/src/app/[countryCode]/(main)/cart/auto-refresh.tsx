"use client"

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function AutoRefresh() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasProcessed = useRef(false)
  
  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return
    
    // Check if we have refresh indicators in the URL
    const needsRefresh = searchParams.has('_refresh') || 
                        searchParams.has('_t') ||
                        searchParams.has('items_added')
    
    const fromKonfigurator = searchParams.get('from') === 'konfigurator' ||
                            searchParams.get('source') === 'konfigurator'
    
    console.log('[AutoRefresh] Checking:', {
      needsRefresh,
      fromKonfigurator,
      hasProcessed: hasProcessed.current,
      params: Object.fromEntries(searchParams.entries())
    })
    
    // Only process once and only if we have the indicators
    if (needsRefresh && !hasProcessed.current) {
      hasProcessed.current = true
      
      console.log('[AutoRefresh] Processing refresh...')
      
      // Clean the URL first to prevent loop
      const cleanUrl = new URL(window.location.href)
      cleanUrl.searchParams.delete('_refresh')
      cleanUrl.searchParams.delete('_t')
      cleanUrl.searchParams.delete('items_added')
      cleanUrl.searchParams.delete('from')
      cleanUrl.searchParams.delete('source')
      
      // Replace URL without triggering navigation
      window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search)
      
      // Then refresh the router to get fresh data
      setTimeout(() => {
        console.log('[AutoRefresh] Refreshing router...')
        router.refresh()
      }, 100)
    }
  }, [searchParams, router])
  
  // Don't show loading indicator anymore to prevent visual loop
  // The refresh happens so fast it's not needed
  
  return null
}