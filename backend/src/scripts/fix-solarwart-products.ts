import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"

export default async function fixSolarwartProducts({ container, args = [] }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("Fixing Solarwart products (adding missing products and variants)...")

  // Get default sales channel
  const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })

  // Check and create missing categories first
  const categoryService = container.resolve(Modules.PRODUCT)
  
  // Define all products with their complete data
  const allProducts = [
    {
      handle: "photovoltaik-reinigung",
      title: "Photovoltaik-Reinigung",
      description: `Professionelle Reinigung Ihrer Photovoltaik-Anlage für maximale Effizienz.
        
- Entfernung von Verschmutzungen, Staub und Vogelkot
- Schonende Reinigung mit entmineralisiertem Wasser
- Keine chemischen Reinigungsmittel
- Ertragssteigung von 10-30% möglich

Der Preis wird basierend auf Ihrer Anlagenkonfiguration berechnet.`.trim(),
      category: "reinigung",
      sku: "PV-CLEAN-001",
      price: 1300, // 13€ base price in cents
      metadata: {
        solarwart_pricing: {
          calculationType: 'cleaning',
          basePrice: 13.00,
          priceTiers: [
            { min: 1, max: 200, factor: 1.00, discount: 0 },
            { min: 201, max: 500, factor: 0.90, discount: 10 },
            { min: 501, max: 1000, factor: 0.85, discount: 15 },
            { min: 1001, max: 2000, factor: 0.80, discount: 20 },
            { min: 2001, max: 5000, factor: 0.75, discount: 25 },
            { min: 5001, max: 10000, factor: 0.70, discount: 30 }
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
    {
      handle: "photovoltaik-wartung",
      title: "Photovoltaik-Wartung",
      description: `Umfassender Wartungsvertrag für Ihre PV-Anlage.
        
Leistungen:
- Jährliche Sichtprüfung
- Funktionskontrolle aller Komponenten
- Ertragskontrolle und Dokumentation
- Reinigung der Module (1x jährlich)
- 24/7 Monitoring (optional)
- Speicherwartung (optional, bis 100 Module)

Verfügbar als Jahres- oder Monatsvertrag.`.trim(),
      category: "wartung-inspektion",
      sku: "PV-MAINT-001",
      price: 26400, // Starting price for yearly contract in cents
      metadata: {
        solarwart_pricing: {
          calculationType: 'maintenance',
          availableOptions: {
            requiresModuleCount: true,
            requiresRoofType: false,
            requiresFloorLevel: false,
            requiresSoilingInfo: false,
            requiresDistance: false,
            hasSubscription: true,
            hasStorageOption: true
          },
          constraints: {
            minModules: 1,
            maxModules: 10000,
            storageMaxModules: 100
          }
        }
      }
    },
    {
      handle: "monitoring-fernueberwachung",
      title: "Monitoring / Fernüberwachung",
      description: `24/7 Überwachung Ihrer PV-Anlage mit sofortiger Fehlererkennung.
        
- Echtzeitüberwachung der Anlagenleistung
- Automatische Fehlererkennung
- E-Mail-Benachrichtigungen bei Störungen
- Monatliche Ertragsberichte
- Online-Portal mit Live-Daten
- Einmalige Einrichtungsgebühr: 99€
- Monatliche Servicegebühr: 15€`.trim(),
      category: "monitoring",
      sku: "PV-MON-001",
      price: 9900, // Setup fee in cents
      metadata: {
        solarwart_pricing: {
          calculationType: 'monitoring',
          prices: {
            setup: 99,
            monthly: 15,
            yearly: 180
          },
          availableOptions: {
            requiresModuleCount: false,
            requiresRoofType: false,
            requiresFloorLevel: false,
            requiresSoilingInfo: false,
            requiresDistance: false,
            hasSubscription: true
          }
        }
      }
    },
    {
      handle: "ueberspannungsschutz-dc",
      title: "Überspannungsschutz DC nachrüsten",
      description: `Nachrüstung von DC-Überspannungsschutz für Ihre PV-Anlage.
        
- Schutz vor Blitzschäden
- Typ 2 Überspannungsableiter
- Professionelle Installation
- Inkl. Material und Montage
- Preis abhängig von Modulanzahl

Berechnung: Anzahl Strings (Module ÷ 18) ÷ 2 = Einheiten
Preis pro Einheit: 460€ brutto`.trim(),
      category: "ueberspannungsschutz",
      sku: "PV-DC-001",
      price: 46000, // Price per unit in cents
      metadata: {
        solarwart_pricing: {
          calculationType: 'overvoltage_dc',
          unitPrice: 460,
          availableOptions: {
            requiresModuleCount: true,
            requiresRoofType: false,
            requiresFloorLevel: false,
            requiresSoilingInfo: false,
            requiresDistance: false,
            hasSubscription: false
          },
          constraints: {
            minModules: 1,
            maxModules: 10000
          }
        }
      }
    },
    {
      handle: "ac-ueberspannungsschutz",
      title: "AC-Überspannungsschutz",
      description: `AC-seitiger Überspannungsschutz für PV-Anlagen bis 100 Module.
        
- Typ 1+2 Kombi-Ableiter
- Schutz des Wechselrichters
- Professionelle Installation
- Basispreis: 649€

Zusatzoptionen:
- Umbau/Hutschiene: +129€
- Kabellänge >5m: +29€

Für Anlagen >100 Module erstellen wir Ihnen ein individuelles Angebot.`.trim(),
      category: "ueberspannungsschutz",
      sku: "PV-AC-001",
      price: 64900, // Base price in cents
      metadata: {
        solarwart_pricing: {
          calculationType: 'overvoltage_ac',
          basePrice: 649,
          additions: [
            { type: 'rebuild', price: 129, label: "Umbau/Hutschiene" },
            { type: 'cable', price: 29, label: "Kabellänge > 5m" }
          ],
          availableOptions: {
            requiresModuleCount: true,
            requiresRoofType: false,
            requiresFloorLevel: false,
            requiresSoilingInfo: false,
            requiresDistance: false,
            hasSubscription: false,
            hasRebuildOption: true,
            hasCableLengthOption: true
          },
          constraints: {
            minModules: 1,
            maxModules: 100
          }
        }
      }
    },
    {
      handle: "drohneninspektion",
      title: "Drohneninspektion",
      description: `Thermografische Inspektion Ihrer PV-Anlage per Drohne.
        
- Wärmebildaufnahmen aller Module
- Erkennung von Hot-Spots
- Defekte Zellen identifizieren
- Verschattungsanalyse
- Detaillierter Prüfbericht

Preise:
- Erste 50 Module: 149€
- Je weitere 50 Module: 79€`.trim(),
      category: "drohneninspektion",
      sku: "PV-DRONE-001",
      price: 14900, // Base price in cents
      metadata: {
        solarwart_pricing: {
          calculationType: 'drone',
          basePrice: 149,
          additionalBlockPrice: 79,
          blockSize: 50,
          availableOptions: {
            requiresModuleCount: true,
            requiresRoofType: false,
            requiresFloorLevel: false,
            requiresSoilingInfo: false,
            requiresDistance: false,
            hasSubscription: false
          },
          constraints: {
            minModules: 1,
            maxModules: 10000
          }
        }
      }
    }
  ]

  let created = 0
  let updated = 0
  let variantsAdded = 0

  for (const productData of allProducts) {
    try {
      // Check if product exists
      const [existingProduct] = await productModuleService.listProducts({
        handle: productData.handle
      })

      if (existingProduct) {
        logger.info(`Product "${productData.title}" exists, updating...`)
        
        // Update metadata
        await productModuleService.updateProducts(existingProduct.id, {
          metadata: productData.metadata,
          description: productData.description
        })
        updated++

        // Check if variants exist - need to refetch with variants
        const productWithVariants = await productModuleService.retrieveProduct(existingProduct.id, {
          relations: ["variants", "variants.prices"]
        })
        
        if (!productWithVariants.variants || productWithVariants.variants.length === 0) {
          logger.info(`  Adding variant for ${productData.title}...`)
          
          // Create variant using the service directly
          const variantData = {
            product_id: existingProduct.id,
            title: productData.title,
            sku: productData.sku,
            manage_inventory: false
          }
          
          const variant = await productModuleService.createProductVariants(variantData)
          
          // Prices are now managed separately or through pricing module
          if (variant) {
            variantsAdded++
            logger.info(`  Variant created with ID: ${variant.id}`)
          }
        }
      } else {
        logger.info(`Creating new product: ${productData.title}`)
        
        // Create product first without variants
        const newProduct = await productModuleService.createProducts({
          title: productData.title,
          handle: productData.handle,
          description: productData.description,
          status: ProductStatus.PUBLISHED,
          metadata: productData.metadata
        })
        
        if (newProduct) {
          // Now create the variant
          const variant = await productModuleService.createProductVariants({
            product_id: newProduct.id,
            title: productData.title,
            sku: productData.sku,
            manage_inventory: false
          })
          
          // Prices are now managed separately or through pricing module
          if (variant) {
            logger.info(`  Variant created with ID: ${variant.id}`)
          }
          
          // Sales channel linking is handled separately in Medusa v2
          logger.info(`  Product created with ID: ${newProduct.id}`)
          
          created++
        }
      }
    } catch (error) {
      logger.error(`Error processing product ${productData.handle}:`, error)
    }
  }

  logger.info(`
========================================
Fix Summary:
- Products created: ${created}
- Products updated: ${updated}  
- Variants added: ${variantsAdded}
========================================
  `)

  return { created, updated, variantsAdded }
}

// Export check function too
export async function checkAllProducts(container: any) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  const handles = [
    "photovoltaik-reinigung",
    "photovoltaik-wartung",
    "monitoring-fernueberwachung",
    "ueberspannungsschutz-dc",
    "ac-ueberspannungsschutz",
    "drohneninspektion"
  ]
  
  logger.info("\n=== FINAL PRODUCT STATUS ===")
  
  for (const handle of handles) {
    const [product] = await productModuleService.listProducts({
      handle: handle
    })
    
    if (product) {
      // Fetch full product with variants
      const fullProduct = await productModuleService.retrieveProduct(product.id, {
        relations: ["variants", "variants.prices"]
      })
      
      const hasMetadata = !!fullProduct.metadata?.solarwart_pricing
      const variantCount = fullProduct.variants?.length || 0
      const variant = fullProduct.variants?.[0]
      
      logger.info(`✅ ${product.title}`)
      logger.info(`   Handle: ${handle}`)
      logger.info(`   Metadata: ${hasMetadata ? '✓' : '✗'}`)
      logger.info(`   Variants: ${variantCount}`)
      if (variant) {
        logger.info(`   SKU: ${variant.sku}`)
        logger.info(`   Price: ${variant.prices?.[0]?.amount ? (variant.prices[0].amount / 100) + '€' : 'No price'}`)
      }
    } else {
      logger.info(`❌ ${handle}: NOT FOUND`)
    }
  }
  
  logger.info("=============================\n")
}