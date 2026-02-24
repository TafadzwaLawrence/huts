/**
 * Generate URL-safe slugs from area names
 * Examples:
 *   "Mount Pleasant" → "mount-pleasant"
 *   "Borrowdale Brook" → "borrowdale-brook"
 *   "CBD (Central)" → "cbd-central"
 */

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}

/**
 * Generate slug with city suffix for uniqueness (optional)
 */
export function generateUniqueSlug(name: string, city: string): string {
  const baseSlug = generateSlug(name)
  const citySlug = generateSlug(city)
  return `${baseSlug}-${citySlug}`
}
