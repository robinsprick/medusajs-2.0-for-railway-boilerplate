'use client'

import { useState } from 'react'
import { Button } from '@medusajs/ui'
import { ModuleCounter } from '../components/module-counter'
import { StoreProduct } from "@medusajs/types"
import { formatPriceSimple } from '../utils/formatters'

interface OvervoltageACConfiguratorProps {
  product: StoreProduct
  onAddToCart: (config: any) => Promise<void>
  onCancel?: () => void
}

export const OvervoltageACConfigurator = ({
  product,
  onAddToCart,
  onCancel
}: OvervoltageACConfiguratorProps) => {
  const [config, setConfig] = useState({
    moduleCount: 80,
    needsHutschiene: false,
    cableLength: 5
  })
  
  const [isAdding, setIsAdding] = useState(false)
  const [showProjectRequest, setShowProjectRequest] = useState(false)

  // Preise gemäß Preisliste
  const BASE_PRICE = 649.00
  const HUTSCHIENE_ADDON = 129.00
  const CABLE_ADDON_PER_METER = 29.00 / 5 // 29€ für jede weiteren 5m
  const MAX_MODULES_STANDARD = 100

  // Prüfe ob Projektangebot benötigt wird
  if (config.moduleCount > MAX_MODULES_STANDARD && !showProjectRequest) {
    setShowProjectRequest(true)
  } else if (config.moduleCount <= MAX_MODULES_STANDARD && showProjectRequest) {
    setShowProjectRequest(false)
  }

  // Berechne Zusatzkosten
  const hutschienePrice = config.needsHutschiene ? HUTSCHIENE_ADDON : 0
  const extraCableMeters = Math.max(0, config.cableLength - 5)
  const cablePrice = extraCableMeters > 0 ? Math.ceil(extraCableMeters / 5) * CABLE_ADDON_PER_METER * 5 : 0
  
  const totalPrice = BASE_PRICE + hutschienePrice + cablePrice

  const breakdown = {
    basePrice: BASE_PRICE,
    additions: [
      ...(config.needsHutschiene ? [{ type: 'Umbau/Hutschiene', amount: HUTSCHIENE_ADDON }] : []),
      ...(cablePrice > 0 ? [{ type: `Zusätzliche Kabellänge (${extraCableMeters}m)`, amount: cablePrice }] : [])
    ],
    discounts: [],
    total: totalPrice
  }

  const handleAddToCart = async () => {
    if (showProjectRequest) {
      alert('Für Anlagen über 100 Module benötigen Sie ein individuelles Projektangebot. Bitte kontaktieren Sie uns.')
      return
    }

    setIsAdding(true)
    try {
      await onAddToCart({
        quantity: 1,
        metadata: {
          solarwart_config: {
            productType: 'overvoltage_ac',
            moduleCount: config.moduleCount,
            needsHutschiene: config.needsHutschiene,
            cableLength: config.cableLength,
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
          <h3 className="text-lg font-semibold mb-2">AC-Überspannungsschutz</h3>
          <p className="text-sm text-gray-700">
            Schützen Sie Ihre PV-Anlage vor Überspannungen auf der AC-Seite
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li>• AC-Überspannungsschutz nach Wechselrichter</li>
            <li>• Schutz der Hausinstallation</li>
            <li>• Fachgerechte Installation im Zählerschrank</li>
            <li>• Überprüfung und Inbetriebnahme</li>
          </ul>
        </div>

        {showProjectRequest ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 text-orange-800">Projektangebot erforderlich</h3>
            <p className="text-sm text-orange-700 mb-4">
              Für Anlagen mit mehr als 100 Modulen erstellen wir Ihnen gerne ein individuelles Angebot.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Ihre Anlage:</strong> {config.moduleCount} Module</p>
              <p>Bitte kontaktieren Sie uns für ein maßgeschneidertes Angebot.</p>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => window.location.href = '/contact'}
                variant="primary"
              >
                Kontakt aufnehmen
              </Button>
              <Button
                onClick={() => setConfig({ ...config, moduleCount: 100 })}
                variant="secondary"
              >
                Zurück zur Standardkonfiguration
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="config-inputs space-y-4">
              <ModuleCounter
                value={config.moduleCount}
                onChange={(value) => setConfig({ ...config, moduleCount: value })}
                min={1}
                max={200}
              />

              {config.moduleCount <= MAX_MODULES_STANDARD && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Zusätzliche Optionen
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={config.needsHutschiene}
                          onChange={(e) => setConfig({ ...config, needsHutschiene: e.target.checked })}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Umbau/Hutschiene erforderlich</div>
                          <div className="text-sm text-gray-500">Zusätzliche Anpassung im Zählerschrank</div>
                        </div>
                        <div className="font-medium">+{formatPriceSimple(HUTSCHIENE_ADDON, 'EUR')}</div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kabellänge (Meter)
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setConfig({ ...config, cableLength: Math.max(5, config.cableLength - 5) })}
                        className="px-3 py-1 border rounded hover:bg-gray-50"
                        disabled={config.cableLength <= 5}
                      >
                        -5m
                      </button>
                      <input
                        type="number"
                        value={config.cableLength}
                        onChange={(e) => setConfig({ ...config, cableLength: Math.max(5, parseInt(e.target.value) || 5) })}
                        min={5}
                        step={5}
                        className="w-24 text-center border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => setConfig({ ...config, cableLength: config.cableLength + 5 })}
                        className="px-3 py-1 border rounded hover:bg-gray-50"
                      >
                        +5m
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {config.cableLength <= 5 ? (
                        'Standardlänge (im Preis enthalten)'
                      ) : (
                        `+${formatPriceSimple(cablePrice, 'EUR')} für ${extraCableMeters}m zusätzliche Kabellänge`
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {config.moduleCount <= MAX_MODULES_STANDARD && (
              <div className="price-section border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Preisübersicht</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">AC-Überspannungsschutz Basispreis</span>
                    <span className="font-medium">{formatPriceSimple(BASE_PRICE, 'EUR')}</span>
                  </div>
                  
                  {config.needsHutschiene && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Umbau/Hutschiene</span>
                      <span className="font-medium">+{formatPriceSimple(HUTSCHIENE_ADDON, 'EUR')}</span>
                    </div>
                  )}
                  
                  {cablePrice > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Zusätzliche Kabellänge ({extraCableMeters}m)</span>
                      <span className="font-medium">+{formatPriceSimple(cablePrice, 'EUR')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2 text-lg font-bold">
                    <span>Gesamtpreis (inkl. MwSt.)</span>
                    <span className="text-blue-600">{formatPriceSimple(totalPrice, 'EUR')}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>Enthaltene Leistungen:</strong> Material, Montage, Anschluss und Funktionsprüfung
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
            )}
          </>
        )}
      </div>
    </div>
  )
}