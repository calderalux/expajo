import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';

// Cache tags for destinations
const DESTINATION_CACHE_TAGS = {
  LIST: 'destinations:list',
  DETAIL: 'destinations:detail',
  SEARCH: 'destinations:search',
  FEATURED: 'destinations:featured',
  COUNTRY: 'destinations:country',
};

// PUT /api/admin/destinations/bulk - Bulk update destinations
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
    await CacheService.invalidateByTags([
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

// DELETE /api/admin/destinations/bulk - Bulk delete destinations
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
    await CacheService.invalidateByTags([
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
