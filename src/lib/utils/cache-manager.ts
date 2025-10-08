import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';

/**
 * Cache management utilities for common operations
 */
export class CacheManager {
  /**
   * Warm up frequently accessed data
   */
  static async warmUpFrequentData(): Promise<void> {
    try {
      console.log('Starting cache warm-up...');
      
      // Warm up destinations
      await this.warmUpDestinations();
      
      // Warm up experiences
      await this.warmUpExperiences();
      
      // Warm up FAQs
      await this.warmUpFAQs();
      
      console.log('Cache warm-up completed successfully');
    } catch (error) {
      console.error('Cache warm-up failed:', error);
    }
  }

  /**
   * Warm up destination caches
   */
  private static async warmUpDestinations(): Promise<void> {
    const destinationKeys = [
      CacheKeys.destinations.featured(6),
      CacheKeys.destinations.countries(),
      CacheKeys.destinations.all(),
    ];

    // Pre-populate with empty data to establish cache structure
    await CacheService.warmUp(
      destinationKeys.map(key => ({
        key,
        value: null,
        options: { ttl: 300 }, // 5 minutes for warm-up
      }))
    );
  }

  /**
   * Warm up experience caches
   */
  private static async warmUpExperiences(): Promise<void> {
    const experienceKeys = [
      CacheKeys.experiences.featured(6),
      CacheKeys.experiences.categories(),
      CacheKeys.experiences.all(),
    ];

    await CacheService.warmUp(
      experienceKeys.map(key => ({
        key,
        value: null,
        options: { ttl: 300 },
      }))
    );
  }

  /**
   * Warm up FAQ caches
   */
  private static async warmUpFAQs(): Promise<void> {
    const faqKeys = [
      CacheKeys.faqs.all(),
    ];

    await CacheService.warmUp(
      faqKeys.map(key => ({
        key,
        value: null,
        options: { ttl: 300 },
      }))
    );
  }

  /**
   * Invalidate all caches
   */
  static async invalidateAllCaches(): Promise<void> {
    try {
      console.log('Invalidating all caches...');
      
      await CacheService.invalidateByTags([
        CacheTags.destinations,
        CacheTags.experiences,
        CacheTags.packages,
        CacheTags.faqs,
        CacheTags.testimonials,
        CacheTags.partners,
        CacheTags.bookings,
      ]);
      
      console.log('All caches invalidated successfully');
    } catch (error) {
      console.error('Cache invalidation failed:', error);
    }
  }

  /**
   * Invalidate specific entity caches
   */
  static async invalidateEntityCache(entityType: string, entityId?: string): Promise<void> {
    try {
      const tags = [entityType];
      
      if (entityId) {
        // Invalidate specific entity cache
        const specificKeys = [
          `${entityType}:id:${entityId}`,
        ];
        await CacheService.deleteMany(specificKeys);
      }
      
      // Invalidate all related caches
      await CacheService.invalidateByTags(tags);
      
      console.log(`Cache invalidated for ${entityType}${entityId ? `:${entityId}` : ''}`);
    } catch (error) {
      console.error(`Cache invalidation failed for ${entityType}:`, error);
    }
  }

  /**
   * Get cache performance report
   */
  static getPerformanceReport(): {
    stats: any;
    hitRate: number;
    recommendations: string[];
    status: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  } {
    const stats = CacheService.getStats();
    const hitRate = CacheService.getHitRate();
    
    const recommendations: string[] = [];
    
    if (hitRate < 0.4) {
      recommendations.push('Consider increasing TTL values');
      recommendations.push('Review cache key generation');
      recommendations.push('Implement cache warming');
    } else if (hitRate < 0.6) {
      recommendations.push('Monitor cache patterns');
      recommendations.push('Consider optimizing TTL values');
    } else if (hitRate < 0.8) {
      recommendations.push('Good cache performance');
      recommendations.push('Consider fine-tuning TTL values');
    } else {
      recommendations.push('Excellent cache performance!');
    }
    
    let status: 'excellent' | 'good' | 'fair' | 'needs_improvement';
    if (hitRate >= 0.8) status = 'excellent';
    else if (hitRate >= 0.6) status = 'good';
    else if (hitRate >= 0.4) status = 'fair';
    else status = 'needs_improvement';
    
    return {
      stats,
      hitRate,
      recommendations,
      status,
    };
  }

  /**
   * Clear all cache data
   */
  static async clearAllCache(): Promise<boolean> {
    try {
      console.log('Clearing all cache data...');
      const result = await CacheService.clearAll();
      console.log('All cache data cleared');
      return result;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Health check for cache system
   */
  static async healthCheck(): Promise<{
    healthy: boolean;
    stats: any;
    hitRate: number;
    message: string;
  }> {
    try {
      const stats = CacheService.getStats();
      const hitRate = CacheService.getHitRate();
      
      const healthy = hitRate >= 0.3; // Minimum acceptable hit rate
      
      return {
        healthy,
        stats,
        hitRate,
        message: healthy 
          ? 'Cache system is healthy' 
          : 'Cache system needs attention - low hit rate detected',
      };
    } catch (error) {
      return {
        healthy: false,
        stats: null,
        hitRate: 0,
        message: `Cache health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
