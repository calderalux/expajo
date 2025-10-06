import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageItemService } from '@/lib/services/package-items';
import { packageItemCreateSchema, packageItemUpdateSchema, packageItemFiltersSchema } from '@/lib/validations/package-items';

// GET /api/admin/package-items - List package items with filters and caching
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      item_type: searchParams.get('item_type') || undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate filters
    const validationResult = packageItemFiltersSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filter parameters',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    // Create cache key
    const cacheKey = CacheKeys.packageItems.all(validationResult.data, undefined, validationResult.data.limit);

    // Try to get from cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: (cached as any).data,
        pagination: (cached as any).pagination,
        fromCache: true,
      });
    }

    // Fetch from database
    const result = await PackageItemService.getPackageItems(validationResult.data);

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, result, { 
      ttl: 300,
      tags: [CacheTags.packageItems]
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching package items:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/package-items - Create new package item with cache invalidation
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = packageItemCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const packageItem = await PackageItemService.createPackageItem({
      ...validationResult.data,
      code: validationResult.data.code ?? null,
      description: validationResult.data.description ?? null,
    });

    // Invalidate package items cache
    await CacheService.invalidateByTags([CacheTags.packageItems]);

    return NextResponse.json({
      success: true,
      data: packageItem,
      message: 'Package item created successfully',
    });
  } catch (error: any) {
    console.error('Error creating package item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
