import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { TierCalculator } from "../../../../../modules/solarwart-pricing/utils/tier-calculator"
import { FactorCalculator } from "../../../../../modules/solarwart-pricing/utils/factor-calculator"
import { MaintenancePriceService } from "../../../../../modules/solarwart-pricing"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const productType = req.params.productType as string

    let config

    switch (productType) {
      case 'cleaning':
        config = {
          basePrice: 13.00,
          tiers: [
            { min: 1, max: 200, factor: 1.00, discount: 0 },
            { min: 201, max: 500, factor: 0.90, discount: 10 },
            { min: 501, max: 1000, factor: 0.85, discount: 15 },
            { min: 1001, max: 2000, factor: 0.80, discount: 20 },
            { min: 2001, max: 5000, factor: 0.75, discount: 25 },
            { min: 5001, max: 10000, factor: 0.70, discount: 30 }
          ],
          factors: {
            roof: {
              schraeg: { factor: 1.15, label: "Schrägdach" },
              flach: { factor: 1.00, label: "Flachdach" },
              freiland: { factor: 0.95, label: "Freiland" }
            },
            soiling: {
              never: { factor: 1.20, label: "Nie gereinigt" },
              gt18: { factor: 1.10, label: "≥ 18 Monate" },
              lt18: { factor: 1.00, label: "< 18 Monate" }
            }
          },
          options: {
            requiresModuleCount: true,
            requiresRoofType: true,
            requiresFloorLevel: true,
            requiresSoilingInfo: true,
            requiresDistance: true
          },
          constraints: {
            minModules: 1,
            maxModules: 10000,
            maxDistance: 50
          }
        }
        break

      case 'maintenance':
        const maintenanceService = new MaintenancePriceService()
        const tiers = await maintenanceService.getMaintenanceTiers()
        config = {
          tiers,
          options: {
            requiresModuleCount: true,
            hasSubscription: true,
            hasStorageOption: true
          },
          constraints: {
            minModules: 1,
            maxModules: 10000,
            storageMaxModules: 100
          },
          prices: {
            storageYearly: 67,
            storageMonthly: 5.60
          }
        }
        break

      case 'monitoring':
        config = {
          prices: {
            setup: 99,
            monthly: 15,
            yearly: 180
          },
          options: {
            hasSubscription: true
          }
        }
        break

      case 'overvoltage_dc':
        config = {
          unitPrice: 460,
          calculation: {
            formula: "Einheiten = ⌈Modulanzahl ÷ 18 ÷ 2⌉",
            priceFormula: "Preis = Einheiten × 460€"
          },
          options: {
            requiresModuleCount: true
          },
          constraints: {
            minModules: 1,
            maxModules: 10000
          }
        }
        break

      case 'overvoltage_ac':
        config = {
          basePrice: 649,
          additions: [
            { type: 'rebuild', price: 129, label: "Umbau/Hutschiene" },
            { type: 'cable', price: 29, label: "Kabellänge > 5m" }
          ],
          options: {
            requiresModuleCount: true,
            hasRebuildOption: true,
            hasCableLengthOption: true
          },
          constraints: {
            minModules: 1,
            maxModules: 100
          }
        }
        break

      case 'drone':
        config = {
          basePrice: 149,
          additionalBlockPrice: 79,
          blockSize: 50,
          options: {
            requiresModuleCount: true
          },
          constraints: {
            minModules: 1,
            maxModules: 10000
          }
        }
        break

      default:
        res.status(404).json({
          error: `Unknown product type: ${productType}`
        })
        return
    }

    res.json({
      success: true,
      productType,
      config
    })

  } catch (error: any) {
    console.error("Pricing config error:", error)
    res.status(500).json({
      error: error.message || "Failed to get pricing configuration"
    })
  }
}

// OPTIONS for CORS
export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.status(200).end()
}