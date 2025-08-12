import { NextRequest, NextResponse } from 'next/server'
import { addToCart, getOrSetCart, retrieveCart } from '@lib/data/cart'

export async function POST(request: NextRequest) {
  try {
    const { variants, countryCode = 'de' } = await request.json()
    
    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'Invalid variants' },
        { status: 400 }
      )
    }
    
    let cart = await retrieveCart()
    
    if (!cart) {
      cart = await getOrSetCart(countryCode)
    }
    
    const results = []
    for (const variantId of variants) {
      try {
        await addToCart({ 
          variantId, 
          quantity: 1,
          countryCode 
        })
        results.push({ variantId, success: true })
      } catch (error: any) {
        results.push({ variantId, success: false, error: error.message })
      }
    }
    
    return NextResponse.json({ success: true, results, cartId: cart.id })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add variants' },
      { status: 500 }
    )
  }
}