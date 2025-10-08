import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';
import { AdminLoginRequest } from '@/types/auth';

// POST /api/admin/auth/login - Verify OTP and login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const request: AdminLoginRequest = {
      email: body.email,
      otp: body.otp,
    };

    const response = await AuthService.verifyOtpAndLogin(request);

    if (response.success && response.session) {
      // Set session token in response headers
      const res = NextResponse.json(response);
      res.cookies.set('admin_session_token', response.session.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60, // 8 hours
      });
      return res;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
