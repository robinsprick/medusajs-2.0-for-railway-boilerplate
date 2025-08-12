// Diese Datei enthält die Server Actions für den Cart
// Pfad: solarwart-railway/storefront/src/modules/cart/actions.ts

"use server"

import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LineItem } from "@medusajs/medusa"

import {
  addItem,
  createCart as createCartCore,
  getCart,
  getProductsById,
  removeItem,
  updateItem,
} from "@/lib/data/cart"
import { getProductPrice } from "@/lib/util/get-product-price"
import { getRegion } from "@/lib/data/regions"
import { omit } from "@/lib/util/omit"

export async function createCart(countryCode: string) {
  const region = await getRegion(countryCode)
  
  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }
  
  const cart = await createCartCore(region.id)
  
  if (!cart) {
    throw new Error("Failed to create cart")
  }
  
  // Set cart cookie
  cookies().set("_medusa_cart_id", cart.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
  
  revalidateTag("cart")
  
  return cart
}

export async function retrieveCart(cartId: string) {
  const cart = await getCart(cartId).catch((err) => {
    console.error("Error retrieving cart:", err)
    return null
  })
  
  if (!cart) {
    throw new Error(`Cart not found: ${cartId}`)
  }
  
  return cart
}

export async function addToCart({
  cartId,
  variantId,
  quantity = 1,
  countryCode,
}: {
  cartId?: string
  variantId: string
  quantity?: number
  countryCode: string
}) {
  // Get or create cart
  let cart = null
  
  if (!cartId) {
    // Try to get cart from cookie
    const cartIdFromCookie = cookies().get("_medusa_cart_id")?.value
    if (cartIdFromCookie) {
      cart = await getCart(cartIdFromCookie).catch(() => null)
    }
  } else {
    cart = await getCart(cartId).catch(() => null)
  }
  
  // Create new cart if needed
  if (!cart) {
    cart = await createCart(countryCode)
    cartId = cart.id
  } else {
    cartId = cart.id
  }
  
  if (!variantId) {
    throw new Error("Variant ID is required")
  }
  
  try {
    await addItem({ cartId, variantId, quantity })
    revalidateTag("cart")
  } catch (error) {
    console.error("Error adding item to cart:", error)
    throw error
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Line item ID is required")
  }
  
  const cartId = cookies().get("_medusa_cart_id")?.value
  
  if (!cartId) {
    throw new Error("No cart found")
  }
  
  try {
    await updateItem({ cartId, lineId, quantity })
    revalidateTag("cart")
  } catch (error) {
    console.error("Error updating line item:", error)
    throw error
  }
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Line item ID is required")
  }
  
  const cartId = cookies().get("_medusa_cart_id")?.value
  
  if (!cartId) {
    throw new Error("No cart found")
  }
  
  try {
    await removeItem({ cartId, lineId })
    revalidateTag("cart")
  } catch (error) {
    console.error("Error deleting line item:", error)
    throw error
  }
}

export async function enrichLineItems(cart: any) {
  if (!cart?.items?.length) {
    return cart
  }
  
  const region = cart.region
  
  const productIds = cart.items.map((item: LineItem) => item.variant.product_id)
  const products = await getProductsById(productIds)
  
  cart.items = cart.items.map((item: LineItem) => {
    const product = products.find((p) => p.id === item.variant.product_id)
    
    if (!product) {
      return item
    }
    
    const variant = product.variants.find((v) => v.id === item.variant_id)
    
    if (!variant) {
      return item
    }
    
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  })
  
  return cart
}