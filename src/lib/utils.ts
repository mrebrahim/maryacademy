import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Piastres/cents -> a display string. Money is always stored in minor units. */
export function formatPrice(minorUnits: number, currency: 'EGP' | 'USD' = 'EGP') {
  const major = minorUnits / 100
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: major % 1 === 0 ? 0 : 2,
  }).format(major)
  return currency === 'EGP' ? `${formatted} جنيه` : `$${formatted}`
}

/** 43200 -> "12 ساعة"، 3600 -> "ساعة"، 1800 -> "30 دقيقة" */
export function formatDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} دقيقة`
  const hoursPart =
    hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : hours <= 10 ? `${hours} ساعات` : `${hours} ساعة`
  return minutes === 0 ? hoursPart : `${hoursPart} و${minutes} دقيقة`
}
