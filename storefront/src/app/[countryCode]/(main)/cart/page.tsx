import { Metadata } from "next"
import CartTemplate from "@modules/cart/templates"

import { enrichLineItems, retrieveCart, getOrSetCart, addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"
import { UrlCleaner } from "./url-cleaner"
import { CartRefresher } from "./cart-refresher"
import { AutoRefresh } from "./auto-refresh"
import { revalidatePath, revalidateTag } from "next/cache"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "Warenkorb",
  description: "Warenkorb anzeigen",
}

async function processUrlParameters(
  searchParams: any,
  countryCode: string
) {
  // Check for multiple URL parameter formats
  const variants = searchParams?.variants || searchParams?.add_to_cart
  const action = searchParams?.action || (variants ? 'add' : null)
  const cartId = searchParams?.cart_id
  const source = searchParams?.source
  
  // Also check for payload format (base64 encoded)
  const payload = searchParams?.payload
  
  let variantIds: string[] = []
  
  if (payload) {
    try {
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())
      console.log('[Cart] Decoded payload:', decodedPayload)
      if (decodedPayload.variants && Array.isArray(decodedPayload.variants)) {
        variantIds = decodedPayload.variants
      }
    } catch (error) {
      console.error('[Cart] Failed to decode payload:', error)
    }
  } else if (variants) {
    variantIds = variants.split(',').filter(Boolean)
  }
  
  // Check for individual variant parameters (v0, v1, etc.)
  if (variantIds.length === 0) {
    for (let i = 0; i < 10; i++) {
      const variantParam = searchParams?.[`v${i}`]
      if (variantParam) {
        variantIds.push(variantParam)
      }
    }
  }
  
  // Allow processing even without action if we have variants
  if (variantIds.length === 0) {
    return null
  }
  
  console.log('[Cart] Processing URL parameters:', { 
    variantIds, 
    action, 
    cartId, 
    source,
    countryCode,
    originalParams: searchParams 
  })
  
  try {
    // Ensure we have a valid country code
    const finalCountryCode = countryCode || 'de'
    
    // Get or create cart with proper region
    let cart = await retrieveCart()
    
    if (!cart) {
      console.log('[Cart] Creating new cart for country:', finalCountryCode)
      cart = await getOrSetCart(finalCountryCode)
      console.log('[Cart] Created new cart:', cart.id, 'with region:', cart.region_id)
    } else {
      console.log('[Cart] Using existing cart:', cart.id, 'with region:', cart.region_id)
    }
    
    const results = []
    let successCount = 0
    let errorCount = 0
    
    for (const variantId of variantIds) {
      try {
        console.log('[Cart] Adding variant to cart:', variantId)
        await addToCart({
          variantId: variantId,
          quantity: 1,
          countryCode: finalCountryCode,
        })
        results.push({ variantId, success: true })
        successCount++
        console.log('[Cart] Successfully added variant:', variantId)
      } catch (error: any) {
        console.error('[Cart] Failed to add variant:', variantId, error)
        results.push({ 
          variantId, 
          success: false, 
          error: error?.message || 'Unknown error' 
        })
        errorCount++
        // Continue adding other variants even if one fails
      }
    }
    
    console.log('[Cart] Processing complete:', {
      total: variantIds.length,
      success: successCount,
      errors: errorCount,
      results
    })
    
    // Force cache revalidation after adding items
    if (successCount > 0) {
      // Revalidate multiple cache tags to ensure fresh data
      revalidateTag('cart')
      revalidatePath(`/${countryCode}/cart`)
      
      // Set a flag in localStorage for client-side refresh
      // This will be read by CartRefresher component
    }
    
    // Return the updated cart with fresh data
    const updatedCart = await retrieveCart()
    return updatedCart
    
  } catch (error: any) {
    console.error('[Cart] Critical error processing URL parameters:', error)
    console.error('[Cart] Error details:', error?.message || 'Unknown error')
    // Don't throw, return null to allow page to render
    return null
  }
}

const fetchCart = async (countryCode: string, searchParams?: any) => {
  let cart = await processUrlParameters(searchParams, countryCode)
  
  if (!cart) {
    cart = await retrieveCart()
  }

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

export default async function Cart({
  params: { countryCode },
  searchParams,
}: {
  params: { countryCode: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const cart = await fetchCart(countryCode, searchParams)
  const customer = await getCustomer()
  
  // Clean URL if any cart-related parameters are present
  const shouldCleanUrl = !!(
    searchParams?.variants || 
    searchParams?.action || 
    searchParams?.add_to_cart || 
    searchParams?.payload ||
    searchParams?.v0 ||
    searchParams?.bulk_add
  )

  return (
    <>
      <AutoRefresh />
      <CartTemplate cart={cart} customer={customer} />
      {/* <CartRefresher /> Temporarily disabled to prevent conflicts */}
      {shouldCleanUrl && <UrlCleaner />}
    </>
  )
}
