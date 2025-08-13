export const formatPrice = (amount: number, currencyCode: string = 'EUR'): string => {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount / 100)
}

export const formatPriceSimple = (amount: number, currencyCode: string = 'EUR'): string => {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}