"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function UrlCleaner() {
  const router = useRouter()
  const hasCleanedRef = useRef(false)
  
  useEffect(() => {
    // Prevent multiple cleanups
    if (hasCleanedRef.current) return
    
    const url = new URL(window.location.href)
    const hasCartParams = url.searchParams.has('variants') || 
                         url.searchParams.has('action') || 
                         url.searchParams.has('add_to_cart') ||
                         url.searchParams.has('t')
    
    if (hasCartParams) {
      hasCleanedRef.current = true
      
      // Set a marker in localStorage that cart was updated
      localStorage.setItem('cart_last_update', Date.now().toString())
      
      // First refresh to get latest data
      router.refresh()
      
      // Then clean the URL after a short delay
      setTimeout(() => {
        const cleanUrl = new URL(window.location.href)
        // Remove all cart-related parameters
        cleanUrl.searchParams.delete('variants')
        cleanUrl.searchParams.delete('action')
        cleanUrl.searchParams.delete('cart_id')
        cleanUrl.searchParams.delete('source')
        cleanUrl.searchParams.delete('add_to_cart')
        cleanUrl.searchParams.delete('payload')
        cleanUrl.searchParams.delete('redirect')
        cleanUrl.searchParams.delete('count')
        cleanUrl.searchParams.delete('quantity')
        cleanUrl.searchParams.delete('bulk_add')
        cleanUrl.searchParams.delete('added')
        cleanUrl.searchParams.delete('errors')
        cleanUrl.searchParams.delete('t')
        
        // Remove individual variant parameters (v0, v1, etc.)
        for (let i = 0; i < 10; i++) {
          cleanUrl.searchParams.delete(`v${i}`)
        }
        
        // Replace URL without triggering navigation
        window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search)
      }, 100)
    }
    
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
  }, [router])
  
  return null
}