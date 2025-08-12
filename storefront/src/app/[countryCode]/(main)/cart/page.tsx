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
  const variants = searchParams?.variants
  const action = searchParams?.action
  const cartId = searchParams?.cart_id
  
  if (!variants || action !== 'add') {
    return null
  }
  
  console.log('[Cart] Processing URL parameters:', { variants, action, cartId })
  
  try {
    const variantIds = variants.split(',').filter(Boolean)
    
    if (variantIds.length === 0) {
      console.log('[Cart] No valid variant IDs found')
      return null
    }
    
    let cart = null
    
    if (cartId) {
      try {
        cart = await retrieveCart()
        console.log('[Cart] Loaded existing cart:', cartId)
      } catch (error) {
        console.error('[Cart] Failed to load cart:', cartId, error)
      }
    }
    
    if (!cart) {
      cart = await retrieveCart()
    }
    
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
  
  const shouldCleanUrl = searchParams?.variants && searchParams?.action === 'add'

  return (
    <>
      <CartTemplate cart={cart} customer={customer} />
      {shouldCleanUrl && <UrlCleaner />}
    </>
  )
}
