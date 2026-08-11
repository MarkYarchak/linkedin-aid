import type { DisplayImage } from '@/types/linkedin-common';

/**
 * Gets the URL from a LinkedIn DisplayImage object.
 * Uses the first artifact if available.
 */
export function getDisplayImageUrl(img: DisplayImage | null | undefined): string | null {
  if (!img || !img.artifacts || img.artifacts.length === 0) {
    return null;
  }
  return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
}

/**
 * Checks if a LinkedIn image URL is expired.
 * LinkedIn image URLs typically have an 'e' parameter which is a Unix timestamp in seconds.
 */
export function isImageExpired(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    const expiry = parsedUrl.searchParams.get('e');
    if (!expiry) return false;

    const expiryTimestamp = parseInt(expiry, 10);
    if (isNaN(expiryTimestamp)) return false;

    // LinkedIn expiry is in seconds.
    // Date.now() returns milliseconds.
    return expiryTimestamp < Math.floor(Date.now() / 1000);
  } catch (e) {
    // If we can't parse the URL or the expiry, assume it's not expired.
    return false;
  }
}
