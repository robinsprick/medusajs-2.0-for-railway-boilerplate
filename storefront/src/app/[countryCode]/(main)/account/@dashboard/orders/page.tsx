import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import { getServerTranslations } from "@lib/server-translations"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders({
  params,
}: {
  params: { countryCode: string }
}) {
  const { t } = getServerTranslations(params.countryCode)
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">{t("account.orders")}</h1>
        <p className="text-base-regular">
          {t("account.orders_description")}
        </p>
      </div>
      <div>
        <OrderOverview orders={orders} />
      </div>
    </div>
  )
}
