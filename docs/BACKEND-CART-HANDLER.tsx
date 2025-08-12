// Diese Datei muss in dein Backend (solarwart-railway/storefront) eingefügt werden
// Pfad: solarwart-railway/storefront/src/app/[countryCode]/(main)/cart/page.tsx

import { Metadata } from "next"
import { enrichLineItems } from "@/modules/cart/actions"
import { retrieveCart } from "@/modules/cart/actions"
import { getCart } from "@/lib/data/cart"
import { LineItem } from "@medusajs/medusa"
import CartTemplate from "@/modules/cart/templates"
import { notFound } from "next/navigation"
import { CartWithCheckoutStep } from "@/types/global"
import { createCart, addToCart } from "@/lib/data/cart"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Warenkorb",
  description: "Ihr Warenkorb",
}

// Neue Funktion zum Verarbeiten von URL-Parametern
async function processUrlParameters(searchParams: any, countryCode: string) {
  // Check for variants parameter
  const variants = searchParams?.variants
  const action = searchParams?.action
  const cartId = searchParams?.cart_id
  
  if (!variants || action !== 'add') {
    return null
  }
  
  console.log('[Cart] Processing URL parameters:', { variants, action, cartId })
  
  try {
    // Split variant IDs
    const variantIds = variants.split(',').filter(Boolean)
    
    if (variantIds.length === 0) {
      console.log('[Cart] No valid variant IDs found')
      return null
    }
    
    // Get or create cart
    let cart = null
    
    // Try to load existing cart first
    if (cartId) {
      try {
        cart = await retrieveCart(cartId).then(enrichLineItems)
        console.log('[Cart] Loaded existing cart:', cartId)
      } catch (error) {
        console.error('[Cart] Failed to load cart:', cartId, error)
      }
    }
    
    // If no cart, try from cookie
    if (!cart) {
      const cartIdFromCookie = cookies().get("_medusa_cart_id")?.value
      if (cartIdFromCookie) {
        try {
          cart = await retrieveCart(cartIdFromCookie).then(enrichLineItems)
          console.log('[Cart] Loaded cart from cookie:', cartIdFromCookie)
        } catch (error) {
          console.error('[Cart] Failed to load cart from cookie:', error)
        }
      }
    }
    
    // Create new cart if needed
    if (!cart) {
      cart = await createCart(countryCode)
      console.log('[Cart] Created new cart:', cart.id)
      
      // Set cart cookie
      cookies().set("_medusa_cart_id", cart.id, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    }
    
    // Add each variant to cart
    const results = []
    for (const variantId of variantIds) {
      try {
        console.log('[Cart] Adding variant to cart:', variantId)
        const result = await addToCart({
          cartId: cart.id,
          variantId: variantId,
          quantity: 1,
          countryCode,
        })
        results.push({ variantId, success: true })
        console.log('[Cart] Successfully added variant:', variantId)
      } catch (error) {
        console.error('[Cart] Failed to add variant:', variantId, error)
        results.push({ variantId, success: false, error })
      }
    }
    
    console.log('[Cart] Processing complete:', results)
    
    // Return updated cart
    return await retrieveCart(cart.id).then(enrichLineItems)
    
  } catch (error) {
    console.error('[Cart] Error processing URL parameters:', error)
    return null
  }
}

// Neue Funktion zum Verarbeiten von localStorage
async function processLocalStorage(countryCode: string) {
  // This needs to be done client-side
  // See the client component below
  return null
}

export default async function CartPage({
  params: { countryCode },
  searchParams,
}: {
  params: { countryCode: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Process URL parameters first
  let cart = await processUrlParameters(searchParams, countryCode)
  
  // If no cart from URL processing, get regular cart
  if (!cart) {
    cart = await getCart().then(enrichLineItems)
  }
  
  if (!cart) {
    return notFound()
  }
  
  // Clean URL after processing (this will be done client-side)
  const shouldCleanUrl = searchParams?.variants && searchParams?.action === 'add'
  
  return (
    <>
      <CartTemplate cart={cart as CartWithCheckoutStep} />
      {shouldCleanUrl && <UrlCleaner />}
    </>
  )
}

// Client component to clean URL and process localStorage
function UrlCleaner() {
  "use client"
  
  useEffect(() => {
    // Clean URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('variants')
    url.searchParams.delete('action')
    url.searchParams.delete('cart_id')
    url.searchParams.delete('source')
    window.history.replaceState({}, '', url.toString())
    
    // Check localStorage for pending variants
    const pendingVariants = localStorage.getItem('medusa_variants_to_add')
    if (pendingVariants) {
      console.log('[Cart] Found pending variants in localStorage:', pendingVariants)
      // Note: These would need to be processed via a client-side API call
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