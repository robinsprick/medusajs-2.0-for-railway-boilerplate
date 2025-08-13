import { 
  OvervoltageDCConfig,
  OvervoltageACConfig,
  PriceCalculation, 
  PriceBreakdown 
} from "../types"
import { FactorCalculator } from "../utils/factor-calculator"

export class OvervoltagePriceService {
  private readonly DC_UNIT_PRICE = 460
  private readonly AC_BASE_PRICE = 649
  private readonly AC_REBUILD_PRICE = 129
  private readonly AC_CABLE_PRICE = 29

  /**
   * Calculate DC overvoltage protection price
   */
  async calculateDCPrice(config: OvervoltageDCConfig): Promise<PriceCalculation> {
    // Validate input
    this.validateDCConfig(config)

    const units = FactorCalculator.calculateOvervoltageDCUnits(config.moduleCount)
    const totalPrice = units * this.DC_UNIT_PRICE

    // Calculate strings for display
    const strings = Math.ceil(config.moduleCount / 18)

    // Generate breakdown
    const breakdown = this.generateDCBreakdown(
      config.moduleCount,
      strings,
      units,
      totalPrice
    )

    return {
      basePrice: totalPrice,
      subtotal: totalPrice,
      totalPrice,
      breakdown,
      validUntil: this.getValidUntilDate()
    }
  }

  /**
   * Calculate AC overvoltage protection price
   */
  async calculateACPrice(config: OvervoltageACConfig): Promise<PriceCalculation> {
    // Validate input
    this.validateACConfig(config)

    let totalPrice = this.AC_BASE_PRICE
    const additions = []

    // Add rebuild cost if needed
    if (config.needsRebuild) {
      totalPrice += this.AC_REBUILD_PRICE
      additions.push({
        type: 'Umbau/Hutschiene',
        amount: this.AC_REBUILD_PRICE,
        description: 'Zusätzlicher Umbau erforderlich'
      })
    }

    // Add cable cost if needed
    if (config.cableLength && config.cableLength > 5) {
      totalPrice += this.AC_CABLE_PRICE
      additions.push({
        type: 'Kabellänge',
        amount: this.AC_CABLE_PRICE,
        description: `Kabellänge > 5m`
      })
    }

    // Generate breakdown
    const breakdown = this.generateACBreakdown(
      this.AC_BASE_PRICE,
      additions,
      totalPrice
    )

    return {
      basePrice: this.AC_BASE_PRICE,
      additions: additions.length > 0 ? additions : undefined,
      subtotal: this.AC_BASE_PRICE,
      totalPrice,
      breakdown,
      validUntil: this.getValidUntilDate()
    }
  }

  /**
   * Validate DC configuration
   */
  private validateDCConfig(config: OvervoltageDCConfig): void {
    if (!config.moduleCount || config.moduleCount < 1) {
      throw new Error("Modulanzahl muss mindestens 1 sein")
    }

    if (config.moduleCount > 10000) {
      throw new Error("Für mehr als 10.000 Module bitte individuelle Anfrage stellen")
    }
  }

  /**
   * Validate AC configuration
   */
  private validateACConfig(config: OvervoltageACConfig): void {
    if (!config.moduleCount || config.moduleCount < 1) {
      throw new Error("Modulanzahl muss mindestens 1 sein")
    }

    if (config.moduleCount > 100) {
      throw new Error("AC-Überspannungsschutz über 100 Module benötigt Projektangebot")
    }
  }

  /**
   * Generate DC breakdown
   */
  private generateDCBreakdown(
    moduleCount: number,
    strings: number,
    units: number,
    totalPrice: number
  ): PriceBreakdown {
    const items = []

    // Calculation steps
    items.push({
      label: 'Berechnung',
      value: `${moduleCount} Module`,
      amount: 0,
      type: 'base' as const
    })

    items.push({
      label: 'Strings',
      value: `${moduleCount} ÷ 18 = ${strings} Strings`,
      amount: 0,
      type: 'base' as const
    })

    items.push({
      label: 'Einheiten',
      value: `${strings} ÷ 2 = ${units} Einheiten`,
      amount: 0,
      type: 'base' as const
    })

    // Price calculation
    items.push({
      label: 'DC-Überspannungsschutz',
      value: `${units} × ${this.DC_UNIT_PRICE}€`,
      amount: totalPrice,
      type: 'base' as const
    })

    return {
      items,
      summary: {
        baseAmount: totalPrice,
        totalDiscounts: 0,
        totalAdditions: 0,
        finalAmount: totalPrice
      }
    }
  }

  /**
   * Generate AC breakdown
   */
  private generateACBreakdown(
    basePrice: number,
    additions: any[],
    totalPrice: number
  ): PriceBreakdown {
    const items = []

    // Base price
    items.push({
      label: 'AC-Überspannungsschutz Basis',
      value: 'Standardinstallation',
      amount: basePrice,
      type: 'base' as const
    })

    // Additions
    additions.forEach(addition => {
      items.push({
        label: addition.type,
        value: addition.description,
        amount: addition.amount,
        type: 'addition' as const
      })
    })

    return {
      items,
      summary: {
        baseAmount: basePrice,
        totalDiscounts: 0,
        totalAdditions: additions.reduce((sum, a) => sum + a.amount, 0),
        finalAmount: totalPrice
      }
    }
  }

  /**
   * Get validity date for price calculation (14 days)
   */
  private getValidUntilDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date
  }
}