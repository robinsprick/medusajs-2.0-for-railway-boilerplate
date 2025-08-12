import { Suspense } from 'react'
import CartTemplate from "@modules/cart/templates"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

interface CartWrapperProps {
  cart: HttpTypes.StoreCart | null
  countryCode: string
}

export async function CartWrapper({ cart, countryCode }: CartWrapperProps) {
  const customer = await getCustomer()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <CartTemplate cart={cart} customer={customer} />
    </Suspense>
  )
}