import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { headers } from "next/headers"
import { getRegion } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"
import { getServerTranslations } from "@lib/server-translations"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses({
  params,
}: {
  params: { countryCode: string }
}) {
  const { countryCode } = params
  const { t } = getServerTranslations(countryCode)
  const customer = await getCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">{t("account.shipping_addresses")}</h1>
        <p className="text-base-regular">
          {t("account.shipping_addresses_description")}
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
