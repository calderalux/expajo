import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/services/cache';

// GET /api/cache/stats
export async function GET(req: NextRequest) {
  try {
    const stats = CacheService.getStats();
    const hitRate = CacheService.getHitRate();

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          hits: stats.hits,
          misses: stats.misses,
          sets: stats.sets,
          deletes: stats.deletes,
          totalRequests: stats.hits + stats.misses,
        },
        performance: {
          hitRate: Math.round(hitRate * 100) / 100,
          hitRatePercentage: Math.round(hitRate * 100),
          status: hitRate > 0.8 ? 'excellent' : 
                 hitRate > 0.6 ? 'good' : 
                 hitRate > 0.4 ? 'fair' : 'needs_improvement',
        },
        recommendations: getCacheRecommendations(hitRate, stats),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/cache/stats (reset stats)
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === 'reset') {
      CacheService.resetStats();
      return NextResponse.json({
        success: true,
        message: 'Cache statistics reset successfully',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Cache stats reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset cache stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getCacheRecommendations(hitRate: number, stats: any): string[] {
  const recommendations: string[] = [];

  if (hitRate < 0.4) {
    recommendations.push('Consider increasing TTL values for frequently accessed data');
    recommendations.push('Review cache key generation to ensure proper cache utilization');
    recommendations.push('Check if cache invalidation is happening too frequently');
  }

  if (stats.misses > stats.hits * 2) {
    recommendations.push('High miss rate detected - consider implementing cache warming');
  }

  if (stats.deletes > stats.sets * 0.5) {
    recommendations.push('High deletion rate - review cache invalidation strategy');
  }

  if (hitRate > 0.9) {
    recommendations.push('Excellent cache performance! Consider optimizing TTL for cost savings');
  }

  return recommendations;
}
