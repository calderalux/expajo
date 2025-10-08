import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';

// GET /api/admin/auth/me - Get current admin user
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('admin_session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No session token found',
        },
        { status: 401 }
      );
    }

    const response = await AuthService.validateSession(sessionToken);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Invalid session',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/auth/logout - Logout admin user
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('admin_session_token')?.value;
    
    if (sessionToken) {
      await AuthService.logout(sessionToken);
    }

    const res = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie
    res.cookies.set('admin_session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
