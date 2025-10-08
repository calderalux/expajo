import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';

// Cache tags for experiences
const EXPERIENCE_CACHE_TAGS = {
  LIST: 'experiences:list',
  SEARCH: 'experiences:search',
  FEATURED: 'experiences:featured',
  CATEGORY: 'experiences:category',
};

// GET /api/experiences/public - Get public experiences
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Create cache key
    const cacheKey = `experiences:public:${search}:${category}:${featured}:${limit}:${offset}`;

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
      .from('experiences')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch experiences' },
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