/**
 * S3 Image URL Helper
 * Constructs public S3 URLs for images stored in myclassesimages bucket
 * Handles both full URLs and relative keys
 */

export const S3_BUCKET_URL = "https://myclassesimages.s3.ap-south-1.amazonaws.com";

/**
 * Get the full public URL for an S3 object
 * Handles three cases:
 * 1. Empty/null value - returns empty string
 * 2. Already a full URL (starts with http) - returns as-is
 * 3. Just the key or filename - prepends S3 bucket URL with appropriate folder
 * 
 * @param key - The S3 object key, filename, or full URL
 * @param folder - The folder prefix (e.g., "instituteLogo", "instituteBanner")
 * @returns Full HTTPS URL or empty string
 */
export function s3ImageUrl(key: string | null | undefined, folder: string): string {
  if (!key) return "";
  
  // Already a full URL - return as-is
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  
  // Already has folder prefix - use as-is
  if (key.includes("/")) {
    return `${S3_BUCKET_URL}/${key}`;
  }
  
  // Just a filename - prepend folder
  return `${S3_BUCKET_URL}/${folder}/${key}`;
}

/**
 * Get the full public URL for an institute logo
 * Expected S3 key format: instituteLogo/{instituteIdentifier}_logo.{ext}
 * 
 * @param key - The S3 key, filename, or full URL
 * @returns Full HTTPS URL or empty string
 */
export function instituteLogoUrl(key: string | null | undefined): string {
  return s3ImageUrl(key, "instituteLogo");
}

/**
 * Get the full public URL for an institute banner
 * Expected S3 key format: instituteBanner/{instituteIdentifier}_banner.{ext}
 * 
 * @param key - The S3 key, filename, or full URL
 * @returns Full HTTPS URL or empty string
 */
export function instituteBannerUrl(key: string | null | undefined): string {
  return s3ImageUrl(key, "instituteBanner");
}

/**
 * Get the full public URL for a faculty image
 * Expected S3 key format: facultyImage/{facultyIdentifier}_image.{ext}
 * 
 * @param key - The S3 key, filename, or full URL
 * @returns Full HTTPS URL or empty string
 */
export function facultyImageUrl(key: string | null | undefined): string {
  return s3ImageUrl(key, "facultyImage");
}

/**
 * Get the full public URL for a student image
 * Expected S3 key format: studentImage/{resultIdentifier}_image.{ext}
 * 
 * @param key - The S3 key, filename, or full URL
 * @returns Full HTTPS URL or empty string
 */
export function studentImageUrl(key: string | null | undefined): string {
  return s3ImageUrl(key, "studentImage");
}

/**
 * Get the full public URL for a media gallery image
 * Expected S3 key format: media/{mediaIdentifier}.{ext}
 * 
 * @param key - The S3 key, filename, or full URL
 * @returns Full HTTPS URL or empty string
 */
export function mediaImageUrl(key: string | null | undefined): string {
  return s3ImageUrl(key, "media");
}

/**
 * Extract just the object key from a full S3 URL
 * Useful for storing in database (store just the key, not full URL)
 * 
 * @param url - Full S3 URL or key
 * @returns Just the object key (e.g., "instituteLogo/inst-123_logo.png")
 */
export function extractObjectKey(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If it's already just a key (no protocol), return as-is
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return url;
  }
  
  // Extract key from full URL
  const prefix = `${S3_BUCKET_URL}/`;
  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }
  
  // Different bucket format, try to extract after .amazonaws.com/
  const amazonawsMatch = url.match(/\.amazonaws\.com\/(.+)$/);
  if (amazonawsMatch) {
    return amazonawsMatch[1];
  }
  
  return url;
}

/**
 * Get a placeholder image URL based on type
 * @param type - Type of placeholder needed
 * @returns Placeholder image URL
 */
export function getPlaceholderImage(type: 'logo' | 'banner' | 'faculty' | 'default'): string {
  switch (type) {
    case 'logo':
      return '/assets/sample_image_for_anything.png';
    case 'banner':
      return '/assets/sample_image_for_anything.png';
    case 'faculty':
      return '/assets/sample_image_for_anything.png';
    default:
      return '/assets/sample_image_for_anything.png';
  }
}
