import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';
import { AdminLoginRequest, OtpRequest, OtpPurpose } from '@/types/auth';

// POST /api/admin/auth/otp - Request OTP for admin login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
          message: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Check if email is authorized for admin access
    const isAdmin = await AuthService.isAdminEmail(email);
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email not authorized for admin access',
          message: 'Email not authorized for admin access',
        },
        { status: 403 }
      );
    }

    const request: OtpRequest = {
      email,
      purpose: OtpPurpose.ADMIN_LOGIN,
    };

    const response = await AuthService.requestOtp(request);

    return NextResponse.json(response);
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to request OTP',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
