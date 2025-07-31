import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Simple health check - no database dependency
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || "9000"
    })
  } catch (error) {
    console.error("Health check error:", error)
    res.status(503).json({
      status: "unhealthy",
      error: error.message
    })
  }
}