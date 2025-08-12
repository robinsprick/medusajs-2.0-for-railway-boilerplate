# Einfache Backend-Integration für Medusa Shop

## Was du in deinem Backend (solarwart-railway) ändern musst

### Option 1: Minimale Änderung (Empfohlen)

Füge diesen Code in deine bestehende Cart-Seite ein:

**Datei:** `solarwart-railway/storefront/src/app/[countryCode]/(main)/cart/page.tsx`

Füge am Anfang der Komponente hinzu:

```typescript
export default async function CartPage({
  params: { countryCode },
  searchParams,
}: {
  params: { countryCode: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  
  // NEU: URL-Parameter verarbeiten
  if (searchParams?.variants && searchParams?.action === 'add') {
    const variantIds = searchParams.variants.toString().split(',')
    
    // Hole oder erstelle Cart
    let cart = await getCart()
    if (!cart) {
      cart = await createCart(countryCode)
    }
    
    // Füge Varianten hinzu
    for (const variantId of variantIds) {
      try {
        await addToCart({
          cartId: cart.id,
          variantId,
          quantity: 1,
          countryCode
        })
      } catch (error) {
        console.error(`Failed to add variant ${variantId}:`, error)
      }
    }
  }
  
  // Rest deines bestehenden Codes...
  const cart = await getCart().then(enrichLineItems)
  // ...
}
```

### Option 2: Client-Side Lösung

Wenn du die Server-Side Lösung nicht verwenden kannst, füge diese Client-Komponente hinzu:

**Neue Datei:** `solarwart-railway/storefront/src/components/cart/url-processor.tsx`

```typescript
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/data/cart' // Deine Cart-Funktionen

export function CartUrlProcessor() {
  const router = useRouter()
  
  useEffect(() => {
    const processUrlParams = async () => {
      const params = new URLSearchParams(window.location.search)
      const variants = params.get('variants')
      const action = params.get('action')
      
      if (variants && action === 'add') {
        const variantIds = variants.split(',')
        
        for (const variantId of variantIds) {
          try {
            // Verwende deine bestehende addToCart Funktion
            await fetch('/api/cart/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ variantId, quantity: 1 })
            })
          } catch (error) {
            console.error('Failed to add variant:', error)
          }
        }
        
        // URL bereinigen
        router.replace('/cart')
      }
    }
    
    processUrlParams()
  }, [router])
  
  return null
}
```

Und füge sie in deine Cart-Seite ein:

```typescript
import { CartUrlProcessor } from '@/components/cart/url-processor'

export default function CartPage() {
  return (
    <>
      <CartUrlProcessor />
      {/* Rest deiner Cart-Komponente */}
    </>
  )
}
```

### Option 3: API Route (Falls du keine direkten Cart-Funktionen hast)

**Neue Datei:** `solarwart-railway/storefront/src/app/api/cart/add-variants/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { addToCart, getCart, createCart } from '@/lib/data/cart'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { variants } = await request.json()
    
    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'Invalid variants' },
        { status: 400 }
      )
    }
    
    // Get or create cart
    let cartId = cookies().get('_medusa_cart_id')?.value
    
    if (!cartId) {
      const cart = await createCart('de') // oder dein country code
      cartId = cart.id
      cookies().set('_medusa_cart_id', cartId)
    }
    
    // Add variants
    const results = []
    for (const variantId of variants) {
      try {
        await addToCart({ cartId, variantId, quantity: 1 })
        results.push({ variantId, success: true })
      } catch (error) {
        results.push({ variantId, success: false, error: error.message })
      }
    }
    
    return NextResponse.json({ success: true, results })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add variants' },
      { status: 500 }
    )
  }
}
```

## Test-URLs

Nach der Implementation teste mit:

```
https://shop.dersolarwart.de/de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&action=add&source=konfigurator
```

## Wichtige Hinweise

1. **Country Code:** Stelle sicher, dass du den richtigen Country Code verwendest (`de` für Deutschland)
2. **Cart Cookie:** Medusa verwendet normalerweise `_medusa_cart_id` als Cookie-Name
3. **Error Handling:** Fange Fehler ab, falls Varianten nicht existieren
4. **URL Cleanup:** Entferne die Parameter nach der Verarbeitung

## Debugging

Füge diese Logs hinzu um zu debuggen:

```typescript
console.log('[Cart] Processing variants:', variantIds)
console.log('[Cart] Cart ID:', cart.id)
console.log('[Cart] Add result:', result)
```

## Support

Falls es nicht funktioniert, prüfe:
1. Ob die Variant-IDs korrekt sind
2. Ob die Cart-Funktionen importiert sind
3. Die Browser-Konsole und Server-Logs für Fehler