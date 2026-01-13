/**
 * Image service utility for handling image URLs and transformations
 * Supports S3/CloudFront with optional on-the-fly resizing
 */

/**
 * Generates an optimized image URL
 * @param {string} baseUrl - Base image URL (S3, CloudFront, or original)
 * @param {string} size - Size variant: 'thumbnail', 'medium', 'large', or 'original'
 * @returns {string} Optimized image URL
 */
export const getImageUrl = (baseUrl, size = 'medium') => {
  if (!baseUrl) return ''

  // If using CloudFront or S3 with URL parameters for resizing
  // This can be configured when S3/CloudFront is set up
  const imageBaseUrl = process.env.IMAGE_BASE_URL || ''
  
  // If the URL is already a full URL (starts with http), use it as-is for now
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    // Once S3 is set up, you can add URL transformations here
    // Example for CloudFront with Lambda@Edge or S3 with query parameters:
    // if (imageBaseUrl && baseUrl.includes(imageBaseUrl)) {
    //   const sizeParams = {
    //     thumbnail: 'w=300',
    //     medium: 'w=800',
    //     large: 'w=1200',
    //   }
    //   const separator = baseUrl.includes('?') ? '&' : '?'
    //   return `${baseUrl}${separator}${sizeParams[size] || sizeParams.medium}`
    // }
    return baseUrl
  }

  // If using a base URL from environment, construct full URL
  if (imageBaseUrl) {
    return `${imageBaseUrl}/${baseUrl}`
  }

  return baseUrl
}

/**
 * Generates srcset for responsive images
 * @param {string} baseUrl - Base image URL
 * @returns {string} srcset string for responsive images
 */
export const getImageSrcSet = (baseUrl) => {
  if (!baseUrl) return ''

  // Once S3/CloudFront is configured with resizing, generate srcset
  // For now, return empty string (browser will use src)
  // Example implementation:
  // const sizes = [300, 600, 900, 1200]
  // return sizes.map(size => `${getImageUrl(baseUrl, size)} ${size}w`).join(', ')
  
  return ''
}

/**
 * Gets the sizes attribute for responsive images
 * @param {boolean} isGrid - Whether this is a grid image or modal image
 * @returns {string} sizes attribute value
 */
export const getImageSizes = (isGrid = true) => {
  if (isGrid) {
    // Grid images: 4 columns on desktop, 1 column on mobile
    return '(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 25vw'
  } else {
    // Modal images: full width on mobile, max 1200px on desktop
    return '(max-width: 767px) 100vw, 1200px'
  }
}

