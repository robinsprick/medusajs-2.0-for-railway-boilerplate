export class FactorCalculator {
  // Roof type factors
  static readonly ROOF_FACTORS = {
    schraeg: 1.15,  // Schrägdach (Ziegel, Schiefer etc.)
    flach: 1.00,    // Flachdach (Folie, Bitumen, Trapezblech)
    freiland: 0.95  // Freiland
  }

  // Soiling factors based on last cleaning
  static readonly SOILING_FACTORS = {
    never: 1.20,    // Nie gereinigt
    gt18: 1.10,     // ≥ 18 Monate
    lt18: 1.00      // < 18 Monate
  }

  // Travel cost per km (one way)
  static readonly TRAVEL_COST_PER_KM = 3.20

  /**
   * Calculate floor factor based on floor level
   */
  static getFloorFactor(level: number): number {
    if (level <= 1) return 1.00  // Erdgeschoss
    if (level === 2) return 1.05  // 2. Etage
    if (level === 3) return 1.10  // 3. Etage
    // Jede weitere Etage +0.05
    return 1.10 + (level - 3) * 0.05
  }

  /**
   * Get roof factor by type
   */
  static getRoofFactor(roofType: 'schraeg' | 'flach' | 'freiland'): number {
    return this.ROOF_FACTORS[roofType] || 1.00
  }

  /**
   * Get soiling factor by last cleaning
   */
  static getSoilingFactor(lastCleaning: 'never' | 'gt18' | 'lt18'): number {
    return this.SOILING_FACTORS[lastCleaning] || 1.00
  }

  /**
   * Calculate travel cost
   */
  static calculateTravelCost(distance: number): number {
    // Maximum distance is 50km (validation should happen before)
    const validDistance = Math.min(Math.max(0, distance), 50)
    return validDistance * this.TRAVEL_COST_PER_KM
  }

  /**
   * Get roof type label for display
   */
  static getRoofTypeLabel(roofType: string): string {
    const labels: Record<string, string> = {
      schraeg: 'Schrägdach',
      flach: 'Flachdach',
      freiland: 'Freiland'
    }
    return labels[roofType] || roofType
  }

  /**
   * Get soiling label for display
   */
  static getSoilingLabel(lastCleaning: string): string {
    const labels: Record<string, string> = {
      never: 'Nie gereinigt',
      gt18: '≥ 18 Monate',
      lt18: '< 18 Monate'
    }
    return labels[lastCleaning] || lastCleaning
  }

  /**
   * Calculate overvoltage DC units based on module count
   */
  static calculateOvervoltageDCUnits(moduleCount: number): number {
    const strings = Math.ceil(moduleCount / 18)
    const units = Math.ceil(strings / 2)
    return units
  }

  /**
   * Calculate overvoltage DC price
   */
  static calculateOvervoltageDCPrice(moduleCount: number): number {
    const units = this.calculateOvervoltageDCUnits(moduleCount)
    return units * 460 // 460€ per unit
  }

  /**
   * Calculate overvoltage AC price
   */
  static calculateOvervoltageACPrice(
    moduleCount: number,
    needsRebuild: boolean = false,
    cableLength: number = 0
  ): number {
    // Only for <= 100 modules, otherwise needs project quote
    if (moduleCount > 100) {
      throw new Error("Über 100 Module benötigen ein Projektangebot")
    }

    let price = 649 // Base price
    
    if (needsRebuild) {
      price += 129 // Umbau/Hutschiene
    }
    
    if (cableLength > 5) {
      price += 29 // Extra cable length
    }
    
    return price
  }
}