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
import { SolarwartLineItemMetadata } from "../../modules/solarwart-pricing/types"

interface ConfiguredProductInput {
  cartId: string
  productId: string
  variantId: string
  quantity: number
  productType: 'cleaning' | 'maintenance' | 'monitoring' | 'overvoltage_dc' | 'overvoltage_ac' | 'drone'
  configuration: any
}

// Step 1: Validate configuration
const validateConfiguration = createStep(
  "validate-solarwart-configuration",
  async (input: ConfiguredProductInput) => {
    // Basic validation
    if (!input.cartId || !input.productId || !input.configuration) {
      throw new Error("Invalid input: missing required fields")
    }

    if (!input.productType) {
      throw new Error("Product type is required for Solarwart products")
    }

    // Type-specific validation will be done in price calculation
    return new StepResponse(input)
  }
)

// Step 2: Calculate price
const calculateSolarwartPrice = createStep(
  "calculate-solarwart-price",
  async (input: ConfiguredProductInput, { container }) => {
    let priceCalculation

    switch (input.productType) {
      case 'cleaning': {
        const service = new CleaningPriceService()
        priceCalculation = await service.calculatePrice(input.configuration)
        break
      }
      case 'maintenance': {
        const service = new MaintenancePriceService()
        priceCalculation = await service.calculatePrice(input.configuration)
        break
      }
      case 'monitoring': {
        const service = new MonitoringPriceService()
        priceCalculation = await service.calculatePrice(input.configuration)
        break
      }
      case 'overvoltage_dc': {
        const service = new OvervoltagePriceService()
        priceCalculation = await service.calculateDCPrice(input.configuration)
        break
      }
      case 'overvoltage_ac': {
        const service = new OvervoltagePriceService()
        priceCalculation = await service.calculateACPrice(input.configuration)
        break
      }
      case 'drone': {
        const service = new DronePriceService()
        priceCalculation = await service.calculatePrice(input.configuration)
        break
      }
      default:
        throw new Error(`Unknown product type: ${input.productType}`)
    }

    return new StepResponse({
      ...input,
      calculatedPrice: priceCalculation.totalPrice,
      priceBreakdown: priceCalculation.breakdown
    })
  }
)

// Step 3: Add to cart with metadata
const addToCartWithMetadata = createStep(
  "add-solarwart-to-cart",
  async (input: any, { container }) => {
    const cartService = container.resolve(Modules.CART)
    
    // Create metadata for the line item
    const metadata: Record<string, unknown> = {
      solarwart_config: {
        productType: input.productType,
        configuration: input.configuration,
        calculatedPrice: input.calculatedPrice,
        priceBreakdown: input.priceBreakdown,
        calculatedAt: new Date()
      }
    }

    // Add item to cart with custom price and metadata
    const lineItem = await cartService.addLineItems({
      cart_id: input.cartId,
      variant_id: input.variantId,
      quantity: input.quantity,
      unit_price: input.calculatedPrice,
      title: `Solarwart Service - ${input.productType}`,
      metadata
    })

    return new StepResponse(lineItem)
  }
)

// Main workflow
export const addConfiguredProductToCartWorkflow = createWorkflow(
  "add-configured-product-to-cart",
  (input: ConfiguredProductInput) => {
    // Step 1: Validate
    const validatedInput = validateConfiguration(input)
    
    // Step 2: Calculate price
    const pricedInput = calculateSolarwartPrice(validatedInput)
    
    // Step 3: Add to cart
    const result = addToCartWithMetadata(pricedInput)
    
    return new WorkflowResponse(result)
  }
)

export default addConfiguredProductToCartWorkflow