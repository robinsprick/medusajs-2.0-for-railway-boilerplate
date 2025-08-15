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
    // Extract calculated price from metadata
    const calculatedPrice = config.metadata?.solarwart_config?.calculatedPrice
    
    if (!calculatedPrice) {
      console.error('No calculated price found in config')
      alert('Fehler: Kein berechneter Preis gefunden. Bitte konfigurieren Sie das Produkt erneut.')
      return
    }

    const variant = product.variants?.[0]
    
    try {
      // Use the custom price endpoint for Solarwart products
      const response = await fetch('/api/cart/konfigurator-add-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          items: [{
            variant_id: variant?.id,
            product_id: product.id,
            quantity: config.quantity || 1,
            unit_price: Math.round(calculatedPrice * 100), // Convert to cents
            title: product.title || 'Solarwart Service',
            description: getConfigDescription(config.metadata?.solarwart_config),
            config: config.metadata?.solarwart_config,
            metadata: config.metadata
          }],
          countryCode,
          source: 'solarwart-configurator'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to cart')
      }

      // Refresh the page to show updated cart
      window.location.reload()
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Fehler beim Hinzufügen zum Warenkorb. Bitte versuchen Sie es erneut.')
    }
  }

  // Helper function to generate description from config
  const getConfigDescription = (config: any) => {
    if (!config) return ''
    
    const parts = []
    if (config.moduleCount) parts.push(`${config.moduleCount} Module`)
    if (config.roofType) {
      const roofTypes: any = {
        'schraegdach': 'Schrägdach',
        'flachdach': 'Flachdach',
        'freiland': 'Freiland'
      }
      parts.push(`${roofTypes[config.roofType] || config.roofType}`)
    }
    if (config.cleaningsPerYear) parts.push(`${config.cleaningsPerYear}x jährlich`)
    if (config.subscriptionType) parts.push(`${config.subscriptionType === 'yearly' ? 'Jahresvertrag' : 'Monatsabo'}`)
    if (config.needsHutschiene) parts.push('Mit Hutschiene')
    if (config.cableLength) parts.push(`${config.cableLength}m Kabel`)
    
    return parts.join(', ')
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