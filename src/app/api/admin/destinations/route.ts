import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { createDestinationSchema, updateDestinationSchema } from '@/lib/validations/destinations';

// Cache tags for destinations
const DESTINATION_CACHE_TAGS = {
  LIST: 'destinations:list',
  DETAIL: 'destinations:detail',
  SEARCH: 'destinations:search',
  FEATURED: 'destinations:featured',
  COUNTRY: 'destinations:country',
};

// GET /api/admin/destinations - List destinations with caching
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const country = url.searchParams.get('country') || '';
    const status = url.searchParams.get('status') || '';
    const featured = url.searchParams.get('featured') || '';
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';

    // Create cache key
    const cacheKey = `destinations:list:${JSON.stringify({
      page, limit, search, country, status, featured, sortBy, sortOrder
    })}`;

    // Try to get from cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: (cached as any).data,
        total: (cached as any).total,
        page: (cached as any).page,
        limit: (cached as any).limit,
        fromCache: true,
      });
    }

    // Fetch from database
    const serverClient = createServerClient();
    let query = serverClient
      .from('destinations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,country.ilike.%${search}%`);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (status) {
      query = query.eq('is_published', status === 'published');
    }
    if (featured) {
      query = query.eq('featured', featured === 'featured');
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch destinations' },
        { status: 500 }
      );
    }

    const result = {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, result, { ttl: 300 });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/destinations - Create destination with cache invalidation
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    
    // Validate input
    const validation = createDestinationSchema.safeParse(body);
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

    const serverClient = createServerClient();
    
    // Create destination
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .insert({
        ...validation.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create destination' },
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

    return NextResponse.json({
      success: true,
      data,
      message: 'Destination created successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/destinations/bulk - Bulk update with cache invalidation
export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'IDs array is required' },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();
    
    // Update destinations
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update destinations' },
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

    // Invalidate individual destination caches
    for (const id of ids) {
      await CacheService.delete(`destinations:detail:${id}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: `${data?.length || 0} destinations updated successfully`,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/destinations/bulk - Bulk delete with cache invalidation
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'IDs array is required' },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();
    
    // Delete destinations
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .delete()
      .in('id', ids)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete destinations' },
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

    // Invalidate individual destination caches
    for (const id of ids) {
      await CacheService.delete(`destinations:detail:${id}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: `${data?.length || 0} destinations deleted successfully`,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}