import { NextRequest, NextResponse } from 'next/server';
import { DestinationService } from '@/lib/services/destinations';
import { withCache } from '@/lib/middleware/cache';

// GET /api/destinations/[id]
export const GET = withCache({
  ttl: 3600, // 1 hour
  tags: ['destinations'],
  varyBy: ['accept-language'],
})(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destination ID is required',
        },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destination ID is required',
        },
        { status: 400 }
      );
    }

    const result = await DestinationService.getDestinationById(id);

    if (!result.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destination not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Destination API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch destination',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
