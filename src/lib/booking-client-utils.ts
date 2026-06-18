import { PricingType } from './types';

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.ceil((end - start) / MS_PER_DAY) + 1;
}

export function buildAvailablePricingTypes(
  pricing: any,
  tCommon: (key: string) => string
): Array<{ type: PricingType; label: string; rate: number }> {
  const types: Array<{ type: PricingType; label: string; rate: number }> = [];
  
  if (pricing?.hourlyRate) types.push({ type: "hourly", label: tCommon("hour"), rate: pricing.hourlyRate });
  if (pricing?.dailyRate) types.push({ type: "daily", label: tCommon("day"), rate: pricing.dailyRate });
  if (pricing?.monthlyRate) types.push({ type: "monthly", label: tCommon("month"), rate: pricing.monthlyRate });
  if (pricing?.kmRate) types.push({ type: "per_km", label: tCommon("km"), rate: pricing.kmRate });
  if (pricing?.tonRate) types.push({ type: "per_ton", label: tCommon("ton"), rate: pricing.tonRate });
  
  return types;
}

export function getPricingRate(pricing: any, type: PricingType): number {
  switch (type) {
    case 'hourly': return pricing?.hourlyRate || 0;
    case 'daily': return pricing?.dailyRate || 0;
    case 'monthly': return pricing?.monthlyRate || 0;
    case 'per_km': return pricing?.kmRate || 0;
    case 'per_ton': return pricing?.tonRate || 0;
    default: return 0;
  }
}

export function calculateBookingEndDate(
  startDate: Date | string,
  usage: number,
  pricingType: string
): Date {
  const start = new Date(startDate);
  
  switch (pricingType) {
    case 'hourly':
      return new Date(start.getTime() + usage * 60 * 60 * 1000);
    case 'daily':
      return new Date(start.getTime() + usage * 24 * 60 * 60 * 1000);
    case 'monthly':
      const monthEnd = new Date(start);
      monthEnd.setMonth(monthEnd.getMonth() + usage);
      return monthEnd;
    case 'per_km':
      return new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000);
    default:
      return start;
  }
}

export function determineEndDate(
  startDate: Date | undefined,
  endDate: Date | undefined,
  usage: number,
  pricingType: string
): Date | undefined {
  if (!startDate) return endDate ? new Date(endDate) : undefined

  if (endDate && pricingType === "daily") {
    return new Date(endDate)
  }

  if (
    pricingType === "hourly" ||
    pricingType === "per_km" ||
    pricingType === "monthly"
  ) {
    return calculateBookingEndDate(startDate, usage, pricingType)
  }

  return endDate ? new Date(endDate) : undefined
}
