# Konfigurator Integration Guide - Medusa Shop

## 🚨 WICHTIG: Auto-Refresh ist implementiert!

Der Shop hat jetzt eine **AutoRefresh-Komponente**, die automatisch die Seite neu lädt, wenn sie die Parameter `_refresh=1` oder `_t` in der URL findet. Das bedeutet:
- ✅ Die Produkte werden beim ersten Laden angezeigt
- ✅ Kein manuelles Refresh mehr nötig
- ✅ Die Seite lädt sich EINMAL automatisch neu
- ✅ Zeigt "Warenkorb wird aktualisiert..." während des Ladens

## Übersicht
Diese Anleitung beschreibt, wie der Konfigurator (https://konfigurator.dersolarwart.de) Produkte an den Medusa Shop (https://shop.dersolarwart.de) übergeben soll.

## LÖSUNG: Neue API-Route verwenden

### ❌ ALTE Implementierung (Problematisch)
```javascript
// NICHT MEHR VERWENDEN - Führt zu Cache-Problemen
const variantIds = ['variant_01K22ETRHJ2K6P8PQB23XTZY54', 'variant_01K22EKBYTPPFWAHGP92TXQC6B'];
const shopUrl = `https://shop.dersolarwart.de/de/cart?variants=${variantIds.join(',')}&action=add&source=konfigurator`;
window.location.href = shopUrl;
```

### ✅ NEUE Implementierung (Empfohlen)
```javascript
// DIESE LÖSUNG VERWENDEN - Mit automatischem Refresh
const handleAddToCart = () => {
  // Sammle alle ausgewählten Variant-IDs
  const variantIds = [
    'variant_01K22ETRHJ2K6P8PQB23XTZY54',  // Photovoltaik Reinigung
    'variant_01K22EKBYTPPFWAHGP92TXQC6B'   // Photovoltaik Wartung
  ];
  
  // Nutze die neue process-and-redirect API
  const apiUrl = new URL('https://shop.dersolarwart.de/api/cart/process-and-redirect');
  apiUrl.searchParams.set('variants', variantIds.join(','));
  apiUrl.searchParams.set('country', 'de');
  apiUrl.searchParams.set('source', 'konfigurator');
  
  // Optional: PLZ und Stadt für Analytics
  if (plz) apiUrl.searchParams.set('plz', plz);
  if (city) apiUrl.searchParams.set('city', city);
  
  // Weiterleitung zum Shop - AutoRefresh wird automatisch ausgelöst!
  window.location.href = apiUrl.toString();
};
```

## Warum funktioniert das jetzt?

Die `/api/cart/process-and-redirect` Route:
1. **Verarbeitet** die Varianten server-seitig
2. **Fügt** die Produkte zum Warenkorb hinzu
3. **Leitet weiter** mit `_refresh=1` Parameter
4. **AutoRefresh-Komponente** erkennt den Parameter
5. **Lädt die Seite** automatisch EINMAL neu
6. **Zeigt** die Produkte sofort im Warenkorb

## Was passiert im Shop?

1. User wird weitergeleitet zu: `/de/cart?_t=1234567890&_refresh=1&from=konfigurator&items_added=2`
2. AutoRefresh-Komponente zeigt "Warenkorb wird aktualisiert..."
3. Seite lädt sich automatisch neu (nach 100ms)
4. Produkte sind sichtbar im Warenkorb
5. URL wird bereinigt

## Variant-ID Mapping

Die Variant-IDs müssen mit den tatsächlichen Produkten im Shop übereinstimmen:

```javascript
const VARIANT_MAPPING = {
  // Reinigung
  'photovoltaik-reinigung': 'variant_01K22ETRHJ2K6P8PQB23XTZY54',
  
  // Wartung
  'photovoltaik-wartung': 'variant_01K22EKBYTPPFWAHGP92TXQC6B',
  
  // Monitoring
  'monitoring-fernueberwachung': 'variant_[ACTUAL_ID]',
  
  // Weitere Produkte...
};
```

## Vollständiges Beispiel für Konfigurator

```javascript
// Im Konfigurator
class ShopIntegration {
  constructor() {
    this.baseUrl = 'https://shop.dersolarwart.de';
    this.selectedProducts = [];
  }
  
  // Produkt zur Auswahl hinzufügen
  addProduct(variantId) {
    if (!this.selectedProducts.includes(variantId)) {
      this.selectedProducts.push(variantId);
    }
  }
  
  // Produkt aus Auswahl entfernen
  removeProduct(variantId) {
    this.selectedProducts = this.selectedProducts.filter(id => id !== variantId);
  }
  
  // Zum Shop weiterleiten mit ausgewählten Produkten
  proceedToCheckout() {
    if (this.selectedProducts.length === 0) {
      alert('Bitte wählen Sie mindestens ein Produkt aus.');
      return;
    }
    
    // WICHTIG: Nutze process-and-redirect für Auto-Refresh!
    const apiUrl = new URL(`${this.baseUrl}/api/cart/process-and-redirect`);
    
    // Füge Varianten hinzu
    apiUrl.searchParams.set('variants', this.selectedProducts.join(','));
    
    // Setze Country Code (immer 'de' für Deutschland)
    apiUrl.searchParams.set('country', 'de');
    
    // Markiere Quelle als Konfigurator
    apiUrl.searchParams.set('source', 'konfigurator');
    
    // Optional: Zusätzliche Daten für Tracking
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('plz')) {
      apiUrl.searchParams.set('plz', urlParams.get('plz'));
    }
    if (urlParams.get('city')) {
      apiUrl.searchParams.set('city', urlParams.get('city'));
    }
    
    // Weiterleitung - Shop wird automatisch refreshen!
    console.log('[Konfigurator] Redirecting to shop with products:', this.selectedProducts);
    window.location.href = apiUrl.toString();
  }
}
```

## Alternative Lösungen (Fallback)

Falls die process-and-redirect API nicht funktioniert:

### Option 1: Direkte Cart-URL mit Refresh-Parametern
```javascript
// Füge _refresh=1 hinzu für Auto-Refresh
const timestamp = Date.now();
const shopUrl = `https://shop.dersolarwart.de/de/cart?variants=${variantIds.join(',')}&action=add&_t=${timestamp}&_refresh=1&source=konfigurator`;
window.location.href = shopUrl;
```

### Option 2: Via Standard API mit Refresh
```javascript
const apiUrl = `https://shop.dersolarwart.de/api/cart/add?variants=${variantIds.join(',')}&action=add&country=de&source=konfigurator`;
window.location.href = apiUrl;
```

## Testing

### Test-URLs zum Ausprobieren:

1. **Einzelnes Produkt (mit Auto-Refresh):**
```
https://shop.dersolarwart.de/api/cart/process-and-redirect?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54&country=de&source=konfigurator
```

2. **Mehrere Produkte (mit Auto-Refresh):**
```
https://shop.dersolarwart.de/api/cart/process-and-redirect?variants=variant_01K22ETRHJ2K6P8PQB23XTZY54,variant_01K22EKBYTPPFWAHGP92TXQC6B&country=de&source=konfigurator
```

## Wichtige Hinweise

1. **Auto-Refresh funktioniert** - Die Seite lädt sich automatisch neu
2. **Variant-IDs** müssen exakt mit den IDs im Shop übereinstimmen
3. **Country Code** sollte immer 'de' für Deutschland sein
4. **_refresh=1** Parameter triggert das Auto-Refresh
5. **Loading-Indicator** zeigt "Warenkorb wird aktualisiert..."

## Debugging

Browser-Konsole zeigt:
```
[AutoRefresh] Checking: {needsRefresh: true, fromKonfigurator: true}
[AutoRefresh] Triggering automatic page reload...
```

## Support

Bei Problemen:
1. Prüfe ob `_refresh=1` in der URL ist
2. Check Browser-Konsole für `[AutoRefresh]` Logs
3. Stelle sicher, dass Variant-IDs korrekt sind

## Kontakt

Bei Fragen zur Integration oder Problemen mit den Variant-IDs bitte melden.