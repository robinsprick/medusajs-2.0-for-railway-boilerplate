import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { 
  CleaningPriceService,
  MaintenancePriceService,
  MonitoringPriceService,
  OvervoltagePriceService,
  DronePriceService
} from "../../modules/solarwart-pricing"

interface ValidateCheckoutInput {
  cartId: string
}

// Step 1: Get cart items with Solarwart config
const getSolarwartItems = createStep(
  "get-solarwart-items",
  async (input: ValidateCheckoutInput, { container }) => {
    const cartService = container.resolve(Modules.CART)
    const cart = await cartService.retrieveCart(input.cartId, {
      relations: ["items"]
    })

    const solarwartItems = cart.items.filter(
      item => item.metadata?.solarwart_config
    )

    return new StepResponse({
      cartId: input.cartId,
      items: solarwartItems
    })
  }
)

// Step 2: Validate prices are still current
const validatePrices = createStep(
  "validate-solarwart-prices",
  async (input: { cartId: string, items: any[] }) => {
    const errors = []
    const warnings = []

    for (const item of input.items) {
      const config = item.metadata.solarwart_config

      // Check if price calculation is older than 24 hours
      const calculatedAt = new Date(config.calculatedAt)
      const hoursSinceCalculation = (Date.now() - calculatedAt.getTime()) / (1000 * 60 * 60)

      if (hoursSinceCalculation > 24) {
        warnings.push({
          itemId: item.id,
          message: "Preis wurde vor mehr als 24 Stunden berechnet. Bitte aktualisieren Sie den Warenkorb."
        })
      }

      // Recalculate price to verify
      let currentPrice
      try {
        switch (config.productType) {
          case 'cleaning': {
            const service = new CleaningPriceService()
            const calculation = await service.calculatePrice(config.configuration)
            currentPrice = calculation.totalPrice
            break
          }
          case 'maintenance': {
            const service = new MaintenancePriceService()
            const calculation = await service.calculatePrice(config.configuration)
            currentPrice = calculation.totalPrice
            break
          }
          case 'monitoring': {
            const service = new MonitoringPriceService()
            const calculation = await service.calculatePrice(config.configuration)
            currentPrice = calculation.totalPrice
            break
          }
          case 'overvoltage_dc': {
            const service = new OvervoltagePriceService()
            const calculation = await service.calculateDCPrice(config.configuration)
            currentPrice = calculation.totalPrice
            break
          }
          case 'overvoltage_ac': {
            const service = new OvervoltagePriceService()
            const calculation = await service.calculateACPrice(config.configuration)
            currentPrice = calculation.totalPrice
            break
          }
          case 'drone': {
            const service = new DronePriceService()
            const calculation = await service.calculatePrice(config.configuration)
            currentPrice = calculation.totalPrice
            break
          }
        }

        // Check if price has changed
        if (Math.abs(currentPrice - config.calculatedPrice) > 0.01) {
          errors.push({
            itemId: item.id,
            message: `Preis hat sich geändert. Alt: ${config.calculatedPrice}€, Neu: ${currentPrice}€`,
            oldPrice: config.calculatedPrice,
            newPrice: currentPrice
          })
        }
      } catch (error: any) {
        errors.push({
          itemId: item.id,
          message: `Fehler bei der Preisvalidierung: ${error.message}`
        })
      }
    }

    if (errors.length > 0) {
      throw new Error(JSON.stringify({ 
        valid: false, 
        errors, 
        warnings 
      }))
    }

    return new StepResponse({
      valid: true,
      warnings
    })
  }
)

// Main workflow
export const validateSolarwartCheckoutWorkflow = createWorkflow(
  "validate-solarwart-checkout",
  (input: ValidateCheckoutInput) => {
    // Step 1: Get Solarwart items
    const solarwartData = getSolarwartItems(input)
    
    // Step 2: Validate prices
    const validationResult = validatePrices(solarwartData)
    
    return new WorkflowResponse(validationResult)
  }
)

export default validateSolarwartCheckoutWorkflow