import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/services/cache';

export interface CacheMiddlewareOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipCache?: (req: NextRequest) => boolean; // Skip cache condition
  varyBy?: string[]; // Headers to vary cache by
}

/**
 * Cache middleware for Next.js API routes
 */
export function withCache(options: CacheMiddlewareOptions = {}) {
  return function cacheMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function cachedHandler(req: NextRequest): Promise<NextResponse> {
      // Skip cache if condition is met
      if (options.skipCache && options.skipCache(req)) {
        return handler(req);
      }

      // Generate cache key
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(req)
        : generateDefaultCacheKey(req, options.varyBy);

      try {
        // Try to get from cache
        const cachedResponse = await CacheService.get<{
          status: number;
          headers: Record<string, string>;
          body: any;
        }>(cacheKey);

        if (cachedResponse) {
          return new NextResponse(cachedResponse.body, {
            status: cachedResponse.status,
            headers: {
              ...cachedResponse.headers,
              'X-Cache': 'HIT',
              'X-Cache-Key': cacheKey,
            },
          });
        }

        // Execute handler
        const response = await handler(req);
        
        // Clone response to read body
        const responseClone = response.clone();
        const body = await responseClone.text();
        
        // Cache the response
        await CacheService.set(
          cacheKey,
          {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body,
          },
          {
            ttl: options.ttl || 300, // Default 5 minutes
            tags: options.tags,
          }
        );

        // Add cache headers to response
        response.headers.set('X-Cache', 'MISS');
        response.headers.set('X-Cache-Key', cacheKey);

        return response;
      } catch (error) {
        console.error('Cache middleware error:', error);
        // Fallback to handler without caching
        return handler(req);
      }
    };
  };
}

/**
 * Generate default cache key from request
 */
function generateDefaultCacheKey(
  req: NextRequest, 
  varyBy?: string[]
): string {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();
  
  let key = `api:${pathname}`;
  
  if (searchParams) {
    key += `:${searchParams}`;
  }
  
  // Add varying headers
  if (varyBy && varyBy.length > 0) {
    const headerValues = varyBy
      .map(header => req.headers.get(header))
      .filter(Boolean)
      .join(':');
    
    if (headerValues) {
      key += `:${headerValues}`;
    }
  }
  
  return key;
}

/**
 * Cache invalidation helper
 */
export async function invalidateCacheByTags(tags: string[]): Promise<void> {
  await CacheService.invalidateByTags(tags);
}

/**
 * Cache invalidation helper for specific keys
 */
export async function invalidateCacheByKeys(keys: string[]): Promise<void> {
  await CacheService.deleteMany(keys);
}

/**
 * Cache warming helper
 */
export async function warmCache<T>(
  items: Array<{ key: string; value: T; options?: { ttl?: number; tags?: string[] } }>
): Promise<void> {
  await CacheService.warmUp(items);
}

/**
 * Cache statistics helper
 */
export function getCacheStats() {
  return CacheService.getStats();
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<boolean> {
  return CacheService.clearAll();
}
