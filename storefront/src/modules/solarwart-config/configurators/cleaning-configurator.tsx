'use client'

import { useState } from 'react'
import { usePriceCalculation } from '../hooks/use-price-calculation'
import { ModuleCounter } from '../components/module-counter'
import { RoofTypeSelector } from '../components/roof-type-selector'
import { FloorLevelSelector } from '../components/floor-level-selector'
import { SoilingSelector } from '../components/soiling-selector'
import { DistanceInput } from '../components/distance-input'
import { PriceDisplay } from '../components/price-display'
import { PriceBreakdown } from '../components/price-breakdown'
import { Button } from '@medusajs/ui'
import { CleaningConfig } from '../types'
import { StoreProduct } from "@medusajs/types"

interface CleaningConfiguratorProps {
  product: StoreProduct
  onAddToCart: (config: any) => Promise<void>
  onCancel?: () => void
}

export const CleaningConfigurator = ({ 
  product, 
  onAddToCart,
  onCancel 
}: CleaningConfiguratorProps) => {
  const [config, setConfig] = useState<CleaningConfig>({
    moduleCount: 30,
    roofType: 'schraeg',
    floorLevel: 0,
    lastCleaning: 'never',
    distance: 10
  })

  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { price, breakdown, isCalculating, error } = usePriceCalculation(
    'cleaning',
    config
  )

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await onAddToCart({
        productId: product.id,
        quantity: 1,
        metadata: {
          solarwart_config: {
            productType: 'cleaning',
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
            <h3 className="text-xl font-bold mb-4">Konfiguration</h3>
            <div className="space-y-6">
              <ModuleCounter
                value={config.moduleCount}
                onChange={(value) => setConfig({...config, moduleCount: value})}
                min={1}
                max={10000}
              />
              
              <RoofTypeSelector
                value={config.roofType}
                onChange={(value) => setConfig({...config, roofType: value})}
              />
              
              <FloorLevelSelector
                value={config.floorLevel}
                onChange={(value) => setConfig({...config, floorLevel: value})}
              />
              
              <SoilingSelector
                value={config.lastCleaning}
                onChange={(value) => setConfig({...config, lastCleaning: value})}
              />
              
              <DistanceInput
                value={config.distance}
                onChange={(value) => setConfig({...config, distance: value})}
                max={50}
              />
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
                {isAddingToCart ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}