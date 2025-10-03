import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';
import { AuthService } from '@/lib/services/auth';

// Auth check function
async function checkAdminAuth(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No authorization token provided' };
    }

    const sessionToken = authHeader.substring(7);
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

// Cache tags for packages
const PACKAGE_CACHE_TAGS = {
  LIST: 'packages:list',
  DETAIL: 'packages:detail',
  DESTINATION: 'packages:destination',
};

// GET /api/admin/destinations/[id]/packages - Get packages for destination with caching
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `packages:destination:${id}`;

    // Try to get from cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        fromCache: true,
      });
    }

    // Fetch from database
    const serverClient = createServerClient();
    const { data, error } = await serverClient
      .from('packages')
      .select('*')
      .eq('destination_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch packages' },
        { status: 500 }
      );
    }

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, data || [], { ttl: 300 });

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
