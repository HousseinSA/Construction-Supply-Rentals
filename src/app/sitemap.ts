import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://kriliyengin.com'
  const locales = ['fr', 'ar', 'en'] as const
  
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/equipment', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/categories/excavation', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/categories/leveling-compaction', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/categories/transport', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/categories/lifting-handling', priority: 0.8, changeFrequency: 'weekly' as const },
  ]

  return routes.flatMap(route => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}${route.path}`])
        ),
      },
    }))
  )
}
