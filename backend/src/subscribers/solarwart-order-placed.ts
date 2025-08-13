import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'

interface SolarwartOrderMetadata {
  solarwart_items?: Array<{
    productType: string
    configuration: any
    calculatedPrice: number
    priceBreakdown: any
    calculatedAt: Date
  }>
}

export default async function solarwartOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  try {
    const order = await orderModuleService.retrieveOrder(data.id, { 
      relations: ['items', 'items.variant', 'items.variant.product'] 
    })

    // Check if there are any Solarwart items
    const solarwartItems = order.items?.filter((item: any) => 
      item.metadata?.solarwart_config
    ) || []

    if (solarwartItems.length === 0) {
      return // No Solarwart items, nothing to do
    }

    // Prepare Solarwart metadata for the order
    const solarwartMetadata: SolarwartOrderMetadata = {
      solarwart_items: solarwartItems.map((item: any) => ({
        productType: item.metadata.solarwart_config.productType,
        configuration: item.metadata.solarwart_config,
        calculatedPrice: item.subtotal || 0,
        priceBreakdown: item.metadata.solarwart_config.priceBreakdown,
        calculatedAt: new Date()
      }))
    }

    // Update order metadata to include Solarwart details
    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...order.metadata,
        ...solarwartMetadata
      }
    })

    console.log(`Solarwart metadata added to order ${order.id}:`, solarwartMetadata)

    // Log for monitoring
    console.log(`Order ${order.id} contains ${solarwartItems.length} Solarwart service(s):`)
    solarwartItems.forEach((item: any) => {
      const config = item.metadata.solarwart_config
      console.log(`- ${item.variant?.product?.title || 'Unknown'}: ${config.productType}`)
      if (config.moduleCount) console.log(`  Modules: ${config.moduleCount}`)
      if (config.roofType) console.log(`  Roof type: ${config.roofType}`)
      if (config.subscription) {
        console.log(`  Subscription: ${config.subscription.type} for ${config.subscription.duration} period(s)`)
      }
    })

  } catch (error) {
    console.error('Error processing Solarwart order metadata:', error)
    // Don't throw - we don't want to break the order flow
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}