import { NextRequest, NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/redis';
import { CacheService } from '@/lib/services/cache';

// GET /api/cache/health
export async function GET(req: NextRequest) {
  try {
    const isHealthy = await checkRedisHealth();
    const stats = CacheService.getStats();
    const hitRate = CacheService.getHitRate();

    return NextResponse.json({
      success: true,
      data: {
        redis: {
          connected: isHealthy,
          status: isHealthy ? 'healthy' : 'unhealthy',
        },
        cache: {
          stats,
          hitRate: Math.round(hitRate * 100) / 100,
          performance: {
            excellent: hitRate > 0.8,
            good: hitRate > 0.6,
            needsImprovement: hitRate < 0.4,
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Cache health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cache health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
