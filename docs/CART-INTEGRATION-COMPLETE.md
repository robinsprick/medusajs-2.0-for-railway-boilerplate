# Cart Integration - Vollständige Lösung

## Übersicht

Die Integration ermöglicht es, Produkte vom Konfigurator (https://konfigurator.dersolarwart.de) direkt in den Shop-Warenkorb (https://shop.dersolarwart.de) zu übertragen.

## Implementierte Lösungen

### 1. URL-basierte Cart-Integration
Die Cart-Seite verarbeitet automatisch URL-Parameter und fügt Produkte hinzu.

**Unterstützte URL-Formate:**
```
# Einzelnes Produkt
https://shop.dersolarwart.de/de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&action=add&source=konfigurator

# Mehrere Produkte
https://shop.dersolarwart.de/de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54,variant_01K22EKBYTPPFWAHGP92TXQC6B&action=add&source=konfigurator

# Alternative Formate
https://shop.dersolarwart.de/de/cart?add_to_cart=variant_01K22ETRHJ2K6P8PQB23XTZY54

# Base64-encoded Payload
https://shop.dersolarwart.de/de/cart?payload=eyJ2YXJpYW50cyI6WyJ2YXJpYW50XzAxSzIyRVRSSEoySzZQOFBRQjIzWFRaWTU0Il19
```

### 2. API-Routen für externe Integration

#### `/api/cart/add-variants` - POST & GET
- Fügt Varianten zum Cart hinzu
- Unterstützt JSON POST und URL GET requests
- Automatische Weiterleitung nach Hinzufügen

#### `/api/cart/add` - GET
- Direkte URL-basierte Integration
- Automatische Weiterleitung zum Cart nach Verarbeitung
- Zeigt Status im Cart an (added=X, errors=true)

#### `/api/cart/external-add` - GET & POST
- CORS-enabled für Cross-Domain Zugriffe
- Perfekt für Konfigurator-Integration
- Unterstützt Redirects und JSON Responses

### 3. Implementierte Dateien

**Cart Page Handler:**
- `/storefront/src/app/[countryCode]/(main)/cart/page.tsx`
- Verarbeitet URL-Parameter automatisch
- Unterstützt multiple Formate

**API Routes:**
- `/storefront/src/app/api/cart/add-variants/route.ts`
- `/storefront/src/app/api/cart/add/route.ts`
- `/storefront/src/app/api/cart/external-add/route.ts`

**URL Cleaner:**
- `/storefront/src/app/[countryCode]/(main)/cart/url-cleaner.tsx`
- Bereinigt URL nach Verarbeitung
- Verarbeitet localStorage-Daten

## Verwendung vom Konfigurator

### Option 1: Direkte Weiterleitung
```javascript
// Im Konfigurator
const variantIds = ['variant_01K22ETRHJ2K6P8PQB23XTZY54', 'variant_01K22EKBYTPPFWAHGP92TXQC6B'];
const shopUrl = `https://shop.dersolarwart.de/de/cart?variants=${variantIds.join(',')}&action=add&source=konfigurator`;
window.location.href = shopUrl;
```

### Option 2: Via API Route
```javascript
// GET Request
const variantIds = ['variant_01K22ETRHJ2K6P8PQB23XTZY54'];
const apiUrl = `https://shop.dersolarwart.de/api/cart/add?variants=${variantIds.join(',')}&action=add&country=de&source=konfigurator`;
window.location.href = apiUrl;

// POST Request
fetch('https://shop.dersolarwart.de/api/cart/add-variants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variants: variantIds,
    countryCode: 'de'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    window.location.href = '/de/cart';
  }
});
```

### Option 3: External API (CORS-enabled)
```javascript
// Für Cross-Domain Zugriffe
const apiUrl = `https://shop.dersolarwart.de/api/cart/external-add?variants=${variantIds.join(',')}&action=add&country=de&source=konfigurator`;
window.location.href = apiUrl;
```

## Fehlerbehandlung

### Tax Provider Fehler
Der Tax Provider ist korrekt konfiguriert mit:
- Provider ID: `tp_system`
- Regions: Deutschland (de) und andere EU-Länder
- Automatische Initialisierung beim Seed

### Region-Fehler
- Automatische Fallback zu 'de' wenn kein Country Code angegeben
- Validierung der Region vor Cart-Erstellung
- Fehlerhafte Regions werden abgefangen

## Testing

### Test-URLs
```bash
# Einzelnes Produkt
curl "https://shop.dersolarwart.de/de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&action=add"

# Mehrere Produkte
curl "https://shop.dersolarwart.de/de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54,variant_01K22EKBYTPPFWAHGP92TXQC6B&action=add"

# Via API
curl "https://shop.dersolarwart.de/api/cart/add?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&action=add&country=de"
```

### Debug-Logs
Alle Komponenten haben ausführliche Logging:
- `[Cart]` - Cart Page Processing
- `[API Cart]` - API Route Processing
- `[API Cart Add]` - Add Route Processing
- `[External Add]` - External API Processing

## Deployment Checkliste

✅ Cart Page verarbeitet URL-Parameter
✅ API Routes erstellt und funktionsfähig
✅ CORS für externe Zugriffe konfiguriert
✅ URL Cleaner bereinigt Parameter nach Verarbeitung
✅ Fehlerbehandlung implementiert
✅ Build erfolgreich

## Nächste Schritte

1. **Test mit echten Produkt-IDs** vom Konfigurator
2. **Monitoring** der Logs in Production
3. **Performance-Optimierung** bei vielen Produkten
4. **Analytics-Tracking** für Konversionen

## Support

Bei Problemen prüfen:
1. Browser-Konsole für JavaScript-Fehler
2. Server-Logs für API-Fehler
3. Netzwerk-Tab für Failed Requests
4. Variant-IDs sind korrekt und existieren im Shop