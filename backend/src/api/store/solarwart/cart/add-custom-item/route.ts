import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { 
  ICartModuleService,
  IProductModuleService
} from "@medusajs/types"

interface CustomItemRequest {
  cart_id: string
  variant_id?: string
  product_id?: string
  quantity: number
  unit_price: number // Der berechnete Preis in Cents
  title: string
  description?: string
  metadata?: Record<string, any>
  config?: any // Die Konfiguration vom Konfigurator
}

export async function POST(
  req: MedusaRequest<CustomItemRequest>,
  res: MedusaResponse
): Promise<void> {
  try {
    const cartService = req.scope.resolve<ICartModuleService>("cart")
    const productService = req.scope.resolve<IProductModuleService>("product")
    
    const {
      cart_id,
      variant_id,
      product_id,
      quantity,
      unit_price,
      title,
      description,
      metadata = {},
      config
    } = req.body

    // Validate request
    if (!cart_id || !quantity || !unit_price || !title) {
      res.status(400).json({
        error: "Missing required fields: cart_id, quantity, unit_price, title"
      })
      return
    }

    // Get the cart
    const cart = await cartService.retrieveCart(cart_id, {
      select: ["id", "currency_code", "region_id", "items"],
      relations: ["items"]
    })

    if (!cart) {
      res.status(404).json({
        error: "Cart not found"
      })
      return
    }

    // If variant_id is provided, get variant details
    let variant = null
    let product = null
    
    if (variant_id) {
      try {
        const variants = await productService.listProductVariants({
          id: [variant_id]
        })
        variant = variants[0]
        
        if (variant && variant.product_id) {
          const products = await productService.listProducts({
            id: [variant.product_id]
          })
          product = products[0]
        }
      } catch (error) {
        console.log("Could not fetch variant/product details:", error)
      }
    } else if (product_id) {
      try {
        const products = await productService.listProducts({
          id: [product_id]
        })
        product = products[0]
      } catch (error) {
        console.log("Could not fetch product details:", error)
      }
    }

    // Add custom line item directly using cart service
    const lineItems = await cartService.addLineItems([{
      cart_id: cart.id,
      variant_id: variant_id || undefined,
      product_id: product_id || (variant?.product_id) || undefined,
      quantity,
      unit_price: unit_price, // Use the calculated price
      title: title || variant?.title || product?.title || "Custom Item",
      subtitle: description,
      thumbnail: variant?.thumbnail || product?.thumbnail || undefined,
      is_custom_price: true,
      metadata: {
        ...metadata,
        custom_price: true,
        original_unit_price: unit_price,
        konfigurator_config: config,
        created_via: "konfigurator",
        created_at: new Date().toISOString()
      }
    }])

    // Retrieve the updated cart with all relations
    const finalCart = await cartService.retrieveCart(cart.id, {
      select: ["*"],
      relations: [
        "items",
        "items.variant",
        "items.product",
        "shipping_address",
        "billing_address",
        "shipping_methods",
        "payment_collection"
      ]
    })

    res.json({
      success: true,
      cart: finalCart,
      message: "Custom item added to cart successfully"
    })

  } catch (error: any) {
    console.error("Error adding custom item to cart:", error)
    res.status(500).json({
      error: error.message || "Failed to add custom item to cart"
    })
  }
}

// OPTIONS for CORS
export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.status(200).end()
}