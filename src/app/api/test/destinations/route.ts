import { NextRequest, NextResponse } from 'next/server';
import { DestinationService } from '@/lib/services/destinations';

// GET /api/test/destinations - Test endpoint to verify destinations can be fetched
export async function GET(req: NextRequest) {
  try {
    console.log('Testing destinations fetch...');
    
    // Test basic destinations fetch
    const result = await DestinationService.getDestinations(
      { isPublished: true },
      { field: 'created_at', order: 'desc' },
      5
    );

    console.log('Destinations fetch result:', result);

    return NextResponse.json({
      success: true,
      message: 'Destinations fetched successfully',
      data: result.data,
      count: result.data?.length || 0,
    });
  } catch (error) {
    console.error('Test destinations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch destinations',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
