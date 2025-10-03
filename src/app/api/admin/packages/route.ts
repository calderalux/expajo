import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { PackageService } from '@/lib/services/packages';
import { PackageCategory, CurrencyEnum } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const CreatePackageSchema = z.object({
  destination_id: z.string().uuid('Invalid destination ID'),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(PackageCategory).optional(),
  lead_partner_id: z.string().uuid().optional(),
  duration_days: z.number().positive().optional(),
  group_size_limit: z.number().positive().optional(),
  inclusions: z.any().optional(),
  exclusions: z.any().optional(),
  itinerary: z.any().optional(),
  base_price: z.number().positive('Base price must be positive'),
  currency: z.nativeEnum(CurrencyEnum).default(CurrencyEnum.USD),
  discount_percent: z.number().min(0).max(100).optional(),
  featured: z.boolean().optional().default(false),
  luxury_certified: z.boolean().optional().default(false),
  availability: z.any().optional(),
  is_published: z.boolean().optional().default(false),
});

const UpdatePackageSchema = CreatePackageSchema.partial();

// GET /api/admin/packages - List all packages (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const destination_id = searchParams.get('destination_id') || undefined;
    const category = searchParams.get('category') as PackageCategory || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : 
                     searchParams.get('featured') === 'false' ? false : undefined;
    const luxury_certified = searchParams.get('luxury_certified') === 'true' ? true : 
                             searchParams.get('luxury_certified') === 'false' ? false : undefined;
    const isPublished = searchParams.get('is_published') === 'true' ? true : 
                       searchParams.get('is_published') === 'false' ? false : undefined;
    const currency = searchParams.get('currency') as CurrencyEnum || undefined;
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const filters = {
      destination_id,
      category,
      featured,
      luxury_certified,
      isPublished,
      currency,
    };

    const sort = {
      field: sortBy as 'created_at' | 'title' | 'base_price' | 'avg_rating' | 'review_count',
      order: sortOrder as 'asc' | 'desc',
    };

    const { data, error } = await PackageService.getPackagesForAdmin(filters, sort, limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: data?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/packages - Create new package (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    // Validate request body
    const validatedData = CreatePackageSchema.parse(body);

    const { data, error } = await PackageService.createPackage(validatedData);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Package created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating package:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
