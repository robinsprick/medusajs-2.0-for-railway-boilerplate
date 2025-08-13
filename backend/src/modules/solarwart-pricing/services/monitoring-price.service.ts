import { 
  MonitoringConfig, 
  PriceCalculation, 
  PriceBreakdown 
} from "../types"

export class MonitoringPriceService {
  private readonly SETUP_PRICE = 99
  private readonly MONTHLY_FEE = 15
  private readonly YEARLY_FEE = 180 // 15€ × 12 months

  /**
   * Calculate monitoring price based on configuration
   */
  async calculatePrice(config: MonitoringConfig): Promise<PriceCalculation> {
    // Validate input
    this.validateConfig(config)

    const isYearly = config.subscriptionType === 'yearly'
    const serviceFee = isYearly ? this.YEARLY_FEE : this.MONTHLY_FEE

    // Total for first period includes setup
    const totalPrice = this.SETUP_PRICE + serviceFee

    // Generate breakdown
    const breakdown = this.generateBreakdown(
      this.SETUP_PRICE,
      serviceFee,
      isYearly
    )

    return {
      basePrice: this.SETUP_PRICE,
      additions: [{
        type: isYearly ? 'Jahresgebühr' : 'Monatsgebühr',
        amount: serviceFee,
        description: isYearly ? '12 Monate Monitoring' : '1 Monat Monitoring'
      }],
      subtotal: this.SETUP_PRICE,
      totalPrice,
      breakdown,
      validUntil: this.getValidUntilDate()
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: MonitoringConfig): void {
    if (!['monthly', 'yearly'].includes(config.subscriptionType)) {
      throw new Error("Ungültiger Abonnement-Typ")
    }

    if (config.setupType !== 'standard') {
      throw new Error("Nur Standard-Setup verfügbar")
    }
  }

  /**
   * Generate detailed price breakdown
   */
  private generateBreakdown(
    setupPrice: number,
    serviceFee: number,
    isYearly: boolean
  ): PriceBreakdown {
    const items = []

    // Setup fee (one-time)
    items.push({
      label: 'Einrichtung (einmalig)',
      value: 'Standard',
      amount: setupPrice,
      type: 'base' as const
    })

    // Service fee
    items.push({
      label: isYearly ? 'Servicegebühr (jährlich)' : 'Servicegebühr (monatlich)',
      value: isYearly ? '12 Monate' : '1 Monat',
      amount: serviceFee,
      type: 'addition' as const
    })

    // Note about recurring fees
    items.push({
      label: 'Hinweis',
      value: `Fortlaufende Gebühr: ${isYearly ? '180€/Jahr' : '15€/Monat'}`,
      amount: 0,
      type: 'base' as const
    })

    return {
      items,
      summary: {
        baseAmount: setupPrice,
        totalDiscounts: 0,
        totalAdditions: serviceFee,
        finalAmount: setupPrice + serviceFee
      }
    }
  }

  /**
   * Get validity date for price calculation (30 days for monitoring)
   */
  private getValidUntilDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date
  }

  /**
   * Calculate recurring fee only (without setup)
   */
  async calculateRecurringFee(isYearly: boolean = false): Promise<number> {
    return isYearly ? this.YEARLY_FEE : this.MONTHLY_FEE
  }
}