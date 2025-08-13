'use client'

import { CleaningConfigurator } from './configurators/cleaning-configurator'
import { MaintenanceConfigurator } from './configurators/maintenance-configurator'
import { DroneConfigurator } from './configurators/drone-configurator'
import { MonitoringConfigurator } from './configurators/monitoring-configurator'
import { OvervoltageDCConfigurator } from './configurators/overvoltage-dc-configurator'
import { OvervoltageACConfigurator } from './configurators/overvoltage-ac-configurator'
import { StoreProduct } from "@medusajs/types"

export const getConfigurator = (calculationType: string) => {
  switch (calculationType) {
    case 'cleaning':
      return CleaningConfigurator
    case 'maintenance':
      return MaintenanceConfigurator
    case 'drone':
      return DroneConfigurator
    case 'monitoring':
      return MonitoringConfigurator
    case 'overvoltage_dc':
      return OvervoltageDCConfigurator
    case 'overvoltage_ac':
      return OvervoltageACConfigurator
    default:
      return null
  }
}

interface SolarwartConfiguratorProps {
  product: StoreProduct
  onAddToCart: (config: any) => Promise<void>
  onCancel?: () => void
}

export const SolarwartConfigurator = ({ 
  product, 
  onAddToCart,
  onCancel 
}: SolarwartConfiguratorProps) => {
  const calculationType = product.metadata?.solarwart_pricing?.calculationType
  
  if (!calculationType) {
    return (
      <div className="text-red-600">
        Konfiguration für dieses Produkt nicht verfügbar.
      </div>
    )
  }

  const ConfiguratorComponent = getConfigurator(calculationType as string)
  
  if (!ConfiguratorComponent) {
    return (
      <div className="text-red-600">
        Konfigurator-Typ &quot;{calculationType}&quot; nicht implementiert.
      </div>
    )
  }

  return (
    <ConfiguratorComponent 
      product={product} 
      onAddToCart={onAddToCart}
      onCancel={onCancel}
    />
  )
}

export { 
  CleaningConfigurator, 
  MaintenanceConfigurator, 
  DroneConfigurator,
  MonitoringConfigurator,
  OvervoltageDCConfigurator,
  OvervoltageACConfigurator
}