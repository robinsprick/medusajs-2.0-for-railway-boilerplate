'use client'

import { useState } from 'react'
import { Button } from '@medusajs/ui'
import { SolarwartConfigurator } from '@modules/solarwart-config'
import { addToCart } from '@lib/data/cart'
import { HttpTypes } from '@medusajs/types'
import { useParams } from 'next/navigation'
import ProductActions from './index'

interface SolarwartProductActionsProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

export const SolarwartProductActions = ({ 
  product, 
  region,
  disabled 
}: SolarwartProductActionsProps) => {
  const [showConfigurator, setShowConfigurator] = useState(false)
  const countryCode = useParams().countryCode as string

  const isSolarwartProduct = product.metadata?.solarwart_pricing
  
  // Falls kein Solarwart-Produkt, zeige Standard-Actions
  if (!isSolarwartProduct) {
    return <ProductActions product={product} region={region} disabled={disabled} />
  }

  const handleAddToCart = async (config: any) => {
    // Für Solarwart-Produkte nehmen wir die erste Variante
    const variant = product.variants?.[0]
    if (!variant?.id) {
      console.error('No variant found for product')
      return
    }

    await addToCart({
      variantId: variant.id,
      quantity: config.quantity || 1,
      countryCode,
      metadata: config.metadata
    })
    
    setShowConfigurator(false)
  }

  return (
    <div className="flex flex-col gap-y-4">
      {!showConfigurator ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Dieses Produkt erfordert eine individuelle Konfiguration. 
              Der Preis wird basierend auf Ihren Angaben berechnet.
            </p>
          </div>
          
          <Button
            onClick={() => setShowConfigurator(true)}
            disabled={disabled}
            variant="primary"
            className="w-full h-10"
          >
            Konfigurieren & Preis berechnen
          </Button>
        </div>
      ) : (
        <SolarwartConfigurator
          product={product as any}
          onAddToCart={handleAddToCart}
          onCancel={() => setShowConfigurator(false)}
        />
      )}
    </div>
  )
}