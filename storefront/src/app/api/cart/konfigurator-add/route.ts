import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { getAuthHeaders, getCartId, setCartId } from "@lib/data/cookies"
import { getRegion } from "@lib/data/regions"
import { revalidateTag } from "next/cache"

const ALLOWED_ORIGINS = [
  'https://solarwartshop.vercel.app',
  'https://konfigurator.dersolarwart.de',
  'http://localhost:3000',
  'http://localhost:3001'
]

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  
  try {
    const { searchParams } = new URL(request.url)
    const variants = searchParams.get('variants')
    const countryCode = searchParams.get('country') || 'de'
    const source = searchParams.get('source')
    const redirectToCart = searchParams.get('redirect') !== 'false'
    
    console.log('[Konfigurator Add] Processing request:', {
      variants,
      countryCode,
      source,
      redirectToCart
    })
    
    if (!variants) {
      return NextResponse.json(
        { error: 'No variants provided' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }
    
    const variantIds = variants.split(',').filter(Boolean)
    
    if (variantIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid variant IDs' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }
    
    // Get region for country
    const region = await getRegion(countryCode)
    if (!region) {
      console.error('[Konfigurator Add] Region not found for country:', countryCode)
      return NextResponse.json(
        { error: `Region not found for country: ${countryCode}` },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }
    
    console.log('[Konfigurator Add] Using region:', region.id, 'for country:', countryCode)
    
    // Get or create cart
    let cartId = getCartId()
    let cart = null
    
    if (cartId) {
      try {
        const cartResponse = await sdk.store.cart.retrieve(
          cartId, 
          {}, 
          { ...getAuthHeaders() }
        )
        cart = cartResponse.cart
        console.log('[Konfigurator Add] Using existing cart:', cart.id)
      } catch (error) {
        console.log('[Konfigurator Add] Existing cart not found, creating new one')
        cartId = null
      }
    }
    
    if (!cart) {
      console.log('[Konfigurator Add] Creating new cart with region:', region.id)
      const cartResponse = await sdk.store.cart.create(
        { 
          region_id: region.id,
          metadata: {
            source: source || 'konfigurator',
            created_at: new Date().toISOString()
          }
        },
        {},
        { ...getAuthHeaders() }
      )
      cart = cartResponse.cart
      setCartId(cart.id)
      console.log('[Konfigurator Add] Created new cart:', cart.id)
    }
    
    // Add variants to cart
    const results = []
    let successCount = 0
    let errorCount = 0
    
    for (const variantId of variantIds) {
      try {
        console.log('[Konfigurator Add] Adding variant:', variantId)
        
        await sdk.store.cart.createLineItem(
          cart.id,
          {
            variant_id: variantId,
            quantity: 1,
          },
          {},
          { ...getAuthHeaders() }
        )
        
        results.push({ variantId, success: true })
        successCount++
        console.log('[Konfigurator Add] Successfully added variant:', variantId)
        
      } catch (error: any) {
        console.error('[Konfigurator Add] Failed to add variant:', variantId, error)
        results.push({ 
          variantId, 
          success: false, 
          error: error?.message || 'Unknown error' 
        })
        errorCount++
      }
    }
    
    // Revalidate cart cache
    revalidateTag('cart')
    
    console.log('[Konfigurator Add] Processing complete:', {
      cartId: cart.id,
      total: variantIds.length,
      success: successCount,
      errors: errorCount
    })
    
    // If redirect is requested, redirect to cart page
    if (redirectToCart) {
      const cartUrl = `/${countryCode}/cart?added=${successCount}${errorCount > 0 ? '&errors=true' : ''}`
      return NextResponse.redirect(new URL(cartUrl, request.url), {
        status: 303,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true',
        }
      })
    }
    
    // Return JSON response
    return NextResponse.json(
      {
        success: true,
        cartId: cart.id,
        results,
        summary: {
          total: variantIds.length,
          success: successCount,
          errors: errorCount
        },
        cartUrl: `/${countryCode}/cart`
      },
      {
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    )
    
  } catch (error: any) {
    console.error('[Konfigurator Add] Critical error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error?.message || 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    )
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  
  try {
    const body = await request.json()
    const { variants, countryCode = 'de', source } = body
    
    console.log('[Konfigurator Add POST] Processing request:', {
      variants,
      countryCode,
      source
    })
    
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: 'No variants provided' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }
    
    // Same logic as GET but with POST body
    const region = await getRegion(countryCode)
    if (!region) {
      return NextResponse.json(
        { error: `Region not found for country: ${countryCode}` },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }
    
    // Get or create cart
    let cartId = getCartId()
    let cart = null
    
    if (cartId) {
      try {
        const cartResponse = await sdk.store.cart.retrieve(
          cartId, 
          {}, 
          { ...getAuthHeaders() }
        )
        cart = cartResponse.cart
      } catch (error) {
        cartId = null
      }
    }
    
    if (!cart) {
      const cartResponse = await sdk.store.cart.create(
        { 
          region_id: region.id,
          metadata: {
            source: source || 'konfigurator',
            created_at: new Date().toISOString()
          }
        },
        {},
        { ...getAuthHeaders() }
      )
      cart = cartResponse.cart
      setCartId(cart.id)
    }
    
    // Add variants to cart
    const results = []
    let successCount = 0
    let errorCount = 0
    
    for (const variantId of variants) {
      try {
        await sdk.store.cart.createLineItem(
          cart.id,
          {
            variant_id: variantId,
            quantity: 1,
          },
          {},
          { ...getAuthHeaders() }
        )
        
        results.push({ variantId, success: true })
        successCount++
        
      } catch (error: any) {
        console.error('[Konfigurator Add POST] Failed to add variant:', variantId, error)
        results.push({ 
          variantId, 
          success: false, 
          error: error?.message || 'Unknown error' 
        })
        errorCount++
      }
    }
    
    revalidateTag('cart')
    
    return NextResponse.json(
      {
        success: true,
        cartId: cart.id,
        results,
        summary: {
          total: variants.length,
          success: successCount,
          errors: errorCount
        },
        cartUrl: `/${countryCode}/cart`
      },
      {
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    )
    
  } catch (error: any) {
    console.error('[Konfigurator Add POST] Critical error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error?.message || 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    )
  }
}