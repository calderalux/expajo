import { NextRequest, NextResponse } from 'next/server';
import { DestinationService } from '@/lib/services/destinations';

// GET /api/destinations/featured - Public API for fetching featured destinations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 3;

    const result = await DestinationService.getDestinations(
      { featured: true, isPublished: true },
      { field: 'name', order: 'asc' },
      limit
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
    });
  } catch (error) {
    console.error('Featured destinations API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured destinations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
