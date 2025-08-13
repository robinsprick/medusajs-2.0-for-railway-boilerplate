'use client'

import { useState } from 'react'
import { usePriceCalculation } from '../hooks/use-price-calculation'
import { ModuleCounter } from '../components/module-counter'
import { PriceDisplay } from '../components/price-display'
import { PriceBreakdown } from '../components/price-breakdown'
import { Button } from '@medusajs/ui'
import { MaintenanceConfig } from '../types'
import { StoreProduct } from "@medusajs/types"

interface MaintenanceConfiguratorProps {
  product: StoreProduct
  onAddToCart: (config: any) => Promise<void>
  onCancel?: () => void
}

const maintenancePrices = [
  { min: 1, max: 30, yearlyPrice: 299, monthlyPrice: 29 },
  { min: 31, max: 100, yearlyPrice: 399, monthlyPrice: 39 },
  { min: 101, max: 300, yearlyPrice: 499, monthlyPrice: 49 },
  { min: 301, max: 500, yearlyPrice: 599, monthlyPrice: 59 },
  { min: 501, max: 1000, yearlyPrice: 799, monthlyPrice: 79 },
  { min: 1001, max: 10000, yearlyPrice: 999, monthlyPrice: 99 }
]

export const MaintenanceConfigurator = ({ 
  product, 
  onAddToCart,
  onCancel 
}: MaintenanceConfiguratorProps) => {
  const [config, setConfig] = useState<MaintenanceConfig>({
    moduleCount: 30,
    subscriptionType: 'yearly'
  })

  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { price, breakdown, isCalculating, error } = usePriceCalculation(
    'maintenance',
    config
  )

  const getPriceInfo = () => {
    const tier = maintenancePrices.find(
      p => config.moduleCount >= p.min && config.moduleCount <= p.max
    )
    if (!tier) return null
    
    return config.subscriptionType === 'yearly' 
      ? { price: tier.yearlyPrice, period: 'Jahr' }
      : { price: tier.monthlyPrice, period: 'Monat' }
  }

  const priceInfo = getPriceInfo()

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await onAddToCart({
        productId: product.id,
        quantity: 1,
        metadata: {
          solarwart_config: {
            productType: 'maintenance',
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
            <h3 className="text-xl font-bold mb-4">Wartungsvertrag konfigurieren</h3>
            <div className="space-y-6">
              <ModuleCounter
                value={config.moduleCount}
                onChange={(value) => setConfig({...config, moduleCount: value})}
                min={1}
                max={10000}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Abrechnungsmodell
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      config.subscriptionType === 'yearly' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscription"
                      value="yearly"
                      checked={config.subscriptionType === 'yearly'}
                      onChange={(e) => setConfig({...config, subscriptionType: 'yearly'})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Jährliche Zahlung</div>
                      <div className="text-sm text-gray-600">
                        {priceInfo && `${priceInfo.price} € pro Jahr`}
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      config.subscriptionType === 'monthly' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscription"
                      value="monthly"
                      checked={config.subscriptionType === 'monthly'}
                      onChange={(e) => setConfig({...config, subscriptionType: 'monthly'})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Monatliche Zahlung</div>
                      <div className="text-sm text-gray-600">
                        {priceInfo && `${priceInfo.price} € pro Monat`}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Leistungsumfang:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Jährliche Sichtprüfung der PV-Anlage</li>
                  <li>• Überprüfung der elektrischen Anschlüsse</li>
                  <li>• Kontrolle der Modulbefestigung</li>
                  <li>• Leistungsmessung und Dokumentation</li>
                  <li>• Wartungsprotokoll und Empfehlungen</li>
                </ul>
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

                {priceInfo && (
                  <div className="text-sm text-gray-600 mt-2">
                    Abrechnung: {priceInfo.price} € pro {priceInfo.period}
                  </div>
                )}
              </>
            )}
            
            <div className="flex gap-3 mt-6">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
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
                {isAddingToCart ? 'Wird hinzugefügt...' : 'Wartungsvertrag abschließen'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}