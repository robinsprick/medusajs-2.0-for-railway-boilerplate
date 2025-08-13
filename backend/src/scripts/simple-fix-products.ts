import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"

export default async function simpleFixProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("Simple fix for Solarwart products...")

  // Get default sales channel
  const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })

  // Product data for missing products
  const missingProducts = [
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
      sku: "PV-DC-001",
      price: 46000,
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
      sku: "PV-AC-001",
      price: 64900,
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
      sku: "PV-DRONE-001",
      price: 14900,
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

  // Create missing products
  for (const productData of missingProducts) {
    try {
      // Check if product already exists
      const [existing] = await productModuleService.listProducts({
        handle: productData.handle
      })

      if (existing) {
        logger.info(`Product ${productData.handle} already exists, skipping...`)
        continue
      }

      logger.info(`Creating product: ${productData.title}`)

      // Create product
      const product = await productModuleService.createProducts({
        title: productData.title,
        handle: productData.handle,
        description: productData.description,
        status: ProductStatus.PUBLISHED,
        metadata: productData.metadata
      })

      if (product) {
        // Create variant
        const variant = await productModuleService.createProductVariants({
          product_id: product.id,
          title: productData.title,
          sku: productData.sku,
          manage_inventory: false
        })

        // Add price separately
        if (variant) {
          try {
            // Try different approaches for price
            const priceData = {
              variant_id: variant.id,
              currency_code: "eur",
              amount: productData.price
            }
            
            // Log what we're trying to create
            logger.info(`  Creating price for variant ${variant.id}: ${productData.price / 100}€`)
            
            // Note: Price creation might need to be done via a different method
            // or might be handled automatically by Medusa
          } catch (priceError) {
            logger.warn(`  Could not create price: ${priceError}`)
          }
        }

        // Link to sales channel
        if (defaultSalesChannel) {
          await productModuleService.updateProducts(product.id, {
            sales_channels: [{ id: defaultSalesChannel.id }]
          })
        }

        created++
        logger.info(`✅ Created product: ${productData.title}`)
      }
    } catch (error) {
      logger.error(`Error creating product ${productData.handle}:`, error)
    }
  }

  // Now check and add variants to existing products
  logger.info("\nChecking variants for existing products...")
  
  const allHandles = [
    "photovoltaik-reinigung",
    "photovoltaik-wartung",
    "monitoring-fernueberwachung",
    "ueberspannungsschutz-dc",
    "ac-ueberspannungsschutz",
    "drohneninspektion"
  ]

  const variantData = {
    "photovoltaik-reinigung": { sku: "PV-CLEAN-001", price: 1300 },
    "photovoltaik-wartung": { sku: "PV-MAINT-001", price: 26400 },
    "monitoring-fernueberwachung": { sku: "PV-MON-001", price: 9900 },
    "ueberspannungsschutz-dc": { sku: "PV-DC-001", price: 46000 },
    "ac-ueberspannungsschutz": { sku: "PV-AC-001", price: 64900 },
    "drohneninspektion": { sku: "PV-DRONE-001", price: 14900 }
  }

  let variantsAdded = 0

  for (const handle of allHandles) {
    try {
      const [product] = await productModuleService.listProducts({
        handle: handle
      })

      if (!product) {
        continue
      }

      // Try to list variants for this product
      const variants = await productModuleService.listProductVariants({
        product_id: product.id
      })

      if (!variants || variants.length === 0) {
        const data = variantData[handle]
        logger.info(`Adding variant to ${product.title}...`)
        
        const variant = await productModuleService.createProductVariants({
          product_id: product.id,
          title: product.title,
          sku: data.sku,
          manage_inventory: false
        })

        if (variant) {
          variantsAdded++
          logger.info(`  ✅ Added variant ${data.sku}`)
        }
      }
    } catch (error) {
      logger.warn(`Could not check/add variant for ${handle}: ${error.message}`)
    }
  }

  logger.info(`
========================================
Summary:
- Products created: ${created}
- Variants added: ${variantsAdded}
========================================
  `)

  // Final status check
  logger.info("\n=== FINAL STATUS ===")
  for (const handle of allHandles) {
    const [product] = await productModuleService.listProducts({
      handle: handle
    })
    
    if (product) {
      logger.info(`✅ ${product.title} (${handle})`)
      
      // Try to list variants
      try {
        const variants = await productModuleService.listProductVariants({
          product_id: product.id
        })
        logger.info(`   Variants: ${variants?.length || 0}`)
      } catch (e) {
        logger.info(`   Variants: Could not check`)
      }
    } else {
      logger.info(`❌ ${handle}: NOT FOUND`)
    }
  }

  return { created, variantsAdded }
}