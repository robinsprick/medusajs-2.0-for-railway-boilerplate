import { 
  MaintenanceConfig, 
  PriceCalculation, 
  PriceBreakdown 
} from "../types"
import { TierCalculator } from "../utils/tier-calculator"

export class MaintenancePriceService {
  private readonly STORAGE_YEARLY_PRICE = 67
  private readonly STORAGE_MONTHLY_PRICE = 5.60

  /**
   * Calculate maintenance price based on configuration
   */
  async calculatePrice(config: MaintenanceConfig): Promise<PriceCalculation> {
    // Validate input
    this.validateConfig(config)

    // Get base maintenance price
    const isYearly = config.subscriptionType === 'yearly'
    const maintenancePrice = TierCalculator.getMaintenancePrice(config.moduleCount, isYearly)

    // Storage maintenance (only for <= 100 modules)
    let storagePrice = 0
    if (config.includeStorage && config.moduleCount <= 100) {
      storagePrice = isYearly ? this.STORAGE_YEARLY_PRICE : this.STORAGE_MONTHLY_PRICE
    }

    // Total price
    const totalPrice = maintenancePrice + storagePrice

    // Generate breakdown
    const breakdown = this.generateBreakdown(
      config,
      maintenancePrice,
      storagePrice
    )

    return {
      basePrice: maintenancePrice,
      additions: storagePrice > 0 ? [{
        type: 'Speicherwartung',
        amount: storagePrice,
        description: isYearly ? 'Jährlich' : 'Monatlich'
      }] : [],
      subtotal: maintenancePrice,
      totalPrice,
      breakdown,
      validUntil: this.getValidUntilDate()
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: MaintenanceConfig): void {
    if (!config.moduleCount || config.moduleCount < 1) {
      throw new Error("Modulanzahl muss mindestens 1 sein")
    }

    if (config.moduleCount > 10000) {
      throw new Error("Für mehr als 10.000 Module bitte individuelle Anfrage stellen")
    }

    if (!['yearly', 'monthly'].includes(config.subscriptionType)) {
      throw new Error("Ungültiger Abonnement-Typ")
    }

    if (config.includeStorage && config.moduleCount > 100) {
      throw new Error("Speicherwartung nur bis 100 Module verfügbar")
    }
  }

  /**
   * Generate detailed price breakdown
   */
  private generateBreakdown(
    config: MaintenanceConfig,
    maintenancePrice: number,
    storagePrice: number
  ): PriceBreakdown {
    const items = []
    const isYearly = config.subscriptionType === 'yearly'

    // Get tier label
    let tierLabel = ''
    if (config.moduleCount <= 30) tierLabel = '≤ 30 Module'
    else if (config.moduleCount <= 50) tierLabel = '31-50 Module'
    else if (config.moduleCount <= 100) tierLabel = '51-100 Module'
    else if (config.moduleCount <= 200) tierLabel = '101-200 Module'
    else if (config.moduleCount <= 500) tierLabel = '201-500 Module'
    else if (config.moduleCount <= 1000) tierLabel = '501-1.000 Module'
    else if (config.moduleCount <= 2000) tierLabel = '1.001-2.000 Module'
    else if (config.moduleCount <= 5000) tierLabel = '2.001-5.000 Module'
    else tierLabel = '5.001-10.000 Module'

    // Base maintenance
    items.push({
      label: `Wartungsvertrag (${tierLabel})`,
      value: isYearly ? 'Jährlich' : 'Monatlich',
      amount: maintenancePrice,
      type: 'base' as const
    })

    // Storage maintenance if included
    if (storagePrice > 0) {
      items.push({
        label: 'Speicherwartung',
        value: isYearly ? 'Jährlich' : 'Monatlich',
        amount: storagePrice,
        type: 'addition' as const
      })
    }

    // If monthly, show yearly savings
    if (!isYearly) {
      const yearlyPrice = TierCalculator.getMaintenancePrice(config.moduleCount, true)
      const monthlyTotal = maintenancePrice * 12
      const savings = monthlyTotal - yearlyPrice
      
      if (savings > 0) {
        items.push({
          label: 'Hinweis',
          value: `Bei jährlicher Zahlung sparen Sie ${savings.toFixed(2)}€`,
          amount: 0,
          type: 'base' as const
        })
      }
    }

    return {
      items,
      summary: {
        baseAmount: maintenancePrice,
        totalDiscounts: 0,
        totalAdditions: storagePrice,
        finalAmount: maintenancePrice + storagePrice
      }
    }
  }

  /**
   * Get validity date for price calculation (7 days for subscriptions)
   */
  private getValidUntilDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  }

  /**
   * Get all available maintenance tiers with prices
   */
  async getMaintenanceTiers(): Promise<Array<{
    moduleRange: string,
    yearlyPrice: number,
    monthlyPrice: number
  }>> {
    return [
      { moduleRange: '≤ 30', yearlyPrice: 264, monthlyPrice: 22.00 },
      { moduleRange: '31-50', yearlyPrice: 297, monthlyPrice: 24.75 },
      { moduleRange: '51-100', yearlyPrice: 363, monthlyPrice: 30.25 },
      { moduleRange: '101-200', yearlyPrice: 496, monthlyPrice: 41.33 },
      { moduleRange: '201-500', yearlyPrice: 730, monthlyPrice: 60.83 },
      { moduleRange: '501-1.000', yearlyPrice: 1050, monthlyPrice: 87.50 },
      { moduleRange: '1.001-2.000', yearlyPrice: 1650, monthlyPrice: 137.50 },
      { moduleRange: '2.001-5.000', yearlyPrice: 3800, monthlyPrice: 316.67 },
      { moduleRange: '5.001-10.000', yearlyPrice: 7900, monthlyPrice: 658.33 }
    ]
  }
}