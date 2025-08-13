export interface CleaningConfig {
  moduleCount: number
  roofType: 'schraeg' | 'flach' | 'freiland'
  floorLevel: number
  lastCleaning: 'never' | 'gt18' | 'lt18'
  distance: number
}

export interface MaintenanceConfig {
  moduleCount: number
  subscriptionType?: 'yearly' | 'monthly'
}

export interface MonitoringConfig {
  setupIncluded: boolean
  monthlySubscription: boolean
}

export interface OvervoltageConfig {
  type: 'dc' | 'ac'
  moduleCount?: number
  additionalOptions?: string[]
}

export interface DroneConfig {
  moduleCount: number
}

export type ServiceConfig = 
  | CleaningConfig 
  | MaintenanceConfig 
  | MonitoringConfig 
  | OvervoltageConfig 
  | DroneConfig

export interface PriceBreakdown {
  basePrice: number
  discounts?: Array<{ type: string; amount: number; label: string }>
  additions?: Array<{ type: string; amount: number; label: string }>
  total: number
  factors?: Record<string, number>
}

export interface PriceCalculationResponse {
  price: number
  breakdown: PriceBreakdown
  validUntil: string
}

export interface SolarwartMetadata {
  solarwart_config?: {
    productType: string
    moduleCount?: number
    roofType?: string
    floorLevel?: number
    lastCleaning?: string
    distance?: number
    subscription?: {
      type: 'yearly' | 'monthly'
      duration: number
    }
    calculatedPrice: number
    priceBreakdown: PriceBreakdown
  }
}