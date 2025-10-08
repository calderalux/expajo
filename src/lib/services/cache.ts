// Only import Redis on server side
let getRedisClient: any = null;
if (typeof window === 'undefined') {
  try {
    getRedisClient = require('@/lib/redis').getRedisClient;
  } catch (error) {
    console.warn('Redis not available:', error);
  }
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

export class CacheService {
  private static stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  private static readonly DEFAULT_TTL = 3600; // 1 hour
  private static readonly KEY_PREFIX = 'expajo:';

  /**
   * Generate cache key with prefix
   */
  private static generateKey(key: string): string {
    return `${this.KEY_PREFIX}${key}`;
  }

  /**
   * Generate tag keys for cache invalidation
   */
  private static generateTagKeys(tags: string[]): string[] {
    return tags.map(tag => `${this.KEY_PREFIX}tag:${tag}`);
  }

  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!getRedisClient) {
        // Redis not available (client-side), return null
        this.stats.misses++;
        return null;
      }

      const redis = getRedisClient();
      const cacheKey = this.generateKey(key);
      const value = await redis.get(cacheKey);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  static async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      if (!getRedisClient) {
        // Redis not available (client-side), return false
        this.stats.sets++;
        return false;
      }

      const redis = getRedisClient();
      const cacheKey = this.generateKey(key);
      const ttl = options.ttl || this.DEFAULT_TTL;
      
      const serializedValue = JSON.stringify(value);
      
      if (options.tags && options.tags.length > 0) {
        // Store with tags for invalidation
        const pipeline = redis.pipeline();
        
        // Set the main value
        pipeline.setex(cacheKey, ttl, serializedValue);
        
        // Add to tag sets
        const tagKeys = this.generateTagKeys(options.tags);
        tagKeys.forEach(tagKey => {
          pipeline.sadd(tagKey, cacheKey);
          pipeline.expire(tagKey, ttl);
        });
        
        await pipeline.exec();
      } else {
        await redis.setex(cacheKey, ttl, serializedValue);
      }
      
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  static async delete(key: string): Promise<boolean> {
    try {
      if (!getRedisClient) {
        // Redis not available (client-side), return false
        this.stats.deletes++;
        return false;
      }

      const redis = getRedisClient();
      const cacheKey = this.generateKey(key);
      
      const result = await redis.del(cacheKey);
      this.stats.deletes++;
      
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  static async deleteMany(keys: string[]): Promise<number> {
    try {
      if (!getRedisClient) {
        // Redis not available (client-side), return 0
        this.stats.deletes += keys.length;
        return 0;
      }

      const redis = getRedisClient();
      const cacheKeys = keys.map(key => this.generateKey(key));
      
      const result = await redis.del(...cacheKeys);
      this.stats.deletes += result;
      
      return result;
    } catch (error) {
      console.error('Cache deleteMany error:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  static async invalidateByTags(tags: string[]): Promise<number> {
    try {
      const redis = getRedisClient();
      const tagKeys = this.generateTagKeys(tags);
      
      let totalDeleted = 0;
      
      for (const tagKey of tagKeys) {
        const keys = await redis.smembers(tagKey);
        if (keys.length > 0) {
          const deleted = await redis.del(...keys);
          totalDeleted += deleted;
          await redis.del(tagKey); // Remove the tag set
        }
      }
      
      this.stats.deletes += totalDeleted;
      return totalDeleted;
    } catch (error) {
      console.error('Cache invalidateByTags error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const cacheKey = this.generateKey(key);
      
      const result = await redis.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern - get from cache or execute function and cache result
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const value = await fetchFn();
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * Clear all cache keys with prefix
   */
  static async clearAll(): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const pattern = `${this.KEY_PREFIX}*`;
      
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        this.stats.deletes += keys.length;
      }
      
      return true;
    } catch (error) {
      console.error('Cache clearAll error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  static resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get cache hit rate
   */
  static getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : this.stats.hits / total;
  }

  /**
   * Warm up cache with multiple values
   */
  static async warmUp<T>(
    items: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    const promises = items.map(item => 
      this.set(item.key, item.value, item.options)
    );
    
    await Promise.all(promises);
  }
}

// Cache key generators for different data types
export const CacheKeys = {
  destinations: {
    all: (filters?: any, sort?: any, limit?: number) => 
      `destinations:all:${JSON.stringify({ filters, sort, limit })}`,
    byId: (id: string) => `destinations:id:${id}`,
    featured: (limit: number) => `destinations:featured:${limit}`,
    byCountry: (country: string, limit?: number) => 
      `destinations:country:${country}:${limit || 'all'}`,
    search: (term: string, limit?: number) => 
      `destinations:search:${term}:${limit || 20}`,
    countries: () => 'destinations:countries',
  },
  
  experiences: {
    all: (filters?: any, sort?: any, limit?: number) => 
      `experiences:all:${JSON.stringify({ filters, sort, limit })}`,
    byId: (id: string) => `experiences:id:${id}`,
    featured: (limit: number) => `experiences:featured:${limit}`,
    byCategory: (category: string, limit?: number) => 
      `experiences:category:${category}:${limit || 'all'}`,
    search: (term: string, limit?: number) => 
      `experiences:search:${term}:${limit || 20}`,
    categories: () => 'experiences:categories',
  },
  
  faqs: {
    all: () => 'faqs:all',
    byCategory: (category: string) => `faqs:category:${category}`,
  },
  
  testimonials: {
    all: () => 'testimonials:all',
    featured: (limit: number) => `testimonials:featured:${limit}`,
  },
  
  packageItems: {
    all: (filters?: any, sort?: any, limit?: number) => 
      `package_items:all:${JSON.stringify({ filters, sort, limit })}`,
    byId: (id: string) => `package_items:id:${id}`,
    byType: (itemType: string, limit?: number) => 
      `package_items:type:${itemType}:${limit || 'all'}`,
    search: (term: string, limit?: number) => 
      `package_items:search:${term}:${limit || 20}`,
  },
  
  packageItemOptions: {
    all: (filters?: any, sort?: any, limit?: number) => 
      `package_item_options:all:${JSON.stringify({ filters, sort, limit })}`,
    byId: (id: string) => `package_item_options:id:${id}`,
    byPackageItem: (packageItemId: string, limit?: number) => 
      `package_item_options:package_item:${packageItemId}:${limit || 'all'}`,
    search: (term: string, limit?: number) => 
      `package_item_options:search:${term}:${limit || 20}`,
  },
  
  packages: {
    all: (filters?: any, sort?: any, limit?: number) => 
      `packages:all:${JSON.stringify({ filters, sort, limit })}`,
    byId: (id: string) => `packages:id:${id}`,
    byDestination: (destinationId: string, limit?: number) => 
      `packages:destination:${destinationId}:${limit || 'all'}`,
    featured: (limit?: number) => `packages:featured:${limit || 'all'}`,
    search: (term: string, limit?: number) => 
      `packages:search:${term}:${limit || 20}`,
  },
  
  packageExperiences: {
    byPackageId: (packageId: string) => `package_experiences:package:${packageId}`,
    byExperienceId: (experienceId: string) => `package_experiences:experience:${experienceId}`,
  },
  
  packageOptionMappings: {
    byPackageId: (packageId: string) => `package_option_mappings:package:${packageId}`,
    byOptionId: (optionId: string) => `package_option_mappings:option:${optionId}`,
  },
} as const;

// Cache tags for invalidation
export const CacheTags = {
  destinations: 'destinations',
  experiences: 'experiences',
  packages: 'packages',
  packageItems: 'package_items',
  packageItemOptions: 'package_item_options',
  packageExperiences: 'package_experiences',
  packageOptionMappings: 'package_option_mappings',
  faqs: 'faqs',
  testimonials: 'testimonials',
  partners: 'partners',
  bookings: 'bookings',
} as const;
