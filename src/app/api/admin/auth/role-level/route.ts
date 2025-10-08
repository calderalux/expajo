import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';

// POST /api/admin/auth/role-level - Get user role level
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    const roleLevel = await AuthService.getUserRoleLevel(userId);

    return NextResponse.json({
      success: true,
      roleLevel,
    });
  } catch (error) {
    console.error('Role level check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Role level check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
