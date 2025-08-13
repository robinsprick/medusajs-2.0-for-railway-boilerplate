import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { 
  CleaningPriceService,
  MaintenancePriceService,
  MonitoringPriceService,
  OvervoltagePriceService,
  DronePriceService
} from "../../../../modules/solarwart-pricing"
import { 
  CleaningConfig,
  MaintenanceConfig,
  MonitoringConfig,
  OvervoltageDCConfig,
  OvervoltageACConfig,
  DroneConfig
} from "../../../../modules/solarwart-pricing/types"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { productType, config } = req.body as {
      productType: 'cleaning' | 'maintenance' | 'monitoring' | 'overvoltage_dc' | 'overvoltage_ac' | 'drone'
      config: any
    }

    // Validate request
    if (!productType || !config) {
      res.status(400).json({
        error: "Missing productType or config"
      })
      return
    }

    let priceCalculation

    switch (productType) {
      case 'cleaning': {
        const cleaningService = new CleaningPriceService()
        priceCalculation = await cleaningService.calculatePrice(config as CleaningConfig)
        break
      }
      
      case 'maintenance': {
        const maintenanceService = new MaintenancePriceService()
        priceCalculation = await maintenanceService.calculatePrice(config as MaintenanceConfig)
        break
      }
      
      case 'monitoring': {
        const monitoringService = new MonitoringPriceService()
        priceCalculation = await monitoringService.calculatePrice(config as MonitoringConfig)
        break
      }
      
      case 'overvoltage_dc': {
        const overvoltageService = new OvervoltagePriceService()
        priceCalculation = await overvoltageService.calculateDCPrice(config as OvervoltageDCConfig)
        break
      }
      
      case 'overvoltage_ac': {
        const overvoltageService = new OvervoltagePriceService()
        priceCalculation = await overvoltageService.calculateACPrice(config as OvervoltageACConfig)
        break
      }
      
      case 'drone': {
        const droneService = new DronePriceService()
        priceCalculation = await droneService.calculatePrice(config as DroneConfig)
        break
      }
      
      default:
        res.status(400).json({
          error: `Unknown product type: ${productType}`
        })
        return
    }

    res.json({
      success: true,
      data: priceCalculation
    })

  } catch (error: any) {
    console.error("Price calculation error:", error)
    res.status(400).json({
      error: error.message || "Price calculation failed"
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