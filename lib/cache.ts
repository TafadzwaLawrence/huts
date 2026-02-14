// Local storage caching utilities for faster loads

const CACHE_PREFIX = 'huts_'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes for property data
const RECENT_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours for recent views

interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

// Generic cache functions
export function setCache<T>(key: string, data: T, expiry: number = CACHE_EXPIRY): void {
  if (typeof window === 'undefined') return
  
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item))
  } catch (e) {
    // localStorage might be full or disabled
    console.warn('Cache write failed:', e)
  }
}

export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key)
    if (!item) return null
    
    const parsed: CacheItem<T> = JSON.parse(item)
    const now = Date.now()
    
    // Check if expired
    if (now - parsed.timestamp > parsed.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    
    return parsed.data
  } catch (e) {
    return null
  }
}

export function removeCache(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CACHE_PREFIX + key)
}

// Property-specific caching
export interface CachedProperty {
  id: string
  slug?: string
  title: string
  price: number
  location: string
  beds: number
  baths: number
  sqft?: number
  image?: string
  listing_type?: string
}

export function cacheProperty(property: CachedProperty): void {
  setCache(`property_${property.slug || property.id}`, property, CACHE_EXPIRY)
}

export function getCachedProperty(slugOrId: string): CachedProperty | null {
  return getCache<CachedProperty>(`property_${slugOrId}`)
}

// Recently viewed properties
export function addRecentlyViewed(property: CachedProperty): void {
  if (typeof window === 'undefined') return
  
  try {
    const recent = getRecentlyViewed()
    
    // Remove if already exists (to move to front)
    const filtered = recent.filter(p => p.id !== property.id)
    
    // Add to front, keep max 10
    const updated = [property, ...filtered].slice(0, 10)
    
    setCache('recently_viewed', updated, RECENT_EXPIRY)
  } catch (e) {
    console.warn('Failed to update recently viewed:', e)
  }
}

export function getRecentlyViewed(): CachedProperty[] {
  return getCache<CachedProperty[]>('recently_viewed') || []
}

// Saved properties (optimistic UI)
export function getLocalSavedIds(): string[] {
  return getCache<string[]>('saved_ids') || []
}

export function addLocalSavedId(propertyId: string): void {
  const saved = getLocalSavedIds()
  if (!saved.includes(propertyId)) {
    setCache('saved_ids', [...saved, propertyId], RECENT_EXPIRY)
  }
}

export function removeLocalSavedId(propertyId: string): void {
  const saved = getLocalSavedIds()
  setCache('saved_ids', saved.filter(id => id !== propertyId), RECENT_EXPIRY)
}

// Search history
export interface SearchQuery {
  query: string
  timestamp: number
}

export function addSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return
  
  try {
    const history = getSearchHistory()
    
    // Remove duplicates
    const filtered = history.filter(h => h.query.toLowerCase() !== query.toLowerCase())
    
    // Add to front, keep max 5
    const updated = [{ query, timestamp: Date.now() }, ...filtered].slice(0, 5)
    
    setCache('search_history', updated, RECENT_EXPIRY)
  } catch (e) {
    console.warn('Failed to update search history:', e)
  }
}

export function getSearchHistory(): SearchQuery[] {
  return getCache<SearchQuery[]>('search_history') || []
}

export function clearSearchHistory(): void {
  removeCache('search_history')
}

// Homepage stats caching
export interface HomepageStats {
  totalListings: number
  neighborhoods: number
}

export function cacheHomepageStats(stats: HomepageStats): void {
  setCache('homepage_stats', stats, CACHE_EXPIRY)
}

export function getCachedHomepageStats(): HomepageStats | null {
  return getCache<HomepageStats>('homepage_stats')
}

// Clear all cache (for logout)
export function clearAllCache(): void {
  if (typeof window === 'undefined') return
  
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
  } catch (e) {
    console.warn('Failed to clear cache:', e)
  }
}
