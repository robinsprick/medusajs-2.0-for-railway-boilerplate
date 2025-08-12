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
    
    console.log('[API Cart] GET request received:', { 
      variants, 
      action, 
      countryCode, 
      source 
    })
    
    if (!variants || action !== 'add') {
      return NextResponse.json(
        { error: 'Missing variants or action parameter' },
        { status: 400 }
      )
    }
    
    const variantIds = variants.split(',').filter(Boolean)
    
    if (variantIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid variant IDs provided' },
        { status: 400 }
      )
    }
    
    // Ensure region exists
    const region = await getRegion(countryCode)
    if (!region) {
      console.error('[API Cart] Region not found for country:', countryCode)
      return NextResponse.json(
        { error: `Region not found for country: ${countryCode}` },
        { status: 400 }
      )
    }
    
    let cart = await retrieveCart()
    
    if (!cart) {
      console.log('[API Cart] Creating new cart for country:', countryCode)
      cart = await getOrSetCart(countryCode)
    }
    
    const results = []
    for (const variantId of variantIds) {
      try {
        console.log('[API Cart] Adding variant:', variantId)
        await addToCart({ 
          variantId, 
          quantity: 1,
          countryCode 
        })
        results.push({ variantId, success: true })
      } catch (error: any) {
        console.error('[API Cart] Failed to add variant:', variantId, error)
        results.push({ variantId, success: false, error: error.message })
      }
    }
    
    // Redirect to cart page
    const redirectUrl = new URL(`/${countryCode}/cart`, request.url)
    if (source) {
      redirectUrl.searchParams.set('source', source)
    }
    
    return NextResponse.redirect(redirectUrl, { status: 303 })
    
  } catch (error: any) {
    console.error('[API Cart] Error in GET handler:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { variants, countryCode = 'de' } = await request.json()
    
    console.log('[API Cart] POST request received:', { variants, countryCode })
    
    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'Invalid variants' },
        { status: 400 }
      )
    }
    
    // Ensure region exists
    const region = await getRegion(countryCode)
    if (!region) {
      console.error('[API Cart] Region not found for country:', countryCode)
      return NextResponse.json(
        { error: `Region not found for country: ${countryCode}` },
        { status: 400 }
      )
    }
    
    let cart = await retrieveCart()
    
    if (!cart) {
      console.log('[API Cart] Creating new cart for country:', countryCode)
      cart = await getOrSetCart(countryCode)
    }
    
    const results = []
    for (const variantId of variants) {
      try {
        console.log('[API Cart] Adding variant:', variantId)
        await addToCart({ 
          variantId, 
          quantity: 1,
          countryCode 
        })
        results.push({ variantId, success: true })
      } catch (error: any) {
        console.error('[API Cart] Failed to add variant:', variantId, error)
        results.push({ variantId, success: false, error: error.message })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      results, 
      cartId: cart.id,
      region: {
        id: region.id,
        name: region.name,
        currency_code: region.currency_code,
        countries: region.countries
      }
    })
    
  } catch (error: any) {
    console.error('[API Cart] Error in POST handler:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add variants' },
      { status: 500 }
    )
  }
}