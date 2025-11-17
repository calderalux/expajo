import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageService } from '@/lib/services/packages';
import { packageUpdateSchema } from '@/lib/validations/packages';

// GET /api/admin/packages/[id] - Get package by ID with caching
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
    const cacheKey = CacheKeys.packages.byId(id);

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
    const packageData = await PackageService.getPackageById(id);

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found',
        },
        { status: 404 }
      );
    }

    // Cache the result for 10 minutes
    await CacheService.set(cacheKey, packageData, {
      ttl: 600,
      tags: [CacheTags.packages],
    });

    return NextResponse.json({
      success: true,
      data: packageData,
    });
  } catch (error: any) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/packages/[id] - Update package with cache invalidation
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
    const validationResult = packageUpdateSchema.safeParse({
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

    const packageData = await PackageService.updatePackage(
      id,
      validationResult.data
    );

    // Invalidate packages cache
    await CacheService.invalidateByTags([CacheTags.packages]);
    // Also invalidate specific package cache
    await CacheService.delete(CacheKeys.packages.byId(id));

    return NextResponse.json({
      success: true,
      data: packageData,
      message: 'Package updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/packages/[id] - Delete package with cache invalidation
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
    await PackageService.deletePackage(id);

    // Invalidate packages cache
    await CacheService.invalidateByTags([CacheTags.packages]);
    // Also invalidate specific package cache
    await CacheService.delete(CacheKeys.packages.byId(id));

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
