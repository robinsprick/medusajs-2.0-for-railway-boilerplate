import { 
  DroneConfig, 
  PriceCalculation, 
  PriceBreakdown 
} from "../types"
import { TierCalculator } from "../utils/tier-calculator"

export class DronePriceService {
  private readonly BASE_PRICE = 149 // First 50 modules
  private readonly ADDITIONAL_PRICE = 79 // Per additional 50 modules

  /**
   * Calculate drone inspection price based on configuration
   */
  async calculatePrice(config: DroneConfig): Promise<PriceCalculation> {
    // Validate input
    this.validateConfig(config)

    const totalPrice = TierCalculator.getDroneInspectionPrice(config.moduleCount)

    // Calculate blocks for breakdown
    const baseModules = Math.min(config.moduleCount, 50)
    const additionalModules = Math.max(0, config.moduleCount - 50)
    const additionalBlocks = Math.ceil(additionalModules / 50)

    // Generate breakdown
    const breakdown = this.generateBreakdown(
      config.moduleCount,
      baseModules,
      additionalModules,
      additionalBlocks,
      totalPrice
    )

    const additions = []
    if (additionalBlocks > 0) {
      additions.push({
        type: 'Zusätzliche Module',
        amount: additionalBlocks * this.ADDITIONAL_PRICE,
        description: `${additionalBlocks} × 50 Module`
      })
    }

    return {
      basePrice: this.BASE_PRICE,
      additions: additions.length > 0 ? additions : undefined,
      subtotal: totalPrice,
      totalPrice,
      breakdown,
      validUntil: this.getValidUntilDate()
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: DroneConfig): void {
    if (!config.moduleCount || config.moduleCount < 1) {
      throw new Error("Modulanzahl muss mindestens 1 sein")
    }

    if (config.moduleCount > 10000) {
      throw new Error("Für mehr als 10.000 Module bitte individuelle Anfrage stellen")
    }
  }

  /**
   * Generate detailed price breakdown
   */
  private generateBreakdown(
    totalModules: number,
    baseModules: number,
    additionalModules: number,
    additionalBlocks: number,
    totalPrice: number
  ): PriceBreakdown {
    const items = []

    // Base inspection
    items.push({
      label: 'Basisinspektion',
      value: `Erste ${baseModules} Module`,
      amount: this.BASE_PRICE,
      type: 'base' as const
    })

    // Additional modules if any
    if (additionalModules > 0) {
      items.push({
        label: 'Zusätzliche Module',
        value: `${additionalModules} Module (${additionalBlocks} × 50er Blöcke)`,
        amount: additionalBlocks * this.ADDITIONAL_PRICE,
        type: 'addition' as const
      })
    }

    // Summary
    items.push({
      label: 'Gesamtmodule',
      value: `${totalModules} Module`,
      amount: 0,
      type: 'base' as const
    })

    return {
      items,
      summary: {
        baseAmount: this.BASE_PRICE,
        totalDiscounts: 0,
        totalAdditions: additionalBlocks * this.ADDITIONAL_PRICE,
        finalAmount: totalPrice
      }
    }
  }

  /**
   * Get validity date for price calculation (7 days)
   */
  private getValidUntilDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  }

  /**
   * Get price estimate for quick calculation
   */
  async getQuickEstimate(moduleCount: number): Promise<{
    price: number,
    blocks: number
  }> {
    const price = TierCalculator.getDroneInspectionPrice(moduleCount)
    const additionalModules = Math.max(0, moduleCount - 50)
    const blocks = 1 + Math.ceil(additionalModules / 50)
    
    return { price, blocks }
  }
}