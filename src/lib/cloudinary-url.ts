export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low'
    format?: 'auto' | 'webp' | 'avif'
    crop?: 'fill' | 'fit' | 'limit' | 'scale'
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) return url

  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    crop = 'limit'
  } = options

  const transformations = []
  
  if (width || height) {
    const dimensions = []
    if (width) dimensions.push(`w_${width}`)
    if (height) dimensions.push(`h_${height}`)
    dimensions.push(`c_${crop}`)
    transformations.push(dimensions.join(','))
  }
  
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  const uploadIndex = url.indexOf('/upload/')
  if (uploadIndex === -1) return url

  return url.slice(0, uploadIndex + 8) + transformations.join('/') + '/' + url.slice(uploadIndex + 8)
}

export function getBlurDataURL(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url
  
  const uploadIndex = url.indexOf('/upload/')
  if (uploadIndex === -1) return url
  
  const transformations = 'w_10,h_10,q_auto:low,f_auto,e_blur:1000'
  return url.slice(0, uploadIndex + 8) + transformations + '/' + url.slice(uploadIndex + 8)
}
