import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/framework/utils'
import { InviteUserEmail, INVITE_USER, isInviteUserData } from './invite-user'
import { OrderPlacedTemplate, ORDER_PLACED, isOrderPlacedTemplateData } from './order-placed'
import { SolarwartOrderPlacedTemplate, SOLARWART_ORDER_PLACED, isSolarwartOrderPlacedTemplateData } from './solarwart-order-placed'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  SOLARWART_ORDER_PLACED
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      return <InviteUserEmail {...data} />

    case EmailTemplates.ORDER_PLACED:
      // Check if this is a Solarwart order first
      if (isSolarwartOrderPlacedTemplateData(data)) {
        return <SolarwartOrderPlacedTemplate {...data} />
      }
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      return <OrderPlacedTemplate {...data} />

    case EmailTemplates.SOLARWART_ORDER_PLACED:
      if (!isSolarwartOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.SOLARWART_ORDER_PLACED}"`
        )
      }
      return <SolarwartOrderPlacedTemplate {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export { InviteUserEmail, OrderPlacedTemplate, SolarwartOrderPlacedTemplate }
