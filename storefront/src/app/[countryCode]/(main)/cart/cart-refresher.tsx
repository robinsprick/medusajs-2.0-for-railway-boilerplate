"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function CartRefresher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    // Check if we have cart update parameters
    const hasUpdateParams = searchParams.has('variants') || 
                           searchParams.has('action') || 
                           searchParams.has('add_to_cart') ||
                           searchParams.has('added')
    
    if (hasUpdateParams && !isProcessing) {
      setIsProcessing(true)
      
      // Force a router refresh to get latest cart data
      console.log('[CartRefresher] Forcing refresh due to cart update params')
      
      // Small delay to ensure server-side processing is complete
      setTimeout(() => {
        router.refresh()
        
        // Clean URL after refresh
        const url = new URL(window.location.href)
        url.search = ''
        window.history.replaceState({}, '', url.toString())
        
        setIsProcessing(false)
      }, 500)
    }
  }, [searchParams, router, isProcessing])
  
  // Check localStorage for cart updates from external sources
  useEffect(() => {
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('cart_last_update')
      const lastCheck = sessionStorage.getItem('cart_last_check')
      
      if (lastUpdate && lastUpdate !== lastCheck) {
        console.log('[CartRefresher] Cart updated externally, refreshing...')
        sessionStorage.setItem('cart_last_check', lastUpdate)
        router.refresh()
      }
    }
    
    // Check immediately
    checkForUpdates()
    
    // Set up interval to check periodically
    const interval = setInterval(checkForUpdates, 2000)
    
    return () => clearInterval(interval)
  }, [router])
  
  return null
}