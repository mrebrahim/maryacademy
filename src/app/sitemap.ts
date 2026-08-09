import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'
import { getPublishedCourseSlugs } from '@/lib/queries'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedCourseSlugs()

  const staticRoutes = ['', '/courses', '/about', '/testimonials', '/blog', '/contact'].map(
    (path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  )

  const courseRoutes = slugs.map((slug) => ({
    url: `${siteConfig.url}/courses/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticRoutes, ...courseRoutes]
}
