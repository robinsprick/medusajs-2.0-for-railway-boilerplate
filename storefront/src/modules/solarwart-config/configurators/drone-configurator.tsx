'use client'

import { useState } from 'react'
import { usePriceCalculation } from '../hooks/use-price-calculation'
import { ModuleCounter } from '../components/module-counter'
import { PriceDisplay } from '../components/price-display'
import { PriceBreakdown } from '../components/price-breakdown'
import { Button } from '@medusajs/ui'
import { DroneConfig } from '../types'
import { StoreProduct } from "@medusajs/types"
import { Info, CheckCircle } from 'lucide-react'

interface DroneConfiguratorProps {
  product: StoreProduct
  onAddToCart: (config: any) => Promise<void>
  onCancel?: () => void
}

export const DroneConfigurator = ({ 
  product, 
  onAddToCart,
  onCancel 
}: DroneConfiguratorProps) => {
  const [config, setConfig] = useState<DroneConfig>({
    moduleCount: 50
  })

  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { price, breakdown, isCalculating, error } = usePriceCalculation(
    'drone',
    config
  )

  const calculateSteps = () => {
    const steps = []
    let remaining = config.moduleCount
    let isFirst = true
    
    while (remaining > 0) {
      const stepModules = Math.min(remaining, 50)
      const stepPrice = isFirst ? 149 : 79
      steps.push({
        modules: stepModules,
        price: stepPrice,
        label: isFirst ? 'Erste 50 Module' : `Weitere ${stepModules} Module`
      })
      remaining -= stepModules
      isFirst = false
    }
    
    return steps
  }

  const steps = calculateSteps()

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await onAddToCart({
        productId: product.id,
        quantity: 1,
        metadata: {
          solarwart_config: {
            productType: 'drone',
            ...config,
            calculatedPrice: price,
            priceBreakdown: breakdown
          }
        }
      })
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="solarwart-configurator">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4">Drohneninspektion konfigurieren</h3>
            <div className="space-y-6">
              <ModuleCounter
                value={config.moduleCount}
                onChange={(value) => setConfig({...config, moduleCount: value})}
                min={1}
                max={10000}
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Leistungsumfang
                </h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Hochauflösende Thermografie-Aufnahmen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Erkennung von Hot-Spots und defekten Modulen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Detaillierter Inspektionsbericht</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Handlungsempfehlungen zur Optimierung</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Digitale Dokumentation aller Befunde</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Preisstaffelung:</h4>
                <div className="space-y-2 text-sm">
                  {steps.map((step, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{step.label}:</span>
                      <span className="font-medium">{step.price} €</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4">Preisübersicht</h3>
            
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {error}
              </div>
            ) : (
              <>
                <PriceDisplay
                  price={price}
                  isCalculating={isCalculating}
                />
                
                <PriceBreakdown
                  breakdown={breakdown}
                  config={config}
                />
              </>
            )}
            
            <div className="flex gap-3 mt-6">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
              )}
              <Button
                onClick={handleAddToCart}
                disabled={isCalculating || isAddingToCart || !!error || price === 0}
                className="flex-1"
              >
                {isAddingToCart ? 'Wird hinzugefügt...' : 'Inspektion beauftragen'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}