# Shop Integration Guide

## Problem
Der Konfigurator (solarwartshop.vercel.app) und der Shop (shop.dersolarwart.de) sind separate Systeme auf verschiedenen Domains. Cart-Sessions können nicht zwischen Domains geteilt werden.

## Lösung
Der Konfigurator übergibt die ausgewählten Produkte über verschiedene Methoden an den Shop. Der Shop muss mindestens eine dieser Methoden unterstützen.

## Methoden zur Produktübergabe

### Methode 1: Cart-ID Parameter (Empfohlen)
Der Konfigurator erstellt einen Cart im Medusa Backend und übergibt die Cart-ID.

**URL-Format:**
```
https://shop.dersolarwart.de/cart?cart_id=cart_01K2ECPD13GMC9D9YCJM1W9GWM&load_cart=true
```

**Shop-Implementation:**
```javascript
// In der Cart-Seite des Shops
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const cartId = urlParams.get('cart_id')
  const loadCart = urlParams.get('load_cart')
  
  if (cartId && loadCart === 'true') {
    // Cart vom Backend laden
    fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY
      }
    })
    .then(res => res.json())
    .then(data => {
      // Cart in lokalen State laden
      setCart(data.cart)
      // Cart-ID in localStorage speichern
      localStorage.setItem('medusa_cart_id', cartId)
    })
  }
}, [])
```

### Methode 2: Variant-IDs als Parameter
Der Konfigurator übergibt die Variant-IDs direkt, der Shop erstellt den Cart.

**URL-Format:**
```
https://shop.dersolarwart.de/cart?add_variants=variant_01K22ETRHJ,variant_01K22EKBYT&auto_add=true
```

**Shop-Implementation:**
```javascript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const variantsParam = urlParams.get('add_variants')
  const autoAdd = urlParams.get('auto_add')
  
  if (variantsParam && autoAdd === 'true') {
    const variantIds = variantsParam.split(',')
    
    // Neuen Cart erstellen oder existierenden verwenden
    const cart = await getOrCreateCart()
    
    // Produkte zum Cart hinzufügen
    for (const variantId of variantIds) {
      await addToCart(cart.id, variantId, 1)
    }
    
    // Zur Cart-Ansicht wechseln
    showCart()
  }
}, [])
```

### Methode 3: localStorage Integration
Der Konfigurator speichert Daten in localStorage, der Shop liest sie aus.

**Gespeicherte Daten:**
```javascript
// Im localStorage unter verschiedenen Keys
localStorage.getItem('medusa_cart_transfer') // Komplette Cart-Daten als JSON
localStorage.getItem('medusa_variants_to_add') // Comma-separated Variant-IDs
localStorage.getItem('medusa_cart_id') // Cart-ID falls vorhanden
```

**Shop-Implementation:**
```javascript
useEffect(() => {
  // Check localStorage for cart data
  const cartTransfer = localStorage.getItem('medusa_cart_transfer')
  
  if (cartTransfer) {
    try {
      const data = JSON.parse(cartTransfer)
      
      // Daten verarbeiten
      if (data.cartId) {
        loadCart(data.cartId)
      } else if (data.variantIds) {
        addVariantsToCart(data.variantIds)
      }
      
      // Daten nach Verarbeitung löschen
      localStorage.removeItem('medusa_cart_transfer')
    } catch (error) {
      console.error('Error processing cart transfer:', error)
    }
  }
}, [])
```

## Empfohlene Minimal-Implementation für den Shop

```javascript
// In der Haupt-Layout-Komponente oder Cart-Provider des Shops
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '@/hooks/use-cart' // Shop's cart hook

export function CartUrlHandler() {
  const router = useRouter()
  const { addItem, loadCart } = useCart()
  
  useEffect(() => {
    // Nur auf der Cart-Seite ausführen
    if (router.pathname !== '/cart') return
    
    const params = new URLSearchParams(window.location.search)
    
    // Option 1: Cart-ID laden
    const cartId = params.get('cart_id')
    if (cartId) {
      loadCart(cartId)
      return
    }
    
    // Option 2: Varianten hinzufügen
    const variants = params.get('add_variants')
    if (variants) {
      const variantIds = variants.split(',')
      variantIds.forEach(id => addItem(id, 1))
      
      // URL-Parameter entfernen nach Verarbeitung
      router.replace('/cart', undefined, { shallow: true })
    }
  }, [router.pathname])
  
  return null
}
```

## Test-URLs

Nach Implementation kann mit folgenden URLs getestet werden:

1. **Mit Cart-ID:**
   ```
   https://shop.dersolarwart.de/cart?cart_id=cart_01K2ECPD13GMC9D9YCJM1W9GWM
   ```

2. **Mit Variant-IDs:**
   ```
   https://shop.dersolarwart.de/cart?add_variants=variant_01K22ETRHJ2K6P8PQB23XTZY54,variant_01K22EKBYTPPFWAHGP92TXQC6B
   ```

3. **Mit Auto-Add Flag:**
   ```
   https://shop.dersolarwart.de/cart?add_variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&auto_add=true&source=konfigurator
   ```

## Sicherheitshinweise

1. **Validierung:** Immer Variant-IDs validieren bevor sie zum Cart hinzugefügt werden
2. **Rate Limiting:** Implementiere Rate-Limiting für Cart-Operationen
3. **CORS:** Stelle sicher, dass CORS korrekt konfiguriert ist
4. **Cleanup:** Lösche verarbeitete Daten aus localStorage/URL-Parametern

## Support

Bei Fragen zur Integration:
- Check die Medusa v2 Dokumentation: https://docs.medusajs.com
- Kontaktiere das Development-Team