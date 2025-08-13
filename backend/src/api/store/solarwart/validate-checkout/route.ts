import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { validateSolarwartCheckoutWorkflow } from "../../../../workflows/solarwart/validate-solarwart-checkout.workflow"

export const POST = async (
  req: MedusaRequest<{ cart_id: string }>,
  res: MedusaResponse
) => {
  const { cart_id } = req.body

  if (!cart_id) {
    return res.status(400).json({
      error: "cart_id is required"
    })
  }

  try {
    const { result } = await validateSolarwartCheckoutWorkflow.run({
      input: { cart_id }
    })

    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        errors: result.errors
      })
    }

    return res.json({
      valid: true,
      message: "Solarwart items validated successfully"
    })
  } catch (error) {
    console.error("Validation error:", error)
    return res.status(500).json({
      error: "Failed to validate checkout",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}