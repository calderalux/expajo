# Redis Cache Setup Guide

This project now includes Redis caching for improved performance and reduced database load.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Optional: Redis URL (alternative to individual settings)
# REDIS_URL=redis://localhost:6379
```

## Redis Installation

### Local Development (Docker)

```bash
# Run Redis in Docker
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# Or with persistence
docker run -d --name redis-cache -p 6379:6379 -v redis-data:/data redis:alpine
```

### Local Development (macOS with Homebrew)

```bash
brew install redis
brew services start redis
```

### Local Development (Windows)

1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

### Production (Cloud)

Consider using managed Redis services:
- **AWS ElastiCache**
- **Google Cloud Memorystore**
- **Azure Cache for Redis**
- **Redis Cloud**

## Cache Features

### 1. Service-Level Caching

All data services now include automatic caching:
- **Destinations**: 30 minutes TTL for lists, 1 hour for individual items
- **Experiences**: 30 minutes TTL for lists, 1 hour for individual items
- **Packages**: Cached with appropriate TTLs

### 2. Cache Invalidation

Automatic cache invalidation on data changes:
- Create operations invalidate related caches
- Update operations invalidate related caches
- Delete operations invalidate related caches

### 3. API Route Caching

API routes use middleware for HTTP response caching:
- Configurable TTL
- Header-based cache variation
- Automatic cache key generation

### 4. Cache Statistics

Monitor cache performance:
```typescript
import { CacheService } from '@/lib/services/cache';

const stats = CacheService.getStats();
console.log('Cache hit rate:', CacheService.getHitRate());
```

## Usage Examples

### Service-Level Caching

```typescript
// Automatically cached
const destinations = await DestinationService.getDestinations();

// Cache with custom options
const featured = await DestinationService.getFeaturedDestinations(6);
```

### API Route Caching

```typescript
import { withCache } from '@/lib/middleware/cache';

export const GET = withCache({
  ttl: 1800, // 30 minutes
  tags: ['destinations'],
})(async (req) => {
  // Your handler logic
});
```

### Manual Cache Operations

```typescript
import { CacheService } from '@/lib/services/cache';

// Set cache
await CacheService.set('key', data, { ttl: 3600 });

// Get cache
const data = await CacheService.get('key');

// Invalidate by tags
await CacheService.invalidateByTags(['destinations']);

// Clear all cache
await CacheService.clearAll();
```

## Cache Keys Structure

Cache keys follow a consistent pattern:
- `expajo:destinations:all:{filters}:{sort}:{limit}`
- `expajo:destinations:id:{id}`
- `expajo:destinations:featured:{limit}`
- `expajo:experiences:category:{category}:{limit}`

## Performance Benefits

- **Reduced Database Load**: Frequently accessed data served from cache
- **Faster Response Times**: Cache hits are significantly faster than database queries
- **Improved Scalability**: Better handling of concurrent requests
- **Cost Optimization**: Reduced database query costs

## Monitoring

### Cache Hit Rate
Monitor cache effectiveness:
```typescript
const hitRate = CacheService.getHitRate();
// Target: >80% hit rate for optimal performance
```

### Cache Statistics
```typescript
const stats = CacheService.getStats();
console.log({
  hits: stats.hits,
  misses: stats.misses,
  hitRate: stats.hits / (stats.hits + stats.misses)
});
```

## Troubleshooting

### Redis Connection Issues
1. Verify Redis is running: `redis-cli ping`
2. Check environment variables
3. Ensure Redis is accessible from your application

### Cache Not Working
1. Check Redis connection health: `CacheService.checkRedisHealth()`
2. Verify cache keys are being generated correctly
3. Check TTL settings are appropriate

### High Memory Usage
1. Monitor Redis memory: `redis-cli info memory`
2. Adjust TTL values for less frequently accessed data
3. Implement cache size limits if needed

## Development vs Production

### Development
- Use local Redis instance
- Shorter TTL values for faster iteration
- Enable detailed logging

### Production
- Use managed Redis service
- Optimize TTL values based on usage patterns
- Monitor cache performance metrics
- Implement cache warming strategies
