import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';

// POST /api/admin/auth/validate - Validate admin session
export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session token is required',
        },
        { status: 400 }
      );
    }

    const response = await AuthService.validateSession(sessionToken);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Session validation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
