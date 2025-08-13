'use client'

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { formatPriceSimple } from "../utils/formatters"
import { PriceBreakdown as PriceBreakdownType } from "../types"

interface PriceBreakdownProps {
  breakdown: PriceBreakdownType | null
  config?: any
  currencyCode?: string
}

export const PriceBreakdown = ({ 
  breakdown, 
  config,
  currencyCode = "EUR"
}: PriceBreakdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!breakdown) return null

  const formatPrice = (amount: number) => {
    return formatPriceSimple(amount, currencyCode)
  }

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <span className="text-sm font-medium">Preisaufschlüsselung</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Basispreis:</span>
            <span className="font-medium">{formatPrice(breakdown.basePrice)}</span>
          </div>
          
          {breakdown.discounts?.map((discount, index) => (
            <div key={index} className="flex justify-between text-green-600">
              <span>{discount.label}:</span>
              <span>-{formatPrice(discount.amount)}</span>
            </div>
          ))}
          
          {breakdown.additions?.map((addition, index) => (
            <div key={index} className="flex justify-between text-orange-600">
              <span>{addition.label}:</span>
              <span>+{formatPrice(addition.amount)}</span>
            </div>
          ))}
          
          <div className="pt-2 mt-2 border-t flex justify-between font-bold">
            <span>Gesamt:</span>
            <span>{formatPrice(breakdown.total)}</span>
          </div>

          {breakdown.factors && Object.keys(breakdown.factors).length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-600 mb-2">Angewendete Faktoren:</p>
              <div className="space-y-1">
                {Object.entries(breakdown.factors).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs text-gray-500">
                    <span className="capitalize">{key}:</span>
                    <span>{(value * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}