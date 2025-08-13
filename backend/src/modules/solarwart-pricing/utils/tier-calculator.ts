import { PriceTier } from "../types"

export class TierCalculator {
  /**
   * Get the tier factor for cleaning based on module count
   */
  static getCleaningTierFactor(moduleCount: number): number {
    if (moduleCount <= 200) return 1.00
    if (moduleCount <= 500) return 0.90
    if (moduleCount <= 1000) return 0.85
    if (moduleCount <= 2000) return 0.80
    if (moduleCount <= 5000) return 0.75
    if (moduleCount <= 10000) return 0.70
    return 0.70 // Maximum discount for > 10000
  }

  /**
   * Get the discount percentage for a given module count
   */
  static getDiscountPercentage(moduleCount: number): number {
    if (moduleCount <= 200) return 0
    if (moduleCount <= 500) return 10
    if (moduleCount <= 1000) return 15
    if (moduleCount <= 2000) return 20
    if (moduleCount <= 5000) return 25
    if (moduleCount <= 10000) return 30
    return 30 // Maximum discount
  }

  /**
   * Get the tier label for display
   */
  static getTierLabel(moduleCount: number): string {
    if (moduleCount <= 200) return "1-200 Module"
    if (moduleCount <= 500) return "201-500 Module"
    if (moduleCount <= 1000) return "501-1.000 Module"
    if (moduleCount <= 2000) return "1.001-2.000 Module"
    if (moduleCount <= 5000) return "2.001-5.000 Module"
    if (moduleCount <= 10000) return "5.001-10.000 Module"
    return "> 10.000 Module"
  }

  /**
   * Get maintenance price based on module count
   */
  static getMaintenancePrice(moduleCount: number, yearly: boolean = true): number {
    const yearlyPrices: Record<string, number> = {
      '1-30': 264,
      '31-50': 297,
      '51-100': 363,
      '101-200': 496,
      '201-500': 730,
      '501-1000': 1050,
      '1001-2000': 1650,
      '2001-5000': 3800,
      '5001-10000': 7900,
    }

    let priceKey: string
    if (moduleCount <= 30) priceKey = '1-30'
    else if (moduleCount <= 50) priceKey = '31-50'
    else if (moduleCount <= 100) priceKey = '51-100'
    else if (moduleCount <= 200) priceKey = '101-200'
    else if (moduleCount <= 500) priceKey = '201-500'
    else if (moduleCount <= 1000) priceKey = '501-1000'
    else if (moduleCount <= 2000) priceKey = '1001-2000'
    else if (moduleCount <= 5000) priceKey = '2001-5000'
    else if (moduleCount <= 10000) priceKey = '5001-10000'
    else return yearlyPrices['5001-10000'] // Use highest tier for > 10000

    const yearlyPrice = yearlyPrices[priceKey]
    return yearly ? yearlyPrice : Math.round(yearlyPrice / 12 * 100) / 100
  }

  /**
   * Calculate drone inspection price
   */
  static getDroneInspectionPrice(moduleCount: number): number {
    const basePrice = 149 // First 50 modules
    if (moduleCount <= 50) return basePrice
    
    const additionalModules = moduleCount - 50
    const additionalBlocks = Math.ceil(additionalModules / 50)
    const additionalPrice = additionalBlocks * 79
    
    return basePrice + additionalPrice
  }

  /**
   * Find applicable tier from a list of tiers
   */
  static findApplicableTier(value: number, tiers: PriceTier[]): PriceTier | null {
    return tiers.find(tier => value >= tier.min && value <= tier.max) || null
  }
}