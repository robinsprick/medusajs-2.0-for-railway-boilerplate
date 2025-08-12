"use client"

import { useEffect } from 'react'

export function UrlCleaner() {
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('variants')
    url.searchParams.delete('action')
    url.searchParams.delete('cart_id')
    url.searchParams.delete('source')
    window.history.replaceState({}, '', url.toString())
    
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
  }, [])
  
  return null
}