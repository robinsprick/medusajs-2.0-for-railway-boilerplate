# Solarwart Preissystem - Implementierungsplan

## 🚦 Aktueller Status

| Phase | Status | Fortschritt | Datum |
|-------|--------|-------------|-------|
| **Phase 1: Backend-Infrastruktur** | ✅ Abgeschlossen | 100% | 13.01.2025 |
| **Phase 2: Produkt-Setup** | ✅ Abgeschlossen | 100% | 13.01.2025 |
| **Phase 3: Frontend-Konfigurator** | ⏳ Ausstehend | 0% | - |
| **Phase 4: Cart & Checkout Integration** | ⏳ Ausstehend | 0% | - |

### Letzte Updates
- **13.01.2025**: 
  - Phase 1 erfolgreich abgeschlossen - Backend-Infrastruktur implementiert
  - Phase 2 abgeschlossen - Produkt-Setup implementiert
  - 6 Solarwart-Produkte mit vollständiger Metadata konfiguriert
  - Seed-Script erstellt und getestet
  - Test-Scripts für API-Endpoints bereitgestellt

## 📋 Übersicht

Dieses Dokument beschreibt die vollständige Implementierung des komplexen Preissystems für Solarwart-Dienstleistungen in Medusa v2. Das System unterstützt dynamische Preisberechnungen basierend auf mehreren Faktoren und Staffelpreisen.

## 🎯 Ziele

- Dynamische Preisberechnung für alle Solarwart-Services
- Konfigurator-basierte Produktauswahl
- Transparente Preisaufschlüsselung für Kunden
- Integration in Medusa Cart & Checkout
- Admin-Verwaltung der Preisparameter

## 📊 Preisberechnungsmodelle

### 1. Photovoltaik-Reinigung
```
Preis = Modulanzahl × 13€ × Staffel-Faktor × Dach-Faktor × Etagen-Faktor × Soiling-Faktor + Anfahrt
```

### 2. Photovoltaik-Wartung
```
Preis = Festpreis nach Modultabelle (Jahres- oder Monatspreis)
```

### 3. Monitoring-Service
```
Preis = 99€ (einmalig) + 15€/Monat
```

### 4. Überspannungsschutz
```
DC: Preis = Einheiten × 460€ (Einheiten = ⌈Modulanzahl÷18÷2⌉)
AC: Preis = 649€ + Zusatzoptionen
```

### 5. Drohneninspektion
```
Preis = 149€ (erste 50 Module) + 79€ je weitere 50 Module
```

---

## 📅 Phase 1: Backend-Infrastruktur ✅ ABGESCHLOSSEN

### 1.1 Custom Pricing Module erstellen ✅

**Dateipfad**: `backend/src/modules/solarwart-pricing/`

#### Struktur:
```
solarwart-pricing/
├── index.ts
├── models/
│   ├── pricing-config.ts
│   └── price-calculation.ts
├── services/
│   ├── cleaning-price.service.ts
│   ├── maintenance-price.service.ts
│   ├── monitoring-price.service.ts
│   ├── overvoltage-price.service.ts
│   └── drone-price.service.ts
├── types/
│   └── index.ts
└── utils/
    ├── tier-calculator.ts
    └── factor-calculator.ts
```

#### Aufgaben:
- [x] Module-Struktur erstellen
- [x] Pricing-Config Model definieren
- [x] Service-Klassen implementieren
- [x] Utility-Funktionen für Berechnungen
- [x] Type-Definitionen

### 1.2 Berechnungslogik implementieren ✅

**Cleaning Price Service Beispiel**:
```typescript
// services/cleaning-price.service.ts
export class CleaningPriceService {
  private readonly BASE_PRICE = 13.00;
  private readonly TRAVEL_COST_PER_KM = 3.20;
  
  private readonly TIER_FACTORS = {
    '1-200': 1.00,
    '201-500': 0.90,
    '501-1000': 0.85,
    '1001-2000': 0.80,
    '2001-5000': 0.75,
    '5001-10000': 0.70
  };
  
  private readonly ROOF_FACTORS = {
    'schraeg': 1.15,  // Schrägdach
    'flach': 1.00,    // Flachdach
    'freiland': 0.95  // Freiland
  };
  
  private readonly SOILING_FACTORS = {
    'never': 1.20,    // Nie gereinigt
    'gt18': 1.10,     // ≥ 18 Monate
    'lt18': 1.00      // < 18 Monate
  };

  calculatePrice(config: CleaningConfig): PriceCalculation {
    const tierFactor = this.getTierFactor(config.moduleCount);
    const roofFactor = this.ROOF_FACTORS[config.roofType];
    const floorFactor = this.getFloorFactor(config.floorLevel);
    const soilingFactor = this.SOILING_FACTORS[config.lastCleaning];
    
    const cleaningPrice = config.moduleCount * this.BASE_PRICE * 
                         tierFactor * roofFactor * floorFactor * soilingFactor;
    const travelCost = config.distance * this.TRAVEL_COST_PER_KM;
    
    return {
      basePrice: config.moduleCount * this.BASE_PRICE,
      factors: {
        tier: tierFactor,
        roof: roofFactor,
        floor: floorFactor,
        soiling: soilingFactor
      },
      cleaningPrice,
      travelCost,
      totalPrice: cleaningPrice + travelCost,
      breakdown: this.generateBreakdown(config, cleaningPrice, travelCost)
    };
  }
  
  private getFloorFactor(level: number): number {
    if (level <= 1) return 1.00;
    if (level === 2) return 1.05;
    if (level === 3) return 1.10;
    return 1.10 + (level - 3) * 0.05;
  }
}
```

### 1.3 API Endpoints erstellen ✅

**Dateipfad**: `backend/src/api/store/solarwart/`

#### Endpoints:
```typescript
// calculate-price/route.ts
POST /api/store/solarwart/calculate-price
Body: {
  productType: 'cleaning' | 'maintenance' | 'monitoring' | 'overvoltage' | 'drone',
  config: {...}
}
Response: {
  price: number,
  breakdown: {...},
  validUntil: Date
}

// pricing-config/route.ts
GET /api/store/solarwart/pricing-config/:productType
Response: {
  tiers: [...],
  factors: {...},
  options: [...]
}
```

#### Aufgaben:
- [x] Calculate-Price Endpoint implementieren
- [x] Pricing-Config Endpoint implementieren
- [x] Request-Validierung hinzufügen
- [x] Error-Handling implementieren
- [x] Response-Typen definieren

### 1.4 Workflows erstellen ✅

**Dateipfad**: `backend/src/workflows/solarwart/`

```typescript
// add-configured-product-to-cart.workflow.ts
export const addConfiguredProductToCartWorkflow = createWorkflow(
  "add-configured-product-to-cart",
  (input: ConfiguredProductInput) => {
    // Step 1: Validate configuration
    const validation = validateConfiguration(input);
    
    // Step 2: Calculate price
    const priceCalculation = calculatePrice(input);
    
    // Step 3: Create line item with metadata
    const lineItem = createConfiguredLineItem({
      ...input,
      price: priceCalculation.totalPrice,
      metadata: {
        configuration: input.config,
        priceBreakdown: priceCalculation.breakdown
      }
    });
    
    // Step 4: Add to cart
    const updatedCart = addToCart(lineItem);
    
    return updatedCart;
  }
);
```

#### Aufgaben:
- [x] Add-to-Cart Workflow erstellen
- [x] Price-Validation Workflow
- [ ] Configuration-Update Workflow (Optional)
- [ ] Order-Processing Workflow (Optional)

### 1.5 Datenbank-Erweiterungen ✅

```typescript
// Metadata-Struktur für Line Items
interface LineItemMetadata {
  solarwart_config?: {
    productType: string;
    moduleCount?: number;
    roofType?: string;
    floorLevel?: number;
    lastCleaning?: string;
    distance?: number;
    subscription?: {
      type: 'yearly' | 'monthly';
      duration: number;
    };
    priceBreakdown: {
      basePrice: number;
      discounts: Array<{type: string, amount: number}>;
      additions: Array<{type: string, amount: number}>;
      total: number;
    };
  };
}
```

---

## 📅 Phase 2: Produkt-Setup ✅ ABGESCHLOSSEN

### 2.1 Produktstruktur definieren ✅

#### Produkte:
1. **Photovoltaik-Reinigung**
   - Handle: `pv-reinigung`
   - Typ: Konfigurierbares Produkt
   - Basis-Preis: 13€/Modul

2. **Photovoltaik-Wartung**
   - Handle: `pv-wartung`
   - Varianten: Nach Modulanzahl-Bereichen
   - Subscription-fähig

3. **Monitoring-Service**
   - Handle: `monitoring-service`
   - Einrichtung + Monatliche Gebühr

4. **Überspannungsschutz DC**
   - Handle: `ueberspannungsschutz-dc`
   - Konfigurierbar nach Modulanzahl

5. **Überspannungsschutz AC**
   - Handle: `ueberspannungsschutz-ac`
   - Basis + Zusatzoptionen

6. **Drohneninspektion**
   - Handle: `drohnen-inspektion`
   - Staffelpreis nach Modulanzahl

### 2.2 Produkt-Metadata Schema ✅

```typescript
interface ProductMetadata {
  solarwart_pricing: {
    calculationType: 'cleaning' | 'maintenance' | 'monitoring' | 'overvoltage_dc' | 'overvoltage_ac' | 'drone';
    basePrice?: number;
    priceTiers?: Array<{
      min: number;
      max: number;
      price?: number;
      factor?: number;
    }>;
    availableOptions: {
      requiresModuleCount: boolean;
      requiresRoofType: boolean;
      requiresFloorLevel: boolean;
      requiresSoilingInfo: boolean;
      requiresDistance: boolean;
      hasSubscription: boolean;
    };
    factors?: {
      roof?: Record<string, number>;
      floor?: Record<string, number>;
      soiling?: Record<string, number>;
    };
    constraints?: {
      minModules?: number;
      maxModules?: number;
      maxDistance?: number;
    };
  };
}
```

### 2.3 Seed-Script für Produkte ✅

```typescript
// scripts/seed-solarwart-products.ts
const solarwartProducts = [
  {
    title: "Photovoltaik-Reinigung",
    handle: "pv-reinigung",
    description: "Professionelle Reinigung Ihrer PV-Anlage",
    metadata: {
      solarwart_pricing: {
        calculationType: 'cleaning',
        basePrice: 13.00,
        priceTiers: [
          { min: 1, max: 200, factor: 1.00 },
          { min: 201, max: 500, factor: 0.90 },
          // ...
        ],
        availableOptions: {
          requiresModuleCount: true,
          requiresRoofType: true,
          requiresFloorLevel: true,
          requiresSoilingInfo: true,
          requiresDistance: true,
          hasSubscription: false
        }
      }
    }
  },
  // ... weitere Produkte
];
```

#### Aufgaben:
- [x] Seed-Script erstellen
- [x] Produkte in Admin anlegen
- [x] Metadata konfigurieren
- [ ] Produktbilder hinzufügen (optional)
- [x] Kategorien zuweisen

### 2.4 Admin-UI Erweiterungen (Optional für später)

```typescript
// admin/widgets/solarwart-pricing-config.tsx
export const SolarwartPricingConfig = () => {
  return (
    <Container>
      <Heading>Solarwart Preiskonfiguration</Heading>
      <div>
        <TierEditor />
        <FactorEditor />
        <ConstraintsEditor />
      </div>
    </Container>
  );
};
```

#### Aufgaben:
- [ ] Admin Widget für Preiskonfiguration
- [ ] Tier-Editor implementieren
- [ ] Factor-Editor implementieren
- [ ] Validierungs-UI

---

## 📅 Phase 3: Frontend-Konfigurator

### 3.1 Komponenten-Struktur

```
storefront/src/modules/solarwart-config/
├── index.tsx                           # Haupt-Konfigurator
├── configurators/
│   ├── cleaning-configurator.tsx       # Reinigung
│   ├── maintenance-configurator.tsx    # Wartung
│   ├── monitoring-configurator.tsx     # Monitoring
│   ├── overvoltage-configurator.tsx    # Überspannungsschutz
│   └── drone-configurator.tsx          # Drohneninspektion
├── components/
│   ├── module-counter.tsx              # Modulanzahl-Eingabe
│   ├── roof-type-selector.tsx          # Dachtyp-Auswahl
│   ├── floor-level-selector.tsx        # Etagen-Auswahl
│   ├── soiling-selector.tsx            # Verschmutzungsgrad
│   ├── distance-input.tsx              # Entfernungseingabe
│   ├── price-display.tsx               # Preisanzeige
│   ├── price-breakdown.tsx             # Preisaufschlüsselung
│   └── subscription-selector.tsx       # Abo-Auswahl
├── hooks/
│   ├── use-price-calculation.ts        # Live-Berechnung
│   ├── use-configurator-state.ts       # State Management
│   └── use-validation.ts               # Eingabevalidierung
├── utils/
│   ├── price-calculator.ts             # Client-seitige Berechnung
│   ├── validators.ts                   # Validierungsfunktionen
│   └── formatters.ts                   # Formatierung
└── types/
    └── index.ts                         # TypeScript Definitionen
```

### 3.2 Cleaning Configurator Beispiel

```tsx
// configurators/cleaning-configurator.tsx
import { useState, useEffect } from 'react';
import { usePriceCalculation } from '../hooks/use-price-calculation';
import ModuleCounter from '../components/module-counter';
import RoofTypeSelector from '../components/roof-type-selector';
import FloorLevelSelector from '../components/floor-level-selector';
import SoilingSelector from '../components/soiling-selector';
import DistanceInput from '../components/distance-input';
import PriceDisplay from '../components/price-display';
import PriceBreakdown from '../components/price-breakdown';

export const CleaningConfigurator = ({ product, onAddToCart }) => {
  const [config, setConfig] = useState({
    moduleCount: 30,
    roofType: 'schraeg',
    floorLevel: 1,
    lastCleaning: 'never',
    distance: 10
  });

  const { price, breakdown, isCalculating } = usePriceCalculation(
    'cleaning',
    config
  );

  const handleAddToCart = async () => {
    await onAddToCart({
      productId: product.id,
      quantity: 1,
      metadata: {
        solarwart_config: {
          ...config,
          calculatedPrice: price,
          priceBreakdown: breakdown
        }
      }
    });
  };

  return (
    <div className="solarwart-configurator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="config-inputs">
          <h3 className="text-xl font-bold mb-4">Konfiguration</h3>
          
          <ModuleCounter
            value={config.moduleCount}
            onChange={(value) => setConfig({...config, moduleCount: value})}
            min={1}
            max={10000}
          />
          
          <RoofTypeSelector
            value={config.roofType}
            onChange={(value) => setConfig({...config, roofType: value})}
          />
          
          <FloorLevelSelector
            value={config.floorLevel}
            onChange={(value) => setConfig({...config, floorLevel: value})}
          />
          
          <SoilingSelector
            value={config.lastCleaning}
            onChange={(value) => setConfig({...config, lastCleaning: value})}
          />
          
          <DistanceInput
            value={config.distance}
            onChange={(value) => setConfig({...config, distance: value})}
            max={50}
          />
        </div>
        
        <div className="price-section">
          <h3 className="text-xl font-bold mb-4">Preisübersicht</h3>
          
          <PriceDisplay
            price={price}
            isCalculating={isCalculating}
          />
          
          <PriceBreakdown
            breakdown={breakdown}
            config={config}
          />
          
          <button
            onClick={handleAddToCart}
            disabled={isCalculating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6"
          >
            In den Warenkorb
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 3.3 Shared Components

```tsx
// components/module-counter.tsx
export const ModuleCounter = ({ value, onChange, min = 1, max = 10000 }) => {
  const getTierInfo = (count: number) => {
    if (count <= 200) return { tier: '1-200', discount: 0 };
    if (count <= 500) return { tier: '201-500', discount: 10 };
    if (count <= 1000) return { tier: '501-1000', discount: 15 };
    if (count <= 2000) return { tier: '1001-2000', discount: 20 };
    if (count <= 5000) return { tier: '2001-5000', discount: 25 };
    return { tier: '5001-10000', discount: 30 };
  };

  const tierInfo = getTierInfo(value);

  return (
    <div className="module-counter">
      <label className="block text-sm font-medium mb-2">
        Anzahl Module
      </label>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onChange(Math.max(min, value - 10))}
          className="px-3 py-1 border rounded"
        >
          -10
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          min={min}
          max={max}
          className="w-24 text-center border rounded px-2 py-1"
        />
        <button
          onClick={() => onChange(Math.min(max, value + 10))}
          className="px-3 py-1 border rounded"
        >
          +10
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Preisstufe: {tierInfo.tier} ({tierInfo.discount}% Rabatt)
      </div>
    </div>
  );
};
```

### 3.4 Hooks für State Management

```typescript
// hooks/use-price-calculation.ts
export const usePriceCalculation = (productType: string, config: any) => {
  const [price, setPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const calculatePrice = async () => {
      setIsCalculating(true);
      
      try {
        const response = await fetch('/api/store/solarwart/calculate-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productType, config })
        });
        
        const data = await response.json();
        setPrice(data.price);
        setBreakdown(data.breakdown);
      } catch (error) {
        console.error('Price calculation failed:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce calculation
    const timer = setTimeout(calculatePrice, 500);
    return () => clearTimeout(timer);
  }, [productType, config]);

  return { price, breakdown, isCalculating };
};
```

#### Aufgaben:
- [ ] Basis-Konfigurator implementieren
- [ ] Alle Service-Konfiguratoren erstellen
- [ ] Shared Components entwickeln
- [ ] State Management einrichten
- [ ] API-Integration
- [ ] Validierung implementieren
- [ ] Responsive Design
- [ ] Accessibility sicherstellen

### 3.5 Integration in Produktseiten

```tsx
// modules/products/components/product-actions/solarwart-actions.tsx
export const SolarwartProductActions = ({ product }) => {
  const [showConfigurator, setShowConfigurator] = useState(false);
  const { addToCart } = useCart();

  const isSolarwartProduct = product.metadata?.solarwart_pricing;

  if (!isSolarwartProduct) {
    return <StandardProductActions product={product} />;
  }

  const ConfiguratorComponent = getConfigurator(
    product.metadata.solarwart_pricing.calculationType
  );

  return (
    <div>
      {!showConfigurator ? (
        <button
          onClick={() => setShowConfigurator(true)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Konfigurieren & Preis berechnen
        </button>
      ) : (
        <ConfiguratorComponent
          product={product}
          onAddToCart={async (config) => {
            await addToCart(config);
            setShowConfigurator(false);
          }}
        />
      )}
    </div>
  );
};
```

---

## 📅 Phase 4: Cart & Checkout Integration

### 4.1 Cart-Item Erweiterung

```tsx
// modules/cart/components/solarwart-item.tsx
export const SolarwartCartItem = ({ item }) => {
  const config = item.metadata?.solarwart_config;
  
  if (!config) return <StandardCartItem item={item} />;

  return (
    <div className="solarwart-cart-item">
      <div className="item-header">
        <h3>{item.product.title}</h3>
        <button onClick={() => removeItem(item.id)}>Entfernen</button>
      </div>
      
      <div className="configuration-summary">
        <h4>Konfiguration:</h4>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {config.moduleCount && (
            <>
              <dt>Module:</dt>
              <dd>{config.moduleCount}</dd>
            </>
          )}
          {config.roofType && (
            <>
              <dt>Dachtyp:</dt>
              <dd>{getRoofTypeLabel(config.roofType)}</dd>
            </>
          )}
          {config.floorLevel && (
            <>
              <dt>Etage:</dt>
              <dd>{config.floorLevel}. Etage</dd>
            </>
          )}
          {config.distance && (
            <>
              <dt>Entfernung:</dt>
              <dd>{config.distance} km</dd>
            </>
          )}
        </dl>
      </div>
      
      <div className="price-breakdown">
        <h4>Preisaufschlüsselung:</h4>
        <dl className="text-sm">
          <dt>Basispreis:</dt>
          <dd>{formatPrice(config.priceBreakdown.basePrice)}</dd>
          
          {config.priceBreakdown.discounts?.map(discount => (
            <React.Fragment key={discount.type}>
              <dt>{discount.type}:</dt>
              <dd className="text-green-600">
                -{formatPrice(discount.amount)}
              </dd>
            </React.Fragment>
          ))}
          
          {config.priceBreakdown.additions?.map(addition => (
            <React.Fragment key={addition.type}>
              <dt>{addition.type}:</dt>
              <dd>+{formatPrice(addition.amount)}</dd>
            </React.Fragment>
          ))}
          
          <dt className="font-bold">Gesamt:</dt>
          <dd className="font-bold">{formatPrice(item.price)}</dd>
        </dl>
      </div>
    </div>
  );
};
```

### 4.2 Checkout-Validierung

```typescript
// workflows/validate-solarwart-checkout.workflow.ts
export const validateSolarwartCheckoutWorkflow = createWorkflow(
  "validate-solarwart-checkout",
  (input: { cart: Cart }) => {
    const solarwartItems = input.cart.items.filter(
      item => item.metadata?.solarwart_config
    );

    for (const item of solarwartItems) {
      const config = item.metadata.solarwart_config;
      
      // Validate configuration is still valid
      validateConfiguration(config);
      
      // Recalculate price to ensure it's current
      const currentPrice = calculatePrice(
        config.productType,
        config
      );
      
      if (Math.abs(currentPrice - item.price) > 0.01) {
        throw new Error(
          `Preis hat sich geändert. Bitte aktualisieren Sie den Warenkorb.`
        );
      }
    }
    
    return { valid: true };
  }
);
```

### 4.3 Order-Metadata

```typescript
// Order metadata structure
interface OrderMetadata {
  solarwart_items?: Array<{
    productType: string;
    configuration: any;
    calculatedPrice: number;
    priceBreakdown: any;
    calculatedAt: Date;
  }>;
}
```

### 4.4 Admin Order-Ansicht

```tsx
// admin/widgets/solarwart-order-details.tsx
export const SolarwartOrderDetails = ({ order }) => {
  const solarwartItems = order.items.filter(
    item => item.metadata?.solarwart_config
  );

  if (solarwartItems.length === 0) return null;

  return (
    <Container>
      <Heading>Solarwart Service Details</Heading>
      {solarwartItems.map(item => (
        <Card key={item.id}>
          <h3>{item.product.title}</h3>
          <ConfigurationDisplay config={item.metadata.solarwart_config} />
          <PriceBreakdownDisplay breakdown={item.metadata.solarwart_config.priceBreakdown} />
        </Card>
      ))}
    </Container>
  );
};
```

#### Aufgaben:
- [ ] Cart-Item Component erweitern
- [ ] Checkout-Validierung implementieren
- [ ] Order-Processing anpassen
- [ ] Admin-Ansicht erweitern
- [ ] Email-Templates anpassen

---

## 🧪 Testing

### Unit Tests
```typescript
// __tests__/price-calculation.test.ts
describe('Cleaning Price Calculation', () => {
  it('should calculate correct price with all factors', () => {
    const config = {
      moduleCount: 250,
      roofType: 'schraeg',
      floorLevel: 2,
      lastCleaning: 'never',
      distance: 20
    };
    
    const result = calculateCleaningPrice(config);
    
    // 250 * 13 * 0.90 (tier) * 1.15 (roof) * 1.05 (floor) * 1.20 (soiling)
    expect(result.cleaningPrice).toBe(4236.75);
    expect(result.travelCost).toBe(64);
    expect(result.totalPrice).toBe(4300.75);
  });
});
```

### E2E Tests
```typescript
// e2e/solarwart-configurator.spec.ts
test('should configure and add cleaning service to cart', async ({ page }) => {
  await page.goto('/products/pv-reinigung');
  
  await page.click('button:has-text("Konfigurieren")');
  
  await page.fill('input[name="moduleCount"]', '100');
  await page.selectOption('select[name="roofType"]', 'flach');
  await page.fill('input[name="distance"]', '15');
  
  await expect(page.locator('.price-display')).toContainText('1.170,00 €');
  
  await page.click('button:has-text("In den Warenkorb")');
  
  await expect(page).toHaveURL('/cart');
  await expect(page.locator('.cart-item')).toContainText('Photovoltaik-Reinigung');
});
```

---

## 📝 Notizen

### Wichtige Überlegungen
1. Alle Preise sind Bruttopreise (inkl. MwSt.)
2. Preisberechnung erfolgt sowohl client- als auch server-seitig
3. Server-seitige Validierung ist zwingend erforderlich
4. Konfigurationen werden in Cart-Metadata gespeichert
5. Historische Preise werden in Order-Metadata archiviert

### Offene Punkte
- [ ] Mehrsprachigkeit der Konfiguratoren
- [ ] PDF-Export der Preisaufschlüsselung
- [ ] Recurring Billing für Wartungsverträge
- [ ] Integration mit CRM-System
- [ ] Automatische Angebotserstellung

### Performance-Optimierungen
1. Client-seitige Preisberechnung für schnelles Feedback
2. Debouncing bei Eingabeänderungen
3. Caching von Pricing-Konfigurationen
4. Lazy Loading der Konfiguratoren

---

## 📚 Referenzen

- [Medusa v2 Dokumentation](https://docs.medusajs.com/v2)
- [Medusa Workflows](https://docs.medusajs.com/v2/resources/workflows)
- [Medusa Pricing Module](https://docs.medusajs.com/v2/resources/commerce-modules/pricing)
- Original Preisdokument: `/docs/preise_der_solarwart.md`