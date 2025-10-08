import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';

// GET /api/admin/package-items/export - Export package items to CSV
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const itemType = searchParams.get('item_type');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Create cache key for export
    const cacheKey = `package_items:export:${JSON.stringify({ search, itemType, sortBy, sortOrder, limit })}`;

    // Try to get from cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return new NextResponse(cached as string, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="package_items_export_${new Date().toISOString().split('T')[0]}.csv"`,
          'X-Cache': 'HIT',
        },
      });
    }

    const serverClient = createServerClient();
    let query = serverClient
      .from('package_items')
      .select('*')
      .limit(limit);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,code.ilike.%${search}%`);
    }
    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: packageItems, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch package items: ${error.message}`);
    }

    // Convert to CSV
    const csvHeaders = [
      'id',
      'name',
      'code',
      'description',
      'item_type',
      'created_at',
      'updated_at',
    ];

    const csvRows = [
      csvHeaders.join(','),
      ...(packageItems || []).map((item: any) => [
        item.id,
        `"${item.name?.replace(/"/g, '""') || ''}"`,
        `"${item.code?.replace(/"/g, '""') || ''}"`,
        `"${item.description?.replace(/"/g, '""') || ''}"`,
        `"${item.item_type?.replace(/"/g, '""') || ''}"`,
        item.created_at || '',
        item.updated_at || '',
      ].join(',')),
    ];

    const csvContent = csvRows.join('\n');

    // Cache the CSV content for 10 minutes
    await CacheService.set(cacheKey, csvContent, { 
      ttl: 600,
      tags: [CacheTags.packageItems]
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="package_items_export_${new Date().toISOString().split('T')[0]}.csv"`,
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('Error exporting package items:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
