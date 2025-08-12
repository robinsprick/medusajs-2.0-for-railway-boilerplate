import { Metadata } from "next"
import CartTemplate from "@modules/cart/templates"

import { enrichLineItems, retrieveCart, getOrSetCart, addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"
import { UrlCleaner } from "./url-cleaner"

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
  
  if (variantIds.length === 0 || (!action && !payload && !searchParams?.add_to_cart)) {
    return null
  }
  
  console.log('[Cart] Processing URL parameters:', { 
    variantIds, 
    action, 
    cartId, 
    source,
    originalParams: searchParams 
  })
  
  try {
    if (variantIds.length === 0) {
      console.log('[Cart] No valid variant IDs found')
      return null
    }
    
    // Get or create cart
    let cart = await retrieveCart()
    
    if (!cart) {
      cart = await getOrSetCart(countryCode)
      console.log('[Cart] Created new cart:', cart.id)
    }
    
    const results = []
    for (const variantId of variantIds) {
      try {
        console.log('[Cart] Adding variant to cart:', variantId)
        await addToCart({
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
    
    return await retrieveCart()
    
  } catch (error) {
    console.error('[Cart] Error processing URL parameters:', error)
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
      <CartTemplate cart={cart} customer={customer} />
      {shouldCleanUrl && <UrlCleaner />}
    </>
  )
}
