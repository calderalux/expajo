import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageService } from '@/lib/services/packages';
import { packageCreateSchema, packageUpdateSchema, packageFiltersSchema } from '@/lib/validations/packages';

// GET /api/admin/packages - List packages with filters and caching
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      destination_id: searchParams.get('destination_id') || undefined,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      featured: searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined,
      is_published: searchParams.get('is_published') ? searchParams.get('is_published') === 'true' : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate filters
    const validationResult = packageFiltersSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filter parameters',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    // Create cache key
    const cacheKey = CacheKeys.packages.all(validationResult.data, undefined, validationResult.data.limit);

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
    const result = await PackageService.getPackages(validationResult.data);

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, result, { 
      ttl: 300,
      tags: [CacheTags.packages]
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/packages - Create new package with cache invalidation
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    
    // Debug logging
    console.log('Package creation request body:', JSON.stringify(body, null, 2));
    
    // Validate request body
    const validationResult = packageCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const packageData = await PackageService.createPackage({
      ...validationResult.data,
      slug: validationResult.data.slug ?? null,
      summary: validationResult.data.summary ?? null,
      description: validationResult.data.description ?? null,
      category: validationResult.data.category ?? null,
      lead_partner_id: validationResult.data.lead_partner_id ?? null,
      duration_days: validationResult.data.duration_days ?? null,
      group_size_limit: validationResult.data.group_size_limit ?? null,
      inclusions: validationResult.data.inclusions ?? null,
      exclusions: validationResult.data.exclusions ?? null,
      itinerary: validationResult.data.itinerary ?? null,
      discount_percent: validationResult.data.discount_percent ?? null,
      avg_rating: validationResult.data.avg_rating ?? null,
      review_count: validationResult.data.review_count ?? null,
      availability: validationResult.data.availability ?? null,
      created_by: authCheck.user?.id || null,
    });

    // Invalidate packages cache
    await CacheService.invalidateByTags([CacheTags.packages]);

    return NextResponse.json({
      success: true,
      data: packageData,
      message: 'Package created successfully',
    });
  } catch (error: any) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}