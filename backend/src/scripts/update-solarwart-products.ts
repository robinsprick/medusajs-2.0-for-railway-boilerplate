import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

export default async function updateSolarwartProducts({ container, args = [] }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)

  logger.info("Updating existing Solarwart products...")

  // Product handles to update
  const productUpdates = [
    {
      handle: "photovoltaik-reinigung",
      updates: {
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
      }
    },
    {
      handle: "photovoltaik-wartung",
      updates: {
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
      }
    },
    {
      handle: "monitoring-fernueberwachung",
      updates: {
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
      }
    },
    {
      handle: "ueberspannungsschutz-dc",
      updates: {
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
      }
    },
    {
      handle: "ac-ueberspannungsschutz",
      updates: {
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
      }
    },
    {
      handle: "drohneninspektion",
      updates: {
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
    }
  ]

  let updatedCount = 0
  let notFoundCount = 0

  for (const { handle, updates } of productUpdates) {
    try {
      // Find product by handle
      const [product] = await productModuleService.listProducts({
        handle: handle
      })

      if (!product) {
        logger.warn(`Product with handle "${handle}" not found, skipping...`)
        notFoundCount++
        continue
      }

      // Update product metadata
      await productModuleService.updateProducts(product.id, updates)
      
      logger.info(`✅ Updated product: ${product.title} (${handle})`)
      updatedCount++

      // If product has variants, update their metadata too if needed
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          // Variant-specific metadata can be updated here if needed
          logger.info(`  - Variant ${variant.sku} is ready for dynamic pricing`)
        }
      }

    } catch (error) {
      logger.error(`❌ Error updating product ${handle}:`, error)
    }
  }

  logger.info(`
========================================
Update Summary:
- Products updated: ${updatedCount}
- Products not found: ${notFoundCount}
========================================
  `)

  return {
    updated: updatedCount,
    notFound: notFoundCount
  }
}

// Check if products exist
export async function checkSolarwartProducts(container: any) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  const solarwartHandles = [
    "photovoltaik-reinigung",
    "photovoltaik-wartung",
    "monitoring-fernueberwachung",
    "ueberspannungsschutz-dc",
    "ac-ueberspannungsschutz",
    "drohneninspektion"
  ]
  
  logger.info("Checking existing Solarwart products...")
  
  const productStatus = []
  
  for (const handle of solarwartHandles) {
    const [product] = await productModuleService.listProducts({
      handle: handle
    })
    
    if (product) {
      productStatus.push({
        handle,
        title: product.title,
        exists: true,
        hasMetadata: !!product.metadata?.solarwart_pricing,
        variantCount: product.variants?.length || 0
      })
    } else {
      productStatus.push({
        handle,
        exists: false
      })
    }
  }
  
  // Log status table
  logger.info("\nProduct Status:")
  logger.info("=====================================")
  for (const status of productStatus) {
    if (status.exists) {
      logger.info(`✅ ${status.handle}: ${status.title}`)
      logger.info(`   - Metadata: ${status.hasMetadata ? '✓' : '✗'}`)
      logger.info(`   - Variants: ${status.variantCount}`)
    } else {
      logger.info(`❌ ${status.handle}: NOT FOUND`)
    }
  }
  logger.info("=====================================\n")
  
  return productStatus
}