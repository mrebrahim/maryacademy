import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The enrolled area, checkout and admin hold nothing a crawler should see.
      disallow: ['/learn/', '/checkout/', '/admin/', '/account', '/api/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
