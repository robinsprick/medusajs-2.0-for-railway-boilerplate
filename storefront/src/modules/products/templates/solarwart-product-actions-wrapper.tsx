'use client'

import { useEffect, useState } from 'react'
import { retrievePricedProductById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { SolarwartConfigurator } from "@modules/solarwart-config"
import { addToCart } from '@lib/data/cart'
import { useParams } from 'next/navigation'

export function SolarwartProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const countryCode = useParams().countryCode as string

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const prod = await retrievePricedProductById({
          id,
          regionId: region.id,
        })
        setProduct(prod)
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id, region.id])

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Konfigurator wird geladen...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-red-600">
        Produkt konnte nicht geladen werden.
      </div>
    )
  }

  const handleAddToCart = async (config: any) => {
    // Extract calculated price from metadata
    const calculatedPrice = config.metadata?.solarwart_config?.calculatedPrice
    
    if (!calculatedPrice) {
      console.error('No calculated price found in config')
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

      // Trigger cart refresh
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
    if (config.roofType) parts.push(`Dachtyp: ${config.roofType}`)
    if (config.cleaningsPerYear) parts.push(`${config.cleaningsPerYear}x jährlich`)
    if (config.needsHutschiene) parts.push('Mit Hutschiene')
    if (config.cableLength) parts.push(`${config.cableLength}m Kabel`)
    
    return parts.join(', ')
  }

  return (
    <div className="w-full">
      <SolarwartConfigurator
        product={product as any}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}