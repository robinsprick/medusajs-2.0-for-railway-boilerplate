"use client"

import { useEffect } from 'react'

export function UrlCleaner() {
  useEffect(() => {
    // Delay URL cleaning to ensure processing is complete
    const timeoutId = setTimeout(() => {
      const url = new URL(window.location.href)
      
      // Remove all cart-related parameters
      url.searchParams.delete('variants')
      url.searchParams.delete('action')
      url.searchParams.delete('cart_id')
      url.searchParams.delete('source')
      url.searchParams.delete('add_to_cart')
      url.searchParams.delete('payload')
      url.searchParams.delete('redirect')
      url.searchParams.delete('count')
      url.searchParams.delete('quantity')
      url.searchParams.delete('bulk_add')
      
      // Remove individual variant parameters (v0, v1, etc.)
      for (let i = 0; i < 10; i++) {
        url.searchParams.delete(`v${i}`)
      }
      
      window.history.replaceState({}, '', url.toString())
    }, 1000) // Delay by 1 second to ensure processing completes
    
    // Check for localStorage items
    const pendingVariants = localStorage.getItem('medusa_variants_to_add')
    if (pendingVariants) {
      console.log('[Cart] Found pending variants in localStorage:', pendingVariants)
      localStorage.removeItem('medusa_variants_to_add')
    }
    
    const cartTransfer = localStorage.getItem('medusa_cart_transfer')
    if (cartTransfer) {
      try {
        const data = JSON.parse(cartTransfer)
        console.log('[Cart] Found cart transfer data:', data)
        localStorage.removeItem('medusa_cart_transfer')
      } catch (error) {
        console.error('[Cart] Error parsing cart transfer data:', error)
      }
    }
    
    return () => clearTimeout(timeoutId)
  }, [])
  
  return null
}