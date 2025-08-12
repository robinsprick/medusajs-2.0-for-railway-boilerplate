import { getCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"

export default async function AccountPageLayout({
  dashboard,
  login,
  params,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
  params: { countryCode: string }
}) {
  const customer = await getCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer} countryCode={params.countryCode}>
      {customer ? dashboard : login}
    </AccountLayout>
  )
}
