import { NextRequest, NextResponse } from 'next/server'
import { addToCart, getOrSetCart, retrieveCart } from '@lib/data/cart'
import { getRegion } from '@lib/data/regions'
import { revalidateTag, revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const variants = searchParams.get('variants')
    const countryCode = searchParams.get('country') || 'de'
    const source = searchParams.get('source')
    
    console.log('[Process & Redirect] Starting with params:', { 
      variants, 
      countryCode, 
      source 
    })
    
    if (!variants) {
      // Just redirect to cart if no variants
      return NextResponse.redirect(new URL(`/${countryCode}/cart`, request.url))
    }
    
    const variantIds = variants.split(',').filter(Boolean)
    
    if (variantIds.length === 0) {
      return NextResponse.redirect(new URL(`/${countryCode}/cart`, request.url))
    }
    
    // Ensure region exists
    const region = await getRegion(countryCode)
    if (!region) {
      console.error('[Process & Redirect] Region not found for country:', countryCode)
      return NextResponse.redirect(new URL('/de/cart', request.url))
    }
    
    // Get or create cart
    let cart = await retrieveCart()
    
    if (!cart) {
      console.log('[Process & Redirect] Creating new cart for country:', countryCode)
      cart = await getOrSetCart(countryCode)
    }
    
    // Process all variants
    const results = []
    let successCount = 0
    
    for (const variantId of variantIds) {
      try {
        console.log('[Process & Redirect] Adding variant:', variantId)
        await addToCart({ 
          variantId, 
          quantity: 1,
          countryCode 
        })
        results.push({ variantId, success: true })
        successCount++
      } catch (error: any) {
        console.error('[Process & Redirect] Failed to add variant:', variantId, error)
        results.push({ variantId, success: false, error: error.message })
      }
    }
    
    console.log('[Process & Redirect] Completed. Success:', successCount, 'of', variantIds.length)
    
    // Force cache invalidation
    revalidateTag('cart')
    revalidatePath(`/${countryCode}/cart`)
    
    // Get the proper base URL for the shop
    const shopBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       process.env.NEXT_PUBLIC_MEDUSA_STORE_URL || 
                       'https://shop.dersolarwart.de'
    
    // Create redirect URL with the correct shop domain
    const redirectUrl = new URL(`/${countryCode}/cart`, shopBaseUrl)
    redirectUrl.searchParams.set('_t', Date.now().toString())
    redirectUrl.searchParams.set('_refresh', '1')
    
    if (source) {
      redirectUrl.searchParams.set('from', source)
    }
    
    if (successCount > 0) {
      redirectUrl.searchParams.set('items_added', successCount.toString())
    }
    
    console.log('[Process & Redirect] Redirecting to:', redirectUrl.toString())
    
    // Use a special redirect that forces the browser to refetch
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cart-Updated': 'true',
        'X-Items-Added': successCount.toString()
      }
    })
    
  } catch (error: any) {
    console.error('[Process & Redirect] Unexpected error:', error)
    
    // Use correct shop URL for error redirect too
    const shopBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       process.env.NEXT_PUBLIC_MEDUSA_STORE_URL || 
                       'https://shop.dersolarwart.de'
    
    return NextResponse.redirect(new URL('/de/cart', shopBaseUrl))
  }
}