import { NextRequest, NextResponse } from 'next/server';
import { DestinationService } from '@/lib/services/destinations';
import { withCache } from '@/lib/middleware/cache';

// GET /api/destinations
export const GET = withCache({
  ttl: 1800, // 30 minutes
  tags: ['destinations'],
  varyBy: ['accept-language'], // Vary by language
})(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const country = searchParams.get('country') || undefined;
    const region = searchParams.get('region') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : 
                    searchParams.get('featured') === 'false' ? false : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const sortField = searchParams.get('sortField') as any || 'created_at';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

    const filters = {
      country,
      region,
      featured,
    };

    const sort = {
      field: sortField,
      order: sortOrder,
    };

    const result = await DestinationService.getDestinations(filters, sort, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        count: result.data?.length || 0,
        filters,
        sort,
        limit,
      },
    });
  } catch (error) {
    console.error('Destinations API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch destinations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
