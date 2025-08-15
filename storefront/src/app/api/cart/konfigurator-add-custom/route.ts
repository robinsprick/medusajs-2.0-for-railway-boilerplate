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

interface KonfiguratorItem {
  variant_id?: string
  product_id?: string
  quantity: number
  unit_price: number // Preis in Cents
  title: string
  description?: string
  config?: any // Konfigurator-Konfiguration
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  
  try {
    const body = await request.json()
    const { 
      items, 
      countryCode = 'de', 
      source = 'konfigurator',
      redirectToCart = false 
    } = body as {
      items: KonfiguratorItem[]
      countryCode?: string
      source?: string
      redirectToCart?: boolean
    }
    
    console.log('[Konfigurator Add Custom] Processing request:', {
      itemsCount: items?.length,
      countryCode,
      source,
      redirectToCart
    })
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
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
      console.error('[Konfigurator Add Custom] Region not found for country:', countryCode)
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
    
    console.log('[Konfigurator Add Custom] Using region:', region.id, 'for country:', countryCode)
    
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
        console.log('[Konfigurator Add Custom] Using existing cart:', cart.id)
      } catch (error) {
        console.log('[Konfigurator Add Custom] Existing cart not found, creating new one')
        cartId = null
      }
    }
    
    if (!cart) {
      console.log('[Konfigurator Add Custom] Creating new cart with region:', region.id)
      const cartResponse = await sdk.store.cart.create(
        { 
          region_id: region.id,
          metadata: {
            source: source,
            created_at: new Date().toISOString()
          }
        },
        {},
        { ...getAuthHeaders() }
      )
      cart = cartResponse.cart
      setCartId(cart.id)
      console.log('[Konfigurator Add Custom] Created new cart:', cart.id)
    }
    
    // Add custom items to cart
    const results = []
    let successCount = 0
    let errorCount = 0
    
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    
    for (const item of items) {
      try {
        console.log('[Konfigurator Add Custom] Adding custom item:', item.title, 'with price:', item.unit_price)
        
        // Call backend API to add custom item
        const response = await fetch(`${backendUrl}/store/solarwart/cart/add-custom-item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            cart_id: cart.id,
            variant_id: item.variant_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            unit_price: item.unit_price,
            title: item.title,
            description: item.description,
            metadata: {
              ...item.metadata,
              source: source
            },
            config: item.config
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to add custom item')
        }
        
        const result = await response.json()
        cart = result.cart // Update cart with latest version
        
        results.push({ 
          item: item.title, 
          success: true,
          price: item.unit_price
        })
        successCount++
        console.log('[Konfigurator Add Custom] Successfully added item:', item.title)
        
      } catch (error: any) {
        console.error('[Konfigurator Add Custom] Failed to add item:', item.title, error)
        results.push({ 
          item: item.title, 
          success: false, 
          error: error?.message || 'Unknown error' 
        })
        errorCount++
      }
    }
    
    // Revalidate cart cache
    revalidateTag('cart')
    
    console.log('[Konfigurator Add Custom] Processing complete:', {
      cartId: cart.id,
      total: items.length,
      success: successCount,
      errors: errorCount
    })
    
    // If redirect is requested, redirect to cart page
    if (redirectToCart) {
      const shopBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                         process.env.NEXT_PUBLIC_MEDUSA_STORE_URL || 
                         'https://shop.dersolarwart.de'
      
      const cartUrl = new URL(`/${countryCode}/cart`, shopBaseUrl)
      cartUrl.searchParams.set('added', successCount.toString())
      if (errorCount > 0) {
        cartUrl.searchParams.set('errors', 'true')
      }
      
      return NextResponse.redirect(cartUrl, {
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
          total: items.length,
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
    console.error('[Konfigurator Add Custom] Critical error:', error)
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

// GET endpoint for backward compatibility
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  
  try {
    const { searchParams } = new URL(request.url)
    const itemsParam = searchParams.get('items')
    const countryCode = searchParams.get('country') || 'de'
    const source = searchParams.get('source') || 'konfigurator'
    const redirectToCart = searchParams.get('redirect') !== 'false'
    
    if (!itemsParam) {
      return NextResponse.json(
        { error: 'No items provided' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }
    
    // Parse items from query param (expected format: JSON string)
    let items: KonfiguratorItem[]
    try {
      items = JSON.parse(decodeURIComponent(itemsParam))
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid items format' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }
    
    // Forward to POST handler
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({
        items,
        countryCode,
        source,
        redirectToCart
      })
    })
    
    return POST(postRequest as NextRequest)
    
  } catch (error: any) {
    console.error('[Konfigurator Add Custom GET] Error:', error)
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