# Medusa.js Implementation Guide für Solarwart

## Übersicht

Dieser Guide beschreibt die Integration von Medusa.js als E-Commerce-Backend mit Supabase als primärer Datenbank für den Solarwart Shop.

## Architektur

```
┌─────────────────────┐     ┌─────────────────────┐
│   Next.js Frontend  │────▶│   Medusa Backend    │
│  (Vercel)          │     │  (Railway/Render)   │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │   Supabase DB       │
                            │  - Medusa Tables    │
                            │  - Custom Tables    │
                            └─────────────────────┘
```

## Warum Medusa + Supabase?

- **Medusa** übernimmt: Produkte, Warenkorb, Checkout, Bestellungen, Kunden, Payment
- **Supabase** verwaltet: PLZ-Daten, Warteliste, Custom Analytics, Auth (optional)
- **Ein** Datenbank-System für alles → weniger Komplexität

## Setup-Schritte

### 1. Medusa Backend Setup

```bash
# Medusa CLI installieren
npm install -g @medusajs/medusa-cli

# Neues Medusa Projekt erstellen
medusa new solarwart-backend

# In Projekt-Ordner wechseln
cd solarwart-backend
```

### 2. Supabase als Datenbank konfigurieren

**medusa-config.js anpassen:**

```javascript
module.exports = {
  projectConfig: {
    // Supabase PostgreSQL Connection String
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",
    store_cors: process.env.STORE_CORS || "http://localhost:3000",
    admin_cors: process.env.ADMIN_CORS || "http://localhost:7000",
    database_extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
  plugins: [
    // Medusa Admin UI
    {
      resolve: "@medusajs/admin",
      options: {
        autoRebuild: true,
      },
    },
    // Mollie Payment Provider
    {
      resolve: "medusa-payment-mollie",
      options: {
        api_key: process.env.MOLLIE_API_KEY,
        test_mode: true,
      },
    },
  ],
};
```

### 3. Environment Variables

**.env für Medusa Backend:**

```env
# Supabase Connection (aus Supabase Dashboard > Settings > Database)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Medusa Settings
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret

# Mollie
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxx

# CORS
STORE_CORS=https://solarwartshop.de,http://localhost:3000
ADMIN_CORS=https://admin.solarwartshop.de,http://localhost:7000
```

### 4. Datenbank-Migration

Medusa erstellt automatisch seine Tabellen in der Supabase DB:

```bash
# Im Medusa Backend Ordner
npm run build
medusa migrations run
```

Dies erstellt folgende Tabellen in Supabase:
- `product`, `product_variant`, `product_category`
- `cart`, `cart_line_item`
- `order`, `order_item`, `payment`
- `customer`, `address`
- `region`, `currency`, `tax_rate`
- ... und viele mehr

### 5. Custom Tables bleiben unberührt

Unsere bestehenden Tabellen bleiben erhalten:
- `available_zip_codes`
- `expansion_requests`
- `request_details`
- `inquiries`

## Frontend Integration

### Store API Client

```typescript
// src/lib/medusa/client.ts
import Medusa from "@medusajs/medusa-js"

const medusaClient = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  maxRetries: 3,
})

export default medusaClient
```

### Beispiel: Produkte abrufen

```typescript
// src/app/produkte/page.tsx
import medusaClient from "@/lib/medusa/client"

export default async function ProductsPage() {
  const { products } = await medusaClient.products.list()
  
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Warenkorb-Integration

```typescript
// src/hooks/use-cart.ts
import { useCart } from "medusa-react"

export function useShoppingCart() {
  const { cart, addItem, updateItem, removeItem } = useCart()
  
  return {
    cart,
    addToCart: (variantId: string, quantity: number) => 
      addItem({ variant_id: variantId, quantity }),
    // ... weitere Methoden
  }
}
```

## Medusa Admin Dashboard

Medusa kommt mit einem fertigen Admin-Dashboard:

- URL: `http://localhost:7000` (development)
- Features:
  - Produktverwaltung (inkl. Varianten, Bilder)
  - Bestellübersicht
  - Kundenverwaltung
  - Rabatt-Codes
  - Analytics
  - Settings (Regionen, Währungen, Steuern)

## Deployment

### Option 1: Railway (Empfohlen)

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```


## Mollie Payment Integration

Medusa hat ein offizielles Mollie-Plugin:

```bash
npm install medusa-payment-mollie
```

Konfiguration erfolgt automatisch über die `medusa-config.js`.

## Wichtige Medusa Konzepte

### 1. Regions
- Definieren Währung, Steuersätze, Payment Provider
- Beispiel: "Deutschland" mit EUR und 19% MwSt

### 2. Products & Variants
- Product = "Solarwartung Basic"
- Variants = "Monatlich", "Jährlich"

### 3. Cart & Checkout Flow
1. Cart erstellen
2. Items hinzufügen
3. Shipping Address
4. Shipping Method wählen
5. Payment initialisieren
6. Order erstellen

### 4. Customers
- Automatische Kundenerstellung bei Bestellung
- Optional: Account-Registrierung

## Custom Features Integration

### PLZ-Check bleibt bei Supabase

```typescript
// Weiterhin über Supabase
const { data: availableZip } = await supabase
  .from('available_zip_codes')
  .select('*')
  .eq('zip_code', plz)
  .single()
```

### Medusa Webhooks für Custom Logic

```typescript
// src/subscribers/order-placed.ts
class OrderPlacedSubscriber {
  constructor({ eventBusService, supabaseService }) {
    eventBusService.subscribe("order.placed", this.handleOrder)
  }

  handleOrder = async (data) => {
    // Custom Logic, z.B. in Supabase speichern
    await supabaseService.saveOrderAnalytics(data.id)
  }
}
```

## Migration Plan

### Phase 1: Setup (1-2 Tage)
- [ ] Medusa Backend aufsetzen
- [ ] Supabase Connection konfigurieren
- [ ] Medusa Migrations laufen lassen
- [ ] Admin Dashboard testen

### Phase 2: Produkte (2-3 Tage)
- [ ] Produkt-Struktur definieren
- [ ] Test-Produkte anlegen
- [ ] Kategorien & Collections
- [ ] Preise & Varianten

### Phase 3: Frontend Integration (3-4 Tage)
- [ ] Medusa Client einbinden
- [ ] Product Listing Pages
- [ ] Product Detail Pages
- [ ] Cart Functionality

### Phase 4: Checkout (2-3 Tage)
- [ ] Checkout Flow implementieren
- [ ] Mollie Payment testen
- [ ] Order Confirmation

### Phase 5: Admin & Customer (2 Tage)
- [ ] Customer Login/Register
- [ ] Order History
- [ ] Admin Schulung

## Entscheidungen

1. **Hosting**: Railway (Kunde hat bereits Account)
2. **Admin Domain**: admin.solarwartshop.de
3. **Bestehende Daten**: PLZ-Daten bleiben in Supabase
4. **Auth**: Medusa Auth für E-Commerce-Funktionen

## Admin Subdomain Setup

Für die Admin-Subdomain benötigen wir:

1. **DNS-Eintrag**: 
   - Type: CNAME
   - Name: admin
   - Value: [Railway-App-URL].up.railway.app

2. **Railway Config**:
   - Custom Domain: admin.solarwartshop.de
   - SSL: Automatisch via Railway

3. **Medusa Config Update**:
   ```javascript
   admin_cors: process.env.ADMIN_CORS || "https://admin.solarwartshop.de"
   ``` 

## Nächste Schritte

1. Medusa Backend lokal aufsetzen
2. Supabase Connection testen
3. Erste Produkte anlegen
4. Frontend-Integration beginnen

## Ressourcen

- [Medusa Docs](https://docs.medusajs.com/)
- [Medusa + Next.js Starter](https://github.com/medusajs/nextjs-starter-medusa)
- [Mollie Plugin Docs](https://github.com/dearsikanddar/medusa-payment-mollie)
- [Medusa Discord](https://discord.gg/medusajs)