# Einfache Shop-Integration für Medusa

## Das Problem
Die Variant-IDs vom Konfigurator können nicht direkt zum Cart hinzugefügt werden (500 Server Error).

## Die Lösung
Der Konfigurator übergibt die Variant-IDs als URL-Parameter. Der Shop muss diese verarbeiten und die Produkte selbst zum Cart hinzufügen.

## Minimale Implementation für den Shop

Füge diesen Code in deine Cart-Seite oder App-Layout ein:

```javascript
// pages/cart.js oder app/cart/page.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router' // oder 'next/navigation' für App Router

export default function CartPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Check URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search)
    
    // Check for variants parameter
    const variants = urlParams.get('variants')
    const action = urlParams.get('action')
    
    if (variants && action === 'add') {
      // Split variant IDs
      const variantIds = variants.split(',')
      
      // Add each variant to cart
      variantIds.forEach(async (variantId) => {
        try {
          // Use your existing addToCart function
          await addToCart(variantId, 1)
          console.log(`Added variant ${variantId} to cart`)
        } catch (error) {
          console.error(`Failed to add variant ${variantId}:`, error)
        }
      })
      
      // Clean URL after processing
      router.replace('/cart', undefined, { shallow: true })
    }
    
    // Alternative: Check localStorage
    const storedVariants = localStorage.getItem('medusa_variants_to_add')
    if (storedVariants) {
      const variantIds = storedVariants.split(',')
      // Add to cart...
      localStorage.removeItem('medusa_variants_to_add')
    }
  }, [])
  
  // Rest of your cart component...
}

// Your existing addToCart function
async function addToCart(variantId, quantity) {
  // Get or create cart
  let cartId = localStorage.getItem('cart_id')
  
  if (!cartId) {
    // Create new cart
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region_id: 'your-region-id' })
    })
    const data = await response.json()
    cartId = data.cart.id
    localStorage.setItem('cart_id', cartId)
  }
  
  // Add item to cart
  await fetch(`/api/cart/${cartId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variant_id: variantId,
      quantity: quantity
    })
  })
}
```

## Test-URLs

Nach der Implementation kannst du mit diesen URLs testen:

1. **Einzelnes Produkt:**
```
https://shop.dersolarwart.de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&action=add&source=konfigurator
```

2. **Mehrere Produkte:**
```
https://shop.dersolarwart.de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54,variant_01K22EKBYTPPFWAHGP92TXQC6B&action=add&source=konfigurator
```

## Alternative: Next.js Middleware

Für eine globale Lösung kannst du Next.js Middleware verwenden:

```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const url = request.nextUrl
  
  // Check if variants parameter exists
  if (url.searchParams.has('variants') && url.searchParams.get('action') === 'add') {
    // Store in cookie for processing
    const response = NextResponse.next()
    response.cookies.set('pending_variants', url.searchParams.get('variants'))
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/cart'
}
```

## Wichtige Hinweise

1. **Variant-IDs validieren:** Stelle sicher, dass die Variant-IDs existieren
2. **Fehlerbehandlung:** Zeige dem User eine Meldung wenn Produkte nicht hinzugefügt werden konnten
3. **URL bereinigen:** Entferne die Parameter nach der Verarbeitung
4. **localStorage bereinigen:** Lösche gespeicherte Daten nach der Verarbeitung

## Support

Bei Problemen:
- Prüfe die Browser-Konsole für Fehlermeldungen
- Stelle sicher, dass die Variant-IDs korrekt sind
- Kontaktiere das Development-Team