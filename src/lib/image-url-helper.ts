/**
 * Image URL Helper
 * Transforms S3 URLs to CloudFront URLs for faster image loading
 * Consistent with cto-vineyard-frontend-repo implementation
 */

const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'd2cjbd1iqkwr9j.cloudfront.net';
const OLD_S3_BUCKET = 'baze-bucket';
const NEW_S3_BUCKET = 'ctom-bucket-backup';

/**
 * Transforms an S3 URL or path to CloudFront URL
 * @param url - The original S3 URL, CloudFront URL, or relative path
 * @returns CloudFront URL
 */
export function getCloudFrontUrl(url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  // If already a CloudFront URL, return as-is
  if (url.includes(CLOUDFRONT_DOMAIN)) {
    return url;
  }

  // Extract the path from S3 URL or relative path
  // Supports formats:
  // - https://baze-bucket.s3.eu-north-1.amazonaws.com/memes/image.jpg
  // - https://ctom-bucket-backup.s3.eu-north-1.amazonaws.com/memes/image.jpg
  // - /memes/image.jpg (relative path)
  // - memes/image.jpg (path without leading slash)
  // - /mascots/STAGE/STAGE.png (mascot paths)

  let imagePath = '';

  if (url.startsWith('http')) {
    // Extract path from full S3 URL
    try {
      const urlObj = new URL(url);
      imagePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    } catch (e) {
      // If URL parsing fails, try to extract path manually
      const match = url.match(/\/memes\/.+/) || 
                   url.match(/\/user-uploads\/.+/) || 
                   url.match(/\/mascots\/.+/);
      if (match) {
        imagePath = match[0].substring(1); // Remove leading slash
      } else {
        return url; // Return original if we can't parse it
      }
    }
  } else {
    // Relative path - remove leading slash if present
    imagePath = url.startsWith('/') ? url.substring(1) : url;
  }

  // Construct CloudFront URL
  return `https://${CLOUDFRONT_DOMAIN}/${imagePath}`;
}

/**
 * Get mascot image URL from CloudFront
 * @param path - Relative path like '/mascots/STAGE/STAGE.png' or 'mascots/TRAITS/CTO.png'
 * @returns CloudFront URL
 */
export function getMascotImageUrl(path: string): string {
  // Normalize path (remove leading slash if present)
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  return getCloudFrontUrl(normalizedPath);
}

/**
 * Transforms an array of image objects to use CloudFront URLs
 */
export function transformImageUrls<T extends { url: string }>(images: T[]): T[] {
  return images.map(image => ({
    ...image,
    url: getCloudFrontUrl(image.url),
  }));
}
