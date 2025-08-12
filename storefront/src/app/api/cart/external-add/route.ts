import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// CORS headers for external access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Get all parameters
    const params = new URLSearchParams()
    searchParams.forEach((value, key) => {
      params.append(key, value)
    })
    
    // Build internal cart URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.dersolarwart.de'
    const countryCode = searchParams.get('country') || 'de'
    const cartUrl = new URL(`/${countryCode}/cart`, baseUrl)
    
    // Copy all parameters
    searchParams.forEach((value, key) => {
      cartUrl.searchParams.append(key, value)
    })
    
    console.log('[External Add] Redirecting to:', cartUrl.toString())
    
    // Return a redirect response with CORS headers
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': cartUrl.toString(),
      },
    })
    
  } catch (error: any) {
    console.error('[External Add] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { variants, countryCode = 'de', source = 'external' } = body
    
    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'Invalid variants array' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    // Build cart URL with variants
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.dersolarwart.de'
    const cartUrl = new URL(`/${countryCode}/cart`, baseUrl)
    cartUrl.searchParams.set('variants', variants.join(','))
    cartUrl.searchParams.set('action', 'add')
    cartUrl.searchParams.set('source', source)
    
    console.log('[External Add POST] Redirecting to:', cartUrl.toString())
    
    return NextResponse.json(
      { 
        success: true,
        redirectUrl: cartUrl.toString(),
        message: 'Redirect to cart with variants'
      },
      { headers: corsHeaders }
    )
    
  } catch (error: any) {
    console.error('[External Add POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500, headers: corsHeaders }
    )
  }
}