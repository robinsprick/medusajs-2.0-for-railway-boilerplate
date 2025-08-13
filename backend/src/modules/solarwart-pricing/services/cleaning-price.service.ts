import { 
  CleaningConfig, 
  PriceCalculation, 
  PriceBreakdown 
} from "../types"
import { TierCalculator } from "../utils/tier-calculator"
import { FactorCalculator } from "../utils/factor-calculator"

export class CleaningPriceService {
  private readonly BASE_PRICE = 13.00

  /**
   * Calculate cleaning price based on configuration
   */
  async calculatePrice(config: CleaningConfig): Promise<PriceCalculation> {
    // Validate input
    this.validateConfig(config)

    // Get all factors
    const tierFactor = TierCalculator.getCleaningTierFactor(config.moduleCount)
    const roofFactor = FactorCalculator.getRoofFactor(config.roofType)
    const floorFactor = FactorCalculator.getFloorFactor(config.floorLevel)
    const soilingFactor = FactorCalculator.getSoilingFactor(config.lastCleaning)

    // Calculate base amounts
    const baseAmount = config.moduleCount * this.BASE_PRICE
    const discountPercentage = TierCalculator.getDiscountPercentage(config.moduleCount)
    const discountAmount = baseAmount * (discountPercentage / 100)

    // Apply all factors
    const cleaningPrice = baseAmount * tierFactor * roofFactor * floorFactor * soilingFactor
    
    // Calculate travel cost
    const travelCost = FactorCalculator.calculateTravelCost(config.distance)

    // Total price
    const totalPrice = cleaningPrice + travelCost

    // Generate breakdown
    const breakdown = this.generateBreakdown(
      config,
      baseAmount,
      cleaningPrice,
      travelCost,
      {
        tier: tierFactor,
        roof: roofFactor,
        floor: floorFactor,
        soiling: soilingFactor
      }
    )

    return {
      basePrice: baseAmount,
      factors: {
        tier: tierFactor,
        roof: roofFactor,
        floor: floorFactor,
        soiling: soilingFactor
      },
      discounts: discountPercentage > 0 ? [{
        type: `Mengenrabatt (${TierCalculator.getTierLabel(config.moduleCount)})`,
        amount: discountAmount,
        percentage: discountPercentage
      }] : [],
      additions: travelCost > 0 ? [{
        type: 'Anfahrt',
        amount: travelCost,
        description: `${config.distance} km × ${FactorCalculator.TRAVEL_COST_PER_KM}€`
      }] : [],
      subtotal: cleaningPrice,
      travelCost,
      totalPrice,
      breakdown,
      validUntil: this.getValidUntilDate()
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: CleaningConfig): void {
    if (!config.moduleCount || config.moduleCount < 1) {
      throw new Error("Modulanzahl muss mindestens 1 sein")
    }

    if (config.moduleCount > 10000) {
      throw new Error("Für mehr als 10.000 Module bitte individuelle Anfrage stellen")
    }

    if (!['schraeg', 'flach', 'freiland'].includes(config.roofType)) {
      throw new Error("Ungültiger Dachtyp")
    }

    if (config.floorLevel < 1) {
      throw new Error("Etage muss mindestens 1 sein")
    }

    if (!['never', 'gt18', 'lt18'].includes(config.lastCleaning)) {
      throw new Error("Ungültiger Verschmutzungsgrad")
    }

    if (config.distance < 0 || config.distance > 50) {
      throw new Error("Entfernung muss zwischen 0 und 50 km liegen")
    }
  }

  /**
   * Generate detailed price breakdown
   */
  private generateBreakdown(
    config: CleaningConfig,
    baseAmount: number,
    cleaningPrice: number,
    travelCost: number,
    factors: Record<string, number>
  ): PriceBreakdown {
    const items = []

    // Base calculation
    items.push({
      label: 'Basispreis',
      value: `${config.moduleCount} Module × ${this.BASE_PRICE}€`,
      amount: baseAmount,
      type: 'base' as const
    })

    // Tier discount
    const discountPercentage = TierCalculator.getDiscountPercentage(config.moduleCount)
    if (discountPercentage > 0) {
      items.push({
        label: `Mengenrabatt (${TierCalculator.getTierLabel(config.moduleCount)})`,
        value: `${discountPercentage}%`,
        amount: -(baseAmount * (discountPercentage / 100)),
        type: 'discount' as const
      })
    }

    // Roof factor
    if (factors.roof !== 1.00) {
      const roofLabel = FactorCalculator.getRoofTypeLabel(config.roofType)
      const factorPercent = Math.round((factors.roof - 1) * 100)
      items.push({
        label: `Dachtyp: ${roofLabel}`,
        value: factorPercent > 0 ? `+${factorPercent}%` : `${factorPercent}%`,
        amount: baseAmount * (factors.roof - 1) * factors.tier,
        type: 'factor' as const
      })
    }

    // Floor factor
    if (factors.floor !== 1.00) {
      const factorPercent = Math.round((factors.floor - 1) * 100)
      items.push({
        label: `${config.floorLevel}. Etage`,
        value: `+${factorPercent}%`,
        amount: baseAmount * (factors.floor - 1) * factors.tier * factors.roof,
        type: 'factor' as const
      })
    }

    // Soiling factor
    if (factors.soiling !== 1.00) {
      const soilingLabel = FactorCalculator.getSoilingLabel(config.lastCleaning)
      const factorPercent = Math.round((factors.soiling - 1) * 100)
      items.push({
        label: `Verschmutzung: ${soilingLabel}`,
        value: `+${factorPercent}%`,
        amount: baseAmount * (factors.soiling - 1) * factors.tier * factors.roof * factors.floor,
        type: 'factor' as const
      })
    }

    // Travel cost
    if (travelCost > 0) {
      items.push({
        label: 'Anfahrt',
        value: `${config.distance} km`,
        amount: travelCost,
        type: 'addition' as const
      })
    }

    return {
      items,
      summary: {
        baseAmount,
        totalDiscounts: items
          .filter(i => i.type === 'discount')
          .reduce((sum, i) => sum + Math.abs(i.amount), 0),
        totalAdditions: items
          .filter(i => i.type === 'addition' || i.type === 'factor')
          .reduce((sum, i) => sum + Math.abs(i.amount), 0),
        finalAmount: cleaningPrice + travelCost
      }
    }
  }

  /**
   * Get validity date for price calculation (24 hours)
   */
  private getValidUntilDate(): Date {
    const date = new Date()
    date.setHours(date.getHours() + 24)
    return date
  }
}