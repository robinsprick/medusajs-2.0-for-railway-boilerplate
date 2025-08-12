import { NextRequest, NextResponse } from 'next/server'
import { addToCart, getOrSetCart, retrieveCart } from '@lib/data/cart'
import { getRegion } from '@lib/data/regions'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const variants = searchParams.get('variants')
    const action = searchParams.get('action')
    const countryCode = searchParams.get('country') || 'de'
    const source = searchParams.get('source')
    
    console.log('[API Cart Add] Processing URL:', request.url)
    console.log('[API Cart Add] Parameters:', { 
      variants, 
      action, 
      countryCode, 
      source 
    })
    
    if (!variants) {
      // Redirect to cart page if no variants specified
      return NextResponse.redirect(new URL(`/${countryCode}/cart`, request.url))
    }
    
    const variantIds = variants.split(',').filter(Boolean)
    
    if (variantIds.length === 0) {
      return NextResponse.redirect(new URL(`/${countryCode}/cart`, request.url))
    }
    
    // Ensure region exists
    const region = await getRegion(countryCode)
    if (!region) {
      console.error('[API Cart Add] Region not found for country:', countryCode)
      // Fallback to cart page
      return NextResponse.redirect(new URL('/de/cart', request.url))
    }
    
    let cart = await retrieveCart()
    
    if (!cart) {
      console.log('[API Cart Add] Creating new cart for country:', countryCode)
      cart = await getOrSetCart(countryCode)
    }
    
    const results = []
    let successCount = 0
    
    for (const variantId of variantIds) {
      try {
        console.log('[API Cart Add] Adding variant:', variantId)
        await addToCart({ 
          variantId, 
          quantity: 1,
          countryCode 
        })
        results.push({ variantId, success: true })
        successCount++
      } catch (error: any) {
        console.error('[API Cart Add] Failed to add variant:', variantId, error)
        results.push({ variantId, success: false, error: error.message })
      }
    }
    
    console.log('[API Cart Add] Results:', results)
    console.log('[API Cart Add] Success count:', successCount, 'of', variantIds.length)
    
    // Get the proper base URL for the shop
    const shopBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       process.env.NEXT_PUBLIC_MEDUSA_STORE_URL || 
                       'https://shop.dersolarwart.de'
    
    // Redirect to cart page with status and timestamp to force refresh
    const redirectUrl = new URL(`/${countryCode}/cart`, shopBaseUrl)
    
    // Add timestamp to force cache bypass
    redirectUrl.searchParams.set('t', Date.now().toString())
    
    // Add query parameters to show status
    if (source) {
      redirectUrl.searchParams.set('source', source)
    }
    
    if (successCount > 0) {
      redirectUrl.searchParams.set('added', successCount.toString())
    }
    
    if (results.some(r => !r.success)) {
      redirectUrl.searchParams.set('errors', 'true')
    }
    
    return NextResponse.redirect(redirectUrl, { status: 303 })
    
  } catch (error: any) {
    console.error('[API Cart Add] Unexpected error:', error)
    // Fallback to cart page on error
    return NextResponse.redirect(new URL('/de/cart', request.url))
  }
}