import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const SOLARWART_ORDER_PLACED = 'solarwart-order-placed'

interface SolarwartConfig {
  productType: string
  moduleCount?: number
  roofType?: string
  floorLevel?: number
  lastCleaning?: string
  distance?: number
  subscription?: {
    type: 'yearly' | 'monthly'
    duration: number
  }
  priceBreakdown?: {
    basePrice: number
    discounts?: Array<{ type: string; amount: number }>
    additions?: Array<{ type: string; amount: number }>
    total: number
  }
}

type BaseOrderItem = OrderDTO['items'] extends Array<infer T> ? T : never

interface SolarwartOrderItem extends BaseOrderItem {
  metadata?: {
    solarwart_config?: SolarwartConfig
  }
}

interface SolarwartOrderPlacedPreviewProps {
  order: OrderDTO & { 
    display_id: string
    summary: { raw_current_order_total: { value: number } }
    items: SolarwartOrderItem[]
  }
  shippingAddress: OrderAddressDTO
}

export interface SolarwartOrderPlacedTemplateProps {
  order: OrderDTO & { 
    display_id: string
    summary: { raw_current_order_total: { value: number } }
    items: SolarwartOrderItem[]
  }
  shippingAddress: OrderAddressDTO
  preview?: string
}

const getRoofTypeLabel = (roofType: string) => {
  const labels: Record<string, string> = {
    'schraeg': 'Schrägdach',
    'flach': 'Flachdach',
    'freiland': 'Freiland'
  }
  return labels[roofType] || roofType
}

const getSoilingLabel = (soiling: string) => {
  const labels: Record<string, string> = {
    'never': 'Nie gereinigt',
    'gt18': '≥ 18 Monate',
    'lt18': '< 18 Monate'
  }
  return labels[soiling] || soiling
}

const getSubscriptionLabel = (subscription: any) => {
  if (!subscription) return null
  if (subscription.type === 'yearly') {
    return `Jahresvertrag (${subscription.duration} Jahr${subscription.duration > 1 ? 'e' : ''})`
  }
  if (subscription.type === 'monthly') {
    return `Monatsvertrag (${subscription.duration} Monat${subscription.duration > 1 ? 'e' : ''})`
  }
  return null
}

export const isSolarwartOrderPlacedTemplateData = (data: any): data is SolarwartOrderPlacedTemplateProps =>
  typeof data.order === 'object' && 
  typeof data.shippingAddress === 'object' &&
  data.order.items?.some((item: any) => item.metadata?.solarwart_config)

export const SolarwartOrderPlacedTemplate: React.FC<SolarwartOrderPlacedTemplateProps> & {
  PreviewProps: SolarwartOrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Ihre Solarwart-Bestellung wurde aufgegeben!' }) => {
  const solarwartItems = order.items.filter((item: any) => item.metadata?.solarwart_config)
  const regularItems = order.items.filter((item: any) => !item.metadata?.solarwart_config)

  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
          Auftragsbestätigung - Solarwart Services
        </Text>

        <Text style={{ margin: '0 0 15px' }}>
          Sehr geehrte(r) {shippingAddress.first_name} {shippingAddress.last_name},
        </Text>

        <Text style={{ margin: '0 0 30px' }}>
          vielen Dank für Ihren Auftrag! Nachfolgend finden Sie alle Details zu Ihrer Bestellung:
        </Text>

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Auftragszusammenfassung
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Auftragsnummer: {order.display_id}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Auftragsdatum: {new Date(order.created_at).toLocaleDateString('de-DE')}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          Gesamtbetrag: {(order.summary.raw_current_order_total.value / 100).toFixed(2)} €
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        {/* Solarwart Services Section */}
        {solarwartItems.length > 0 && (
          <>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px', color: '#2c5282' }}>
              Solarwart Dienstleistungen
            </Text>
            
            {solarwartItems.map((item) => {
              const config = item.metadata?.solarwart_config
              if (!config) return null

              return (
                <div key={item.id} style={{
                  backgroundColor: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <Text style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 10px' }}>
                    {item.product_title}
                  </Text>
                  
                  <div style={{ marginLeft: '10px' }}>
                    {config.moduleCount && (
                      <Text style={{ margin: '0 0 5px' }}>
                        • Anzahl Module: {config.moduleCount}
                      </Text>
                    )}
                    {config.roofType && (
                      <Text style={{ margin: '0 0 5px' }}>
                        • Dachtyp: {getRoofTypeLabel(config.roofType)}
                      </Text>
                    )}
                    {config.floorLevel && (
                      <Text style={{ margin: '0 0 5px' }}>
                        • Etage: {config.floorLevel}. Etage
                      </Text>
                    )}
                    {config.lastCleaning && (
                      <Text style={{ margin: '0 0 5px' }}>
                        • Letzte Reinigung: {getSoilingLabel(config.lastCleaning)}
                      </Text>
                    )}
                    {config.distance && (
                      <Text style={{ margin: '0 0 5px' }}>
                        • Entfernung: {config.distance} km
                      </Text>
                    )}
                    {config.subscription && (
                      <Text style={{ margin: '0 0 5px' }}>
                        • Vertrag: {getSubscriptionLabel(config.subscription)}
                      </Text>
                    )}
                  </div>

                  {config.priceBreakdown && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #cbd5e0' }}>
                      <Text style={{ fontWeight: 'bold', margin: '0 0 5px' }}>
                        Preisaufschlüsselung:
                      </Text>
                      <Text style={{ margin: '0 0 3px', fontSize: '14px' }}>
                        Basispreis: {(config.priceBreakdown.basePrice / 100).toFixed(2)} €
                      </Text>
                      {config.priceBreakdown.discounts?.map((discount, idx) => (
                        <Text key={idx} style={{ margin: '0 0 3px', fontSize: '14px', color: '#38a169' }}>
                          {discount.type}: -{(discount.amount / 100).toFixed(2)} €
                        </Text>
                      ))}
                      {config.priceBreakdown.additions?.map((addition, idx) => (
                        <Text key={idx} style={{ margin: '0 0 3px', fontSize: '14px' }}>
                          {addition.type}: +{(addition.amount / 100).toFixed(2)} €
                        </Text>
                      ))}
                      <Text style={{ fontWeight: 'bold', marginTop: '5px' }}>
                        Zwischensumme: {(item.subtotal! / 100).toFixed(2)} €
                      </Text>
                    </div>
                  )}

                  <Text style={{ margin: '10px 0 0', fontSize: '14px' }}>
                    Menge: {item.quantity} × {(item.unit_price! / 100).toFixed(2)} € = {(item.subtotal! / 100).toFixed(2)} €
                  </Text>
                </div>
              )
            })}
          </>
        )}

        {/* Regular Items Section */}
        {regularItems.length > 0 && (
          <>
            <Hr style={{ margin: '20px 0' }} />
            <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
              Weitere Artikel
            </Text>
            <div style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
              margin: '10px 0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: '#f2f2f2',
                padding: '8px',
                borderBottom: '1px solid #ddd'
              }}>
                <Text style={{ fontWeight: 'bold' }}>Artikel</Text>
                <Text style={{ fontWeight: 'bold' }}>Menge</Text>
                <Text style={{ fontWeight: 'bold' }}>Preis</Text>
              </div>
              {regularItems.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  borderBottom: '1px solid #ddd'
                }}>
                  <Text>{item.title} - {item.product_title}</Text>
                  <Text>{item.quantity}</Text>
                  <Text>{(item.unit_price! / 100).toFixed(2)} €</Text>
                </div>
              ))}
            </div>
          </>
        )}

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Serviceadresse
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.address_1}
        </Text>
        {shippingAddress.address_2 && (
          <Text style={{ margin: '0 0 5px' }}>
            {shippingAddress.address_2}
          </Text>
        )}
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.postal_code} {shippingAddress.city}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          {shippingAddress.province}, {shippingAddress.country_code}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ margin: '20px 0', fontSize: '14px', color: '#718096' }}>
          Wichtige Hinweise:
        </Text>
        <Text style={{ margin: '0 0 5px', fontSize: '14px', color: '#718096' }}>
          • Wir werden Sie kontaktieren, um einen Termin für die Durchführung der Services zu vereinbaren.
        </Text>
        <Text style={{ margin: '0 0 5px', fontSize: '14px', color: '#718096' }}>
          • Bei Fragen stehen wir Ihnen gerne zur Verfügung.
        </Text>
        <Text style={{ margin: '0 0 20px', fontSize: '14px', color: '#718096' }}>
          • Diese E-Mail dient als Auftragsbestätigung und Rechnung.
        </Text>

        <Text style={{ margin: '30px 0 0', fontSize: '14px' }}>
          Mit freundlichen Grüßen,<br />
          Ihr Solarwart Team
        </Text>
      </Section>
    </Base>
  )
}

SolarwartOrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'SW-ORD-2024-001',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'EUR',
    items: [
      {
        id: 'item-1',
        title: 'PV-Reinigung',
        product_title: 'Photovoltaik-Reinigung',
        quantity: 1,
        unit_price: 325000,
        subtotal: 325000,
        metadata: {
          solarwart_config: {
            productType: 'cleaning',
            moduleCount: 250,
            roofType: 'schraeg',
            floorLevel: 2,
            lastCleaning: 'never',
            distance: 15,
            priceBreakdown: {
              basePrice: 325000,
              discounts: [{ type: 'Mengenrabatt', amount: 32500 }],
              additions: [{ type: 'Anfahrt', amount: 4800 }],
              total: 297300
            }
          }
        }
      },
      {
        id: 'item-2',
        title: 'Wartungsvertrag',
        product_title: 'Photovoltaik-Wartung',
        quantity: 1,
        unit_price: 89900,
        subtotal: 89900,
        metadata: {
          solarwart_config: {
            productType: 'maintenance',
            moduleCount: 100,
            subscription: {
              type: 'yearly',
              duration: 1
            },
            priceBreakdown: {
              basePrice: 89900,
              discounts: [],
              additions: [],
              total: 89900
            }
          }
        }
      }
    ],
    shipping_address: {
      first_name: 'Max',
      last_name: 'Mustermann',
      address_1: 'Solarstraße 42',
      address_2: '',
      city: 'München',
      province: 'Bayern',
      postal_code: '80331',
      country_code: 'DE'
    },
    summary: { raw_current_order_total: { value: 387200 } }
  },
  shippingAddress: {
    first_name: 'Max',
    last_name: 'Mustermann',
    address_1: 'Solarstraße 42',
    address_2: '',
    city: 'München',
    province: 'Bayern',
    postal_code: '80331',
    country_code: 'DE'
  }
} as SolarwartOrderPlacedPreviewProps

export default SolarwartOrderPlacedTemplate