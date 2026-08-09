import Image from 'next/image'

import { BrandMark } from '@/components/ui/brand-mark'
import { brandAssets, HAS_LOGO_FILE } from '@/config/assets'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

/**
 * The academy lockup. Renders the real artwork once it is in public/brand/
 * and HAS_LOGO_FILE is flipped; until then it draws the placeholder crest so
 * the header and hero stay composed rather than showing a broken image.
 */
export function Logo({
  variant = 'mark',
  className,
  priority = false,
}: {
  /** `mark` = square crest only (header). `full` = crest + wordmark (hero). */
  variant?: 'mark' | 'full'
  className?: string
  priority?: boolean
}) {
  if (!HAS_LOGO_FILE) {
    return <BrandMark className={className} />
  }

  const src = variant === 'mark' ? brandAssets.logoMark : brandAssets.logo

  return (
    <Image
      src={src}
      alt={siteConfig.nameAr}
      width={variant === 'mark' ? 512 : 1200}
      height={variant === 'mark' ? 512 : 1200}
      priority={priority}
      className={cn('h-auto w-full object-contain', className)}
    />
  )
}
