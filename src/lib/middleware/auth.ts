import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth';

export interface AuthCheckResult {
  success: boolean;
  user?: any;
  error?: string;
}

export async function checkAdminAuth(req: NextRequest): Promise<AuthCheckResult> {
  try {
    // Get session token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No authorization token provided' };
    }

    const sessionToken = authHeader.substring(7);
    
    // Validate session
    const response = await AuthService.validateSession(sessionToken);
    
    if (response.success && response.user) {
      return { success: true, user: response.user };
    } else {
      return { success: false, error: 'Invalid or expired session' };
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}
