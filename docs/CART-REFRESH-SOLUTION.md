# Cart Refresh Solution - Automatische Aktualisierung

## Problem
Der Warenkorb aktualisiert sich nicht automatisch nach dem Hinzufügen von Produkten über URL-Parameter. Die Seite muss manuell neu geladen werden, um die hinzugefügten Produkte zu sehen.

## Ursache
Next.js cached aggressiv die Cart-Seite, und die Cache-Invalidierung funktioniert nicht zuverlässig bei Cross-Domain-Requests.

## Implementierte Lösungen

### 1. Force-Dynamic Rendering
```typescript
// In cart/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0
```
Dies deaktiviert das Caching für die Cart-Seite komplett.

### 2. Cache Revalidation
Nach dem Hinzufügen von Produkten:
```typescript
revalidateTag('cart')
revalidatePath(`/${countryCode}/cart`)
```

### 3. CartRefresher Component
Eine Client-Komponente, die:
- URL-Parameter überwacht
- Router.refresh() auslöst bei Änderungen
- LocalStorage für Cross-Tab-Updates nutzt

### 4. Verbesserte UrlCleaner Component
- Setzt localStorage Flag für Cart-Updates
- Triggert router.refresh() vor URL-Bereinigung
- Verwendet useRef um mehrfache Cleanups zu verhindern

### 5. Neue API-Route mit erzwungenem Refresh
`/api/cart/process-and-redirect`
- Verarbeitet Varianten
- Invalidiert Cache explizit
- Redirect mit Cache-Busting-Parametern
- Setzt No-Cache Headers

## Empfohlene Verwendung vom Konfigurator

### Option 1: Direkte Cart-Page mit Force-Refresh (Empfohlen)
```javascript
// Diese URL sorgt für automatisches Refresh
const variantIds = ['variant_01K22ETRHJ2K6P8PQB23XTZY54'];
const timestamp = Date.now();
const shopUrl = `https://shop.dersolarwart.de/de/cart?variants=${variantIds.join(',')}&action=add&t=${timestamp}&source=konfigurator`;
window.location.href = shopUrl;
```

### Option 2: Process-and-Redirect API (Beste Lösung)
```javascript
// Nutzt die neue API-Route für garantiertes Refresh
const variantIds = ['variant_01K22ETRHJ2K6P8PQB23XTZY54'];
const apiUrl = `https://shop.dersolarwart.de/api/cart/process-and-redirect?variants=${variantIds.join(',')}&country=de&source=konfigurator`;
window.location.href = apiUrl;
```

### Option 3: Mit localStorage für Cross-Tab-Updates
```javascript
// Setzt localStorage bevor redirect
localStorage.setItem('cart_last_update', Date.now().toString());
localStorage.setItem('medusa_variants_to_add', variantIds.join(','));
window.location.href = 'https://shop.dersolarwart.de/de/cart';
```

## Technische Details

### Cache-Busting Parameter
- `t` oder `_t`: Timestamp für Cache-Bypass
- `_refresh`: Flag für erzwungenes Refresh

### Headers für No-Cache
```
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Expires: 0
```

### Client-Side Refresh Trigger
- CartRefresher überwacht searchParams
- UrlCleaner triggert router.refresh()
- localStorage für Cross-Tab-Synchronisation

## Debugging

### Console Logs prüfen:
- `[Cart]` - Server-side Processing
- `[CartRefresher]` - Client-side Refresh
- `[Process & Redirect]` - API Processing

### Probleme und Lösungen:

**Problem: Produkte werden nicht hinzugefügt**
- Variant-IDs prüfen
- Region/Country Code verifizieren
- Console für Fehler checken

**Problem: Seite aktualisiert sich nicht**
- Cache-Busting Parameter (`t`) hinzufügen
- Process-and-Redirect API verwenden
- Browser-Cache leeren

**Problem: Inkonsistente Updates**
- Force-dynamic ist gesetzt
- revalidate = 0 ist gesetzt
- CartRefresher ist eingebunden

## Test-URLs

```bash
# Mit Timestamp für Force-Refresh
https://shop.dersolarwart.de/de/cart?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&action=add&t=1234567890

# Via Process-and-Redirect API (Empfohlen)
https://shop.dersolarwart.de/api/cart/process-and-redirect?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&country=de

# Mit mehreren Produkten
https://shop.dersolarwart.de/api/cart/process-and-redirect?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54,variant_01K22EKBYTPPFWAHGP92TXQC6B&country=de&source=konfigurator
```

## Nächste Schritte

1. **Konfigurator anpassen**: Process-and-Redirect API verwenden
2. **Monitoring**: Response-Zeiten überwachen
3. **Optimierung**: WebSocket für Real-time Updates evaluieren