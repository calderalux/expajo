import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageItemService } from '@/lib/services/package-items';
import { packageItemUpdateSchema } from '@/lib/validations/package-items';

// GET /api/admin/package-items/[id] - Get package item by ID with caching
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

    // Create cache key
    const cacheKey = CacheKeys.packageItems.byId(id);

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
    const packageItem = await PackageItemService.getPackageItemById(id);

    if (!packageItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package item not found',
        },
        { status: 404 }
      );
    }

    // Cache the result for 10 minutes
    await CacheService.set(cacheKey, packageItem, {
      ttl: 600,
      tags: [CacheTags.packageItems],
    });

    return NextResponse.json({
      success: true,
      data: packageItem,
    });
  } catch (error: any) {
    console.error('Error fetching package item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/package-items/[id] - Update package item with cache invalidation
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    // Validate request body
    const validationResult = packageItemUpdateSchema.safeParse({
      ...body,
      id,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const packageItem = await PackageItemService.updatePackageItem(
      id,
      validationResult.data
    );

    // Invalidate package items cache
    await CacheService.invalidateByTags([CacheTags.packageItems]);
    // Also invalidate specific item cache
    await CacheService.delete(CacheKeys.packageItems.byId(id));

    return NextResponse.json({
      success: true,
      data: packageItem,
      message: 'Package item updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating package item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/package-items/[id] - Delete package item with cache invalidation
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
    await PackageItemService.deletePackageItem(id);

    // Invalidate package items cache
    await CacheService.invalidateByTags([CacheTags.packageItems]);
    // Also invalidate specific item cache
    await CacheService.delete(CacheKeys.packageItems.byId(id));

    return NextResponse.json({
      success: true,
      message: 'Package item deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting package item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
