import { 
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { 
  CleaningPriceService 
} from "../../modules/solarwart-pricing/services/cleaning-price.service"
import { 
  MaintenancePriceService 
} from "../../modules/solarwart-pricing/services/maintenance-price.service"
import { 
  MonitoringPriceService 
} from "../../modules/solarwart-pricing/services/monitoring-price.service"
import { 
  OvervoltagePriceService 
} from "../../modules/solarwart-pricing/services/overvoltage-price.service"
import { 
  DronePriceService 
} from "../../modules/solarwart-pricing/services/drone-price.service"

interface ValidateCheckoutInput {
  cart_id: string
}

const validateSolarwartItemsStep = createStep(
  "validate-solarwart-items",
  async (input: ValidateCheckoutInput, { container }) => {
    const cartService = container.resolve(Modules.CART)
    const cart = await cartService.retrieveCart(input.cart_id, {
      relations: ["items", "items.variant", "items.variant.product"]
    })

    if (!cart || !cart.items) {
      return new StepResponse({
        valid: false,
        errors: ["Cart not found or empty"]
      })
    }

    // Filter items with Solarwart configuration
    const solarwartItems = cart.items.filter((item: any) => 
      item.metadata?.solarwart_config
    )

    if (solarwartItems.length === 0) {
      return new StepResponse({
        valid: true,
        errors: []
      })
    }

    const errors: string[] = []
    const priceServices = {
      cleaning: new CleaningPriceService(),
      maintenance: new MaintenancePriceService(),
      monitoring: new MonitoringPriceService(),
      overvoltage_dc: new OvervoltagePriceService(),
      overvoltage_ac: new OvervoltagePriceService(),
      drone: new DronePriceService()
    }

    for (const item of solarwartItems) {
      const config = item.metadata.solarwart_config as any
      
      if (!config || !config.productType) {
        errors.push(`Item ${item.id} has invalid Solarwart configuration`)
        continue
      }

      // Validate configuration based on product type
      const validationErrors = validateConfiguration(config)
      if (validationErrors.length > 0) {
        errors.push(...validationErrors.map(err => 
          `${(item as any).variant?.product?.title || (item as any).title || 'Item'}: ${err}`
        ))
        continue
      }

      // Recalculate price to ensure it's current
      try {
        const service = priceServices[config.productType as keyof typeof priceServices]
        if (!service) {
          errors.push(`Unknown product type: ${config.productType}`)
          continue
        }

        let currentPrice = 0
        switch (config.productType) {
          case 'cleaning':
            const cleaningResult = await (service as CleaningPriceService).calculatePrice({
              moduleCount: config.moduleCount,
              roofType: config.roofType,
              floorLevel: config.floorLevel,
              lastCleaning: config.lastCleaning,
              distance: config.distance
            })
            currentPrice = cleaningResult.totalPrice
            break
          
          case 'maintenance':
            const maintenanceResult = await (service as MaintenancePriceService).calculatePrice({
              moduleCount: config.moduleCount,
              subscriptionType: config.subscription?.type || 'yearly'
            })
            currentPrice = maintenanceResult.totalPrice
            break
          
          case 'monitoring':
            const monitoringResult = await (service as MonitoringPriceService).calculatePrice({
              setupType: 'standard',
              subscriptionType: config.subscription?.type === 'yearly' ? 'yearly' : 'monthly'
            })
            currentPrice = monitoringResult.totalPrice
            break
          
          case 'overvoltage_dc':
            const ovDcResult = await (service as OvervoltagePriceService).calculateDCPrice({
              moduleCount: config.moduleCount
            })
            currentPrice = ovDcResult.totalPrice
            break
          
          case 'overvoltage_ac':
            const ovAcResult = await (service as OvervoltagePriceService).calculateACPrice({
              moduleCount: config.moduleCount || 1,
              needsRebuild: config.needsRebuild || false,
              cableLength: config.cableLength || 0
            })
            currentPrice = ovAcResult.totalPrice
            break
          
          case 'drone':
            const droneResult = await (service as DronePriceService).calculatePrice({
              moduleCount: config.moduleCount
            })
            currentPrice = droneResult.totalPrice
            break
        }

        // Convert to cents for comparison (Medusa stores prices in cents)
        const currentPriceInCents = Math.round(currentPrice * 100)
        const itemPriceInCents = Number(item.subtotal) || 0

        // Allow small difference due to rounding
        const priceDifference = Math.abs(currentPriceInCents - itemPriceInCents)
        if (priceDifference > 100) { // More than 1 EUR difference
          errors.push(
            `Preis für ${(item as any).variant?.product?.title || (item as any).title || 'Item'} hat sich geändert. ` +
            `Bitte aktualisieren Sie den Warenkorb. ` +
            `(Erwartet: ${(currentPriceInCents / 100).toFixed(2)}€, ` +
            `Aktuell: ${(Number(itemPriceInCents) / 100).toFixed(2)}€)`
          )
        }
      } catch (error) {
        errors.push(`Failed to validate price for ${(item as any).variant?.product?.title || (item as any).title || 'Item'}: ${error}`)
      }
    }

    return new StepResponse({
      valid: errors.length === 0,
      errors
    })
  }
)

function validateConfiguration(config: any): string[] {
  const errors: string[] = []

  switch (config.productType) {
    case 'cleaning':
      if (!config.moduleCount || config.moduleCount < 1 || config.moduleCount > 10000) {
        errors.push('Ungültige Modulanzahl (1-10000)')
      }
      if (!config.roofType || !['schraeg', 'flach', 'freiland'].includes(config.roofType)) {
        errors.push('Ungültiger Dachtyp')
      }
      if (!config.floorLevel || config.floorLevel < 0 || config.floorLevel > 10) {
        errors.push('Ungültige Etagenangabe (0-10)')
      }
      if (!config.lastCleaning || !['never', 'gt18', 'lt18'].includes(config.lastCleaning)) {
        errors.push('Ungültige Verschmutzungsangabe')
      }
      if (!config.distance || config.distance < 0 || config.distance > 50) {
        errors.push('Ungültige Entfernung (0-50 km)')
      }
      break
    
    case 'maintenance':
      if (!config.moduleCount || config.moduleCount < 1 || config.moduleCount > 10000) {
        errors.push('Ungültige Modulanzahl (1-10000)')
      }
      if (config.subscription) {
        if (!['yearly', 'monthly'].includes(config.subscription.type)) {
          errors.push('Ungültiger Vertragstyp')
        }
        if (!config.subscription.duration || config.subscription.duration < 1) {
          errors.push('Ungültige Vertragsdauer')
        }
      }
      break
    
    case 'monitoring':
      // Monitoring has optional configuration
      if (config.subscription) {
        if (!config.subscription.duration || config.subscription.duration < 1) {
          errors.push('Ungültige Vertragsdauer')
        }
      }
      break
    
    case 'overvoltage_dc':
      if (!config.moduleCount || config.moduleCount < 1 || config.moduleCount > 10000) {
        errors.push('Ungültige Modulanzahl (1-10000)')
      }
      break
    
    case 'overvoltage_ac':
      // AC overvoltage has optional configuration
      if (config.options && !Array.isArray(config.options)) {
        errors.push('Ungültige Optionen')
      }
      break
    
    case 'drone':
      if (!config.moduleCount || config.moduleCount < 1 || config.moduleCount > 10000) {
        errors.push('Ungültige Modulanzahl (1-10000)')
      }
      break
    
    default:
      errors.push(`Unbekannter Produkttyp: ${config.productType}`)
  }

  return errors
}

const validateSolarwartCheckoutWorkflow = createWorkflow(
  "validate-solarwart-checkout",
  (input: ValidateCheckoutInput) => {
    const validation = validateSolarwartItemsStep(input)
    
    return new WorkflowResponse(validation)
  }
)

export { validateSolarwartCheckoutWorkflow }