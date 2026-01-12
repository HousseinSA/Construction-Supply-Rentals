import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yourdomain.com'
  const locales = ['ar', 'fr', 'en']
  
  const routes = [
    '',
    '/equipment',
    '/categories/excavation',
    '/categories/leveling-compaction',
    '/categories/transport',
    '/categories/lifting-handling',
    '/auth/login',
    '/auth/register',
  ]

  const urls: MetadataRoute.Sitemap = []

  locales.forEach(locale => {
    routes.forEach(route => {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: {
            ar: `${baseUrl}/ar${route}`,
            fr: `${baseUrl}/fr${route}`,
            en: `${baseUrl}/en${route}`,
          },
        },
      })
    })
  })

  return urls
}
