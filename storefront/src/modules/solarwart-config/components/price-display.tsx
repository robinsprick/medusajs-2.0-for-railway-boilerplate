'use client'

import { Loader2 } from "lucide-react"
import { formatPriceSimple } from "../utils/formatters"

interface PriceDisplayProps {
  price: number
  isCalculating: boolean
  currencyCode?: string
}

export const PriceDisplay = ({ 
  price, 
  isCalculating,
  currencyCode = "EUR"
}: PriceDisplayProps) => {
  if (isCalculating) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Preis wird berechnet...</p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Gesamtpreis</p>
        <p className="text-3xl font-bold text-green-600">
          {formatPriceSimple(price, currencyCode)}
        </p>
        <p className="text-xs text-gray-500 mt-2">inkl. 19% MwSt.</p>
      </div>
    </div>
  )
}