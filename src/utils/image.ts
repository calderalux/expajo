/**
 * Validates if a URL is a valid image URL
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check for empty or placeholder values
  if (url.trim() === '' || url === 'placeholder' || url === 'null' || url === 'undefined') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // Check if it's a valid hostname (not localhost in production)
    if (urlObj.hostname === 'localhost' && process.env.NODE_ENV === 'production') {
      return false;
    }

    return true;
  } catch {
    // If URL parsing fails, it's not a valid URL
    return false;
  }
}

/**
 * Gets the best available image URL from destination data
 * @param destination - The destination object
 * @returns A valid image URL or fallback placeholder
 */
export function getDestinationImageUrl(destination: any): string {
  // Check gallery images first
  if (destination.image_gallery && Array.isArray(destination.image_gallery)) {
    for (const imageUrl of destination.image_gallery) {
      if (isValidImageUrl(imageUrl)) {
        return imageUrl;
      }
    }
  }

  // Check cover image
  if (isValidImageUrl(destination.image_cover_url)) {
    return destination.image_cover_url!;
  }

  // Fallback to placeholder
  return '/placeholder-destination.svg';
}
