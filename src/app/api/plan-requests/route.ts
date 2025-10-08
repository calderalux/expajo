import { NextRequest, NextResponse } from 'next/server';
import { PlanRequestService } from '@/lib/services/planRequests';

// POST /api/plan-requests - Create a new plan request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const result = await PlanRequestService.createPlanRequest(body);
    
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Plan request API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create plan request' },
      { status: 500 }
    );
  }
}
