import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { updateDestinationSchema } from '@/lib/validations/destinations';

// Cache tags for destinations
const DESTINATION_CACHE_TAGS = {
  LIST: 'destinations:list',
  DETAIL: 'destinations:detail',
  SEARCH: 'destinations:search',
  FEATURED: 'destinations:featured',
  COUNTRY: 'destinations:country',
};

// GET /api/admin/destinations/[id] - Get destination with caching
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
    const serverClient = createServerClient();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `destinations:detail:${id}`;

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
    const { data, error } = await serverClient
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }

    // Cache the result for 10 minutes
    await CacheService.set(cacheKey, data, { ttl: 600 });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/destinations/[id] - Update destination with cache invalidation
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = await params;
    const serverClient = createServerClient();
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = updateDestinationSchema.safeParse({ id, ...body });
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    // Update destination
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update destination' },
        { status: 500 }
      );
    }

    // Invalidate related caches
    await CacheService.deleteMany([
      DESTINATION_CACHE_TAGS.LIST,
      DESTINATION_CACHE_TAGS.SEARCH,
      DESTINATION_CACHE_TAGS.FEATURED,
      DESTINATION_CACHE_TAGS.COUNTRY,
    ]);

    // Invalidate specific destination cache
    await CacheService.delete(`destinations:detail:${id}`);

    return NextResponse.json({
      success: true,
      data,
      message: 'Destination updated successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/destinations/[id] - Delete destination with cache invalidation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = await params;
    const serverClient = createServerClient();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }
    
    // Delete destination
    const { data, error } = await serverClient
      .from('destinations')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete destination' },
        { status: 500 }
      );
    }

    // Invalidate all destination caches
    await CacheService.deleteMany([
      DESTINATION_CACHE_TAGS.LIST,
      DESTINATION_CACHE_TAGS.SEARCH,
      DESTINATION_CACHE_TAGS.FEATURED,
      DESTINATION_CACHE_TAGS.COUNTRY,
    ]);

    // Invalidate specific destination cache
    await CacheService.delete(`destinations:detail:${id}`);

    return NextResponse.json({
      success: true,
      data,
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}