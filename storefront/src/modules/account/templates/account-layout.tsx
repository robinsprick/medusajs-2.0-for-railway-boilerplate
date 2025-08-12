import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import { getServerTranslations } from "@lib/server-translations"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
  countryCode: string
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
  countryCode,
}) => {
  const { t } = getServerTranslations(countryCode)
  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        <div className="grid grid-cols-1  small:grid-cols-[240px_1fr] py-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">{t("account.got_questions")}</h3>
            <span className="txt-medium">
              {t("account.customer_service_message")}
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              {t("account.customer_service")}
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
