# Konfigurator Cart Integration

## Übersicht

Diese Dokumentation beschreibt die Integration zwischen dem externen Konfigurator und dem Medusa Shop-System, speziell für das Hinzufügen von Produkten mit dynamisch berechneten Preisen.

## Problem

Der Konfigurator berechnet dynamische Preise basierend auf Konfigurationen (z.B. für Reinigung, Wartung, Monitoring). Diese Preise müssen beim Hinzufügen zum Warenkorb übernommen werden, anstatt die Standard-Variantenpreise zu verwenden.

## Lösung

### 1. Backend API Route

**Endpoint:** `/store/solarwart/cart/add-custom-item`  
**Methode:** POST

Ermöglicht das Hinzufügen von Line Items mit benutzerdefinierten Preisen.

```typescript
interface CustomItemRequest {
  cart_id: string
  variant_id?: string      // Optional: Varianten-ID wenn vorhanden
  product_id?: string      // Optional: Produkt-ID wenn vorhanden
  quantity: number
  unit_price: number       // Der berechnete Preis in Cents
  title: string
  description?: string
  metadata?: Record<string, any>
  config?: any            // Die Konfiguration vom Konfigurator
}
```

### 2. Frontend API Route

**Endpoint:** `/api/cart/konfigurator-add-custom`  
**Methoden:** GET, POST

Nimmt Anfragen vom Konfigurator entgegen und leitet sie an das Backend weiter.

```typescript
interface KonfiguratorItem {
  variant_id?: string
  product_id?: string
  quantity: number
  unit_price: number     // Preis in Cents
  title: string
  description?: string
  config?: any          // Konfigurator-Konfiguration
  metadata?: Record<string, any>
}
```

### 3. Workflow

Der `addCustomCartItemWorkflow` handled:
- Erstellung des Line Items mit custom Preis
- Aktualisierung der Cart-Totals
- Speicherung der Konfigurator-Konfiguration in Metadata

## Verwendung vom Konfigurator

### POST Request (Empfohlen)

```javascript
const response = await fetch('https://shop.dersolarwart.de/api/cart/konfigurator-add-custom', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    items: [
      {
        variant_id: 'variant_123',  // Optional
        product_id: 'prod_456',      // Optional
        quantity: 1,
        unit_price: 29900,           // 299,00 € in Cents
        title: 'PV-Reinigung Standard',
        description: '100 Module, 2x jährlich',
        config: {
          // Konfigurator-Konfiguration
          moduleCount: 100,
          cleaningsPerYear: 2,
          // ... weitere Konfig
        },
        metadata: {
          productType: 'cleaning'
        }
      }
    ],
    countryCode: 'de',
    source: 'konfigurator',
    redirectToCart: true  // Optional: Direkt zum Warenkorb weiterleiten
  })
})
```

### GET Request (Für einfache Weiterleitungen)

```javascript
const items = [
  {
    variant_id: 'variant_123',
    quantity: 1,
    unit_price: 29900,
    title: 'PV-Reinigung Standard',
    config: { moduleCount: 100 }
  }
]

const params = new URLSearchParams({
  items: JSON.stringify(items),
  country: 'de',
  source: 'konfigurator',
  redirect: 'true'
})

window.location.href = `https://shop.dersolarwart.de/api/cart/konfigurator-add-custom?${params}`
```

## Response

```json
{
  "success": true,
  "cartId": "cart_abc123",
  "results": [
    {
      "item": "PV-Reinigung Standard",
      "success": true,
      "price": 29900
    }
  ],
  "summary": {
    "total": 1,
    "success": 1,
    "errors": 0
  },
  "cartUrl": "/de/cart"
}
```

## CORS

Die Endpoints unterstützen CORS für folgende Origins:
- https://solarwartshop.vercel.app
- https://konfigurator.dersolarwart.de
- http://localhost:3000
- http://localhost:3001

## Wichtige Hinweise

1. **Preise in Cents:** Alle Preise müssen in Cents angegeben werden (29900 = 299,00 €)

2. **Metadata:** Die Konfigurator-Konfiguration wird in den Metadata gespeichert und ist später für Bestellungen verfügbar

3. **Cart-Session:** Der Warenkorb wird über Cookies verwaltet. Bei POST-Requests muss `credentials: 'include'` gesetzt sein

4. **Variant vs Product ID:** Wenn möglich, sollte eine variant_id verwendet werden. Falls nur product_id vorhanden ist, wird ein generisches Line Item erstellt

## Fehlerbehebung

### Produkt wird mit falschem Preis hinzugefügt

Stellen Sie sicher, dass:
1. Der neue Endpoint `/api/cart/konfigurator-add-custom` verwendet wird (nicht der alte `/api/cart/konfigurator-add`)
2. Der `unit_price` in Cents angegeben ist
3. Die `items` Array-Struktur korrekt ist

### CORS-Fehler

Prüfen Sie, ob die Origin in der `ALLOWED_ORIGINS` Liste enthalten ist.

### Cart nicht gefunden

Der Cart wird automatisch erstellt, wenn keiner existiert. Falls Probleme auftreten, prüfen Sie die Region-Konfiguration.