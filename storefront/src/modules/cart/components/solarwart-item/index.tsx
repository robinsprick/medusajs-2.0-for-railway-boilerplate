"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import { convertToLocale } from "@lib/util/money"

type SolarwartItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
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

const SolarwartItem = ({ item, type = "full", currencyCode }: SolarwartItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const { handle } = item.variant?.product ?? {}
  const config = item.metadata?.solarwart_config as any

  // Check if this is a Solarwart product
  if (!config) {
    return null
  }

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  return (
    <>
      <Table.Row className="w-full" data-testid="product-row">
        <Table.Cell className="!pl-0 p-4 w-24">
          <LocalizedClientLink
            href={`/products/${handle}`}
            className={clx("flex", {
              "w-16": type === "preview",
              "small:w-24 w-12": type === "full",
            })}
          >
            <Thumbnail
              thumbnail={item.variant?.product?.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        </Table.Cell>

        <Table.Cell className="text-left">
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
          
          {/* Configuration Summary */}
          <div className="mt-2 text-sm text-ui-fg-muted">
            {config.moduleCount && (
              <div>Module: {config.moduleCount}</div>
            )}
            {config.roofType && (
              <div>Dachtyp: {getRoofTypeLabel(config.roofType)}</div>
            )}
            {config.subscription && (
              <div>{getSubscriptionLabel(config.subscription)}</div>
            )}
            {type === "full" && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-ui-fg-interactive hover:underline mt-1"
              >
                {showDetails ? "Details ausblenden" : "Details anzeigen"}
              </button>
            )}
          </div>
        </Table.Cell>

        {type === "full" && (
          <Table.Cell>
            <div className="flex gap-2 items-center w-28">
              <DeleteButton id={item.id} data-testid="product-delete-button" />
              <CartItemSelect
                value={item.quantity}
                onChange={(value) => changeQuantity(parseInt(value.target.value))}
                className="w-14 h-10 p-4"
                data-testid="product-select-button"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                ))}
              </CartItemSelect>
              {updating && <Spinner />}
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </Table.Cell>
        )}

        {type === "full" && (
          <Table.Cell className="hidden small:table-cell">
            <LineItemUnitPrice item={item} style="tight" />
          </Table.Cell>
        )}

        <Table.Cell className="!pr-0">
          <span
            className={clx("!pr-0", {
              "flex flex-col items-end h-full justify-center": type === "preview",
            })}
          >
            {type === "preview" && (
              <span className="flex gap-x-1 ">
                <Text className="text-ui-fg-muted">{item.quantity}x </Text>
                <LineItemUnitPrice item={item} style="tight" />
              </span>
            )}
            <LineItemPrice item={item} style="tight" />
          </span>
        </Table.Cell>
      </Table.Row>

      {/* Detailed Configuration View */}
      {type === "full" && showDetails && config && (
        <Table.Row>
          <Table.Cell colSpan={5} className="bg-ui-bg-subtle p-4">
            <div className="space-y-4">
              {/* Configuration Details */}
              <div>
                <h4 className="font-medium mb-2">Konfiguration</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {config.moduleCount && (
                    <>
                      <dt className="text-ui-fg-muted">Anzahl Module:</dt>
                      <dd>{config.moduleCount}</dd>
                    </>
                  )}
                  {config.roofType && (
                    <>
                      <dt className="text-ui-fg-muted">Dachtyp:</dt>
                      <dd>{getRoofTypeLabel(config.roofType)}</dd>
                    </>
                  )}
                  {config.floorLevel && (
                    <>
                      <dt className="text-ui-fg-muted">Etage:</dt>
                      <dd>{config.floorLevel}. Etage</dd>
                    </>
                  )}
                  {config.lastCleaning && (
                    <>
                      <dt className="text-ui-fg-muted">Letzte Reinigung:</dt>
                      <dd>{getSoilingLabel(config.lastCleaning)}</dd>
                    </>
                  )}
                  {config.distance && (
                    <>
                      <dt className="text-ui-fg-muted">Entfernung:</dt>
                      <dd>{config.distance} km</dd>
                    </>
                  )}
                  {config.subscription && (
                    <>
                      <dt className="text-ui-fg-muted">Vertragslaufzeit:</dt>
                      <dd>{getSubscriptionLabel(config.subscription)}</dd>
                    </>
                  )}
                </dl>
              </div>

              {/* Price Breakdown */}
              {config.priceBreakdown && (
                <div>
                  <h4 className="font-medium mb-2">Preisaufschlüsselung</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ui-fg-muted">Basispreis:</dt>
                      <dd>{convertToLocale({
                        amount: config.priceBreakdown.basePrice,
                        currency_code: currencyCode
                      })}</dd>
                    </div>
                    
                    {config.priceBreakdown.discounts?.map((discount: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <dt className="text-ui-fg-muted">{discount.type}:</dt>
                        <dd className="text-green-600">
                          -{convertToLocale({
                            amount: discount.amount,
                            currency_code: currencyCode
                          })}
                        </dd>
                      </div>
                    ))}
                    
                    {config.priceBreakdown.additions?.map((addition: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <dt className="text-ui-fg-muted">{addition.type}:</dt>
                        <dd>
                          +{convertToLocale({
                            amount: addition.amount,
                            currency_code: currencyCode
                          })}
                        </dd>
                      </div>
                    ))}
                    
                    <div className="flex justify-between pt-2 border-t">
                      <dt className="font-medium">Gesamt:</dt>
                      <dd className="font-medium">
                        {convertToLocale({
                          amount: config.priceBreakdown.total || item.subtotal || 0,
                          currency_code: currencyCode
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </Table.Cell>
        </Table.Row>
      )}
    </>
  )
}

export default SolarwartItem