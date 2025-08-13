import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const orderService: IOrderModuleService = req.scope.resolve(Modules.ORDER)

  try {
    const order = await orderService.retrieveOrder(id, {
      relations: ["items", "items.variant", "items.variant.product", "summary", "shipping_address"]
    })

    // Extract Solarwart items and their configurations
    const solarwartItems = order.items?.filter((item: any) => 
      item.metadata?.solarwart_config
    ).map((item: any) => ({
      id: item.id,
      title: item.title,
      productTitle: item.variant?.product?.title,
      quantity: item.quantity,
      subtotal: item.subtotal,
      configuration: item.metadata.solarwart_config,
      priceBreakdown: item.metadata.solarwart_config?.priceBreakdown
    }))

    // Get order-level Solarwart metadata if exists
    const orderSolarwartMetadata = order.metadata?.solarwart_items || []

    return res.json({
      orderId: order.id,
      orderNumber: order.display_id,
      createdAt: order.created_at,
      email: order.email,
      totalAmount: order.summary?.total,
      solarwartItems,
      solarwartMetadata: orderSolarwartMetadata,
      hasSolarwartServices: solarwartItems.length > 0
    })
  } catch (error) {
    console.error("Error fetching Solarwart order details:", error)
    return res.status(500).json({
      error: "Failed to fetch order details",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}