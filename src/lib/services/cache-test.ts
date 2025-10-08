/**
 * Cache testing utilities for development and debugging
 */
import { CacheService, CacheKeys, CacheTags } from './cache';
import { checkRedisHealth } from '@/lib/redis';

export class CacheTest {
  /**
   * Test basic cache operations
   */
  static async testBasicOperations(): Promise<{
    success: boolean;
    results: Record<string, any>;
    errors: string[];
  }> {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    try {
      // Test Redis connection
      const isHealthy = await checkRedisHealth();
      results.redisConnection = isHealthy;

      if (!isHealthy) {
        errors.push('Redis connection failed');
        return { success: false, results, errors };
      }

      // Test set operation
      const testKey = 'test:basic:set';
      const testValue = { message: 'Hello Cache!', timestamp: Date.now() };
      const setResult = await CacheService.set(testKey, testValue, { ttl: 60 });
      results.setOperation = setResult;

      // Test get operation
      const getValue = await CacheService.get(testKey);
      results.getOperation = getValue;
      results.getValueMatches = JSON.stringify(getValue) === JSON.stringify(testValue);

      // Test exists operation
      const existsResult = await CacheService.exists(testKey);
      results.existsOperation = existsResult;

      // Test delete operation
      const deleteResult = await CacheService.delete(testKey);
      results.deleteOperation = deleteResult;

      // Test get after delete
      const getAfterDelete = await CacheService.get(testKey);
      results.getAfterDelete = getAfterDelete === null;

      // Test tag operations
      const tagTestKey = 'test:tag:operation';
      const tagTestValue = { data: 'tagged data' };
      await CacheService.set(tagTestKey, tagTestValue, { 
        ttl: 60, 
        tags: ['test-tag'] 
      });
      
      const tagInvalidationResult = await CacheService.invalidateByTags(['test-tag']);
      results.tagInvalidation = tagInvalidationResult;

      // Test getOrSet operation
      let callCount = 0;
      const getOrSetValue = await CacheService.getOrSet(
        'test:getorset',
        async () => {
          callCount++;
          return { callCount, data: 'getOrSet test' };
        },
        { ttl: 60 }
      );
      results.getOrSetOperation = getOrSetValue;
      results.getOrSetCallCount = callCount;

      // Test second call (should use cache)
      const getOrSetValue2 = await CacheService.getOrSet(
        'test:getorset',
        async () => {
          callCount++;
          return { callCount, data: 'getOrSet test 2' };
        },
        { ttl: 60 }
      );
      results.getOrSetSecondCall = getOrSetValue2;
      results.getOrSetSecondCallCount = callCount;

      // Clean up test keys
      await CacheService.deleteMany(['test:getorset']);

      return { 
        success: errors.length === 0, 
        results, 
        errors 
      };
    } catch (error) {
      errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, results, errors };
    }
  }

  /**
   * Test cache key generation
   */
  static testCacheKeys(): Record<string, string> {
    return {
      destinationsAll: CacheKeys.destinations.all(),
      destinationsById: CacheKeys.destinations.byId('test-id'),
      destinationsFeatured: CacheKeys.destinations.featured(6),
      destinationsByCountry: CacheKeys.destinations.byCountry('Nigeria', 10),
      destinationsSearch: CacheKeys.destinations.search('lagos', 20),
      destinationsCountries: CacheKeys.destinations.countries(),
      
      experiencesAll: CacheKeys.experiences.all(),
      experiencesById: CacheKeys.experiences.byId('test-id'),
      experiencesFeatured: CacheKeys.experiences.featured(6),
      experiencesByCategory: CacheKeys.experiences.byCategory('adventure', 10),
      experiencesSearch: CacheKeys.experiences.search('hiking', 20),
      experiencesCategories: CacheKeys.experiences.categories(),
      
      packagesAll: CacheKeys.packages.all(),
      packagesById: CacheKeys.packages.byId('test-id'),
      packagesFeatured: CacheKeys.packages.featured(6),
      packagesByDestination: CacheKeys.packages.byDestination('dest-id', 10),
      packagesSearch: CacheKeys.packages.search('luxury', 20),
      
      faqsAll: CacheKeys.faqs.all(),
      faqsByCategory: CacheKeys.faqs.byCategory('general'),
      
      testimonialsAll: CacheKeys.testimonials.all(),
      testimonialsFeatured: CacheKeys.testimonials.featured(5),
    };
  }

  /**
   * Test cache performance
   */
  static async testCachePerformance(iterations: number = 100): Promise<{
    results: Record<string, number[]>;
    averageTimes: Record<string, number>;
  }> {
    const results: Record<string, number[]> = {
      set: [],
      get: [],
      delete: [],
    };

    // Warm up
    for (let i = 0; i < 10; i++) {
      const key = `perf:test:${i}`;
      const value = { data: `test data ${i}`, timestamp: Date.now() };
      await CacheService.set(key, value, { ttl: 60 });
    }

    // Performance test
    for (let i = 0; i < iterations; i++) {
      const key = `perf:test:${i}`;
      const value = { data: `test data ${i}`, timestamp: Date.now() };

      // Test set
      const setStart = performance.now();
      await CacheService.set(key, value, { ttl: 60 });
      results.set.push(performance.now() - setStart);

      // Test get
      const getStart = performance.now();
      await CacheService.get(key);
      results.get.push(performance.now() - getStart);

      // Test delete
      const deleteStart = performance.now();
      await CacheService.delete(key);
      results.delete.push(performance.now() - deleteStart);
    }

    // Calculate averages
    const averageTimes = Object.keys(results).reduce((acc, operation) => {
      const times = results[operation];
      acc[operation] = times.reduce((sum, time) => sum + time, 0) / times.length;
      return acc;
    }, {} as Record<string, number>);

    return { results, averageTimes };
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      stats: CacheService.getStats(),
      hitRate: CacheService.getHitRate(),
      hitRatePercentage: Math.round(CacheService.getHitRate() * 100),
    };
  }

  /**
   * Reset cache statistics
   */
  static resetCacheStats() {
    CacheService.resetStats();
    return { message: 'Cache statistics reset successfully' };
  }
}
