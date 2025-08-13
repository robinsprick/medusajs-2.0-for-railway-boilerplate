'use client'

import { useState, useEffect } from 'react'
import { PriceBreakdown, PriceCalculationResponse } from '../types'
import { MEDUSA_BACKEND_URL } from '@lib/config'

export const usePriceCalculation = (
  productType: string,
  config: any
) => {
  const [price, setPrice] = useState(0)
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const calculatePrice = async () => {
      setIsCalculating(true)
      setError(null)
      
      try {
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/solarwart/calculate-price`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            productType, 
            config 
          })
        })
        
        if (!response.ok) {
          throw new Error('Preisberechnung fehlgeschlagen')
        }

        const data: PriceCalculationResponse = await response.json()
        setPrice(data.price)
        setBreakdown(data.breakdown)
      } catch (error) {
        console.error('Price calculation failed:', error)
        setError('Preisberechnung nicht verfügbar')
        setPrice(0)
        setBreakdown(null)
      } finally {
        setIsCalculating(false)
      }
    }

    const timer = setTimeout(calculatePrice, 500)
    return () => clearTimeout(timer)
  }, [productType, config])

  return { price, breakdown, isCalculating, error }
}