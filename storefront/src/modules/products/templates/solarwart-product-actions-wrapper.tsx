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