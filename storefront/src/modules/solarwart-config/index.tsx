'use client'

import { CleaningConfigurator } from './configurators/cleaning-configurator'
import { MaintenanceConfigurator } from './configurators/maintenance-configurator'
import { DroneConfigurator } from './configurators/drone-configurator'
import { StoreProduct } from "@medusajs/types"

export const getConfigurator = (calculationType: string) => {
  switch (calculationType) {
    case 'cleaning':
      return CleaningConfigurator
    case 'maintenance':
      return MaintenanceConfigurator
    case 'drone':
      return DroneConfigurator
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

export { CleaningConfigurator, MaintenanceConfigurator, DroneConfigurator }