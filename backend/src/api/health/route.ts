import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Always return 200 OK for health check
  // This ensures Railway can detect the service is running
  console.log(`[Health Check] Request received at ${new Date().toISOString()}`);
  
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "9000",
      RAILWAY: process.env.RAILWAY_ENVIRONMENT || "not-on-railway"
    }
  })
}