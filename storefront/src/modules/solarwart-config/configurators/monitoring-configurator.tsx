'use client'

import { useState } from 'react'
import { Button } from '@medusajs/ui'
import { StoreProduct } from "@medusajs/types"
import { formatPriceSimple } from '../utils/formatters'

interface MonitoringConfiguratorProps {
  product: StoreProduct
  onAddToCart: (config: any) => Promise<void>
  onCancel?: () => void
}

export const MonitoringConfigurator = ({
  product,
  onAddToCart,
  onCancel
}: MonitoringConfiguratorProps) => {
  const [config, setConfig] = useState({
    subscriptionType: 'monthly' as 'monthly' | 'yearly'
  })
  
  const [isAdding, setIsAdding] = useState(false)

  // Festpreise gemäß Preisliste
  const prices = {
    setup: 99.00,
    monthly: 15.00,
    yearly: 180.00
  }

  // Berechne Gesamtpreis
  const totalPrice = prices.setup + (config.subscriptionType === 'monthly' ? prices.monthly : prices.yearly)
  
  const breakdown = {
    basePrice: prices.setup,
    additions: [
      {
        type: config.subscriptionType === 'monthly' ? 'Monatliche Servicegebühr' : 'Jährliche Servicegebühr',
        amount: config.subscriptionType === 'monthly' ? prices.monthly : prices.yearly
      }
    ],
    discounts: [],
    total: totalPrice
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await onAddToCart({
        quantity: 1,
        metadata: {
          solarwart_config: {
            productType: 'monitoring',
            subscriptionType: config.subscriptionType,
            setupFee: prices.setup,
            subscriptionFee: config.subscriptionType === 'monthly' ? prices.monthly : prices.yearly,
            calculatedPrice: totalPrice,
            priceBreakdown: breakdown
          }
        }
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="solarwart-configurator">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Monitoring / Fernüberwachung</h3>
          <p className="text-sm text-gray-700">
            24/7 Überwachung Ihrer PV-Anlage mit sofortiger Fehlererkennung
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li>• Echtzeitüberwachung der Anlagenleistung</li>
            <li>• Automatische Fehlererkennung</li>
            <li>• E-Mail-Benachrichtigungen bei Störungen</li>
            <li>• Monatliche Ertragsberichte</li>
            <li>• Online-Portal mit Live-Daten</li>
          </ul>
        </div>

        <div className="config-inputs space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Abrechnungsintervall
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfig({ ...config, subscriptionType: 'monthly' })}
                className={`px-4 py-3 border rounded-lg transition-colors ${
                  config.subscriptionType === 'monthly'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Monatlich</div>
                <div className="text-sm mt-1">{formatPriceSimple(prices.monthly, 'EUR')}/Monat</div>
              </button>
              <button
                onClick={() => setConfig({ ...config, subscriptionType: 'yearly' })}
                className={`px-4 py-3 border rounded-lg transition-colors ${
                  config.subscriptionType === 'yearly'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Jährlich</div>
                <div className="text-sm mt-1">{formatPriceSimple(prices.yearly, 'EUR')}/Jahr</div>
                <div className="text-xs text-green-600 mt-1">Sparen Sie {formatPriceSimple(prices.monthly * 12 - prices.yearly, 'EUR')}</div>
              </button>
            </div>
          </div>
        </div>

        <div className="price-section border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Preisübersicht</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Einrichtungsgebühr (einmalig)</span>
              <span className="font-medium">{formatPriceSimple(prices.setup, 'EUR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">
                {config.subscriptionType === 'monthly' ? 'Servicegebühr (monatlich)' : 'Servicegebühr (jährlich)'}
              </span>
              <span className="font-medium">
                {formatPriceSimple(config.subscriptionType === 'monthly' ? prices.monthly : prices.yearly, 'EUR')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 text-lg font-bold">
              <span>Gesamtpreis (1. Periode)</span>
              <span className="text-blue-600">{formatPriceSimple(totalPrice, 'EUR')}</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Hinweis:</strong> Die Einrichtungsgebühr fällt nur einmalig an. 
              Ab der zweiten Periode zahlen Sie nur noch die {config.subscriptionType === 'monthly' ? 'monatliche' : 'jährliche'} Servicegebühr.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              variant="primary"
              className="flex-1"
            >
              {isAdding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="secondary"
                className="flex-1"
              >
                Abbrechen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}