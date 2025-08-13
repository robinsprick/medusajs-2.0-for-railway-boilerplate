import { CleaningPriceService } from "./services/cleaning-price.service"
import { MaintenancePriceService } from "./services/maintenance-price.service"
import { MonitoringPriceService } from "./services/monitoring-price.service"
import { OvervoltagePriceService } from "./services/overvoltage-price.service"
import { DronePriceService } from "./services/drone-price.service"

export const SOLARWART_PRICING = "solarwart-pricing"

// Simple service class that provides all pricing services
export default class SolarwartPricingModuleService {
  cleaningService: CleaningPriceService
  maintenanceService: MaintenancePriceService
  monitoringService: MonitoringPriceService
  overvoltageService: OvervoltagePriceService
  droneService: DronePriceService

  constructor() {
    this.cleaningService = new CleaningPriceService()
    this.maintenanceService = new MaintenancePriceService()
    this.monitoringService = new MonitoringPriceService()
    this.overvoltageService = new OvervoltagePriceService()
    this.droneService = new DronePriceService()
  }
}

// Export all services for easy access
export {
  CleaningPriceService,
  MaintenancePriceService,
  MonitoringPriceService,
  OvervoltagePriceService,
  DronePriceService,
}

// Export types
export * from "./types"