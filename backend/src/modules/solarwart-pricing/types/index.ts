// Configuration types for different services
export interface CleaningConfig {
  moduleCount: number
  roofType: 'schraeg' | 'flach' | 'freiland'
  floorLevel: number
  lastCleaning: 'never' | 'gt18' | 'lt18'
  distance: number
}

export interface MaintenanceConfig {
  moduleCount: number
  includeStorage?: boolean
  subscriptionType: 'yearly' | 'monthly'
}

export interface MonitoringConfig {
  setupType: 'standard'
  subscriptionType: 'monthly' | 'yearly'
}

export interface OvervoltageDCConfig {
  moduleCount: number
}

export interface OvervoltageACConfig {
  moduleCount: number
  needsRebuild?: boolean
  cableLength?: number
}

export interface DroneConfig {
  moduleCount: number
}

// Price calculation result types
export interface PriceCalculation {
  basePrice: number
  factors?: {
    tier?: number
    roof?: number
    floor?: number
    soiling?: number
  }
  discounts?: Array<{
    type: string
    amount: number
    percentage?: number
  }>
  additions?: Array<{
    type: string
    amount: number
    description?: string
  }>
  subtotal: number
  travelCost?: number
  totalPrice: number
  breakdown: PriceBreakdown
  validUntil?: Date
}

export interface PriceBreakdown {
  items: Array<{
    label: string
    value: string | number
    amount: number
    type: 'base' | 'factor' | 'discount' | 'addition'
  }>
  summary: {
    baseAmount: number
    totalDiscounts: number
    totalAdditions: number
    finalAmount: number
  }
}

// Service configuration types
export interface PricingConfig {
  calculationType: 'cleaning' | 'maintenance' | 'monitoring' | 'overvoltage_dc' | 'overvoltage_ac' | 'drone'
  basePrice?: number
  priceTiers?: PriceTier[]
  factors?: PricingFactors
  constraints?: PricingConstraints
}

export interface PriceTier {
  min: number
  max: number
  price?: number
  factor?: number
  discount?: number
}

export interface PricingFactors {
  roof?: Record<string, number>
  floor?: Record<string, number>
  soiling?: Record<string, number>
}

export interface PricingConstraints {
  minModules?: number
  maxModules?: number
  maxDistance?: number
}

// Line item metadata for cart/order
export interface SolarwartLineItemMetadata {
  solarwart_config?: {
    productType: string
    configuration: CleaningConfig | MaintenanceConfig | MonitoringConfig | OvervoltageDCConfig | OvervoltageACConfig | DroneConfig
    calculatedPrice: number
    priceBreakdown: PriceBreakdown
    calculatedAt: Date
  }
}