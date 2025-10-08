import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';

// POST /api/admin/auth/permission - Check user permission
export async function POST(req: NextRequest) {
  try {
    const { userId, resource, action } = await req.json();

    if (!userId || !resource || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId, resource, and action are required',
        },
        { status: 400 }
      );
    }

    const hasPermission = await AuthService.hasPermission(userId, resource, action);

    return NextResponse.json({
      success: true,
      hasPermission,
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Permission check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
