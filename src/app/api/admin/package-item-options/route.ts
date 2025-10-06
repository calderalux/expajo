import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageItemOptionService } from '@/lib/services/package-item-options';
import { packageItemOptionCreateSchema, packageItemOptionUpdateSchema, packageItemOptionFiltersSchema } from '@/lib/validations/package-item-options';

// GET /api/admin/package-item-options - List package item options with filters and caching
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      package_item_id: searchParams.get('package_item_id') || undefined,
      search: searchParams.get('search') || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate filters
    const validationResult = packageItemOptionFiltersSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filter parameters',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    // Create cache key
    const cacheKey = CacheKeys.packageItemOptions.all(validationResult.data, undefined, validationResult.data.limit);

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
    const result = await PackageItemOptionService.getPackageItemOptions(validationResult.data);

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, result, { 
      ttl: 300,
      tags: [CacheTags.packageItemOptions]
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching package item options:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/package-item-options - Create new package item option with cache invalidation
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = packageItemOptionCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const packageItemOption = await PackageItemOptionService.createPackageItemOption({
      ...validationResult.data,
      description: validationResult.data.description ?? null,
      meta: validationResult.data.meta ?? null,
    });

    // Invalidate package item options cache
    await CacheService.invalidateByTags([CacheTags.packageItemOptions]);

    return NextResponse.json({
      success: true,
      data: packageItemOption,
      message: 'Package item option created successfully',
    });
  } catch (error: any) {
    console.error('Error creating package item option:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
