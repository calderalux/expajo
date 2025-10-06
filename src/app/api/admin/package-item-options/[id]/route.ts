import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageItemOptionService } from '@/lib/services/package-item-options';
import { packageItemOptionUpdateSchema } from '@/lib/validations/package-item-options';

// GET /api/admin/package-item-options/[id] - Get package item option by ID with caching
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = params;
    
    // Create cache key
    const cacheKey = CacheKeys.packageItemOptions.byId(id);

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
    const packageItemOption = await PackageItemOptionService.getPackageItemOptionById(id);

    if (!packageItemOption) {
      return NextResponse.json({
        success: false,
        error: 'Package item option not found',
      }, { status: 404 });
    }

    // Cache the result for 10 minutes
    await CacheService.set(cacheKey, packageItemOption, { 
      ttl: 600,
      tags: [CacheTags.packageItemOptions]
    });

    return NextResponse.json({
      success: true,
      data: packageItemOption,
    });
  } catch (error: any) {
    console.error('Error fetching package item option:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/package-item-options/[id] - Update package item option with cache invalidation
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = packageItemOptionUpdateSchema.safeParse({
      ...body,
      id: params.id,
    });
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const packageItemOption = await PackageItemOptionService.updatePackageItemOption(params.id, validationResult.data);

    // Invalidate package item options cache
    await CacheService.invalidateByTags([CacheTags.packageItemOptions]);
    // Also invalidate specific option cache
    await CacheService.delete(CacheKeys.packageItemOptions.byId(params.id));

    return NextResponse.json({
      success: true,
      data: packageItemOption,
      message: 'Package item option updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating package item option:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/package-item-options/[id] - Delete package item option with cache invalidation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    await PackageItemOptionService.deletePackageItemOption(params.id);

    // Invalidate package item options cache
    await CacheService.invalidateByTags([CacheTags.packageItemOptions]);
    // Also invalidate specific option cache
    await CacheService.delete(CacheKeys.packageItemOptions.byId(params.id));

    return NextResponse.json({
      success: true,
      message: 'Package item option deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting package item option:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
