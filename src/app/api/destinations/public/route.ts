import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';

// Cache tags for destinations
const DESTINATION_CACHE_TAGS = {
  LIST: 'destinations:list',
  SEARCH: 'destinations:search',
  FEATURED: 'destinations:featured',
  COUNTRY: 'destinations:country',
};

// GET /api/destinations/public - Get public destinations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Create cache key
    const cacheKey = `destinations:public:${search}:${country}:${featured}:${limit}:${offset}`;

    // Try to get from cache first
    const cached = await CacheService.get(cacheKey) as any;
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        pagination: cached.pagination,
        cached: true,
      });
    }

    // Build query
    let query = supabase
      .from('destinations')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (country) {
      query = query.eq('country', country);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

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
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    };

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, result, { ttl: 300 });

    return NextResponse.json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}