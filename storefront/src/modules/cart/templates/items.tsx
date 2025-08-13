"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SolarwartItem from "@modules/cart/components/solarwart-item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import { useTranslations } from "@lib/hooks/use-translations"

type ItemsTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[]
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ items, cart }: ItemsTemplateProps) => {
  const { t } = useTranslations()
  const currencyCode = cart?.currency_code || "EUR"
  
  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">{t("cart.title")}</Heading>
      </div>
      <Table>
        <Table.Header className="border-t-0">
          <Table.Row className="text-ui-fg-subtle txt-medium-plus">
            <Table.HeaderCell className="!pl-0">{t("cart.item")}</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>{t("common.quantity")}</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              {t("common.price")}
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right">
              {t("common.total")}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  // Check if this is a Solarwart configured item
                  if (item.metadata?.solarwart_config) {
                    return <SolarwartItem key={item.id} item={item} currencyCode={currencyCode} />
                  }
                  return <Item key={item.id} item={item} />
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
