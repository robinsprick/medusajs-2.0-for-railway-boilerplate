# Fragebogen-zu-Produktempfehlungs Integration

## Übersicht

Dieses Dokument beschreibt, wie die Fragebogen-Antworten (aus Supabase) mit den Produkten (aus Medusa) verknüpft werden, um personalisierte Produktempfehlungen zu generieren.

## Architektur

```
┌─────────────────────┐
│   Fragebogen UI     │
│  (Next.js Frontend) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Empfehlungs-API    │────▶│   Medusa Backend    │
│  (Next.js API)      │     │  (Product Data)     │
└──────────┬──────────┘     └─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Supabase DB       │
│  (User Answers)     │
└─────────────────────┘
```

## Datenmodell

### 1. Medusa Product Metadata

In Medusa werden Produkte mit speziellen Metadaten versehen, die für die Empfehlungslogik genutzt werden:

```typescript
// Product Metadata Fields
{
  "recommendation_tags": [
    "mehr_stromertrag",
    "sicherheit_garantie",
    "wenig_aufwand",
    "sauberkeit",
    "speicher_zuverlaessigkeit",
    "fehler_vermeiden",
    "langfristiger_service",
    "unabhaengigkeit"
  ],
  "requires_battery_storage": false,
  "min_module_count": 0,
  "max_module_count": 2000,
  "suitable_roof_types": ["schraegdach", "flachdach", "freiland"],
  "recommendation_priority": 1
}
```

### 2. Produktkategorien in Medusa

```
- Reinigung
  - Einmalige Reinigung
  - Reinigungsvertrag (jährlich)
  
- Wartung & Inspektion
  - Basis-Wartung
  - Premium-Wartung mit Thermografie
  - Überspannungsschutz-Check
  
- Monitoring
  - Solar-Log Monitoring
  - App-basiertes Monitoring
  
- Verträge
  - Full-Service-Vertrag
  - Wartungsvertrag
  - Reinigungsvertrag
  
- Speicher-Services
  - Speicherwartung
  - Speicher-Nachrüstung
  
- Zusatzleistungen
  - Wärmepumpen-Beratung
  - Erinnerungsservice
```

## Empfehlungslogik

### 1. Mapping: Prioritäten → Produkt-Tags

```typescript
const priorityToTagsMapping = {
  "Mehr Stromertrag durch optimale Leistung": [
    "mehr_stromertrag"
  ],
  "Sicherheit und Garantieerhalt": [
    "sicherheit_garantie"
  ],
  "Wenig Aufwand - alles aus einer Hand": [
    "wenig_aufwand"
  ],
  "Sauberkeit und Optik": [
    "sauberkeit"
  ],
  "Zuverlässigkeit meines Batteriespeichers": [
    "speicher_zuverlaessigkeit"
  ],
  "Fehler frühzeitig erkennen": [
    "fehler_vermeiden"
  ],
  "Langfristigen Service": [
    "langfristiger_service"
  ],
  "Maximale Unabhängigkeit": [
    "unabhaengigkeit"
  ]
};
```

### 2. API Route für Produktempfehlungen

```typescript
// app/api/recommendations/route.ts
import { createClient } from '@/lib/supabase/server'
import medusaClient from '@/lib/medusa/client'

export async function POST(request: Request) {
  const { formData } = await request.json()
  
  // 1. Speichere Antworten in Supabase
  const supabase = createClient()
  const { data: inquiry } = await supabase
    .from('inquiries')
    .insert({
      zip_code: formData.plz,
      priorities: formData.priorities,
      module_count: formData.modules,
      has_battery_storage: formData.hasBatteryStorage,
      // ... weitere Felder
    })
    .select()
    .single()
  
  // 2. Hole relevante Produkte von Medusa
  const { products } = await medusaClient.products.list({
    limit: 100
  })
  
  // 3. Filter und Score Produkte basierend auf Antworten
  const recommendations = scoreProducts(products, formData)
  
  // 4. Speichere Empfehlungen in Supabase
  await supabase
    .from('product_recommendations')
    .insert({
      inquiry_id: inquiry.id,
      recommended_products: recommendations.map(p => ({
        medusa_product_id: p.id,
        score: p.score,
        reason: p.reason
      }))
    })
  
  return Response.json({ 
    inquiryId: inquiry.id,
    recommendations 
  })
}

function scoreProducts(products: any[], formData: FormData) {
  return products
    .map(product => {
      let score = 0
      const reasons = []
      
      // Score basierend auf Prioritäten
      formData.priorities.forEach(priority => {
        const tags = priorityToTagsMapping[priority]
        const productTags = product.metadata?.recommendation_tags || []
        
        const matchingTags = tags.filter(tag => 
          productTags.includes(tag)
        )
        
        if (matchingTags.length > 0) {
          score += 10 * matchingTags.length
          reasons.push(`Passt zu: ${priority}`)
        }
      })
      
      // Bonus für Batteriespeicher-Produkte
      if (formData.hasBatteryStorage && 
          product.metadata?.requires_battery_storage) {
        score += 15
        reasons.push("Speziell für Batteriespeicher")
      }
      
      // Prüfe Dachart-Kompatibilität
      const suitableRoofTypes = product.metadata?.suitable_roof_types || []
      const hasMatchingRoof = formData.roofTypes.some(roof => 
        suitableRoofTypes.includes(roof)
      )
      
      if (!hasMatchingRoof && suitableRoofTypes.length > 0) {
        score -= 20 // Penality für unpassende Dacharten
      }
      
      return {
        ...product,
        score,
        reason: reasons.join(", ")
      }
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6) // Top 6 Empfehlungen
}
```

### 3. Produkt-Bundles generieren

```typescript
// lib/bundle-generator.ts
export function generateBundles(recommendations: Product[]) {
  const bundles = []
  
  // Basis-Paket (häufigste Kombination)
  const basicBundle = {
    name: "Sorglos-Basis",
    products: recommendations.slice(0, 2),
    discount: 5,
    description: "Perfekt für den Einstieg"
  }
  
  // Premium-Paket (umfassender Service)
  const premiumBundle = {
    name: "Rundum-Sorglos",
    products: recommendations.slice(0, 4),
    discount: 10,
    description: "Maximaler Schutz und Ertrag"
  }
  
  // Individuelles Paket basierend auf Prioritäten
  const customBundle = createCustomBundle(recommendations, formData)
  
  return [basicBundle, premiumBundle, customBundle]
}
```

## Supabase Tabellen-Erweiterung

```sql
-- Neue Tabelle für Produktempfehlungen
CREATE TABLE product_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id),
  recommended_products JSONB NOT NULL,
  bundle_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_recommendations_inquiry ON product_recommendations(inquiry_id);
```

## Frontend-Implementation

### 1. Konfigurator-Seite Update

```typescript
// app/konfigurator/page.tsx
export default async function KonfiguratorPage({ 
  searchParams 
}: { 
  searchParams: { inquiryId?: string } 
}) {
  if (!searchParams.inquiryId) {
    redirect('/fragen')
  }
  
  // Hole Empfehlungen
  const recommendations = await getRecommendations(searchParams.inquiryId)
  
  return (
    <div>
      <h1>Ihre persönlichen Empfehlungen</h1>
      
      {/* Einzelprodukte */}
      <ProductGrid products={recommendations.products} />
      
      {/* Bundles */}
      <BundleSection bundles={recommendations.bundles} />
      
      {/* Warenkorb-Button */}
      <CartSummary />
    </div>
  )
}
```

### 2. Produkt-Karte mit Empfehlungsgrund

```typescript
// components/ProductCard.tsx
export function ProductCard({ 
  product, 
  reason 
}: { 
  product: Product
  reason?: string 
}) {
  return (
    <Card>
      <CardHeader>
        <h3>{product.title}</h3>
        {reason && (
          <Badge variant="secondary">
            {reason}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
        <p className="font-bold">{product.price} €</p>
      </CardContent>
      <CardFooter>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  )
}
```

## Admin-Setup für Produkte

### 1. Produkt-Metadaten in Medusa Admin

Im Medusa Admin Dashboard müssen für jedes Produkt folgende Metadaten gepflegt werden:

1. **Recommendation Tags** (Mehrfachauswahl)
2. **Requires Battery Storage** (Ja/Nein)
3. **Suitable Roof Types** (Mehrfachauswahl)
4. **Min/Max Module Count** (Zahlenfelder)
5. **Priority** (1-10)

### 2. Beispiel-Produkte

**Produkt: "Premium Solarreinigung"**
- Tags: ["mehr_stromertrag", "sauberkeit"]
- Battery Required: false
- Roof Types: ["schraegdach", "flachdach"]
- Priority: 8

**Produkt: "Batteriespeicher-Wartung"**
- Tags: ["speicher_zuverlaessigkeit", "fehler_vermeiden"]
- Battery Required: true
- Roof Types: [] (alle)
- Priority: 9

**Produkt: "Full-Service-Vertrag"**
- Tags: ["wenig_aufwand", "langfristiger_service", "sicherheit_garantie"]
- Battery Required: false
- Roof Types: [] (alle)
- Priority: 10

## Testing

### Test-Szenarien

1. **Kunde mit Batteriespeicher**
   - Prioritäten: "Speicher-Zuverlässigkeit", "Fehler vermeiden"
   - Erwartung: Speicher-Wartung als Top-Empfehlung

2. **Effizienz-orientierter Kunde**
   - Prioritäten: "Mehr Stromertrag", "Fehler vermeiden"
   - Erwartung: Reinigung + Monitoring Pakete

3. **Service-orientierter Kunde**
   - Prioritäten: "Wenig Aufwand", "Langfristiger Service"
   - Erwartung: Full-Service-Verträge

## Nächste Schritte

1. Medusa Backend mit Railway deployen
2. Produkt-Metadaten-Schema implementieren
3. Test-Produkte mit Tags anlegen
4. Empfehlungs-API implementieren
5. Frontend-Integration testen