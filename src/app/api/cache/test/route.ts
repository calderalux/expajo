import { NextRequest, NextResponse } from 'next/server';
import { CacheTest } from '@/lib/services/cache-test';

// GET /api/cache/test
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testType = searchParams.get('type') || 'basic';

    let result;

    switch (testType) {
      case 'basic':
        result = await CacheTest.testBasicOperations();
        break;
      case 'keys':
        result = CacheTest.testCacheKeys();
        break;
      case 'performance':
        const iterations = parseInt(searchParams.get('iterations') || '100');
        result = await CacheTest.testCachePerformance(iterations);
        break;
      case 'stats':
        result = CacheTest.getCacheStats();
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid test type',
            availableTypes: ['basic', 'keys', 'performance', 'stats'],
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      testType,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cache test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/cache/test (reset stats)
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === 'reset-stats') {
      const result = CacheTest.resetCacheStats();
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
        availableActions: ['reset-stats'],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Cache test reset error:', error);
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
